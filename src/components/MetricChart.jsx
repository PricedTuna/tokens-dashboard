import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MetricChart = ({ data, title, focusFormat }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = [
    { 
      name: 'TRON', 
      input: data.tron.input, 
      output: data.tron.output, 
      reasoning: data.tron.reasoning 
    },
    { 
      name: 'TOON', 
      input: data.toon.input, 
      output: data.toon.output, 
      reasoning: data.toon.reasoning 
    },
    { 
      name: 'JTON', 
      input: data.jton.input, 
      output: data.jton.output, 
      reasoning: data.jton.reasoning 
    },
  ].filter(d => !focusFormat || d.name.toLowerCase() === focusFormat.toLowerCase());

  return (
    <div className="glass chart-container animate-in">
      <h3 className="chart-title">{title}</h3>
      <div style={{ width: '100%', height: isMobile ? 280 : 350 }}>
        <ResponsiveContainer>
          <BarChart 
            data={chartData} 
            margin={isMobile 
              ? { top: 10, right: 10, left: -20, bottom: 0 } 
              : { top: 20, right: 30, left: 20, bottom: 5 }
            }
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ 
                fill: 'var(--text-secondary)', 
                fontSize: isMobile ? 10 : 12, 
                fontWeight: 600 
              }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: isMobile ? 9 : 10 }}
              tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              contentStyle={{ 
                backgroundColor: 'var(--bg-sidebar)', 
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                fontSize: isMobile ? '12px' : '14px'
              }}
              itemStyle={{ fontWeight: 600 }}
            />
            {(!isMobile || window.innerWidth > 480) && (
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ 
                  fontSize: isMobile ? '10px' : '12px', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)' 
                }}
              />
            )}
            <Bar dataKey="input" fill="var(--accent-tron)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="output" fill="var(--accent-toon)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="reasoning" fill="var(--accent-jton)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricChart;
