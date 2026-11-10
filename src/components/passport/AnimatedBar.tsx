import { useEffect, useState } from 'react';

interface AnimatedBarProps {
  pct: number;
  className: string;
  fillClassName: string;
}

export function AnimatedBar({ pct, className, fillClassName }: AnimatedBarProps) {
  const target = Math.min(100, Math.max(0, pct));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <div className={className}>
      <div className={`${fillClassName} transition-[width] duration-1000 ease-out`} style={{ width: `${width}%` }} />
    </div>
  );
}
