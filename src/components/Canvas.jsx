import { useState, useEffect, useRef } from "react"
import "./Canvas.css"
import Menu from "./Menu"
import DrawArea from "./DrawArea"

const Canvas = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lineColor, setLineColor] = useState("#000000");
    const [lineWidth, setLineWidth] = useState(5);
    const [lineOpacity, setLineOpacity] = useState(1);
    const [tool, setTool] = useState("pencil");
    const [zoom, setZoom] = useState();
    const [pan, setPan] = useState({ x: 0, y: 0 }); // in „canvas units“
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = lineOpacity;
        ctx.strokeStyle = lineColor;
        ctxRef.current = ctx;
    }, [lineColor, lineWidth, lineOpacity]);
    
    /*** Drawing functions */
    // Start drawing
    const startDrawing = (e) => {
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(
            e.nativeEvent.offsetX,  
            e.nativeEvent.offsetY
        );
        setIsDrawing(true);
    }
    
    // End drawing
    const endDrawing = () => {
        ctxRef.current.closePath();
        setIsDrawing(false);
    }
    
    // During drawing
    const draw = (e) => {
        if (!isDrawing) return;
        ctxRef.current.lineTo(
            e.nativeEvent.offsetX,
            e.nativeEvent.offsetY
        );
        ctxRef.current.stroke();
    }
    
    // utilities
    const idx = (x, y, w) => (y * w + x) * 4; // RGBA index
    const colorMatch = (data, i, target, tol) => {
        const dr = data[i]   - target[0];
        const dg = data[i+1] - target[1];
        const db = data[i+2] - target[2];
        const da = data[i+3] - target[3]; // ✅ Přidána alpha kontrola!
        return (Math.abs(dr) + Math.abs(dg) + Math.abs(db) + Math.abs(da)) <= tol;
    };

    // ✅ OPRAVENÝ Flood fill s visited tracking
    function floodFill(ctx, x, y, fillRGBA, tolerance = 0) {
        const { width: w, height: h } = ctx.canvas;
        
        // Check bounds
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        
        const img = ctx.getImageData(0, 0, w, h);
        const data = img.data;
        
        const i0 = idx(x, y, w);
        const target = [data[i0], data[i0+1], data[i0+2], data[i0+3]];
        
        // If target color is same as fill color, nothing to do
        if (
            target[0] === fillRGBA[0] &&
            target[1] === fillRGBA[1] &&
            target[2] === fillRGBA[2] &&
            target[3] === fillRGBA[3]
        ) return;
        
        // ✅ KLÍČOVÁ OPRAVA: Použít visited array pro sledování navštívených pixelů
        const visited = new Uint8Array(w * h);
        
        const stack = [[x, y]];
        visited[y * w + x] = 1; // Označit startovní pixel jako navštívený
        
        while (stack.length) {
            const [cx, cy] = stack.pop();
            const i = idx(cx, cy, w);
            
            // Check if this pixel matches the target color
            if (!colorMatch(data, i, target, tolerance)) continue;
            
            // Set the new color
            data[i]   = fillRGBA[0];
            data[i+1] = fillRGBA[1];
            data[i+2] = fillRGBA[2];
            data[i+3] = fillRGBA[3];
            
            // ✅ Přidat sousedy pouze pokud ještě nebyli navštíveni
            // Left
            if (cx > 0) {
                const leftIdx = cy * w + (cx - 1);
                if (!visited[leftIdx]) {
                    visited[leftIdx] = 1;
                    stack.push([cx - 1, cy]);
                }
            }
            // Right
            if (cx < w - 1) {
                const rightIdx = cy * w + (cx + 1);
                if (!visited[rightIdx]) {
                    visited[rightIdx] = 1;
                    stack.push([cx + 1, cy]);
                }
            }
            // Up
            if (cy > 0) {
                const upIdx = (cy - 1) * w + cx;
                if (!visited[upIdx]) {
                    visited[upIdx] = 1;
                    stack.push([cx, cy - 1]);
                }
            }
            // Down
            if (cy < h - 1) {
                const downIdx = (cy + 1) * w + cx;
                if (!visited[downIdx]) {
                    visited[downIdx] = 1;
                    stack.push([cx, cy + 1]);
                }
            }
        }
        
        ctx.putImageData(img, 0, 0);
    }
    
    return (
        <div className="canvas">            
            <Menu
                lineColor={lineColor}
                setLineColor={setLineColor}
                lineWidth={lineWidth}
                setLineWidth={setLineWidth}
                lineOpacity={lineOpacity}
                setLineOpacity={setLineOpacity}
                tool={tool}
                setTool={setTool}
            />
            <DrawArea
                canvasRef={canvasRef}
                ctxRef={ctxRef}
                startDrawing={startDrawing}
                draw={draw} 
                isDrawing={isDrawing}
                setIsDrawing={setIsDrawing} 
                tool={tool}
                lineColor={lineColor}
                lineWidth={lineWidth}
                lineOpacity={lineOpacity}
                endDrawing={endDrawing}
                SetLineOpacity={setLineOpacity}
                setLineColor={setLineColor}
                setTool={setTool}
                floodFill={floodFill}
            />
        </div>
    )
}

export default Canvas
