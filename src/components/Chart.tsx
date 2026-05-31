import * as React from "react";
import { useEffect, useRef, useCallback } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, ColorType, LineStyle } from "lightweight-charts";

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Trade {
  id: string;
  pair: string;
  direction: "buy" | "sell";
  amount: number;
  entryPrice: number;
  entryTime: number;
  expirationTime: number;
  duration: number;
  payout: number;
  isPendingDb?: boolean;
  isOfflineFallback?: boolean;
}

export interface Drawing {
  id: string;
  type: "horizontal" | "trend" | "rectangle";
  price?: number;
  startTime?: number;
  startPrice?: number;
  endTime?: number;
  endPrice?: number;
}

interface ChartProps {
  pair: string;
  timeframe: string;
  chartType: "candles" | "area";
  indicators: { ma: boolean; bb: boolean; rsi: boolean };
  currentPrice: number;
  historicalCandles: Candle[];
  activeTrades: Trade[];
  zoomLevel: number;
  candleTimerStr: string;
  activeDrawingTool: "horizontal" | "trend" | "rectangle" | null;
  setActiveDrawingTool: (tool: "horizontal" | "trend" | "rectangle" | null) => void;
  drawings: Drawing[];
  setDrawings: React.Dispatch<React.SetStateAction<Drawing[]>>;
  floatingIndicators?: {
    id: string;
    amountText: string;
    isWin: boolean;
    yPrice: number;
    createdAt: number;
  }[];
  gridLinesEnabled?: boolean;
  gridDensity?: "low" | "medium" | "high";
  customBackground?: string | null;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

const CHART_BG = "#080d1a";
const GRID_COLOR = "rgba(34, 48, 74, 0.5)";
const TEXT_COLOR = "#4b6080";
const UP_COLOR = "#00C076";
const DOWN_COLOR = "#ef4444";
const BORDER_UP = "#00a860";
const BORDER_DOWN = "#dc2626";

export function Chart({
  pair,
  timeframe,
  chartType,
  indicators,
  currentPrice,
  historicalCandles,
  activeTrades,
  zoomLevel,
  candleTimerStr,
  activeDrawingTool,
  setActiveDrawingTool,
  drawings,
  setDrawings,
  floatingIndicators = [],
  gridLinesEnabled = true,
  gridDensity = "medium",
  customBackground,
  onZoomIn,
  onZoomOut,
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const areaSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const maSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<"Line"> | null>(null);
  const priceLineMapRef = useRef<Map<string, any>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);

  // Build CandlestickData for lightweight-charts
  const buildCandleData = useCallback((candles: Candle[]): CandlestickData[] => {
    // lightweight-charts needs time in seconds (unix) and sorted ascending
    const seen = new Set<number>();
    return candles
      .map((c) => ({
        time: Math.floor(c.time / 1000) as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
      .filter((c) => {
        if (seen.has(c.time as number)) return false;
        seen.add(c.time as number);
        return true;
      })
      .sort((a, b) => (a.time as number) - (b.time as number));
  }, []);

  const calcMA = (candles: Candle[], period = 20) => {
    const seen = new Set<number>();
    const sorted = candles
      .map((c) => ({ time: Math.floor(c.time / 1000) as Time, close: c.close }))
      .filter((c) => { if (seen.has(c.time as number)) return false; seen.add(c.time as number); return true; })
      .sort((a, b) => (a.time as number) - (b.time as number));
    return sorted
      .map((_, i) => {
        if (i < period - 1) return null;
        const slice = sorted.slice(i - period + 1, i + 1);
        const avg = slice.reduce((s, x) => s + x.close, 0) / period;
        return { time: sorted[i].time, value: avg };
      })
      .filter(Boolean) as { time: Time; value: number }[];
  };

  const calcBB = (candles: Candle[], period = 20, multiplier = 2) => {
    const seen = new Set<number>();
    const sorted = candles
      .map((c) => ({ time: Math.floor(c.time / 1000) as Time, close: c.close }))
      .filter((c) => { if (seen.has(c.time as number)) return false; seen.add(c.time as number); return true; })
      .sort((a, b) => (a.time as number) - (b.time as number));
    const upper: { time: Time; value: number }[] = [];
    const lower: { time: Time; value: number }[] = [];
    sorted.forEach((_, i) => {
      if (i < period - 1) return;
      const slice = sorted.slice(i - period + 1, i + 1);
      const avg = slice.reduce((s, x) => s + x.close, 0) / period;
      const variance = slice.reduce((s, x) => s + Math.pow(x.close - avg, 2), 0) / period;
      const std = Math.sqrt(variance);
      upper.push({ time: sorted[i].time, value: avg + multiplier * std });
      lower.push({ time: sorted[i].time, value: avg - multiplier * std });
    });
    return { upper, lower };
  };

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = containerRef.current.getBoundingClientRect();

    const chart = createChart(containerRef.current, {
      width: rect.width || containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight || 400,
      layout: {
        background: { type: ColorType.Solid, color: customBackground || CHART_BG },
        textColor: TEXT_COLOR,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridLinesEnabled ? GRID_COLOR : "transparent", style: LineStyle.Dotted },
        horzLines: { color: gridLinesEnabled ? GRID_COLOR : "transparent", style: LineStyle.Dotted },
      },
      crosshair: {
        vertLine: { color: "rgba(99,179,237,0.4)", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#14213d" },
        horzLine: { color: "rgba(99,179,237,0.4)", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#14213d" },
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "rgba(34,48,74,0.6)",
        textColor: TEXT_COLOR,
        scaleMargins: { top: 0.1, bottom: 0.15 },
        minimumWidth: 70,
      },
      timeScale: {
        borderColor: "rgba(34,48,74,0.6)",
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true,
      },
      handleScale: {
        axisPressedMouseMove: { time: true, price: true },
        axisDoubleClickReset: { time: true, price: true },
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
    });

    chartRef.current = chart;

    // ResizeObserver for pixel-perfect sizing
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          chart.applyOptions({ width, height });
        }
      }
    });
    ro.observe(containerRef.current);
    resizeObserverRef.current = ro;

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      areaSeriesRef.current = null;
      maSeriesRef.current = null;
      bbUpperRef.current = null;
      bbLowerRef.current = null;
    };
  }, []); // only once

  // Update grid when settings change
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      layout: { background: { type: ColorType.Solid, color: customBackground || CHART_BG } },
      grid: {
        vertLines: { color: gridLinesEnabled ? GRID_COLOR : "transparent" },
        horzLines: { color: gridLinesEnabled ? GRID_COLOR : "transparent" },
      },
    });
  }, [gridLinesEnabled, customBackground]);

  // Update series data when candles/type/indicators change
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;
    const data = buildCandleData(historicalCandles);

    // Remove old series
    if (candleSeriesRef.current) { chart.removeSeries(candleSeriesRef.current); candleSeriesRef.current = null; }
    if (areaSeriesRef.current) { chart.removeSeries(areaSeriesRef.current); areaSeriesRef.current = null; }
    if (maSeriesRef.current) { chart.removeSeries(maSeriesRef.current); maSeriesRef.current = null; }
    if (bbUpperRef.current) { chart.removeSeries(bbUpperRef.current); bbUpperRef.current = null; }
    if (bbLowerRef.current) { chart.removeSeries(bbLowerRef.current); bbLowerRef.current = null; }

    if (chartType === "candles") {
      const cs = chart.addCandlestickSeries({
        upColor: UP_COLOR,
        downColor: DOWN_COLOR,
        borderUpColor: BORDER_UP,
        borderDownColor: BORDER_DOWN,
        wickUpColor: UP_COLOR,
        wickDownColor: DOWN_COLOR,
        borderVisible: true,
      });
      cs.setData(data);
      candleSeriesRef.current = cs;
    } else {
      const areaData = data.map((d) => ({ time: d.time, value: d.close }));
      const as = chart.addAreaSeries({
        lineColor: "#00C076",
        topColor: "rgba(0,192,118,0.25)",
        bottomColor: "rgba(0,192,118,0.02)",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: "#00C076",
        crosshairMarkerBackgroundColor: "#080d1a",
      });
      as.setData(areaData);
      areaSeriesRef.current = as;
    }

    // MA indicator
    if (indicators.ma) {
      const maData = calcMA(historicalCandles, 20);
      const mas = chart.addLineSeries({
        color: "#3b82f6",
        lineWidth: 1,
        lineStyle: LineStyle.Solid,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      mas.setData(maData);
      maSeriesRef.current = mas;
    }

    // Bollinger Bands
    if (indicators.bb) {
      const { upper, lower } = calcBB(historicalCandles, 20, 2);
      const bbU = chart.addLineSeries({
        color: "rgba(250,204,21,0.5)",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      bbU.setData(upper);
      bbUpperRef.current = bbU;
      const bbL = chart.addLineSeries({
        color: "rgba(250,204,21,0.5)",
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      bbL.setData(lower);
      bbLowerRef.current = bbL;
    }

    // Scroll to right edge to show latest
    chart.timeScale().scrollToRealTime();
  }, [historicalCandles, chartType, indicators.ma, indicators.bb, buildCandleData]);

  // Add current price line and trade price lines
  useEffect(() => {
    if (!chartRef.current) return;
    const series = candleSeriesRef.current || areaSeriesRef.current;
    if (!series) return;

    // Clear old price lines
    priceLineMapRef.current.forEach((pl) => { try { series.removePriceLine(pl); } catch {} });
    priceLineMapRef.current.clear();

    // Current price line
    const pl = series.createPriceLine({
      price: currentPrice,
      color: "rgba(255,255,255,0.6)",
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: `● ${currentPrice.toFixed(5)}`,
    });
    priceLineMapRef.current.set("current", pl);

    // Trade entry lines
    activeTrades.forEach((trade) => {
      const tradeColor = trade.direction === "buy" ? UP_COLOR : DOWN_COLOR;
      const tradePL = series.createPriceLine({
        price: trade.entryPrice,
        color: tradeColor,
        lineWidth: 1,
        lineStyle: LineStyle.Dotted,
        axisLabelVisible: true,
        title: `${trade.direction === "buy" ? "▲" : "▼"} $${trade.amount}`,
      });
      priceLineMapRef.current.set(trade.id, tradePL);
    });
  }, [currentPrice, activeTrades]);

  // Zoom
  useEffect(() => {
    if (!chartRef.current) return;
    const scale = chartRef.current.timeScale();
    const visible = scale.getVisibleRange();
    if (visible) {
      const span = (visible.to as number) - (visible.from as number);
      const center = ((visible.to as number) + (visible.from as number)) / 2;
      const newSpan = span / zoomLevel;
      scale.setVisibleRange({ from: (center - newSpan / 2) as Time, to: (center + newSpan / 2) as Time });
    }
  }, [zoomLevel]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#080d1a] chart-canvas-wrapper" id="tradex_chart_root">
      {/* Pair & timer overlay */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-2 pointer-events-none">
        <span className="text-[10px] font-mono font-bold text-white/80 bg-[#080d1a]/70 px-2 py-1 rounded-lg border border-[#22304a]/40">
          {pair} · {timeframe}
        </span>
        {candleTimerStr && (
          <span className="text-[9px] font-mono text-yellow-400/80 bg-[#080d1a]/70 px-1.5 py-1 rounded-lg border border-yellow-500/20">
            {candleTimerStr}
          </span>
        )}
      </div>

      {/* Floating win/loss indicators */}
      {floatingIndicators.map((fi) => (
        <div
          key={fi.id}
          className={`absolute right-20 z-20 pointer-events-none text-xs font-black font-mono px-3 py-1.5 rounded-full shadow-lg border ${
            fi.isWin
              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
              : "bg-rose-500/20 border-rose-500/40 text-rose-300"
          } animate-slideUp`}
          style={{ top: "30%" }}
        >
          {fi.isWin ? "+" : "-"}{fi.amountText}
        </div>
      ))}

      {/* Active trades count badge */}
      {activeTrades.length > 0 && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[9px] font-bold font-mono px-2 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping inline-block" />
          {activeTrades.length} ACTIVE
        </div>
      )}

      {/* Main chart container */}
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
}

export default Chart;
