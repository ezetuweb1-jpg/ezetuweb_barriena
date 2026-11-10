import type { SyntheticEvent } from 'react';

const block = (e: SyntheticEvent) => e.preventDefault();

export function ProtectedPhoto({ src, alt, loading, className = '' }: {
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}) {
  return (
    <div
      className="absolute inset-0 select-none"
      style={{ WebkitTouchCallout: 'none' }}
      onContextMenu={block}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        draggable={false}
        onDragStart={block}
        className={`w-full h-full select-none pointer-events-none ${className}`}
      />
      <div className="absolute inset-0" onContextMenu={block} onDragStart={block} />
    </div>
  );
}
