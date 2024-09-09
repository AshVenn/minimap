"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Define types for Route and MapComponentProps
interface Route {
  lat: number;
  lng: number;
  label: string;
}

interface ValhallaLeg {
  shape: string; // Polyline shape for each leg
}

interface MapComponentProps {
  routes: Route[];
  setRouteInfo: (info: { distance: string; duration: string }) => void;
  resetMarkers: () => void; // Function to clear all markers
}

export default function MapComponent({ routes, setRouteInfo, resetMarkers }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLineRef = useRef<L.Polyline | null>(null); // Store the route polyline reference

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map").setView([34.0522, -118.2437], 13); // Default position
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
    }

    const map = mapRef.current!; // Non-null assertion operator

    // Clear existing markers and route
    markersRef.current.forEach((marker) => {
      map?.removeLayer(marker);
    });
    markersRef.current = [];

    // Remove the polyline when resetting the map
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    const markers = routes.map((route, index) => {
      const customIcon = L.divIcon({
        className: "numbered-marker",
        html: `<div class="marker-number">${index + 1}</div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

      const marker = L.marker([route.lat, route.lng], { icon: customIcon, draggable: true })
        .addTo(map!)
        .bindPopup(`<b>Route ${index + 1}</b><br>${route.label}`);

      // Zoom to and navigate to the new marker's location when a place is selected
      map.setView([route.lat, route.lng], 13);

      marker.on("dragend", () => {
        const newLatLng = marker.getLatLng();
        routes[index].lat = newLatLng.lat;
        routes[index].lng = newLatLng.lng;
        drawRoute(markers, map, setRouteInfo);
      });

      markersRef.current.push(marker);
      return marker;
    });

    if (markers.length > 1) {
      drawRoute(markers, map!, setRouteInfo);
    }

    setTimeout(() => {
      map?.invalidateSize();
    }, 100);

    return () => {
      markersRef.current.forEach((marker) => map?.removeLayer(marker));
      markersRef.current = [];
    };
  }, [routes]);

  const drawRoute = async (
    markers: L.Marker[],
    map: L.Map,
    setRouteInfo: (info: { distance: string; duration: string }) => void
  ) => {
    const latlngs = markers.map((marker) => marker.getLatLng());
    const response = await fetchValhallaRoute(latlngs);

    if (response.trip && response.trip.legs) {
      // Clear previous route if it exists
      if (routeLineRef.current) {
        map.removeLayer(routeLineRef.current);
        routeLineRef.current = null;
      }

      let fullRoute: L.LatLng[] = [];
      response.trip.legs.forEach((leg: ValhallaLeg) => {
        const polyline = decodePolyline(leg.shape);
        fullRoute = [...fullRoute, ...polyline];
      });

      const routeLine = L.polyline(fullRoute, { color: "blue" }).addTo(map);
      routeLineRef.current = routeLine; // Store the polyline reference

      map.fitBounds(routeLine.getBounds());

      const distance = (response.trip.summary.length / 1000).toFixed(2) + " km";
      const duration = (response.trip.summary.time / 60).toFixed(2) + " minutes";
      setRouteInfo({ distance, duration });
    }
  };

  // Function to clear all markers and routes (renamed to avoid conflict)
  const clearMarkersAndRoute = () => {
    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Remove the route line (polyline)
    if (routeLineRef.current) {
      mapRef.current?.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }
  };

  return <div id="map" className="h-full w-full"></div>;
}

const fetchValhallaRoute = async (locations: L.LatLng[]) => {
  const url = "https://valhalla1.openstreetmap.de/route";
  const data = {
    locations: locations.map((loc) => ({ lat: loc.lat, lon: loc.lng })),
    costing: "auto",
    directions_options: { units: "kilometers" },
  };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
};

const decodePolyline = (encoded: string): L.LatLng[] => {
  let points: L.LatLng[] = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push(L.latLng(lat / 1e6, lng / 1e6));
  }
  return points;
};
