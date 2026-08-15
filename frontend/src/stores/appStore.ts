import { create } from "zustand";
import { Message, ResidentView, SystemLogEntry, Zone } from "../types";
import { AppState, Session } from "../types/store";

interface AppStore extends AppState {
  setSession: (session: Session) => void;
  setZones: (zones: Zone[]) => void;
  setMessages: (messages: Message[]) => void;
  setResidents: (residents: ResidentView[]) => void;
  setSystemLog: (entries: SystemLogEntry[]) => void;
  setError: (error: string | null) => void;
}

const emptySession: Session = {
  uid: "",
  latitude: 0,
  longitude: 0,
  zoneId: null,
  zoneName: null
};

/**
 * Centrale Zustand-store van Overdeheg.
 * Hooks schrijven hier de data uit de API naartoe;
 * componenten lezen alleen deze staat.
 */
export const useAppStore = create<AppStore>((set) => ({
  session: emptySession,
  zones: [],
  messages: [],
  residents: [],
  systemLog: [],
  error: null,
  setSession: (session) => set({ session }),
  setZones: (zones) => set({ zones }),
  setMessages: (messages) => set({ messages }),
  setResidents: (residents) => set({ residents }),
  setSystemLog: (entries) => set({ systemLog: entries }),
  setError: (error) => set({ error })
}));
