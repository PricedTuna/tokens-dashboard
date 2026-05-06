import { TrendingUp, Activity, Zap, Cpu } from 'lucide-react';

const icons = {
  tokens: Zap,
  accuracy: TrendingUp,
  latency: Activity,
  models: Cpu
};

const KpiCard = ({ label, value, type, suffix = '' }) => {
  const Icon = icons[type] || Activity;
  
  return (
    <div className="glass kpi-card animate-in">
      <div className="kpi-header">
        <div className={`kpi-icon icon-${type}`}>
          <Icon size={18} />
        </div>
        <span className="label">{label}</span>
      </div>
      <div className="kpi-body">
        <span className="value">{value}</span>
        {suffix && <span className="suffix">{suffix}</span>}
      </div>
    </div>
  );
};

export default KpiCard;
