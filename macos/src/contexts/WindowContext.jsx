import { createContext, useContext, useState, useCallback, useRef } from 'react';

const WindowContext = createContext(null);

const windowDefaults = {
  calculator: { width: 232, height: 396 },
  finder:     { width: 920, height: 560 },
  notes:      { width: 900, height: 560 },
  terminal:   { width: 640, height: 420 },
  safari:     { width: 1020, height: 640 },
  settings:   { width: 780, height: 520 },
  textedit:   { width: 680, height: 480 },
  photos:     { width: 960, height: 600 },
};

export function WindowProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const topZRef = useRef(10);

  const openWindow = useCallback((appId, title, icon) => {
    const existing = windows.find(w => w.appId === appId && !w.minimized);
    if (existing) {
      focusWindow(existing.id);
      return existing.id;
    }

    const id = `window-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    topZRef.current += 1;

    const newWindow = {
      id,
      appId,
      title,
      icon,
      x: 120 + Math.random() * 200,
      y: 60 + Math.random() * 100,
      width: (windowDefaults[appId]?.width) || 800,
      height: (windowDefaults[appId]?.height) || 520,
      zIndex: topZRef.current,
      minimized: false,
      maximized: false,
      prevBounds: null,
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(id);
    return id;
  }, [windows]);

  const closeWindow = useCallback((id) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    setActiveWindowId(prev => {
      if (prev === id) {
        const remaining = windows.filter(w => w.id !== id && !w.minimized);
        if (remaining.length > 0) {
          return remaining.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id;
        }
        return null;
      }
      return prev;
    });
  }, [windows]);

  const focusWindow = useCallback((id) => {
    topZRef.current += 1;
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, zIndex: topZRef.current, minimized: false } : w
    ));
    setActiveWindowId(id);
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, minimized: true } : w
    ));
    setActiveWindowId(prev => {
      if (prev === id) {
        const remaining = windows.filter(w => w.id !== id && !w.minimized);
        if (remaining.length > 0) {
          return remaining.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id;
        }
        return null;
      }
      return prev;
    });
  }, [windows]);

  const maximizeWindow = useCallback((id) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.maximized) {
        return { ...w, maximized: false, ...w.prevBounds, prevBounds: null };
      }
      return {
        ...w,
        maximized: true,
        prevBounds: { x: w.x, y: w.y, width: w.width, height: w.height },
        x: 0,
        y: 25,
        width: window.innerWidth,
        height: window.innerHeight - 25,
      };
    }));
  }, []);

  const updateWindow = useCallback((id, updates) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, ...updates } : w
    ));
  }, []);

  const restoreWindow = useCallback((appId) => {
    const win = windows.find(w => w.appId === appId && w.minimized);
    if (win) {
      focusWindow(win.id);
    }
  }, [windows, focusWindow]);

  const isAppOpen = useCallback((appId) => {
    return windows.some(w => w.appId === appId);
  }, [windows]);

  const activeApp = windows.find(w => w.id === activeWindowId);

  return (
    <WindowContext.Provider value={{
      windows,
      activeWindowId,
      activeApp,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      updateWindow,
      restoreWindow,
      isAppOpen,
    }}>
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error('useWindows must be inside WindowProvider');
  return ctx;
}
