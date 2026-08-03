import { useRef, useCallback, useEffect, useState } from 'react';
import { useWindows } from '../contexts/WindowContext';

const LIGHT_CHROME_APPS = new Set([
  'finder', 'settings', 'aboutthismac', 'calendar', 'photos', 'preview', 'textedit',
]);

export default function Window({ windowData, children, toolbar }) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindow, activeWindowId } = useWindows();
  const windowRef = useRef(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeDir = useRef('');
  const startBounds = useRef({});
  const startMouse = useRef({ x: 0, y: 0 });
  const [trafficHover, setTrafficHover] = useState(false);

  const isActive = activeWindowId === windowData.id;
  const isLightChrome = LIGHT_CHROME_APPS.has(windowData.appId);

  const onDragMove = useCallback((e) => {
    if (!isDragging.current) return;
    const x = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.current.x));
    const y = Math.max(25, Math.min(window.innerHeight - 50, e.clientY - dragOffset.current.y));
    updateWindow(windowData.id, { x, y, maximized: false, prevBounds: null });
  }, [windowData.id, updateWindow]);

  const onDragUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('pointermove', onDragMove);
  }, [onDragMove]);

  const onTitleBarDown = useCallback((e) => {
    if (e.target.closest('.traffic-lights')) return;
    e.preventDefault();
    isDragging.current = true;
    const rect = windowRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    focusWindow(windowData.id);
    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', onDragUp, { once: true });
  }, [windowData.id, focusWindow, onDragMove, onDragUp]);

  const onResizeMove = useCallback((e) => {
    if (!isResizing.current) return;
    const dx = e.clientX - startMouse.current.x;
    const dy = e.clientY - startMouse.current.y;
    const dir = resizeDir.current;
    const b = startBounds.current;
    const minW = 300, minH = 200;

    let x = b.x, y = b.y, w = b.width, h = b.height;

    if (dir.includes('e')) w = Math.max(minW, b.width + dx);
    if (dir.includes('w')) { w = Math.max(minW, b.width - dx); x = b.x + b.width - w; }
    if (dir.includes('s')) h = Math.max(minH, b.height + dy);
    if (dir.includes('n')) { h = Math.max(minH, b.height - dy); y = b.y + b.height - h; }

    const maxW = Math.max(minW, window.innerWidth - Math.max(0, x));
    const maxH = Math.max(minH, window.innerHeight - 25 - Math.max(0, y));
    w = Math.min(w, maxW);
    h = Math.min(h, maxH);
    x = Math.max(0, Math.min(x, window.innerWidth - w));
    y = Math.max(25, Math.min(y, window.innerHeight - h));

    updateWindow(windowData.id, { x, y, width: w, height: h, maximized: false, prevBounds: null });
  }, [windowData.id, updateWindow]);

  const onResizeUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('pointermove', onResizeMove);
  }, [onResizeMove]);

  const onResizeDown = useCallback((e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    resizeDir.current = dir;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startBounds.current = { x: windowData.x, y: windowData.y, width: windowData.width, height: windowData.height };
    focusWindow(windowData.id);
    document.addEventListener('pointermove', onResizeMove);
    document.addEventListener('pointerup', onResizeUp, { once: true });
  }, [windowData, focusWindow, onResizeMove, onResizeUp]);

  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', onDragMove);
      document.removeEventListener('pointerup', onDragUp);
      document.removeEventListener('pointermove', onResizeMove);
      document.removeEventListener('pointerup', onResizeUp);
    };
  }, [onDragMove, onDragUp, onResizeMove, onResizeUp]);

  if (windowData.minimized) return null;

  const resizeHandles = ['n','s','e','w','ne','nw','se','sw'];
  const cursorMap = { n:'ns-resize', s:'ns-resize', e:'ew-resize', w:'ew-resize', ne:'nesw-resize', nw:'nwse-resize', se:'nwse-resize', sw:'nesw-resize' };

  return (
    <div
      ref={windowRef}
      className="absolute flex flex-col overflow-hidden mac-window"
      style={{
        left: windowData.x,
        top: windowData.y,
        width: windowData.width,
        height: windowData.height,
        zIndex: windowData.zIndex,
        borderRadius: windowData.maximized ? 0 : 10,
        boxShadow: isActive ? 'var(--mac-shadow-window)' : 'var(--mac-shadow-window-inactive)',
        transition: windowData.maximized !== undefined ? 'none' : undefined,
        background: isLightChrome ? 'rgba(246,246,248,0.72)' : 'rgba(18,19,23,0.48)',
        border: isLightChrome ? '0.5px solid rgba(0,0,0,0.16)' : '0.5px solid rgba(255,255,255,0.15)',
        animation: 'scale-in 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
        transformOrigin: 'center bottom',
      }}
      onPointerDown={() => focusWindow(windowData.id)}
    >
      {/* Title Bar */}
      <div
        className="flex items-center h-[36px] shrink-0 pl-[18px] pr-[14px] gap-[8px] select-none"
        style={{
          background: isLightChrome
            ? (isActive ? 'rgba(255,255,255,0.78)' : 'rgba(246,246,248,0.66)')
            : (isActive ? 'rgba(245,248,255,0.12)' : 'rgba(245,248,255,0.07)'),
          borderBottom: isLightChrome ? '0.5px solid rgba(0,0,0,0.10)' : '0.5px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(56px) saturate(190%)',
          WebkitBackdropFilter: 'blur(56px) saturate(190%)',
          cursor: 'default',
        }}
        onPointerDown={onTitleBarDown}
      >
        {/* Traffic Lights */}
        <div
          className="traffic-lights flex items-center gap-[8px]"
          onMouseEnter={() => setTrafficHover(true)}
          onMouseLeave={() => setTrafficHover(false)}
        >
          <button
            aria-label="Close Window"
            className="w-[12px] h-[12px] rounded-full flex items-center justify-center border-[0.5px] border-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
            style={{ background: isActive ? '#ff5f57' : 'rgba(255,255,255,0.24)', opacity: isActive || trafficHover ? 1 : 0.55 }}
            onClick={() => closeWindow(windowData.id)}
          >
            {trafficHover && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" strokeLinecap="round">
                <path d="M1 1L5 5M5 1L1 5"/>
              </svg>
            )}
          </button>
          <button
            aria-label="Minimize Window"
            className="w-[12px] h-[12px] rounded-full flex items-center justify-center border-[0.5px] border-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
            style={{ background: isActive ? '#febc2e' : 'rgba(255,255,255,0.24)', opacity: isActive || trafficHover ? 1 : 0.55 }}
            onClick={() => minimizeWindow(windowData.id)}
          >
            {trafficHover && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5">
                <path d="M1 3h4"/>
              </svg>
            )}
          </button>
          <button
            aria-label="Maximize Window"
            className="w-[12px] h-[12px] rounded-full flex items-center justify-center border-[0.5px] border-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
            style={{ background: isActive ? '#28c840' : 'rgba(255,255,255,0.24)', opacity: isActive || trafficHover ? 1 : 0.55 }}
            onClick={() => maximizeWindow(windowData.id)}
          >
            {trafficHover && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2">
                <path d="M1 4v1h1M5 2V1H4M1.5 4.5l3-3"/>
              </svg>
            )}
          </button>
        </div>
        <span
          className={`flex-1 text-center text-[13px] font-medium truncate pointer-events-none ${isLightChrome ? 'text-black/75' : 'text-white/80'}`}
          style={{ textShadow: isLightChrome ? 'none' : '0 1px 1px rgba(0,0,0,0.22)' }}
        >
          {windowData.title}
        </span>
        <div className="w-[54px]" />
      </div>

      {/* Toolbar (merged with title bar chrome) */}
      {toolbar && (
        <div
          className="shrink-0"
          style={{
            background: isLightChrome ? 'rgba(246,246,248,0.70)' : 'rgba(245,248,255,0.08)',
            borderBottom: isLightChrome ? '0.5px solid rgba(0,0,0,0.08)' : '0.5px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(56px) saturate(190%)',
            WebkitBackdropFilter: 'blur(56px) saturate(190%)',
          }}
        >
          {toolbar}
        </div>
      )}

      <div
        className={`flex-1 overflow-hidden ${!toolbar && !windowData.maximized ? 'rounded-b-[10px]' : ''}`}
        style={{
          background: isLightChrome ? 'rgba(246,246,248,0.42)' : 'rgba(28,29,34,0.82)',
          backdropFilter: 'blur(78px) saturate(190%)',
          WebkitBackdropFilter: 'blur(78px) saturate(190%)',
          borderRadius: windowData.maximized ? 0 : undefined,
        }}
      >
        {children}
      </div>

      {/* Resize Handles */}
      {!windowData.maximized && windowData.resizable !== false && resizeHandles.map(dir => (
        <div
          key={dir}
          className="absolute"
          style={{
            cursor: cursorMap[dir],
            ...(dir === 'n' && { top: -4, left: 6, right: 6, height: 10 }),
            ...(dir === 's' && { bottom: -4, left: 6, right: 6, height: 10 }),
            ...(dir === 'e' && { right: -4, top: 6, bottom: 6, width: 10 }),
            ...(dir === 'w' && { left: -4, top: 6, bottom: 6, width: 10 }),
            ...(dir === 'ne' && { top: -6, right: -6, width: 16, height: 16 }),
            ...(dir === 'nw' && { top: -6, left: -6, width: 16, height: 16 }),
            ...(dir === 'se' && { bottom: -6, right: -6, width: 16, height: 16 }),
            ...(dir === 'sw' && { bottom: -6, left: -6, width: 16, height: 16 }),
          }}
          onPointerDown={(e) => onResizeDown(e, dir)}
        />
      ))}
    </div>
  );
}
