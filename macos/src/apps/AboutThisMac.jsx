export default function AboutThisMac({ onAppLaunch }) {
  return (
    <div className="flex flex-col items-center bg-[#f5f5f7] h-full px-6 pt-8 pb-5 select-none">
      {/* MacBook Pro Image */}
      <div className="w-[200px] h-[130px] flex items-center justify-center">
        <img
          src="/12889736.png"
          alt="MacBook Pro"
          className="w-full h-full object-contain"
          draggable={false}
        />
      </div>

      {/* Title */}
      <h1
        className="text-[26px] text-black tracking-[-0.02em] mt-3"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif', fontWeight: 500, fontStyle: 'italic' }}
      >
        MacBook Pro
      </h1>
      <p className="text-[13px] text-[#86868B] mt-0.5">16-inch, 2024</p>

      {/* Specs Table */}
      <table className="mt-5 text-[13px] border-separate" style={{ borderSpacing: '12px 2px' }}>
        <tbody>
          <tr>
            <td className="text-[#86868B] text-right">Chip</td>
            <td className="text-black">Apple M3</td>
          </tr>
          <tr>
            <td className="text-[#86868B] text-right">Memory</td>
            <td className="text-black">36 GB</td>
          </tr>
          <tr>
            <td className="text-[#86868B] text-right">macOS</td>
            <td className="text-black">Tahoe 16.0</td>
          </tr>
        </tbody>
      </table>

      {/* More Info Button */}
      <button
        className="mt-6 px-5 py-[5px] text-[13px] text-black bg-white rounded-md border border-black/15 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        style={{ boxShadow: '0 0.5px 1px rgba(0,0,0,0.1)' }}
        onClick={() => onAppLaunch?.('settings', 'System Settings')}
      >
        More Info...
      </button>

      {/* Footer */}
      <div className="mt-auto text-center">
        <button className="text-[11px] text-[#6e6e73] underline decoration-[#6e6e73]/50 underline-offset-2 hover:text-[#444] transition-colors">
          Regulatory Certification
        </button>
        <p className="text-[11px] text-[#6e6e73] mt-2.5 leading-[1.35]">
          TM and © 1983-2026 Apple Inc.<br />
          All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
