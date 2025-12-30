import { useState } from 'react'

export default function Row({ row, level, onPercent, onValue }) {
  const [input, setInput] = useState('')

  const variance = row.originalValue > 0 ? ((row.value - row.originalValue) / row.originalValue) * 100 : 0

  const applyPercent = () => {
    const pct = Number(input)
    if (!Number.isNaN(pct)) {
      onPercent(row.id, row.value, pct)
      setInput('')
    }
  }

  const applyValue = () => {
    const val = Number(input)
    if (!Number.isNaN(val) && val >= 0) {
      onValue(row.id, val)
      setInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') applyValue()
  }

  const indent = level * 24
  const isParent = !!(row.children && row.children.length)

  return (
    <div className={`table-row ${isParent ? 'parent-row' : 'child-row'}`}>
      <div className="cell label-cell" style={{ paddingLeft: `${12 + indent}px` }}>
        {level > 0 && <span className="indent-marker">└─</span>}
        {row.label}
      </div>
      <div className="cell value-cell">{row.value.toFixed(2)}</div>
      <div className="cell input-cell">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter value"
          className="value-input"
        />
      </div>
      <div className="cell button-cell">
        <button className="allocation-btn percent-btn" onClick={applyPercent}>
          Apply %
        </button>
      </div>
      <div className="cell button-cell">
        <button className="allocation-btn value-btn" onClick={applyValue}>
          Set Value
        </button>
      </div>
      <div className="cell variance-cell">
        <span className={`variance ${variance > 0 ? 'positive' : variance < 0 ? 'negative' : ''}`}>
          {variance.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

