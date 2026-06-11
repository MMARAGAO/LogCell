"use client";

interface SparklineProps {
  data: number[];
  /** Cor da linha. Use uma cor semântica (ex: currentColor herda do texto). */
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Mini gráfico de tendência (SVG puro, sem dependências).
 * Renderiza uma linha suave com área preenchida sutil.
 */
export function Sparkline({
  data,
  color = "currentColor",
  width = 96,
  height = 32,
  className,
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div className={className} style={{ width, height }} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 4) - 2;

    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const gradientId = `spark-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      aria-hidden="true"
      className={className}
      height={height}
      style={{ color }}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
    </svg>
  );
}
