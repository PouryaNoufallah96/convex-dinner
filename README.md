# Dinner Plans

A real-time multiplayer chat app for deciding where to eat dinner, featuring AI-assisted restaurant recommendations, a shared shortlist with voting, and an interactive map.

## Features

- **Real-time Group Chat**: Chat with friends in real-time powered by Convex subscriptions
- **AI Restaurant Assistant**: Mention `@ai` to get restaurant recommendations, add places to the shortlist, and more
- **Live Voting**: Vote on shortlisted restaurants and see votes update in real-time
- **Interactive Map**: See restaurant locations on a map with highlighted pins
- **No Auth Required**: Just enter a display name and start chatting

## Tech Stack

- **TanStack Start** - Full-stack React framework
- **TanStack AI** - Streaming AI responses with tool calling
- **Convex** - Real-time backend with subscriptions
- **Anthropic Claude** - AI model for chat (configurable)
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Convex account
- Anthropic API key (or other LLM provider)

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Set up Convex:

```bash
npx convex dev
```

This will prompt you to create or link a Convex project.

3. Configure environment variables:

Create a `.env.local` file:

```bash
# Convex
CONVEX_DEPLOYMENT=<your-deployment-name>
VITE_CONVEX_URL=https://<your-deployment>.convex.cloud

# AI Provider
ANTHROPIC_API_KEY=<your-anthropic-key>

# Google API (one key for Places API and Maps)
GOOGLE_API_KEY=<your-google-key>           # Server-side (Convex Places API)
VITE_GOOGLE_API_KEY=<your-google-key>      # Client-side (Google Maps)
```

**Google Cloud Setup:**
1. Create a project in Google Cloud Console
2. Enable **Places API (New)** and **Maps JavaScript API**
3. Create an API key
4. Add billing (required for Places API)

4. Start the development server:

```bash
pnpm dev
```

5. Open http://localhost:3000 in your browser

## Usage

1. Enter your display name on the landing page
2. Start chatting! Messages are visible to everyone in real-time
3. Mention `@ai` to interact with the AI assistant:
   - `@ai find Thai restaurants nearby`
   - `@ai add Pok Pok to the shortlist`
   - `@ai show me where Le Pigeon is`
   - `@ai we can't decide, you pick!`
4. Vote on restaurants in the shortlist
5. See locations on the map

## AI Tools

The AI assistant can:

- **Search Restaurants**: Find restaurants by cuisine, type, or general query
- **Get Details**: Show detailed info about a specific restaurant
- **Add to Shortlist**: Add restaurants to the group's voting list
- **Remove from Shortlist**: Remove restaurants from consideration
- **Show on Map**: Pan the map to a specific restaurant
- **Highlight Items**: Draw attention to specific restaurants

## Development Notes

### API Keys Required

The Google API keys (`GOOGLE_API_KEY` for server-side and `VITE_GOOGLE_API_KEY` for client-side) are required for the app to function. Without them, restaurant search will return empty results and the map will show a placeholder.

### Convex Schema

- `messages` - Chat messages with sender info and AI flag
- `shortlist` - Restaurants added for group consideration
- `votes` - User votes on shortlisted restaurants

### Project Structure

```
src/
├── components/dinner/    # UI components
│   ├── Chat/            # Chat panel components
│   ├── Map/             # Map components
│   └── Shortlist/       # Voting components
├── lib/                 # Utilities and hooks
│   ├── useDinnerChat.ts # Composed chat hook
│   ├── useChatMessages.ts # Message subscription
│   ├── useChatInput.ts  # Input state management
│   ├── useClientTools.ts # Client-side tool handlers
│   ├── visitor.ts       # User identity
│   └── location.ts      # Geolocation
├── routes/              # TanStack Router routes
│   ├── index.tsx        # Landing page
│   ├── chat.tsx         # Main chat room
│   └── api.chat.ts      # AI API endpoint
└── data/                # Mock data
convex/
├── schema.ts            # Database schema
├── messages.ts          # Message functions
├── shortlist.ts         # Shortlist functions
├── votes.ts             # Voting functions
└── places.ts            # Google Places actions
```

## License

MIT
