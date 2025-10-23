import "./Menu.css"
import { PiPaintBucketBold } from "react-icons/pi";
import { FaPen, FaEraser, FaEyeDropper, FaArrowLeft, FaArrowRight, FaDownload, FaTrashAlt, FaPlus, FaMinus } from "react-icons/fa";
import { MdGradient } from "react-icons/md";

const Menu = ({ lineColor, setLineColor, lineWidth, setLineWidth, lineOpacity, setLineOpacity, tool, setTool }) => {
  return (
     <nav className="menu">
        <h1>Paint App</h1>
        <article className="navigation">
         <div className="group zoom">
            <h2 className="tools-title">
                Zoom
            </h2>
            <div className="buttons">
                <button
                    type="button"
                    aria-label="Zoom out"
                >
                    <FaMinus/>
                </button>

                <button
                    type="button"
                    aria-label="Zoom in"
                >
                    <FaPlus />
                </button>
            </div>
      </div>
      <div className="brush-color">
        <label htmlFor="brush-color" className="tools-title">Color</label>
        <input
          id="brush-color"
          type="color"
          value={lineColor}
          onChange={(e) => setLineColor(e.target.value)}
        />
      </div>

      <div className="brush-size">
        <label htmlFor="brush-size" className="tools-title">Brush size</label>
        <input
          id="brush-size"
          type="range"
          min="1"
          max="50"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}  // převést na číslo
        />
      </div>

      <div className="brush-opacity">
        <label htmlFor="brush-opacity" className="tools-title">Brush opacity</label>
        <input
          id="brush-opacity"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={lineOpacity}
          onChange={(e) => setLineOpacity(Number(e.target.value))} // taky číslo
        />
      </div>
        <div className="tools">
            <h2 className="tools-title">Tools</h2>
            <div className="buttons">
                <button
                    type="button" 
                    id="pencil-tool"
                    title="Pencil"
                    className={tool === "pencil" ? "active" : ""}
                    aria-label="Pencil"
                    aria-pressed={tool === "pencil"}  
                    onClick={() => setTool("pencil")}
                >
                    <FaPen />
                </button>
                <button 
                    type="button"
                    id="eraser-tool"
                    title="Eraser"            
                    className={tool === "eraser" ? "active" : ""}
                    aria-label="Eraser"
                    aria-pressed={tool === "eraser"}
                    onClick={() => setTool("eraser")}
                >
                        <FaEraser />
                </button>

                <button
                    type="button"
                    id="eyedropper-tool"
                    title="Eyedropper tool"
                    className={tool === "eyedropper" ? "active" : ""}
                    aria-label="Eyedropper"
                    aria-pressed={tool === "eyedropper"}
                    onClick={() => setTool("eyedropper")}
                >
                        <FaEyeDropper />
                </button>

                <button
                    type="button"
                    id="bucket"
                    title="Bucket tool"
                    className={tool === "bucket" ? "active" : ""}
                    aria-label="Bucket fill"
                    aria-pressed={tool === "bucket"}
                    onClick={() => setTool("bucket")}
                >
                        <PiPaintBucketBold />
                </button>

                <button
                    type="button"
                    id="gradient"
                    title="Gradient tool"
                    aria-label="Gradient tool"
                    aria-pressed={tool === "gradient"}
                >
                    <MdGradient/>
                </button>
            </div>
        </div>
        <div className="history">
            <h2 className="tools-title">Changes</h2>
            <div className="history-tools">
                <button
                    type="button"
                    id="undo"
                    aria-label="Undo"
                    onClick={() => setTool("undo")}
                >
                    <FaArrowLeft />
                </button>

                <button
                    type="button"
                    id="redo"
                    aria-label="Redo"
                    onClick={() => setTool("redo")}
                >
                    <FaArrowRight />
                </button>
            </div>
        </div>

        <div className="file">
            <h2 className="tools-title">File</h2>
            <div className="file-tools">
                <button
                    type="button"
                    id="clear-tool"
                    title="Delete picture" 
                    aria-label="Delete the picture"
                    onClick={() => window.confirm("Do you want to delete the picture?") && setTool("clear")}
                >
                    <FaTrashAlt />
                </button>
                <button
                    type="button" 
                    title="Download PNG"
                    aria-label="Download the picture as PNG" 
                    onClick={() => setTool("download")}>
                    <FaDownload />
                </button>
            </div>
        </div>
        </article>
    </nav>
 )
}

export default Menu