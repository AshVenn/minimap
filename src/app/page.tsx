"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { SidebarSheet } from "@/components/Sidebar";

// Dynamically import the MapComponent with ssr: false
const MapComponent = dynamic(() => {
  return import("@/components/MapComponent");
}, { ssr: false });

export default function Home() {
  const [routes, setRoutes] = useState<{ lat: number; lng: number; label: string }[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  const addRoute = (route: { lat: number; lng: number; label: string }) => {
    setRoutes([...routes, route]);
  };

  const swapRoutes = (index1: number, index2: number) => {
    const newRoutes = [...routes];
    [newRoutes[index1], newRoutes[index2]] = [newRoutes[index2], newRoutes[index1]];
    setRoutes(newRoutes);
  };

  const resetRoutes = () => {
    setRoutes([]); // Clear all routes
    setRouteInfo(null); // Clear the route information (distance and duration)
  };

  return (
    <div className="relative">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 text-center align-middle">Prototype d'un système du mapping</h2>
      <p className="leading-7 text-center">
      Cette application utilise Next.js, TypeScript, Leaflet, l'API Nominatim d'OpenStreetMap.
 </p>

      <SidebarSheet addRoute={addRoute} swapRoutes={swapRoutes} resetRoutes={resetRoutes} routeInfo={routeInfo} />
      <MapComponent routes={routes} setRouteInfo={setRouteInfo} resetMarkers={resetRoutes} />
    </div>
  );
}
