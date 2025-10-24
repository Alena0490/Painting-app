import { useState, useEffect, useRef, useCallback } from "react";
import "./DrawArea.css";

const DrawArea = ({ 
  canvasRef, startDrawing, draw, endDrawing, ctxRef, tool, 
  lineColor, lineWidth, lineOpacity, setLineColor, setTool, zoom, floodFill, pan, setPan   
}) => {

  /*** GRADIENT TOOL */
  // [ADD] Track gradient drag start
  const [gradStart, setGradStart] = useState(null);

  // // [ADD] Event -> canvas bitmap coords (respects zoom)
  // const evtToBitmap = (e) => {
  //   const canvas = canvasRef.current;
  //   const rect = canvas.getBoundingClientRect();

  //   // Base size without CSS zoom
  //   const baseWidth = rect.width / zoom;
  //   const baseHeight = rect.height / zoom;

  //   // CSS px -> bitmap px
  //   const scaleX = canvas.width / baseWidth;
  //   const scaleY = canvas.height / baseHeight;

  //   const mouseX = e.clientX - rect.left;
  //   const mouseY = e.clientY - rect.top;

  //   const x = Math.max(0, Math.floor((mouseX / zoom) * scaleX));
  //   const y = Math.max(0, Math.floor((mouseY / zoom) * scaleY));
  //   return { x, y };
  // };

  // [ADD] Hex -> RGB
  const hexToRgb = (hex) => {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  };

  /*** HISTORY for Undo functionality ***/
  const historyRef = useRef([]);
  const redoRef = useRef([]);

  // Save snapshot function
  const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const url = canvas.toDataURL("image/png");
      historyRef.current.push(url);
      redoRef.current = [];
    } catch (err) {
      console.warn("Failed to save snapshot:", err);
    }
  }, [canvasRef]);

  // Restore from dataURL
  const restoreFrom = useCallback((url) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || !url) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = url;
  }, [canvasRef, ctxRef]);

  // Undo function
  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length === 0) return;
    
    redoRef.current.push(canvas.toDataURL("image/png"));
    const prev = historyRef.current.pop();
    restoreFrom(prev);
  }, [canvasRef, restoreFrom]);

  // Redo function
  const redo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || redoRef.current.length === 0) return;
    
    historyRef.current.push(canvas.toDataURL("image/png"));
    const next = redoRef.current.pop();
    restoreFrom(next);
  }, [canvasRef, restoreFrom]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      const t = e.target;
      const isTyping = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (isTyping) return;

      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (key === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if (key === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo]);

  // Clear, Redo, Download and Undo functionality
  useEffect(() => {
    if (!canvasRef.current || !ctxRef.current) return;

    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (tool === "clear") {
      snapshot();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setTimeout(() => setTool?.("pencil"), 0);
    }

    if (tool === "download") {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.download = "drawing.png";
      a.href = url;
      a.click();
      setTimeout(() => setTool?.("pencil"), 0);
    }

    if (tool === "undo") {
      undo();
      setTimeout(() => setTool?.("pencil"), 0);
    }

    if (tool === "redo") {
      redo();
      setTimeout(() => setTool?.("pencil"), 0);
    }
  }, [tool, canvasRef, ctxRef, setTool, snapshot, undo, redo]);

  // Get canvas coordinates (compensate for CSS zoom)
  const getCanvasXY = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // rect.width already includes zoom! We need the base width
    const baseWidth = rect.width / zoom;
    const baseHeight = rect.height / zoom;
    
    // Scale from CSS pixels to canvas bitmap pixels
    const scaleX = canvas.width / baseWidth;
    const scaleY = canvas.height / baseHeight;
    
    // Mouse position in zoomed pixels
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert to canvas bitmap coordinates
    const x = Math.floor((mouseX / zoom) * scaleX);
    const y = Math.floor((mouseY / zoom) * scaleY);
    
    return { x, y };
};

  //Panning
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const handlePanStart = (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // Middle mouse or Shift+Left
      e.preventDefault();
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handlePanMove = (e) => {
    if (!isPanningRef.current) return;
    e.preventDefault();
    const newPan = {
      x: e.clientX - panStartRef.current.x,
      y: e.clientY - panStartRef.current.y
    };
    setPan?.(newPan);
  };

  const handlePanEnd = () => {
    isPanningRef.current = false;
  };

  canvas.addEventListener('mousedown', handlePanStart);
  window.addEventListener('mousemove', handlePanMove);
  window.addEventListener('mouseup', handlePanEnd);

  return () => {
    canvas.removeEventListener('mousedown', handlePanStart);
    window.removeEventListener('mousemove', handlePanMove);
    window.removeEventListener('mouseup', handlePanEnd);
  };
}, [pan, setPan, canvasRef]);

  /* Drawing and tool handlers */
  // finish gradient on mouse up (wash over whole canvas along the drag)
  function handleMouseUp(e) {
    if (tool === "gradient" && gradStart) {
      const end = getCanvasXY(e);                 // end point
      const ctx = ctxRef.current;
      const { r, g, b } = hexToRgb(lineColor);

      // save to history for Undo
      snapshot?.();

      const lg = ctx.createLinearGradient(gradStart.x, gradStart.y, end.x, end.y);
      lg.addColorStop(0, `rgba(${r},${g},${b},0)`);
      lg.addColorStop(1, `rgba(${r},${g},${b},${lineOpacity})`);

      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();

      setGradStart(null);
      setTool?.("pencil");                       // back to pencil
      return;                                    // don't call endDrawing
    }

    // default path: finish normal stroke
    endDrawing(e);
  }

  const handleMouseDown = (e) => {
    const ctx = ctxRef.current;

      if (tool === "gradient") {
        // start point in canvas bitmap coords
        setGradStart(getCanvasXY(e));          
        return;
      }
    if (!ctx) return;

    // 🖐️ Move tool (pan)
    if (tool === "move") {
      e.preventDefault();
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return; 
    }

    //🪣 Bucket tool
    if (tool === "bucket") {
      snapshot();
      const { x, y } = getCanvasXY(e);
      const hex = lineColor.replace('#','');
      const r = parseInt(hex.slice(0,2),16);
      const g = parseInt(hex.slice(2,4),16);
      const b = parseInt(hex.slice(4,6),16);
      const a = Math.round((lineOpacity ?? 1) * 255);
      floodFill(ctx, x, y, [r,g,b,a], 8);
      setTool?.("pencil");
      return;
    }

    // 🎨 Eyedropper tool
    if (tool === "eyedropper") {
      const { x, y } = getCanvasXY(e);
      const [r,g,b] = ctx.getImageData(x, y, 1, 1).data;
      const hex = "#" + [r,g,b].map(v => v.toString(16).padStart(2,"0")).join("");
      setLineColor?.(hex);
      setTool?.("pencil");
      return;
    }

    // ✏️ / 🧽 – drawing and erasing (ONLY if not move tool)
    snapshot();
    const { x, y } = getCanvasXY(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = lineOpacity;
    ctx.strokeStyle = lineColor;
    ctx.globalCompositeOperation = (tool === "eraser") ? "destination-out" : "source-over";
    startDrawing(e);
  };

  return (
    <div 
    className="draw-area"
     style={{
      '--zoom': zoom,
      '--pan-x': `${pan.x}px`,
      '--pan-y': `${pan.y}px`
    }}>
      <canvas
        id="draw-canvas"
        ref={canvasRef}
        width={800}
        height={600}
        data-tool={tool}
        onMouseDown={handleMouseDown}
        onMouseMove={draw}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default DrawArea;