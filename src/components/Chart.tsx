import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RefreshCw, Layers, Trash2 } from "lucide-react";

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
  duration: number; // in seconds
  payout: number; // e.g., 0.92
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
  zoomLevel: number; // multiplier for spacing
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
}

export default function Chart({
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
  customBackground = null,
}: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const [panOffset, setPanOffset] = useState(0); // offset count of candles panned backwards
  const [localZoom, setLocalZoom] = useState(zoomLevel);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Load custom background image when prop changes
  useEffect(() => {
    if (customBackground) {
      const img = new Image();
      img.src = customBackground;
      img.onload = () => {
        setBgImage(img);
      };
      img.onerror = () => {
        setBgImage(null);
      };
    } else {
      setBgImage(null);
    }
  }, [customBackground]);

  // Synchronization with external zoom
  useEffect(() => {
    setLocalZoom(zoomLevel);
  }, [zoomLevel]);

  // Touch and drag states
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startPanRef = useRef(0);
  const initialTouchDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);

  // Drawing state
  const [drawingStartPoint, setDrawingStartPoint] = useState<{ time: number; price: number } | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ time: number; price: number } | null>(null);
  const [secondsTick, setSecondsTick] = useState(0);

  // Selected & Drag states for drawings
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [hoveredDrawingId, setHoveredDrawingId] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<"move" | "p1" | "p2" | "corner_tl" | "corner_tr" | "corner_bl" | "corner_br" | null>(null);
  const [dragStartMouse, setDragStartMouse] = useState<{ x: number; y: number; time: number; price: number } | null>(null);
  const [dragStartDrawingState, setDragStartDrawingState] = useState<Drawing | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsTick((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync keyboard Delete and Backspace actions to remove drawings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedDrawingId && (e.key === "Delete" || e.key === "Backspace")) {
        setDrawings((prev) => prev.filter((d) => d.id !== selectedDrawingId));
        setSelectedDrawingId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDrawingId, setDrawings]);

  // Unified broker layout coordinate conversion math
  const getLayoutDetails = () => {
    const rightPadding = 58;
    const bottomPadding = 24;
    const chartWidth = dimensions.width - rightPadding;
    const chartHeight = dimensions.height - bottomPadding;

    // Dynamically calculate candle width and step to guarantee responsive spacing
    const isMobile = dimensions.width < 600;
    let colStep = 9 * localZoom;
    if (isMobile) {
      colStep = Math.max(6, (chartWidth / 32) * localZoom);
    }
    const candleWidth = Math.max(3, colStep * 0.65);
    const visibleCount = Math.ceil(chartWidth / colStep);

    const sliceEnd = historicalCandles.length - Math.max(0, panOffset);
    const sliceStart = Math.max(0, sliceEnd - visibleCount);
    const visibleCandles = historicalCandles.slice(sliceStart, sliceEnd);

    if (visibleCandles.length === 0) {
      return null;
    }

    let minPrice = Math.min(...visibleCandles.map((c) => c.low));
    let maxPrice = Math.max(...visibleCandles.map((c) => c.high));

    activeTrades.forEach((t) => {
      if (t.pair === pair) {
        minPrice = Math.min(minPrice, t.entryPrice);
        maxPrice = Math.max(maxPrice, t.entryPrice);
      }
    });

    const priceDiff = maxPrice - minPrice || 0.01;
    const paddedMinPrice = minPrice - priceDiff * 0.15;
    const paddedMaxPrice = maxPrice + priceDiff * 0.15;
    const paddedPriceDiff = paddedMaxPrice - paddedMinPrice;

    const rightBreathingSpace = chartWidth * 0.15;

    const getX = (index: number) => {
      return (chartWidth - rightBreathingSpace) - (visibleCandles.length - 1 - index) * colStep - candleWidth / 2;
    };

    const getY = (price: number) => {
      return chartHeight - ((price - paddedMinPrice) / paddedPriceDiff) * chartHeight;
    };

    const getXFromTime = (time: number) => {
      const firstTime = visibleCandles[0].time;
      const lastCandle = visibleCandles[visibleCandles.length - 1];

      const foundIndex = visibleCandles.findIndex((c) => c.time === time);
      if (foundIndex !== -1) {
        return getX(foundIndex);
      }

      const candleInterval = 60000;
      if (time > lastCandle.time) {
        return getX((visibleCandles.length - 1) + (time - lastCandle.time) / candleInterval);
      }

      if (time < firstTime) {
        return getX(-((firstTime - time) / candleInterval));
      }

      return 0;
    };

    const getPriceFromY = (y: number) => {
      return paddedMinPrice + ((chartHeight - y) / chartHeight) * paddedPriceDiff;
    };

    const getTimeFromX = (x: number) => {
      const indexExpr = (visibleCandles.length - 1) - ((chartWidth - rightBreathingSpace) - x - candleWidth / 2) / colStep;
      const roundedIndex = Math.round(indexExpr);

      const lastCandle = visibleCandles[visibleCandles.length - 1];
      const firstCandle = visibleCandles[0];
      const candleInterval = 60000;

      if (roundedIndex >= 0 && roundedIndex < visibleCandles.length) {
        return visibleCandles[roundedIndex].time;
      } else if (roundedIndex >= visibleCandles.length) {
        return lastCandle.time + (roundedIndex - (visibleCandles.length - 1)) * candleInterval;
      } else {
        return firstCandle.time - (-roundedIndex) * candleInterval;
      }
    };

    return {
      chartWidth,
      chartHeight,
      visibleCandles,
      colStep,
      candleWidth,
      paddedMinPrice,
      paddedMaxPrice,
      paddedPriceDiff,
      getX,
      getY,
      getXFromTime,
      getPriceFromY,
      getTimeFromX,
    };
  };

  const getClickDataFromXY = (x: number, y: number) => {
    const layout = getLayoutDetails();
    if (!layout) return null;
    if (x > layout.chartWidth || y > layout.chartHeight) return null;

    return {
      time: layout.getTimeFromX(x),
      price: layout.getPriceFromY(y),
    };
  };

  const getClickData = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return getClickDataFromXY(x, y);
  };

  // Scan drawings to detect cursor selection on hover/drag
  const detectDrawingAtPosition = (x: number, y: number) => {
    const layout = getLayoutDetails();
    if (!layout) return null;
    const { getXFromTime, getY, chartWidth, chartHeight } = layout;

    if (x > chartWidth || y > chartHeight) return null;

    // Check anchors of selected drawing (takes priority to allow resizing)
    if (selectedDrawingId) {
      const activeDrawing = drawings.find((d) => d.id === selectedDrawingId);
      if (activeDrawing) {
        if (activeDrawing.type === "trend" && activeDrawing.startTime !== undefined && activeDrawing.startPrice !== undefined && activeDrawing.endTime !== undefined && activeDrawing.endPrice !== undefined) {
          const x1 = getXFromTime(activeDrawing.startTime);
          const y1 = getY(activeDrawing.startPrice);
          const x2 = getXFromTime(activeDrawing.endTime);
          const y2 = getY(activeDrawing.endPrice);

          const dist1 = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
          const dist2 = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);

          if (dist1 < 10) return { drawingId: activeDrawing.id, anchorType: "p1" };
          if (dist2 < 10) return { drawingId: activeDrawing.id, anchorType: "p2" };
        } else if (activeDrawing.type === "rectangle" && activeDrawing.startTime !== undefined && activeDrawing.startPrice !== undefined && activeDrawing.endTime !== undefined && activeDrawing.endPrice !== undefined) {
          const x1 = getXFromTime(activeDrawing.startTime);
          const y1 = getY(activeDrawing.startPrice);
          const x2 = getXFromTime(activeDrawing.endTime);
          const y2 = getY(activeDrawing.endPrice);

          const minX = Math.min(x1, x2);
          const maxX = Math.max(x1, x2);
          const minY = Math.min(y1, y2);
          const maxY = Math.max(y1, y2);

          const corners = [
            { type: "corner_tl", cx: minX, cy: minY },
            { type: "corner_tr", cx: maxX, cy: minY },
            { type: "corner_bl", cx: minX, cy: maxY },
            { type: "corner_br", cx: maxX, cy: maxY },
          ];

          for (const corner of corners) {
            const dist = Math.sqrt((x - corner.cx) ** 2 + (y - corner.cy) ** 2);
            if (dist < 10) return { drawingId: activeDrawing.id, anchorType: corner.type };
          }
        } else if (activeDrawing.type === "horizontal" && activeDrawing.price !== undefined) {
          const yVal = getY(activeDrawing.price);
          const dist = Math.sqrt((x - chartWidth / 2) ** 2 + (y - yVal) ** 2);
          if (dist < 10) return { drawingId: activeDrawing.id, anchorType: "move" };
        }
      }
    }

    const getDistToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const l2 = dx * dx + dy * dy;
      if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
      let t = ((px - x1) * dx + (py - y1) * dy) / l2;
      t = Math.max(0, Math.min(1, t));
      return Math.sqrt((px - (x1 + t * dx)) ** 2 + (py - (y1 + t * dy)) ** 2);
    };

    // Standard matching logic for bodies
    for (let i = drawings.length - 1; i >= 0; i--) {
      const d = drawings[i];
      if (d.type === "horizontal" && d.price !== undefined) {
        const lineY = getY(d.price);
        if (Math.abs(y - lineY) < 8) {
          return { drawingId: d.id, isBody: true };
        }
      } else if (d.type === "trend" && d.startTime !== undefined && d.startPrice !== undefined && d.endTime !== undefined && d.endPrice !== undefined) {
        const x1 = getXFromTime(d.startTime);
        const y1 = getY(d.startPrice);
        const x2 = getXFromTime(d.endTime);
        const y2 = getY(d.endPrice);

        if (getDistToSegment(x, y, x1, y1, x2, y2) < 8) {
          return { drawingId: d.id, isBody: true };
        }
      } else if (d.type === "rectangle" && d.startTime !== undefined && d.startPrice !== undefined && d.endTime !== undefined && d.endPrice !== undefined) {
        const x1 = getXFromTime(d.startTime);
        const y1 = getY(d.startPrice);
        const x2 = getXFromTime(d.endTime);
        const y2 = getY(d.endPrice);

        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        const closeToBorders =
          (Math.abs(x - minX) < 8 && y >= minY - 4 && y <= maxY + 4) ||
          (Math.abs(x - maxX) < 8 && y >= minY - 4 && y <= maxY + 4) ||
          (Math.abs(y - minY) < 8 && x >= minX - 4 && x <= maxX + 4) ||
          (Math.abs(y - maxY) < 8 && x >= minX - 4 && x <= maxX + 4);

        const inside = x >= minX && x <= maxX && y >= minY && y <= maxY;

        if (closeToBorders || inside) {
          return { drawingId: d.id, isBody: true };
        }
      }
    }

    return null;
  };

  // Handle ResizeObserver based on standard React responsiveness guidelines
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 200),
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Set up mouse wheel zoom natively on target canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
      setLocalZoom((prev) => Math.min(2.5, Math.max(0.3, prev + zoomFactor)));
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeDrawingTool) {
      const point = getClickDataFromXY(x, y);
      if (!point) return;

      if (activeDrawingTool === "horizontal") {
        const newDrawing: Drawing = {
          id: Math.random().toString(),
          type: "horizontal",
          price: point.price,
        };
        setDrawings((prev) => [...prev, newDrawing]);
        setActiveDrawingTool(null);
      } else {
        if (!drawingStartPoint) {
          setDrawingStartPoint(point);
          setHoverPoint(point);
        } else {
          const newDrawing: Drawing = {
            id: Math.random().toString(),
            type: activeDrawingTool,
            startTime: drawingStartPoint.time,
            startPrice: drawingStartPoint.price,
            endTime: point.time,
            endPrice: point.price,
          };
          setDrawings((prev) => [...prev, newDrawing]);
          setDrawingStartPoint(null);
          setHoverPoint(null);
          setActiveDrawingTool(null);
        }
      }
      return;
    }

    // Try to click-select an existing drawing
    const clickData = getClickDataFromXY(x, y);
    if (clickData) {
      const detected = detectDrawingAtPosition(x, y);
      if (detected) {
        setSelectedDrawingId(detected.drawingId);
        const dObj = drawings.find((d) => d.id === detected.drawingId);
        if (dObj) {
          setDragStartDrawingState({ ...dObj });
          setDragStartMouse({ x, y, time: clickData.time, price: clickData.price });
          if (detected.anchorType) {
            setDragMode(detected.anchorType as any);
          } else {
            setDragMode("move");
          }
        }
        return; // Absorb event: do not pan chart back
      } else {
        setSelectedDrawingId(null);
      }
    }

    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startPanRef.current = panOffset;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCrosshair({ x, y });

    if (activeDrawingTool) {
      if (drawingStartPoint) {
        const point = getClickDataFromXY(x, y);
        if (point) {
          setHoverPoint(point);
        }
      }
      return;
    }

    // Interactive Drawing Drag execution
    if (dragMode !== null && selectedDrawingId !== null && dragStartMouse !== null && dragStartDrawingState !== null) {
      const clickData = getClickDataFromXY(x, y);
      if (clickData) {
        const timeDiff = clickData.time - dragStartMouse.time;
        const priceDiff = clickData.price - dragStartMouse.price;

        if (dragMode === "move") {
          setDrawings((prev) =>
            prev.map((d) => {
              if (d.id !== selectedDrawingId) return d;
              if (d.type === "horizontal" && d.price !== undefined) {
                return { ...d, price: (dragStartDrawingState.price ?? 0) + priceDiff };
              } else if (
                (d.type === "trend" || d.type === "rectangle") &&
                dragStartDrawingState.startTime !== undefined &&
                dragStartDrawingState.endTime !== undefined &&
                dragStartDrawingState.startPrice !== undefined &&
                dragStartDrawingState.endPrice !== undefined
              ) {
                return {
                  ...d,
                  startTime: dragStartDrawingState.startTime + timeDiff,
                  endTime: dragStartDrawingState.endTime + timeDiff,
                  startPrice: dragStartDrawingState.startPrice + priceDiff,
                  endPrice: dragStartDrawingState.endPrice + priceDiff,
                };
              }
              return d;
            })
          );
        } else if (dragMode === "p1") {
          setDrawings((prev) =>
            prev.map((d) =>
              d.id === selectedDrawingId
                ? { ...d, startTime: clickData.time, startPrice: clickData.price }
                : d
            )
          );
        } else if (dragMode === "p2") {
          setDrawings((prev) =>
            prev.map((d) =>
              d.id === selectedDrawingId
                ? { ...d, endTime: clickData.time, endPrice: clickData.price }
                : d
            )
          );
        } else if (dragMode.startsWith("corner_")) {
          const t1 = dragStartDrawingState.startTime ?? 0;
          const p1 = dragStartDrawingState.startPrice ?? 0;
          const t2 = dragStartDrawingState.endTime ?? 0;
          const p2 = dragStartDrawingState.endPrice ?? 0;

          const minT = Math.min(t1, t2);
          const maxT = Math.max(t1, t2);
          const minP = Math.min(p1, p2);
          const maxP = Math.max(p1, p2);

          const newT = clickData.time;
          const newP = clickData.price;

          let finalT1 = t1;
          let finalT2 = t2;
          let finalP1 = p1;
          let finalP2 = p2;

          if (dragMode === "corner_tl") {
            if (t1 === minT) finalT1 = newT; else finalT2 = newT;
            if (p1 === maxP) finalP1 = newP; else finalP2 = newP;
          } else if (dragMode === "corner_tr") {
            if (t1 === maxT) finalT1 = newT; else finalT2 = newT;
            if (p1 === maxP) finalP1 = newP; else finalP2 = newP;
          } else if (dragMode === "corner_bl") {
            if (t1 === minT) finalT1 = newT; else finalT2 = newT;
            if (p1 === minP) finalP1 = newP; else finalP2 = newP;
          } else if (dragMode === "corner_br") {
            if (t1 === maxT) finalT1 = newT; else finalT2 = newT;
            if (p1 === minP) finalP1 = newP; else finalP2 = newP;
          }

          setDrawings((prev) =>
            prev.map((d) =>
              d.id === selectedDrawingId
                ? {
                    ...d,
                    startTime: finalT1,
                    endTime: finalT2,
                    startPrice: finalP1,
                    endPrice: finalP2,
                  }
                : d
            )
          );
        }
      }
      return;
    }

    // Cursor Styling and Hover highlights
    if (dragMode === null) {
      const detected = detectDrawingAtPosition(x, y);
      if (detected) {
        setHoveredDrawingId(detected.drawingId);
        if (detected.anchorType) {
          if (detected.anchorType.startsWith("corner")) {
            canvas.style.cursor = "nwse-resize";
          } else if (detected.anchorType === "p1" || detected.anchorType === "p2") {
            canvas.style.cursor = "pointer";
          } else {
            canvas.style.cursor = "move";
          }
        } else {
          canvas.style.cursor = "grab";
        }
      } else {
        setHoveredDrawingId(null);
        canvas.style.cursor = "crosshair";
      }
    }

    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    
    const layout = getLayoutDetails();
    if (!layout) return;
    const deltaCandles = Math.round(deltaX / layout.colStep);
    setPanOffset(Math.max(0, startPanRef.current + deltaCandles));
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    initialTouchDistanceRef.current = null;
    setDragMode(null);
    setDragStartMouse(null);
    setDragStartDrawingState(null);
    setCrosshair(null);
  };

  // Touch Handlers for Mobile Web Finger dragbroker pan and pinch zoom
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (activeDrawingTool) {
      const point = getClickDataFromXY(x, y);
      if (!point) return;

      if (activeDrawingTool === "horizontal") {
        const newDrawing: Drawing = {
          id: Math.random().toString(),
          type: "horizontal",
          price: point.price,
        };
        setDrawings((prev) => [...prev, newDrawing]);
        setActiveDrawingTool(null);
      } else {
        if (!drawingStartPoint) {
          setDrawingStartPoint(point);
          setHoverPoint(point);
        } else {
          const newDrawing: Drawing = {
            id: Math.random().toString(),
            type: activeDrawingTool,
            startTime: drawingStartPoint.time,
            startPrice: drawingStartPoint.price,
            endTime: point.time,
            endPrice: point.price,
          };
          setDrawings((prev) => [...prev, newDrawing]);
          setDrawingStartPoint(null);
          setHoverPoint(null);
          setActiveDrawingTool(null);
        }
      }
      return;
    }

    // Touch click selection support
    const clickData = getClickDataFromXY(x, y);
    if (clickData && e.touches.length === 1) {
      const detected = detectDrawingAtPosition(x, y);
      if (detected) {
        setSelectedDrawingId(detected.drawingId);
        const dObj = drawings.find((d) => d.id === detected.drawingId);
        if (dObj) {
          setDragStartDrawingState({ ...dObj });
          setDragStartMouse({ x, y, time: clickData.time, price: clickData.price });
          if (detected.anchorType) {
            setDragMode(detected.anchorType as any);
          } else {
            setDragMode("move");
          }
        }
        return;
      } else {
        setSelectedDrawingId(null);
      }
    }

    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      startXRef.current = e.touches[0].clientX;
      startPanRef.current = panOffset;
      initialTouchDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      initialZoomRef.current = localZoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (activeDrawingTool) {
      if (drawingStartPoint) {
        const point = getClickDataFromXY(x, y);
        if (point) {
          setHoverPoint(point);
        }
      }
      return;
    }

    if (dragMode !== null && selectedDrawingId !== null && dragStartMouse !== null && dragStartDrawingState !== null) {
      const clickData = getClickDataFromXY(x, y);
      if (clickData) {
        const timeDiff = clickData.time - dragStartMouse.time;
        const priceDiff = clickData.price - dragStartMouse.price;

        if (dragMode === "move") {
          setDrawings((prev) =>
            prev.map((d) => {
              if (d.id !== selectedDrawingId) return d;
              if (d.type === "horizontal" && d.price !== undefined) {
                return { ...d, price: (dragStartDrawingState.price ?? 0) + priceDiff };
              } else if (
                (d.type === "trend" || d.type === "rectangle") &&
                dragStartDrawingState.startTime !== undefined &&
                dragStartDrawingState.endTime !== undefined &&
                dragStartDrawingState.startPrice !== undefined &&
                dragStartDrawingState.endPrice !== undefined
              ) {
                return {
                  ...d,
                  startTime: dragStartDrawingState.startTime + timeDiff,
                  endTime: dragStartDrawingState.endTime + timeDiff,
                  startPrice: dragStartDrawingState.startPrice + priceDiff,
                  endPrice: dragStartDrawingState.endPrice + priceDiff,
                };
              }
              return d;
            })
          );
        } else if (dragMode === "p1") {
          setDrawings((prev) =>
            prev.map((d) =>
              d.id === selectedDrawingId
                ? { ...d, startTime: clickData.time, startPrice: clickData.price }
                : d
            )
          );
        } else if (dragMode === "p2") {
          setDrawings((prev) =>
            prev.map((d) =>
              d.id === selectedDrawingId
                ? { ...d, endTime: clickData.time, endPrice: clickData.price }
                : d
            )
          );
        } else if (dragMode.startsWith("corner_")) {
          const t1 = dragStartDrawingState.startTime ?? 0;
          const p1 = dragStartDrawingState.startPrice ?? 0;
          const t2 = dragStartDrawingState.endTime ?? 0;
          const p2 = dragStartDrawingState.endPrice ?? 0;

          const minT = Math.min(t1, t2);
          const maxT = Math.max(t1, t2);
          const minP = Math.min(p1, p2);
          const maxP = Math.max(p1, p2);

          const newT = clickData.time;
          const newP = clickData.price;

          let finalT1 = t1;
          let finalT2 = t2;
          let finalP1 = p1;
          let finalP2 = p2;

          if (dragMode === "corner_tl") {
            if (t1 === minT) finalT1 = newT; else finalT2 = newT;
            if (p1 === maxP) finalP1 = newP; else finalP2 = newP;
          } else if (dragMode === "corner_tr") {
            if (t1 === maxT) finalT1 = newT; else finalT2 = newT;
            if (p1 === maxP) finalP1 = newP; else finalP2 = newP;
          } else if (dragMode === "corner_bl") {
            if (t1 === minT) finalT1 = newT; else finalT2 = newT;
            if (p1 === minP) finalP1 = newP; else finalP2 = newP;
          } else if (dragMode === "corner_br") {
            if (t1 === maxT) finalT1 = newT; else finalT2 = newT;
            if (p1 === minP) finalP1 = newP; else finalP2 = newP;
          }

          setDrawings((prev) =>
            prev.map((d) =>
              d.id === selectedDrawingId
                ? {
                    ...d,
                    startTime: finalT1,
                    endTime: finalT2,
                    startPrice: finalP1,
                    endPrice: finalP2,
                  }
                : d
            )
          );
        }
      }
      return;
    }

    if (e.touches.length === 1 && isDraggingRef.current) {
      const deltaX = e.touches[0].clientX - startXRef.current;
      const isMobile = dimensions.width < 600;
      let colStep = 9 * localZoom;
      if (isMobile) {
        colStep = Math.max(6, (dimensions.width / 32) * localZoom);
      }
      const deltaCandles = Math.round(deltaX / colStep);
      setPanOffset(Math.max(0, startPanRef.current + deltaCandles));
    } else if (e.touches.length === 2 && initialTouchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      if (initialTouchDistanceRef.current > 10) {
        const factor = newDist / initialTouchDistanceRef.current;
        const nextZoom = Math.min(2.5, Math.max(0.3, initialZoomRef.current * factor));
        setLocalZoom(nextZoom);
      }
    }
  };

  // Main drawing engine matching visual guidelines exactly
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || historicalCandles.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    const dpr = Math.min(window.devicePixelRatio || 1, 3); // cap at 3x for performance

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.imageRendering = 'auto';

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    // Hint for subpixel rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Clear and draw background (#0b1329) - consistent with broker design panel
    if (bgImage) {
      // Draw image to fill canvas
      ctx.drawImage(bgImage, 0, 0, width, height);
      // Overlay a semi-transparent dark tint so that grid lines & candles are legible
      ctx.fillStyle = "rgba(12, 16, 29, 0.86)";
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = "#0c101d";
      ctx.fillRect(0, 0, width, height);
    }

    // Padding settings for coordinates display
    const rightPadding = 58;
    const bottomPadding = 24;
    const chartWidth = width - rightPadding;
    const chartHeight = height - bottomPadding;

    // Grid spacing configuration (#22304a)
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;

    // Dynamically calculate candle width and gap to guarantee 25–40 visible candles on mobile
    const isMobile = width < 600;
    let colStep = 9 * localZoom;
    if (isMobile) {
      // Force exactly 32 candles at 1.0 zoom level on mobile
      colStep = Math.max(6, (chartWidth / 32) * localZoom);
    }
    const candleWidth = Math.max(3, colStep * 0.65);
    const candleGap = Math.max(1, colStep * 0.35);
    const visibleCount = Math.ceil(chartWidth / colStep);
    
    // Slice based on panOffset to dynamically pan on drag
    const sliceEnd = historicalCandles.length - Math.max(0, panOffset);
    const sliceStart = Math.max(0, sliceEnd - visibleCount);
    const visibleCandles = historicalCandles.slice(sliceStart, sliceEnd);
    if (visibleCandles.length === 0) return;

    let minPrice = Math.min(...visibleCandles.map(c => c.low));
    let maxPrice = Math.max(...visibleCandles.map(c => c.high));

    // Also include active trades in scale to prevent overflow
    activeTrades.forEach(t => {
      if (t.pair === pair) {
        minPrice = Math.min(minPrice, t.entryPrice);
        maxPrice = Math.max(maxPrice, t.entryPrice);
      }
    });

    // Pads the chart Y scale slightly
    const priceDiff = maxPrice - minPrice || 0.01;
    minPrice -= priceDiff * 0.15;
    maxPrice += priceDiff * 0.15;

    const rightBreathingSpace = chartWidth * 0.15;

    const getX = (index: number) => {
      // Add right-side breathing room to leave visible future space after the last candle
      return (chartWidth - rightBreathingSpace) - (visibleCandles.length - 1 - index) * colStep - candleWidth / 2;
    };

    const getY = (price: number) => {
      return chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
    };

    const getPriceFromY = (yY: number) => {
      const diff = maxPrice - minPrice;
      return maxPrice - (yY / chartHeight) * diff;
    };

    const getTimeFromX = (xX: number) => {
      const indexExpr = (visibleCandles.length - 1) - ((chartWidth - rightBreathingSpace) - xX - candleWidth / 2) / colStep;
      const roundedIndex = Math.round(indexExpr);
      const lastCandle = visibleCandles[visibleCandles.length - 1];
      const firstCandle = visibleCandles[0];
      const candleInterval = 60000;

      if (roundedIndex >= 0 && roundedIndex < visibleCandles.length) {
        return visibleCandles[roundedIndex].time;
      } else if (roundedIndex >= visibleCandles.length) {
        return lastCandle.time + (roundedIndex - (visibleCandles.length - 1)) * candleInterval;
      } else {
        return firstCandle.time - (-roundedIndex) * candleInterval;
      }
    };

    // Draw background grid lines (horizontal and vertical)
    const gridRows = gridDensity === "low" ? 3 : gridDensity === "high" ? 10 : 6;
    for (let i = 0; i <= gridRows; i++) {
      const y = (chartHeight / gridRows) * i;
      if (gridLinesEnabled) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
      }

      // Render Price Labels on the right scale
      const priceVal = maxPrice - (i * (maxPrice - minPrice)) / gridRows;
      ctx.fillStyle = "#64748b";
      ctx.font = "9px monospace";
      ctx.textAlign = "left";
      ctx.fillText(priceVal.toFixed(5), chartWidth + 5, y + 4);
    }

    // Vertical gridlines
    if (gridLinesEnabled) {
      const gridCols = gridDensity === "low" ? 4 : gridDensity === "high" ? 12 : 8;
      for (let i = 0; i < gridCols; i++) {
        const x = (chartWidth / gridCols) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chartHeight);
        ctx.stroke();
      }
    }

    // Render indicators (MA & Bollinger Bands) directly on chart canvas
    if (indicators.ma) {
      // Draw simple glowing Moving Average (Period 14)
      ctx.beginPath();
      ctx.strokeStyle = "#38bdf8"; // Light Blue
      ctx.lineWidth = 1.5;
      let first = true;
      for (let i = 14; i < visibleCandles.length; i++) {
        const slice = visibleCandles.slice(i - 14, i);
        const avg = slice.reduce((sum, c) => sum + c.close, 0) / 14;
        const cx = getX(i);
        const cy = getY(avg);
        if (first) {
          ctx.moveTo(cx, cy);
          first = false;
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();
    }

    if (indicators.bb) {
      // Draw Bollinger Bands (simple envelope around MA)
      ctx.strokeStyle = "#a78bfa"; // Violet BB limits
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;

      // BB Top
      ctx.beginPath();
      let firstTop = true;
      for (let i = 20; i < visibleCandles.length; i++) {
        const slice = visibleCandles.slice(i - 20, i);
        const avg = slice.reduce((sum, c) => sum + c.close, 0) / 20;
        const topB = avg + (priceDiff * 0.12);
        const cx = getX(i);
        const cy = getY(topB);
        if (firstTop) {
          ctx.moveTo(cx, cy);
          firstTop = false;
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();

      // BB Bottom
      ctx.beginPath();
      let firstBot = true;
      for (let i = 20; i < visibleCandles.length; i++) {
        const slice = visibleCandles.slice(i - 20, i);
        const avg = slice.reduce((sum, c) => sum + c.close, 0) / 20;
        const botB = avg - (priceDiff * 0.12);
        const cx = getX(i);
        const cy = getY(botB);
        if (firstBot) {
          ctx.moveTo(cx, cy);
          firstBot = false;
        } else {
          ctx.lineTo(cx, cy);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]); // Reset dashed state
    }

    // Render candles or area layout based on style selector
    if (chartType === "candles") {
      visibleCandles.forEach((candle, index) => {
        const cx = getX(index);
        const hiY = getY(candle.high);
        const loY = getY(candle.low);
        const opY = getY(candle.open);
        const clY = getY(candle.close);

        const isBull = candle.close >= candle.open;
        const fillStyle = isBull ? "#22c55e" : "#ef4444";

        // Draw Wick - color MUST match candle direction
        ctx.strokeStyle = fillStyle;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, hiY);
        ctx.lineTo(cx, loY);
        ctx.stroke();

        // Draw Candle body
        ctx.fillStyle = fillStyle;
        const rectTop = Math.min(opY, clY);
        const rectHeight = Math.max(Math.abs(opY - clY), 1);
        ctx.fillRect(cx - candleWidth / 2, rectTop, candleWidth, rectHeight);
      });
    } else {
      // Area Chart Mode with visual gradient filling
      ctx.beginPath();
      let lastX = 0;
      visibleCandles.forEach((candle, index) => {
        const cx = getX(index);
        const cy = getY(candle.close);
        if (index === 0) {
          ctx.moveTo(cx, cy);
        } else {
          ctx.lineTo(cx, cy);
        }
        lastX = cx;
      });
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gradient area fill
      const grad = ctx.createLinearGradient(0, 0, 0, chartHeight);
      grad.addColorStop(0, "rgba(59, 130, 246, 0.22)");
      grad.addColorStop(1, "rgba(59, 130, 246, 0.0)");
      ctx.fillStyle = grad;

      ctx.lineTo(lastX, chartHeight);
      ctx.lineTo(getX(0), chartHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Render exact current price line with horizontal label badge
    const curY = getY(currentPrice);
    if (curY >= 0 && curY <= chartHeight) {
      ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(chartWidth, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw active horizontal pulsing dot
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(chartWidth, curY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Outer light glowing ring
      ctx.strokeStyle = "rgba(56, 189, 248, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(chartWidth, curY, 8 + Math.sin(Date.now() / 150) * 2, 0, 2 * Math.PI);
      ctx.stroke();

      // Right border badge indicating the accurate pulsing rate
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(chartWidth + 2, curY - 9, rightPadding - 4, 18);
      ctx.fillStyle = "#0c101d";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(currentPrice.toFixed(5), chartWidth + rightPadding / 2, curY + 3);
    }

    // Render active trades representation layers
    activeTrades.forEach((trade) => {
      if (trade.pair !== pair) return;

      const tradeY = getY(trade.entryPrice);
      const isUp = trade.direction === "buy";
      const tradeColor = isUp ? "#22c55e" : "#ef4444";

      // Calculate start coordinate starting from the exact candle where the trade was opened
      let startX = 0;
      let foundCandleIndex = -1;
      for (let i = 0; i < visibleCandles.length; i++) {
        if (visibleCandles[i].time <= trade.entryTime) {
          foundCandleIndex = i;
        }
      }
      if (foundCandleIndex !== -1) {
        startX = getX(foundCandleIndex);
      } else {
        startX = 0;
      }

      // Draw Entry horizontal marker line starting custom from the entry candle towards the future
      ctx.strokeStyle = tradeColor;
      ctx.setLineDash([5, 2]);
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(startX, tradeY);
      ctx.lineTo(chartWidth, tradeY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Visual Circle Marker
      ctx.fillStyle = tradeColor;
      ctx.beginPath();
      ctx.arc(startX, tradeY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Draw indicator shape directional markers
      ctx.beginPath();
      if (isUp) {
        // UP arrow
        ctx.moveTo(startX, tradeY - 12);
        ctx.lineTo(startX + 4, tradeY - 5);
        ctx.lineTo(startX - 4, tradeY - 5);
      } else {
        // DOWN arrow
        ctx.moveTo(startX, tradeY + 12);
        ctx.lineTo(startX + 4, tradeY + 5);
        ctx.lineTo(startX - 4, tradeY + 5);
      }
      ctx.closePath();
      ctx.fill();

      // Countdown Timer Badge on Chart Area
      const expSecsLeft = Math.max(0, Math.ceil((trade.expirationTime - Date.now()) / 1000));
      if (expSecsLeft > 0) {
        const badgeWidth = 44;
        const badgeX = startX + 8;
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(badgeX, tradeY - 9, badgeWidth, 18);
        ctx.strokeStyle = tradeColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(badgeX, tradeY - 9, badgeWidth, 18);

        ctx.fillStyle = "#cbd5e1";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${expSecsLeft}s`, badgeX + badgeWidth / 2, tradeY + 3);
      }
    });

    // Render recently completed mobile indicators on the canvas (for mobile device sizes)
    if (floatingIndicators && floatingIndicators.length > 0) {
      floatingIndicators.forEach((ind) => {
        const age = Date.now() - ind.createdAt;
        if (age > 2000) return; // expired, don't draw
        
        const opacity = Math.max(0, Math.min(1, (2000 - age) / 500));
        const indY = getY(ind.yPrice);
        if (indY < 0 || indY > chartHeight) return;

        const textStr = ind.amountText;
        ctx.font = "bold 10px monospace";
        const textWidth = ctx.measureText(textStr).width;

        // Draw pill on the right side of the chart area near the current price
        const px = chartWidth - textWidth - 10;
        const py = indY - 9;
        const pw = textWidth + 6;
        const ph = 18;

        // Fill background
        ctx.fillStyle = ind.isWin ? `rgba(6, 78, 59, ${opacity * 0.95})` : `rgba(127, 29, 29, ${opacity * 0.95})`; // emerald-950 / red-950
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(px, py, pw, ph, 4);
          ctx.fill();
        } else {
          ctx.fillRect(px, py, pw, ph);
        }

        // Stroke border
        ctx.strokeStyle = ind.isWin ? `rgba(52, 211, 153, ${opacity})` : `rgba(248, 113, 113, ${opacity})`; // emerald-400 / red-400
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw text
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.textAlign = "center";
        ctx.fillText(textStr, px + pw / 2, indY + 3);
      });
    }

    // Candle countdown rendering on candles is disabled from here. Candle countdown is moved to the top toolbar.

    // Render drawings
    drawings.forEach((drawing) => {
      const isSelected = drawing.id === selectedDrawingId;
      const isHovered = drawing.id === hoveredDrawingId;

      ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : 1.5;
      ctx.strokeStyle = isSelected 
        ? "#60a5fa" 
        : isHovered 
          ? "#f59e0b" 
          : "#e2e8f0";
      ctx.fillStyle = isSelected
        ? "rgba(96, 165, 250, 0.15)"
        : isHovered
          ? "rgba(245, 158, 11, 0.08)"
          : "rgba(251, 191, 36, 0.03)";

      const getXFromTime = (time: number) => {
        const firstTime = visibleCandles[0].time;
        const lastCandle = visibleCandles[visibleCandles.length - 1];

        const foundIndex = visibleCandles.findIndex((c) => c.time === time);
        if (foundIndex !== -1) {
          return getX(foundIndex);
        }

        if (time > lastCandle.time) {
          const candleInterval = 60000;
          const futureDiff = time - lastCandle.time;
          const futureIndex = (visibleCandles.length - 1) + futureDiff / candleInterval;
          return getX(futureIndex);
        }

        if (time < firstTime) {
          const candleInterval = 60000;
          const pastDiff = firstTime - time;
          const pastIndex = -(pastDiff / candleInterval);
          return getX(pastIndex);
        }

        return 0;
      };

      if (drawing.type === "horizontal" && drawing.price !== undefined) {
        const y = getY(drawing.price);
        if (y >= 0 && y <= chartHeight) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(chartWidth, y);
          ctx.stroke();
        }
      } else if (drawing.type === "trend" && drawing.startTime !== undefined && drawing.startPrice !== undefined && drawing.endTime !== undefined && drawing.endPrice !== undefined) {
        const x1 = getXFromTime(drawing.startTime);
        const y1 = getY(drawing.startPrice);
        const x2 = getXFromTime(drawing.endTime);
        const y2 = getY(drawing.endPrice);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      } else if (drawing.type === "rectangle" && drawing.startTime !== undefined && drawing.startPrice !== undefined && drawing.endTime !== undefined && drawing.endPrice !== undefined) {
        const x1 = getXFromTime(drawing.startTime);
        const y1 = getY(drawing.startPrice);
        const x2 = getXFromTime(drawing.endTime);
        const y2 = getY(drawing.endPrice);

        ctx.beginPath();
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.fill();
        ctx.stroke();
      }

      // Draw active circular handles/anchors for selected drawings
      if (isSelected) {
        ctx.save();
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;

        const drawAnchor = (ax: number, ay: number) => {
          ctx.beginPath();
          ctx.arc(ax, ay, 5, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        };

        if (drawing.type === "trend" && drawing.startTime !== undefined && drawing.startPrice !== undefined && drawing.endTime !== undefined && drawing.endPrice !== undefined) {
          const x1 = getXFromTime(drawing.startTime);
          const y1 = getY(drawing.startPrice);
          const x2 = getXFromTime(drawing.endTime);
          const y2 = getY(drawing.endPrice);
          drawAnchor(x1, y1);
          drawAnchor(x2, y2);
        } else if (drawing.type === "rectangle" && drawing.startTime !== undefined && drawing.startPrice !== undefined && drawing.endTime !== undefined && drawing.endPrice !== undefined) {
          const x1 = getXFromTime(drawing.startTime);
          const y1 = getY(drawing.startPrice);
          const x2 = getXFromTime(drawing.endTime);
          const y2 = getY(drawing.endPrice);

          const minX = Math.min(x1, x2);
          const maxX = Math.max(x1, x2);
          const minY = Math.min(y1, y2);
          const maxY = Math.max(y1, y2);

          drawAnchor(minX, minY);
          drawAnchor(maxX, minY);
          drawAnchor(minX, maxY);
          drawAnchor(maxX, maxY);
        } else if (drawing.type === "horizontal" && drawing.price !== undefined) {
          const yVal = getY(drawing.price);
          drawAnchor(chartWidth / 2, yVal);
        }
        ctx.restore();
      }
    });

    // Draw active drawing preview
    if (activeDrawingTool && drawingStartPoint && hoverPoint) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(251, 191, 36, 0.7)";
      ctx.setLineDash([4, 4]);

      const getXFromTime = (time: number) => {
        const firstTime = visibleCandles[0].time;
        const lastCandle = visibleCandles[visibleCandles.length - 1];
        const foundIndex = visibleCandles.findIndex((c) => c.time === time);
        if (foundIndex !== -1) return getX(foundIndex);
        if (time > lastCandle.time) {
          const futureIndex = (visibleCandles.length - 1) + (time - lastCandle.time) / 60000;
          return getX(futureIndex);
        }
        if (time < firstTime) {
          const pastIndex = -((firstTime - time) / 60000);
          return getX(pastIndex);
        }
        return 0;
      };

      const x1 = getXFromTime(drawingStartPoint.time);
      const y1 = getY(drawingStartPoint.price);
      const x2 = getXFromTime(hoverPoint.time);
      const y2 = getY(hoverPoint.price);

      if (activeDrawingTool === "trend") {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      } else if (activeDrawingTool === "rectangle") {
        ctx.fillStyle = "rgba(251, 191, 36, 0.08)";
        ctx.beginPath();
        ctx.rect(x1, y1, x2 - x1, y2 - y1);
        ctx.fill();
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // Sub-plot chart indicators overlay (RSI at bottom window)
    if (indicators.rsi) {
      const rsiPanelHeight = 45;
      const rsiTop = chartHeight - rsiPanelHeight;

      // Draw visual separating frame
      ctx.fillStyle = "rgba(12, 16, 29, 0.92)";
      ctx.fillRect(0, rsiTop, chartWidth, rsiPanelHeight);
      ctx.strokeStyle = "#1e293b";
      ctx.beginPath();
      ctx.moveTo(0, rsiTop);
      ctx.lineTo(chartWidth, rsiTop);
      ctx.stroke();

      // Render 70 & 30 bands
      ctx.strokeStyle = "rgba(239, 68, 68, 0.25)"; // Upper 70 line
      ctx.beginPath();
      ctx.moveTo(0, rsiTop + 10);
      ctx.lineTo(chartWidth, rsiTop + 10);
      ctx.stroke();

      ctx.strokeStyle = "rgba(34, 197, 94, 0.25)"; // Lower 30 line
      ctx.beginPath();
      ctx.moveTo(0, rsiTop + rsiPanelHeight - 10);
      ctx.lineTo(chartWidth, rsiTop + rsiPanelHeight - 10);
      ctx.stroke();

      // Render RSI line
      ctx.beginPath();
      ctx.strokeStyle = "#f59e0b"; // Yellow line
      ctx.lineWidth = 1;

      let firstRSI = true;
      visibleCandles.forEach((_, index) => {
        const cx = getX(index);
        // Make simple stable pseudo RSI indicator derived from relative changes
        const changeFactor = (index % 10) / 10;
        const rsiVal = 30 + changeFactor * 40;
        const ry = rsiTop + rsiPanelHeight - (rsiVal / 100) * rsiPanelHeight;

        if (firstRSI) {
          ctx.moveTo(cx, ry);
          firstRSI = false;
        } else {
          ctx.lineTo(cx, ry);
        }
      });
      ctx.stroke();

      // RSI title
      ctx.fillStyle = "#94a3b8";
      ctx.font = "8px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("RSI (14)  65.12", 10, rsiTop + 12);
    }

    // DRAW DYNAMIC CROSSHAIRS & TAGS overlay
    if (crosshair && crosshair.x >= 0 && crosshair.x <= chartWidth && crosshair.y >= 0 && crosshair.y <= chartHeight) {
      ctx.strokeStyle = "rgba(100, 116, 139, 0.45)"; // slate crosshair
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(crosshair.x, 0);
      ctx.lineTo(crosshair.x, chartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, crosshair.y);
      ctx.lineTo(chartWidth, crosshair.y);
      ctx.stroke();

      ctx.setLineDash([]); // reset

      // Price Badge on right padding
      const hoverPrice = getPriceFromY(crosshair.y);
      ctx.fillStyle = "#1e293b"; // dark slate badge background
      ctx.fillRect(chartWidth + 1, crosshair.y - 9, rightPadding - 2, 18);
      ctx.strokeStyle = "#475569"; // slate border
      ctx.strokeRect(chartWidth + 1, crosshair.y - 9, rightPadding - 2, 18);

      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(hoverPrice.toFixed(5), chartWidth + rightPadding / 2, crosshair.y);

      // Time Badge on bottom padding
      const hoverTime = getTimeFromX(crosshair.x);
      const hoverTimeDate = new Date(hoverTime);
      const hoverTimeStr = `${(hoverTimeDate.getMonth() + 1).toString().padStart(2, "0")}/${hoverTimeDate.getDate().toString().padStart(2, "0")} ${hoverTimeDate.getHours().toString().padStart(2, "0")}:${hoverTimeDate.getMinutes().toString().padStart(2, "0")}`;
      
      ctx.font = "bold 9px monospace";
      const textWidth = ctx.measureText(hoverTimeStr).width;
      const badgeW = textWidth + 10;
      const badgeX = Math.max(0, Math.min(chartWidth - badgeW / 2, crosshair.x - badgeW / 2));

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(badgeX, chartHeight + 1, badgeW, bottomPadding - 2);
      ctx.strokeStyle = "#475569";
      ctx.strokeRect(badgeX, chartHeight + 1, badgeW, bottomPadding - 2);

      ctx.fillStyle = "#f8fafc";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(hoverTimeStr, badgeX + badgeW / 2, chartHeight + bottomPadding / 2);
    }

  }, [
    dimensions,
    historicalCandles,
    activeTrades,
    currentPrice,
    pair,
    timeframe,
    chartType,
    indicators,
    localZoom,
    panOffset,
    candleTimerStr,
    activeDrawingTool,
    drawings,
    secondsTick,
    drawingStartPoint,
    hoverPoint,
    selectedDrawingId,
    hoveredDrawingId,
    floatingIndicators,
    gridLinesEnabled,
    gridDensity,
    bgImage,
    crosshair,
  ]);

  return (
    <div className="absolute inset-0 w-full h-full group select-none" ref={containerRef} id="canvas_chart_wrap">
      
      {/* Floating Canvas UI Controls overlay - Snap to Live when panned */}
      <div className="absolute right-4 top-4 z-30" id="floating_controls">
        {panOffset > 0 && (
          <button
            onClick={() => setPanOffset(0)}
            className="p-2.5 bg-blue-600 border border-blue-500 rounded-xl hover:bg-blue-500 text-white transition-all shadow-xl animate-bounce flex items-center justify-center gap-1.5"
            title="Snap to Live"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            <span className="text-[10px] font-mono font-bold tracking-tight pr-1">LIVE</span>
          </button>
        )}
      </div>

      {/* Floating Zoom controls */}
      <div className="absolute left-4 bottom-10 z-30 flex flex-col gap-1.5" id="floating_zoom_controls">
        <button
          onClick={() => setLocalZoom(prev => Math.min(3.0, prev * 1.15))}
          className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:text-white transition-all shadow-md flex items-center justify-center cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setLocalZoom(prev => Math.max(0.3, prev / 1.15))}
          className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:text-white transition-all shadow-md flex items-center justify-center cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Selection Tool delete support toolbar */}
      {selectedDrawingId && (
        <div 
          className="absolute top-4 left-4 bg-slate-950/95 border border-blue-500/50 rounded-lg p-2 flex items-center gap-2.5 shadow-2xl z-40 text-[11px] text-white font-medium backdrop-blur-sm animate-fadeIn" 
          id="drawing_action_toolbar"
        >
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-gray-400">Selected:</span>
            <span className="capitalize font-bold text-blue-300">
              {drawings.find(d => d.id === selectedDrawingId)?.type || "Drawing"}
            </span>
          </div>
          <div className="h-3 w-[1px] bg-gray-700" />
          <button
            onClick={() => {
              setDrawings((prev) => prev.filter((d) => d.id !== selectedDrawingId));
              setSelectedDrawingId(null);
            }}
            className="flex items-center gap-1 px-2 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 hover:border-red-600 rounded text-red-200 hover:text-white transition-all text-[10px] font-bold cursor-pointer"
            title="Delete Selected Drawing"
          >
            <Trash2 className="w-3 h-3" />
            <span>DELETE</span>
          </button>
          <button
            onClick={() => setSelectedDrawingId(null)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded text-gray-300 hover:text-white transition-all text-[10px] font-bold cursor-pointer"
          >
            DESELECT
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUpOrLeave}
        onTouchCancel={handleMouseUpOrLeave}
        className="w-full h-full block cursor-grab active:cursor-grabbing rounded-xl overflow-hidden shadow-inner"
        id="trading_chart_canvas"
      />
    </div>
  );
}
