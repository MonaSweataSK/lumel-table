import { useEffect, useState } from 'react';
import Row from './Row';
import './Table.css';

const sumRow = (row) => {
  if (!row.children || row.children.length === 0) return row.value;
  return row.children.reduce((total, child) => total + sumRow(child), 0);
};

const bootstrapRows = (rows) => {
  return rows.map(row => {
    const kids = row.children ? bootstrapRows(row.children) : undefined;
    const value = kids && kids.length ? kids.reduce((total, child) => total + child.value, 0) : row.value;
    return { ...row, value, originalValue: value, children: kids };
  });
};

const cloneRows = (rows) =>
  rows.map(row => ({ ...row, children: row.children ? cloneRows(row.children) : undefined }));

const updateRow = (rows, id, nextValue) => {
  const draft = cloneRows(rows);

  const visit = (list) => {
    for (const row of list) {
      if (row.id === id) {
        if (row.children && row.children.length) {
          const current = sumRow(row);
          if (current > 0) {
            const spread = (children, parentValue, parentCurrent) => {
              children.forEach(child => {
                const childCurrent = sumRow(child);
                const share = childCurrent / parentCurrent;
                const target = parentValue * share;

                if (child.children && child.children.length) {
                  spread(child.children, target, childCurrent);
                  child.value = sumRow(child);
                } else {
                  child.value = Math.round(target * 10000) / 10000;
                }
              });
            };
            spread(row.children, nextValue, current);
          }
          row.value = sumRow(row);
        } else {
          row.value = nextValue;
        }
        return true;
      }

      if (row.children && visit(row.children)) {
        row.value = sumRow(row);
        return true;
      }
    }
    return false;
  };

  visit(draft);
  return draft;
};

const sumCurrent = (rows) => rows.reduce((total, row) => total + row.value, 0);
const sumOriginal = (rows) => rows.reduce((total, row) => total + row.originalValue, 0);

export default function Table() {
  const [rows, setRows] = useState([]);


  useEffect(() => {
    fetch('/data.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data');
        return res.json();
      })
      .then((data) => {
        setRows(bootstrapRows(data.rows));
      })
  }, []);

  const applyPercent = (id, currentValue, percent) => {
    const next = currentValue + (currentValue * percent) / 100;
    setRows(prev => updateRow(prev, id, next));
  };

  const applyValue = (id, value) => {
    setRows(prev => updateRow(prev, id, value));
  };

  const renderRows = (list, level = 0) =>
    list.map(row => (
      <div key={row.id}>
        <Row row={row} level={level} onPercent={applyPercent} onValue={applyValue} />
        {row.children && renderRows(row.children, level + 1)}
      </div>
    ));

  


  const total = sumCurrent(rows);
  const originalTotal = sumOriginal(rows);
  const totalVariance = originalTotal > 0 ? ((total - originalTotal) / originalTotal) * 100 : 0;

  return (
    <div className="table-wrapper">
      <div className="table">
        <div className="table-header">
          <div className="cell label-cell">Label</div>
          <div className="cell value-cell">Value</div>
          <div className="cell input-cell">Input</div>
          <div className="cell button-cell">Allocation %</div>
          <div className="cell button-cell">Allocation Val</div>
          <div className="cell variance-cell">Variance %</div>
        </div>
        <div className="table-body">
          {renderRows(rows)}
          <div className="table-row grand-total-row">
            <div className="cell label-cell">
              <strong>Total</strong>
            </div>
            <div className="cell value-cell">
              <strong>{total.toFixed(2)}</strong>
            </div>
            <div className="cell input-cell" />
            <div className="cell button-cell" />
            <div className="cell button-cell" />
            <div className="cell variance-cell">
              <span className={totalVariance > 0 ? 'positive' : totalVariance < 0 ? 'negative' : ''}>
                {totalVariance.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

