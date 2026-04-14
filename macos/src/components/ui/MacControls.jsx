// Shared macOS UI primitives — pixel-perfect Sequoia components
import SFSymbol from '../icons/SFSymbol';

const toneStyles = {
  glass: {
    background: 'var(--mac-glass-clear)',
    border: '0.5px solid rgba(255,255,255,0.13)',
  },
  quiet: {
    background: 'transparent',
    border: '0.5px solid transparent',
  },
  solid: {
    background: 'rgba(255,255,255,0.12)',
    border: '0.5px solid rgba(255,255,255,0.14)',
  },
};

// --- Toggle Switch (green when on, like real macOS) ---
export function MacToggle({ checked, onChange, size = 'default' }) {
  const w = size === 'small' ? 32 : 38;
  const h = size === 'small' ? 18 : 22;
  const knob = size === 'small' ? 14 : 18;
  const pad = 2;
  return (
    <button
      className="relative shrink-0 rounded-full transition-colors duration-200 cursor-default"
      style={{
        width: w, height: h,
        background: checked ? '#34C759' : 'rgba(255,255,255,0.15)',
        boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.15)',
      }}
      onClick={() => onChange?.(!checked)}
    >
      <div
        className="absolute rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
        style={{
          width: knob, height: knob, top: pad,
          left: checked ? w - knob - pad : pad,
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </button>
  );
}

// --- Slider ---
export function MacSlider({ value, onChange, min = 0, max = 100, accentColor = '#0a84ff' }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="relative flex items-center w-full h-5 group">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange?.(Number(e.target.value))}
        className="w-full appearance-none bg-transparent cursor-default relative z-10"
        style={{ height: 20 }}
      />
      <div className="absolute left-0 right-0 h-[4px] rounded-full bg-white/15 pointer-events-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accentColor }} />
      </div>
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0.5px 2px rgba(0,0,0,0.3), 0 0 0 0.5px rgba(0,0,0,0.1);
          cursor: default;
          position: relative;
          z-index: 2;
        }
        input[type=range]::-webkit-slider-runnable-track {
          height: 4px;
          background: transparent;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}

// --- Segmented Control ---
export function MacSegmentedControl({ options, value, onChange, size = 'default', tone = 'glass' }) {
  const h = size === 'small' ? 22 : size === 'large' ? 30 : 26;
  return (
    <div
      className="inline-flex items-center rounded-[8px] p-[2px]"
      style={{ ...toneStyles[tone], height: h, boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.08)' }}
    >
      {options.map(opt => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            className="relative flex items-center justify-center px-2.5 h-full rounded-[5px] text-[11px] font-medium transition-all duration-150 cursor-default"
            style={{
              background: isActive ? 'rgba(255,255,255,0.22)' : 'transparent',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              boxShadow: isActive ? '0 0.5px 2px rgba(0,0,0,0.2)' : 'none',
              minWidth: 28,
            }}
            onClick={() => onChange?.(opt.value)}
          >
            {opt.icon && <SFSymbol name={opt.icon} size={12} className={opt.label ? 'mr-1' : ''} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// --- Search Field ---
export function MacSearchField({ value, onChange, placeholder = 'Search', className = '', density = 'default', tone = 'glass' }) {
  const height = density === 'compact' ? 22 : density === 'spacious' ? 30 : 26;
  return (
    <div
      className={`flex items-center gap-1.5 rounded-[8px] px-2 ${className}`}
      style={{ ...toneStyles[tone], height, boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.08)' }}
    >
      <SFSymbol name="magnifyingglass" size={11} color="rgba(255,255,255,0.4)" />
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent text-[12px] text-white/90 placeholder:text-white/30 outline-none w-full"
      />
      {value && (
        <button onClick={() => onChange?.('')} className="opacity-45 hover:opacity-80 transition-opacity">
          <SFSymbol name="xmark.circle" size={11} />
        </button>
      )}
    </div>
  );
}

// --- Dropdown / Popup Button ---
export function MacDropdown({ value, options, onChange, width }) {
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={e => onChange?.(e.target.value)}
        className="appearance-none bg-white/8 text-white/90 text-[12px] rounded-[5px] pl-2 pr-5 h-[22px] border-[0.5px] border-white/10 cursor-default outline-none hover:bg-white/12"
        style={width ? { width } : {}}
      >
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt} className="bg-[#2a2a2a] text-white">
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      <SFSymbol name="chevron.down" size={8} color="rgba(255,255,255,0.5)" className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

// --- Toolbar Button ---
export function MacToolbarButton({ icon, onClick, active, label, size = 28, variant = 'quiet', tone = 'glass' }) {
  const base = variant === 'pill'
    ? { ...toneStyles[tone], borderRadius: 8 }
    : { background: active ? 'rgba(255,255,255,0.16)' : 'transparent', border: '0.5px solid transparent', borderRadius: 6 };
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center transition-colors duration-100 cursor-default mac-control"
      style={{
        width: size, height: size,
        ...base,
        color: active ? '#fff' : 'rgba(255,255,255,0.7)',
        boxShadow: active ? 'inset 0 0.5px 0 rgba(255,255,255,0.12)' : 'none',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = variant === 'pill' ? toneStyles[tone].background : 'transparent'; }}
      title={label}
    >
      {typeof icon === 'string' ? <SFSymbol name={icon} size={14} /> : icon}
    </button>
  );
}

// --- Sidebar Item ---
export function MacSidebarItem({ icon, iconColor, label, selected, onClick, badge, density = 'default', tone = 'sidebar' }) {
  const padY = density === 'compact' ? 2 : density === 'spacious' ? 5 : 3;
  return (
    <button
      className="flex items-center w-full gap-2 px-2.5 rounded-[6px] text-[13px] cursor-default transition-colors duration-75"
      style={{
        paddingTop: padY + 1.5,
        paddingBottom: padY + 1.5,
        background: selected ? (tone === 'source' ? 'rgba(10,132,255,0.82)' : 'rgba(255,255,255,0.2)') : 'transparent',
        color: selected ? '#fff' : 'rgba(255,255,255,0.85)',
        boxShadow: selected ? 'inset 0 0.5px 0 rgba(255,255,255,0.12)' : 'none',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
      onClick={onClick}
    >
      {typeof icon === 'string' ? (
        <SFSymbol name={icon} size={15} color={iconColor || (selected ? '#0a84ff' : 'rgba(255,255,255,0.55)')} />
      ) : icon}
      <span className="truncate flex-1 text-left">{label}</span>
      {badge && <span className="text-[10px] text-white/40 tabular-nums">{badge}</span>}
    </button>
  );
}

// --- Settings Row ---
export function MacSettingsRow({ label, description, children, noBorder, density = 'default' }) {
  const minHeight = density === 'spacious' ? 46 : 42;
  return (
    <div className="relative">
      <div
        className="flex items-center justify-between"
        style={{
          minHeight,
          padding: density === 'spacious' ? '10px 16px' : '8px 16px',
        }}
      >
        <div className="flex-1 min-w-0" style={{ marginRight: 16 }}>
          <div className="text-[14px] text-black tracking-[-0.01em]">{label}</div>
          {description && <div className="text-[12px] text-[#86868b] mt-0.5 leading-snug">{description}</div>}
        </div>
        <div className="shrink-0 flex items-center gap-2">{children}</div>
      </div>
      {!noBorder && <div className="absolute bottom-0 right-0 h-[0.5px] bg-black/10" style={{ left: 44 }} />}
    </div>
  );
}

// --- Settings Group Card ---
export function MacSettingsGroup({ title, children, tone = 'default' }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {title && <div className="text-[12px] text-[#86868b] ml-1 mb-1.5">{title}</div>}
      <div
        className="rounded-[10px] overflow-hidden bg-white"
        style={{
          boxShadow: '0 1px 2px rgba(0,0,0,0.05), inset 0 0 0 0.5px rgba(0,0,0,0.1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// --- Settings Category Icon (colored rounded rect with symbol) ---
export function MacSettingsIcon({ icon, color }) {
  return (
    <div
      className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center shrink-0"
      style={{ background: color }}
    >
      <SFSymbol name={icon} size={14} color="white" />
    </div>
  );
}

// --- Section Header (for sidebar sections) ---
export function MacSidebarSection({ title, children }) {
  return (
    <div className="mb-4 mt-1">
      {title && <div className="text-[11px] font-semibold text-white/40 uppercase tracking-wider px-3 pb-1.5">{title}</div>}
      <div className="flex flex-col gap-[2px]">{children}</div>
    </div>
  );
}
