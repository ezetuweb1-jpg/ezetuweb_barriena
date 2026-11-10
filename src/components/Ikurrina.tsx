export function Ikurrina({ className = 'w-7 h-3.5' }: { className?: string }) {
  // Authentic Ikurriña — proportions 280:140 (2:1).
  // Red field (#D52B1E), green saltire (#009B48), white cross (#FFFFFF).
  // Saltire band width ~14% of height (20px in 140px tall viewBox).
  // White cross width ~14% of height, centered. Red field stays prominent.
  return (
    <svg
      viewBox="0 0 280 140"
      className={className}
      aria-label="Ikurriña"
      role="img"
      preserveAspectRatio="xMidYMid meet"
      shapeRendering="geometricPrecision"
    >
      {/* Red field */}
      <rect width="280" height="140" fill="#D52B1E" />

      {/* Green saltire (St. Andrew's cross) — two diagonal bands, 20px wide */}
      {/* Each band is a parallelogram from corner to corner with 14px offset on each side */}
      <path d="M0,0 L14,0 L280,126 L280,140 L266,140 L0,14 Z" fill="#009B48" />
      <path d="M266,0 L280,0 L280,14 L14,140 L0,140 L0,126 Z" fill="#009B48" />

      {/* White cross overlaying the saltire, centered — 20px wide (14% of height) */}
      <rect x="130" width="20" height="140" fill="#FFFFFF" />
      <rect y="60" width="280" height="20" fill="#FFFFFF" />
    </svg>
  );
}
