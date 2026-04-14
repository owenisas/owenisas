import { useEffect, useRef } from 'react';

export default function ContextMenu({ items, x, y, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Adjust position if menu goes off screen
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 28 - 20);

  return (
    <div
      ref={ref}
      className="fixed z-[250] min-w-[200px] rounded-lg py-1 shadow-2xl border border-white/10 animate-[scale-in_0.12s_ease-out]"
      style={{
        left: adjustedX,
        top: adjustedY,
        background: 'rgba(40,40,40,0.92)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
      }}
    >
      {items.map((item, i) => item.divider ? (
        <div key={i} className="h-px bg-white/10 my-1" />
      ) : (
        <button
          key={i}
          className="w-full text-left px-4 py-[3px] text-[13px] text-white/85 hover:bg-accent hover:text-white flex items-center justify-between rounded-[4px] mx-1 disabled:opacity-40"
          style={{ width: 'calc(100% - 8px)' }}
          disabled={item.disabled}
          onClick={() => { item.action?.(); onClose(); }}
        >
          <span>{item.label}</span>
          {item.shortcut && <span className="text-white/40 text-[11px] ml-4">{item.shortcut}</span>}
        </button>
      ))}
    </div>
  );
}
