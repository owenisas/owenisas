import { useRef, useCallback, useEffect, useState } from 'react';
import { useWindows } from '../contexts/WindowContext';

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

  const onTitleBarDown = useCallback((e) => {
    if (e.target.closest('.traffic-lights')) return;
    e.preventDefault();
    isDragging.current = true;
    const rect = windowRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    focusWindow(windowData.id);
    document.addEventListener('pointermove', onDragMove);
    document.addEventListener('pointerup', onDragUp);
  }, [windowData.id, focusWindow]);

  const onDragMove = useCallback((e) => {
    if (!isDragging.current) return;
    const x = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.current.x));
    const y = Math.max(25, Math.min(window.innerHeight - 50, e.clientY - dragOffset.current.y));
    updateWindow(windowData.id, { x, y, maximized: false, prevBounds: null });
  }, [windowData.id, updateWindow]);

  const onDragUp = useCallback(() => {
    isDragging.current = false;
    document.removeEventListener('pointermove', onDragMove);
    document.removeEventListener('pointerup', onDragUp);
  }, [onDragMove]);

  const onResizeDown = useCallback((e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    resizeDir.current = dir;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startBounds.current = { x: windowData.x, y: windowData.y, width: windowData.width, height: windowData.height };
    focusWindow(windowData.id);
    document.addEventListener('pointermove', onResizeMove);
    document.addEventListener('pointerup', onResizeUp);
  }, [windowData, focusWindow]);

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

    updateWindow(windowData.id, { x, y, width: w, height: h, maximized: false, prevBounds: null });
  }, [windowData.id, updateWindow]);

  const onResizeUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('pointermove', onResizeMove);
    document.removeEventListener('pointerup', onResizeUp);
  }, [onResizeMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('pointermove', onDragMove);
      document.removeEventListener('pointerup', onDragUp);
      document.removeEventListener('pointermove', onResizeMove);
      document.removeEventListener('pointerup', onResizeUp);
    };
  }, []);

  if (windowData.minimized) return null;

  const resizeHandles = ['n','s','e','w','ne','nw','se','sw'];
  const cursorMap = { n:'ns-resize', s:'ns-resize', e:'ew-resize', w:'ew-resize', ne:'nesw-resize', nw:'nwse-resize', se:'nwse-resize', sw:'nesw-resize' };

  return (
    <div
      ref={windowRef}
      className="absolute flex flex-col overflow-hidden"
      style={{
        left: windowData.x,
        top: windowData.y,
        width: windowData.width,
        height: windowData.height,
        zIndex: windowData.zIndex,
        borderRadius: windowData.maximized ? 0 : 10,
        boxShadow: isActive ? '0 0 0 0.5px rgba(255,255,255,0.2), 0 20px 60px rgba(0,0,0,0.5)' : '0 0 0 0.5px rgba(255,255,255,0.1), 0 10px 30px rgba(0,0,0,0.3)',
        transition: windowData.maximized !== undefined ? 'none' : undefined,
      }}
      onPointerDown={() => focusWindow(windowData.id)}
    >
      {/* Title Bar */}
      <div
        className="flex items-center h-[38px] shrink-0 px-[14px] gap-[8px] select-none"
        style={{
          background: isActive ? 'rgba(50,50,50,0.6)' : 'rgba(40,40,40,0.4)',
          borderBottom: '0.5px solid rgba(0,0,0,0.2)',
          backdropFilter: 'blur(50px) saturate(200%)',
          WebkitBackdropFilter: 'blur(50px) saturate(200%)',
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
            className="w-[12px] h-[12px] rounded-full flex items-center justify-center border-[0.5px] border-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
            style={{ background: isActive ? '#ff5f57' : '#4d4d4d' }}
            onClick={() => closeWindow(windowData.id)}
          >
            {trafficHover && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" strokeLinecap="round">
                <path d="M1 1L5 5M5 1L1 5"/>
              </svg>
            )}
          </button>
          <button
            className="w-[12px] h-[12px] rounded-full flex items-center justify-center border-[0.5px] border-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
            style={{ background: isActive ? '#febc2e' : '#4d4d4d' }}
            onClick={() => minimizeWindow(windowData.id)}
          >
            {trafficHover && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5">
                <path d="M1 3h4"/>
              </svg>
            )}
          </button>
          <button
            className="w-[12px] h-[12px] rounded-full flex items-center justify-center border-[0.5px] border-black/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
            style={{ background: isActive ? '#28c840' : '#4d4d4d' }}
            onClick={() => maximizeWindow(windowData.id)}
          >
            {trafficHover && (
              <svg width="6" height="6" viewBox="0 0 6 6" fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2">
                <path d="M1 4v1h1M5 2V1H4M1.5 4.5l3-3"/>
              </svg>
            )}
          </button>
        </div>
        <span className="flex-1 text-center text-[13px] text-white/80 font-semibold tracking-wide truncate pointer-events-none" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.2)' }}>
          {windowData.title}
        </span>
        <div className="w-[54px]" />
      </div>

      {/* Toolbar (merged with title bar chrome) */}
      {toolbar && (
        <div
          className="shrink-0"
          style={{
            background: 'rgba(50,50,50,0.4)',
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(50px) saturate(200%)',
            WebkitBackdropFilter: 'blur(50px) saturate(200%)',
          }}
        >
          {toolbar}
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-hidden ${!toolbar ? 'rounded-b-[10px]' : ''}`} style={{ background: 'rgba(30,30,30,0.85)', backdropFilter: 'blur(80px) saturate(200%)', WebkitBackdropFilter: 'blur(80px) saturate(200%)', borderRadius: windowData.maximized ? 0 : undefined }}>
        {children}
      </div>

      {/* Resize Handles */}
      {!windowData.maximized && resizeHandles.map(dir => (
        <div
          key={dir}
          className="absolute"
          style={{
            cursor: cursorMap[dir],
            ...(dir === 'n' && { top: 0, left: 6, right: 6, height: 4 }),
            ...(dir === 's' && { bottom: 0, left: 6, right: 6, height: 4 }),
            ...(dir === 'e' && { right: 0, top: 6, bottom: 6, width: 4 }),
            ...(dir === 'w' && { left: 0, top: 6, bottom: 6, width: 4 }),
            ...(dir === 'ne' && { top: 0, right: 0, width: 8, height: 8 }),
            ...(dir === 'nw' && { top: 0, left: 0, width: 8, height: 8 }),
            ...(dir === 'se' && { bottom: 0, right: 0, width: 8, height: 8 }),
            ...(dir === 'sw' && { bottom: 0, left: 0, width: 8, height: 8 }),
          }}
          onPointerDown={(e) => onResizeDown(e, dir)}
        />
      ))}
    </div>
  );
}
