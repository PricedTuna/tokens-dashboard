import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const MetricChart = ({ data, title }) => {
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
  ];

  return (
    <div className="glass chart-container animate-in">
      <h3 className="chart-title">{title}</h3>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              contentStyle={{ 
                backgroundColor: 'var(--bg-sidebar)', 
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                fontSize: '14px'
              }}
              itemStyle={{ fontWeight: 600 }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}
            />
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
