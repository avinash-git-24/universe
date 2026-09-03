"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

interface RequestStatusDonutProps {
  data: { name: string; value: number; color: string }[];
  title: string;
  description?: string;
  total: number;
}

interface DonutTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

const CustomTooltip = ({ active, payload }: DonutTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0f0d]/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-4 text-sm min-w-[140px]">
        <div className="flex items-center gap-2 mb-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: payload[0].payload.color }}
          />
          <p className="font-semibold text-white/90 capitalize">{payload[0].name}</p>
        </div>
        <p className="text-2xl font-bold text-white mb-1">{payload[0].value}</p>
        <p className="text-xs text-white/50">requests</p>
      </div>
    );
  }
  return null;
};

export function RequestStatusDonut({ data, title, description, total }: RequestStatusDonutProps) {
  const hasData = total > 0;

  // Re-calculate percentages for custom legend
  const legendData = data.map(item => ({
    ...item,
    percentage: hasData ? ((item.value / total) * 100).toFixed(1) : "0.0"
  }));

  return (
    <div className="bg-[#0c1410]/80 backdrop-blur-md border border-white/10 hover:border-emerald-500/25 rounded-2xl overflow-hidden relative group h-full transition-all shadow-sm">
      <div className="p-6 pb-2 border-b border-white/5 relative z-10 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-400" />
            {title}
          </h2>
          {description && <p className="text-sm text-white/50 mt-1">{description}</p>}
        </div>
      </div>
      
      <div className="p-6 relative z-10 flex h-[300px]">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center w-full h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <PieChartIcon className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white/80">No requests yet</h3>
            <p className="text-sm text-white/40 mt-1 max-w-[200px]">
              Status breakdown will appear once requests are made.
            </p>
          </div>
        ) : (
          <div className="flex w-full h-full items-center">
            <div className="flex-1 h-full min-w-0 min-h-[260px] relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-extrabold text-white">{total}</span>
                <span className="text-xs font-medium text-white/40 tracking-wider mt-1">Total</span>
              </div>
              <ResponsiveContainer width="100%" height={260} minWidth={0} minHeight={260}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="90%"
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-[180px] flex flex-col justify-center space-y-6 ml-4">
              {legendData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-white/80">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{item.value}</span>
                    <span className="text-xs text-white/40 w-12 text-right">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
