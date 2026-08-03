import { useMemo, useState, useEffect } from 'react';
import SFSymbol from '../components/icons/SFSymbol';
import { MacToolbarButton } from '../components/ui/MacControls';
import { getByPath } from '../fs/vfs';
import { useFileContent } from '../hooks/useFileContent';
import MarkdownView from '../components/MarkdownView';

export default function Preview({ windowData }) {
  const payloadPath = windowData?.payload?.vfsPath;
  const node = useMemo(() => (payloadPath ? getByPath(payloadPath) : null), [payloadPath]);
  const [zoom, setZoom] = useState(1);

  useEffect(() => { setZoom(1); }, [payloadPath]);

  if (!node || node.type !== 'file') {
    return <EmptyState />;
  }

  const isImage = node.kind === 'image';
  const isText = node.kind === 'md' || node.kind === 'text';
  const isPdf = node.kind === 'pdf';

  return (
    <div className="flex flex-col h-full text-white" style={{ background: 'rgba(18,19,23,0.92)' }}>
      <div className="flex items-center gap-1 h-[40px] px-3 shrink-0" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <MacToolbarButton icon="sidebar.left" size={26} label="Sidebar" />
        <div className="flex items-center gap-0.5 ml-1">
          <MacToolbarButton icon="minus.magnifyingglass" size={26} label="Zoom Out" onClick={() => setZoom(z => Math.max(0.25, z - 0.15))} />
          <MacToolbarButton icon="plus.magnifyingglass" size={26} label="Zoom In" onClick={() => setZoom(z => Math.min(4, z + 0.15))} />
        </div>
        <div className="flex-1" />
        <div className="text-[12px] text-white/60 truncate max-w-[40%]">{node.name}</div>
        <div className="flex-1" />
        <MacToolbarButton icon="square.and.arrow.up" size={26} label="Share" />
      </div>
      <div className="flex-1 flex items-center justify-center overflow-auto" style={{ background: 'rgba(0,0,0,0.45)' }}>
        {isImage && <ImageView node={node} zoom={zoom} />}
        {isText && <TextView node={node} zoom={zoom} />}
        {isPdf && <PdfView node={node} zoom={zoom} />}
        {!isImage && !isText && !isPdf && (
          <div className="text-white/50 text-[13px]">No preview available</div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-white/50 gap-3" style={{ background: 'rgba(18,19,23,0.9)' }}>
      <SFSymbol name="photo" size={48} color="rgba(255,255,255,0.2)" />
      <div className="text-[14px] font-medium">No file open</div>
      <div className="text-[11px] text-white/40 max-w-[280px] text-center leading-relaxed">
        Open an image, PDF, or text file from Finder to preview it here.
      </div>
    </div>
  );
}

function ImageView({ node, zoom }) {
  return (
    <div className="p-8 flex items-center justify-center w-full h-full">
      <img
        src={node.contentUrl}
        alt={node.name}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.12s ease-out', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', borderRadius: 4 }}
        onError={e => { e.currentTarget.style.display = 'none'; const fallback = e.currentTarget.nextElementSibling; if (fallback) fallback.style.display = 'flex'; }}
      />
      <div className="hidden flex-col items-center gap-2 text-white/50" style={{ display: 'none' }}>
        <SFSymbol name="photo" size={56} color="rgba(255,255,255,0.25)" />
        <div className="text-[13px]">Image unavailable</div>
        <div className="text-[11px] text-white/35">{node.meta?.caption || node.name}</div>
      </div>
    </div>
  );
}

function TextView({ node, zoom }) {
  const { text, loading, error } = useFileContent(node.contentUrl);
  if (loading) return <div className="text-white/40 text-[13px]">Loading…</div>;
  if (error) return <div className="text-red-300 text-[13px]">Error: {error}</div>;
  return (
    <div className="max-w-[760px] w-full mx-auto px-8 py-10 overflow-y-auto h-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
      {node.kind === 'md' ? <MarkdownView text={text} /> : <pre className="text-[12px] text-white/85 font-mono whitespace-pre-wrap">{text}</pre>}
    </div>
  );
}

function PdfView({ node, zoom }) {
  return (
    <div className="w-full h-full overflow-auto bg-white"><iframe src={node.contentUrl} title={node.name} className="w-full h-full border-0 bg-white" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%`, height: `${100 / zoom}%` }} /></div>
  );
}
