import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { LogOut, RotateCcw } from "lucide-react";

import ChatPanel from "@/components/dinner/Chat";
import { RestaurantMap } from "@/components/dinner/Map";
import { ShortlistPanel } from "@/components/dinner/Shortlist";
import LoginDialog from "@/components/dinner/LoginDialog";

import { useDinnerChat } from "@/lib/useDinnerChat";

import { useVisitorStore, useLocationStore } from "@/stores";

import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
  component: DinnerPlans,
});

function DinnerPlans() {
  // Get state and actions from stores
  const { visitorName, isInitialized, initialize, logout } = useVisitorStore();
  const { fetchLocation } = useLocationStore();

  // Get shortlist for map pins
  const shortlist = useQuery(api.shortlist.list);
  const clearChat = useMutation(api.chat.clearChat);
  const clearShortlist = useMutation(api.shortlist.clear);

  // Set up chat subscription (syncs to store)
  useDinnerChat();

  // Initialize on mount
  useEffect(() => {
    initialize();
    fetchLocation();
  }, [initialize, fetchLocation]);

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
        <LoginDialog />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Login Dialog for re-login */}
      <LoginDialog />

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
              onClick={logout}
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
            <ChatPanel />
          </div>

          {/* Right: Map + Shortlist stacked */}
          <div className="h-full min-h-0 flex flex-col gap-4">
            {/* Map - takes ~50% */}
            <div className="flex-1 min-h-0">
              <RestaurantMap restaurants={mapRestaurants} />
            </div>

            {/* Shortlist - takes ~50% */}
            <div className="flex-1 min-h-0 overflow-auto">
              <ShortlistPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
