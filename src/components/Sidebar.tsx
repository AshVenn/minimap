"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react"; // Import refresh/reset icon
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface Route {
  id: number;
  value: string;
}

interface SidebarSheetProps {
  addRoute: (route: { lat: number; lng: number; label: string }) => void;
  swapRoutes: (index1: number, index2: number) => void;
  resetRoutes: () => void; // Prop for resetting routes
  routeInfo: { distance: string; duration: string } | null; // Prop for route info
}

export function SidebarSheet({
  addRoute,
  swapRoutes,
  resetRoutes,
  routeInfo,
}: SidebarSheetProps) {
  const [routes, setRoutes] = useState<Route[]>([{ id: 1, value: "" }, { id: 2, value: "" }]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Fetch suggestions from Nominatim API
  const fetchSuggestions = async (query: string, index: number) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`
    );
    const data = await response.json();
    setSuggestions(data);
    setSelectedIndex(index);
  };

  const handleSelectSuggestion = (lat: number, lon: number, display_name: string) => {
    const newRoutes = [...routes];
    if (selectedIndex !== null) {
      newRoutes[selectedIndex].value = display_name;
      setRoutes(newRoutes);
      setSuggestions([]);
      addRoute({ lat, lng: lon, label: display_name });
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const updatedRoutes = [...routes];
    updatedRoutes[index].value = value;
    setRoutes(updatedRoutes);
    fetchSuggestions(value, index);
  };

  const handleAddRoute = () => {
    const newRoute: Route = { id: routes.length + 1, value: "" };
    setRoutes([...routes, newRoute]);
  };

  const handleSwap = (index1: number, index2: number) => {
    const updatedRoutes = [...routes];
    [updatedRoutes[index1], updatedRoutes[index2]] = [updatedRoutes[index2], updatedRoutes[index1]];
    setRoutes(updatedRoutes);
    swapRoutes(index1, index2);
  };

  const handleReset = () => {
    setRoutes([{ id: 1, value: "" }, { id: 2, value: "" }]); // Reset input fields
    resetRoutes(); // Clear markers and route info on the map
  };

  return (
    <Sheet>
      <SheetTrigger className="absolute top-2 left-[50px] top-[80px] z-[9999]" asChild>
        <Button className="bg-black " variant="outline">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Direction</SheetTitle>
        </SheetHeader>
        <div className="py-4">
          {routes.map((route, index) => (
            <div key={route.id} className="mb-4 relative">
              <Input
                value={route.value}
                placeholder={`Route ${route.id}`}
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
              {suggestions.length > 0 && selectedIndex === index && (
                <Select
                  onValueChange={(value) => {
                    const selectedSuggestion = suggestions.find(
                      (suggestion) => suggestion.display_name === value
                    );
                    if (selectedSuggestion) {
                      handleSelectSuggestion(
                        selectedSuggestion.lat,
                        selectedSuggestion.lon,
                        selectedSuggestion.display_name
                      );
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un lieu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {suggestions.map((suggestion, i) => (
                        <SelectItem key={i} value={suggestion.display_name}>
                          {suggestion.display_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
              {index > 0 && (
                <Button variant="outline" onClick={() => handleSwap(index, index - 1)}>
                  ↑
                </Button>
              )}
              {index < routes.length - 1 && (
                <Button variant="outline" onClick={() => handleSwap(index, index + 1)}>
                  ↓
                </Button>
              )}
            </div>
          ))}

          {/* Display route information if available */}
          {routeInfo ? (
            <div className="mt-4 p-2">
              <h3 className="font-semibold">Informations sur l'itinéraire :</h3>
              <p>Distance : {routeInfo.distance}</p>
              <p>Durée : {routeInfo.duration}</p>
            </div>
          ) : (
            <div className="mt-4 p-2">
              <p>Aucune information disponible.</p>
            </div>
          )}

          <Button variant="outline" onClick={handleAddRoute}>
            + Ajouter une destination
          </Button>

          {/* Reset button */}
          <Button variant="outline" className="mt-4 flex items-center" onClick={handleReset}>
            <RefreshCw className="mr-2" /> Réinitialiser les itinéraires
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
