import { useEffect, useRef, useCallback } from "react";
import "./DrawArea.css";

const DrawArea = ({
  canvasRef, startDrawing, draw, endDrawing,
  ctxRef, tool, lineColor, lineWidth, lineOpacity, setLineColor, setTool, floodFill
}) => {

/*** History for Undo functionality*/
const historyRef = useRef([]);
const redoRef    = useRef([]);

//Save snapshot function
const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
        const url = canvas.toDataURL("image/png");
        historyRef.current.push(url);
        redoRef.current = [];
    } catch (err) {
        console.warn("Nepodařilo se uložit snapshot:", err);
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
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = url;
}, [canvasRef, ctxRef]);

// Undo function
const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length === 0) return;
    // Save current state to redo stack
     redoRef.current.push(canvas.toDataURL("image/png"))
     const prev = historyRef.current.pop();
        restoreFrom(prev);
}, [canvasRef, restoreFrom]);

// Redo function
const redo = useCallback (() => {
    const canvas = canvasRef.current;
    if (!canvas || redoRef.current.length === 0) return;
    // Save current state to history stack
    historyRef.current.push(canvas.toDataURL("image/png"));
    const next = redoRef.current.pop();
    restoreFrom(next);
}, [canvasRef, restoreFrom]);

  // Clear, Redo and Download functionality
  useEffect(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    if (tool === "clear") {
        snapshot(); // save current state for undo
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setTimeout(() => setTool?.("pencil"), 0);
    }
    if (tool === "download") {
        const url = canvas.toDataURL("image/png");  // může být chvíli těžké – to je normální
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
  
    //Bucket tool helper
    const getCanvasXY = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top)  * scaleY);
        return { x, y };
    };

  // Drawing and Eyedropper tool
  const handleMouseDown = (e) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

     //🪣 Bucket tool
    if (tool === "bucket") {
        snapshot(); // save current state for undo
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
        setTool?.("pencil");   // ← go back to the pencil after picking color
        return;
    }

     // ✏️ / 🧽 – drawing and erasing
     snapshot(); // save current state for undo
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = lineOpacity;
    ctx.strokeStyle = lineColor;
    ctx.globalCompositeOperation = (tool === "eraser") ? "destination-out" : "source-over";
    startDrawing(e);
};

  return (
    <div className="draw-area">
      <canvas
        id="draw-canvas"
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
    </div>
  );
};

export default DrawArea;