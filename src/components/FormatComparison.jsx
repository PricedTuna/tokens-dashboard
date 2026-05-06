import { Hash } from 'lucide-react';

const FormatComparison = ({ format, name, totalEvals }) => {
  const accuracy = (format.correct / totalEvals) * 100 || 0;
  
  return (
    <div className={`glass format-card border-${name} animate-in`}>
      <div className="format-header">
        <div className="title-area">
          <h3 className={`text-${name}`}>{name.toUpperCase()}</h3>
        </div>
        <div className={`accuracy-badge badge-${name}`}>
          {accuracy.toFixed(1)}%
        </div>
      </div>
      
      <div className="format-stats-v2">
        <div className="v2-stat-row">
          <Hash size={14} className="stat-icon" />
          <span className="stat-label">Total Tokens</span>
          <span className="stat-value">{format.tokens.toLocaleString()}</span>
        </div>
        
        <div className="token-breakdown-bar">
          <div 
            className={`bar-fill bar-${name}`} 
            style={{ width: '100%' }}
          ></div>
        </div>
        
        <div className="v2-sub-stats">
          <div className="sub-stat">
            <span className="sub-label">Input</span>
            <span className="sub-value">{format.input.toLocaleString()}</span>
          </div>
          <div className="sub-stat">
            <span className="sub-label">Output</span>
            <span className="sub-value">{format.output.toLocaleString()}</span>
          </div>
          <div className="sub-stat">
            <span className="sub-label">Reasoning</span>
            <span className="sub-value">{format.reasoning.toLocaleString()}</span>
          </div>
        </div>

        <div className="delta-insights">
          <div className="insight-title">Efficiency Analysis</div>
          {Object.entries(format.deltas).filter(([key]) => !key.includes('_pct')).map(([other, value]) => {
            const isSaving = value < 0;
            const pct = format.deltas[`${other}_pct`];
            return (
              <div key={other} className={`delta-row ${isSaving ? 'saving' : 'extra'}`}>
                <span className="delta-label">vs {other.toUpperCase()}</span>
                <span className="delta-value">
                  {isSaving ? '-' : '+'}{Math.abs(value).toLocaleString()} 
                  <small>({Math.abs(pct).toFixed(1)}%)</small>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormatComparison;
