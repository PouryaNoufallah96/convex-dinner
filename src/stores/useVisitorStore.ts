import { create } from "zustand";

const VISITOR_ID_KEY = "dinner-plans-visitor-id";
const VISITOR_NAME_KEY = "dinner-plans-visitor-name";

interface VisitorState {
  visitorId: string;
  visitorName: string | null;
  showLoginDialog: boolean;
  isInitialized: boolean;
  // Actions
  initialize: () => void;
  login: (name: string) => void;
  logout: () => void;
  openLoginDialog: () => void;
  closeLoginDialog: () => void;
}

export const useVisitorStore = create<VisitorState>((set) => ({
  visitorId: "",
  visitorName: null,
  showLoginDialog: false,
  isInitialized: false,

  initialize: () => {
    if (typeof window === "undefined") {
      set({ isInitialized: true });
      return;
    }

    const storedName = localStorage.getItem(VISITOR_NAME_KEY);
    let storedId = localStorage.getItem(VISITOR_ID_KEY);

    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, storedId);
    }

    set({
      visitorId: storedId,
      visitorName: storedName,
      showLoginDialog: !storedName,
      isInitialized: true,
    });
  },

  login: (name: string) => {
    if (typeof window === "undefined") return;

    let visitorId = localStorage.getItem(VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(VISITOR_ID_KEY, visitorId);
    }

    localStorage.setItem(VISITOR_NAME_KEY, name);

    set({
      visitorId,
      visitorName: name,
      showLoginDialog: false,
    });
  },

  logout: () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(VISITOR_ID_KEY);
    localStorage.removeItem(VISITOR_NAME_KEY);

    set({
      visitorId: "",
      visitorName: null,
      showLoginDialog: true,
    });
  },

  openLoginDialog: () => set({ showLoginDialog: true }),
  closeLoginDialog: () => set({ showLoginDialog: false }),
}));
