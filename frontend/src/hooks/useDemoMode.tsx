import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const STORAGE_KEY = "raqeeb-demo-mode";

type DemoModeContextValue = {
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  toggleDemoMode: () => void;
};

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

function readInitial(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === "true";
  return import.meta.env.VITE_DEMO_MODE !== "false";
}

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoModeState] = useState(readInitial);

  const setDemoMode = useCallback((v: boolean) => {
    setDemoModeState(v);
    localStorage.setItem(STORAGE_KEY, String(v));
  }, []);

  const toggleDemoMode = useCallback(() => {
    setDemoMode(!demoMode);
  }, [demoMode, setDemoMode]);

  return (
    <DemoModeContext.Provider value={{ demoMode, setDemoMode, toggleDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode outside provider");
  return ctx;
}
