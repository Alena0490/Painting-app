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

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineColor = lineColor;
        ctx.lineJoin = "round";
        ctx.lineWidth = lineWidth;
        ctx.globalAlpha = lineOpacity;
        ctx.strokeStyle = lineColor;
        ctxRef.current = ctx;


    }, [lineColor, lineWidth, lineOpacity]);

    const startDrawing = (e) => {
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(
            e.nativeEvent.offsetX,  
            e.nativeEvent.offsetY
        );
        setIsDrawing(true);
    }

    const endDrawing = () => {
        ctxRef.current.closePath();
        setIsDrawing(false);
    }

    const draw = (e) => {
        if (!isDrawing) return;
        ctxRef.current.lineTo(
            e.nativeEvent.offsetX,
            e.nativeEvent.offsetY
        );
        ctxRef.current.stroke();
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
        />
        <DrawArea
            canvasRef={canvasRef}
            ctxRef={ctxRef}
            startDrawing={startDrawing}
            draw={draw} 
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing} 
            lineColor={lineColor}
            lineWidth={lineWidth}
            lineOpacity={lineOpacity}
            endDrawing={endDrawing}
        />
    </div>
 )
}

export default Canvas 