import "./DrawArea.css";

const DrawArea = ({ canvasRef, startDrawing, draw, endDrawing}) => {
  return (
    <div className="draw-area">
      <canvas
        id="draw-canvas"
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
    </div>
  );
};

export default DrawArea;