import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { LogOut, RotateCcw } from "lucide-react";

import ChatPanel from "@/components/dinner/Chat";
import { RestaurantMap } from "@/components/dinner/Map";
import { ShortlistPanel } from "@/components/dinner/Shortlist";
import LoginDialog from "@/components/dinner/LoginDialog";
import { getVisitorId, getVisitorName, clearVisitor } from "@/lib/visitor";
import { getCachedLocation, type UserLocation } from "@/lib/location";
import { DEFAULT_LOCATION } from "@/data/mock-restaurants";
import { useDinnerChat } from "@/lib/dinner-chat-hook";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
  component: DinnerPlans,
});

function DinnerPlans() {
  // Visitor info
  const [visitorId, setVisitorId] = useState("");
  const [visitorName, setVisitorName] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userLocation, setUserLocation] =
    useState<UserLocation>(DEFAULT_LOCATION);

  // Map state for client tools
  const [mapCenter, setMapCenter] = useState(DEFAULT_LOCATION);
  const [mapZoom, setMapZoom] = useState(13);
  const [highlightedPlaceId, setHighlightedPlaceId] = useState<string | null>(
    null
  );

  // Get shortlist for map pins
  const shortlist = useQuery(api.shortlist.list);
  const clearChat = useMutation(api.chat.clearChat);
  const clearShortlist = useMutation(api.shortlist.clear);

  // Multi-user chat hook with client tool handlers
  // Messages come from Convex subscription - all users see the same messages
  const { messages, sendMessage, isLoading, isStreaming } = useDinnerChat(
    visitorName || "",
    userLocation,
    {
      onShowOnMap: ({ lat, lng, placeId, name, zoom }) => {
        setMapCenter({ lat, lng, name: name || "Restaurant" });
        setMapZoom(zoom || 15);
        setHighlightedPlaceId(placeId);
      },
      onShowRestaurantCard: ({ placeId }) => {
        setHighlightedPlaceId(placeId);
      },
      onHighlightShortlistItem: ({ placeId }) => {
        setHighlightedPlaceId(placeId);
      },
    }
  );

  // Initialize visitor on mount
  useEffect(() => {
    const name = getVisitorName();
    if (name) {
      setVisitorId(getVisitorId());
      setVisitorName(name);
    } else {
      setShowLoginDialog(true);
    }
    setIsInitialized(true);

    // Get user location
    getCachedLocation().then(setUserLocation);
  }, []);

  // Handle successful login
  const handleLoginSuccess = useCallback((name: string) => {
    setVisitorId(getVisitorId());
    setVisitorName(name);
    setShowLoginDialog(false);
  }, []);

  // Handle sending message
  const handleSendMessage = useCallback(
    (message: string) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  // Handle logout
  const handleLogout = () => {
    clearVisitor();
    setVisitorName(null);
    setVisitorId("");
    setShowLoginDialog(true);
  };

  // Handle reset (clear all data)
  const handleReset = async () => {
    if (confirm("Clear all messages and shortlist? This affects everyone!")) {
      await Promise.all([clearChat(), clearShortlist()]);
    }
  };

  // Map restaurants from shortlist
  const mapRestaurants =
    shortlist?.map((r) => ({
      placeId: r.placeId,
      name: r.name,
      lat: r.lat,
      lng: r.lng,
    })) ?? [];

  // Show loading state until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-amber-500">Loading...</div>
      </div>
    );
  }

  // Show login dialog if not logged in
  if (!visitorName) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-900 via-gray-900 to-gray-950">
        <LoginDialog
          open={showLoginDialog}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Login Dialog for re-login */}
      <LoginDialog
        open={showLoginDialog}
        onSuccess={handleLoginSuccess}
        onClose={() => setShowLoginDialog(false)}
        showCloseButton={!!visitorName}
      />

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">
              Dinner <span className="text-amber-500">Plans</span>
            </h1>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400">
              Welcome, <span className="text-amber-400">{visitorName}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-amber-500 p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="Reset all data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              title="Leave chat"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Leave</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-88px)]">
          {/* Left: Chat Panel */}
          <div className="h-full min-h-0">
            <ChatPanel
              visitorName={visitorName}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isStreaming={isStreaming}
              messages={messages}
            />
          </div>

          {/* Right: Map + Shortlist stacked */}
          <div className="h-full min-h-0 flex flex-col gap-4">
            {/* Map - takes ~50% */}
            <div className="flex-1 min-h-0">
              <RestaurantMap
                restaurants={mapRestaurants}
                highlightedPlaceId={highlightedPlaceId}
                center={mapCenter}
                zoom={mapZoom}
                onPinClick={(placeId) => setHighlightedPlaceId(placeId)}
              />
            </div>

            {/* Shortlist - takes ~50% */}
            <div className="flex-1 min-h-0 overflow-auto">
              <ShortlistPanel
                visitorId={visitorId}
                visitorName={visitorName}
                highlightedPlaceId={highlightedPlaceId}
                onCardClick={(placeId) => {
                  const restaurant = shortlist?.find(
                    (r) => r.placeId === placeId
                  );
                  if (restaurant) {
                    setMapCenter({
                      lat: restaurant.lat,
                      lng: restaurant.lng,
                      name: restaurant.name,
                    });
                    setMapZoom(15);
                    setHighlightedPlaceId(placeId);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
