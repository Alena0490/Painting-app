import "./Menu.css"

const Menu = ({ lineColor, setLineColor, lineWidth, setLineWidth, lineOpacity, setLineOpacity }) => {
  return (
     <nav className="menu">
      <div className="brush-color">
        <label htmlFor="brush-color"></label>
        <input
          id="brush-color"
          type="color"
          value={lineColor}
          onChange={(e) => setLineColor(e.target.value)}
        />
      </div>

      <div className="brush-size">
        <label htmlFor="brush-size"></label>
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
        <label htmlFor="brush-opacity"></label>
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
            <button 
                id="pencil-tool"
            >
                ✏️ Pencil
            </button>
            <button 
                id="eraser-tool">
                    🧽 Eraser
                </button>
        </div>
         <button title="Vymazat vše">
          🗑️ Clear
        </button>
        <button title="Stáhnout PNG">
          ⬇️ Download
        </button>
    </nav>
        )
}

export default Menu