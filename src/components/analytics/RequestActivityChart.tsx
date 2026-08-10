"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";
import { Activity, LayoutList, ChevronDown } from "lucide-react";
import { useState } from "react";

interface RequestActivityChartProps {
  data: { date: string; created: number; completed: number; cancelled: number }[];
  title: string;
  description?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0f0d]/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-4 text-sm min-w-[160px]">
        <p className="font-medium text-white/50 mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-[2px]" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-white/70 capitalize">{entry.name}</span>
              </div>
              <span className="font-bold text-white ml-4">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function RequestActivityChart({ 
  data, 
  title, 
  description 
}: RequestActivityChartProps) {
  const [aggregation, setAggregation] = useState<"Daily" | "Weekly">("Daily");
  const hasData = data && data.some((d) => d.created > 0 || d.completed > 0 || d.cancelled > 0);

  return (
    <div className="bg-[#0d1310] border border-white/5 rounded-2xl overflow-hidden relative group h-full">
      <div className="p-6 pb-2 border-b border-white/5 relative z-10 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            {title}
          </h2>
          {description && <p className="text-sm text-white/50 mt-1">{description}</p>}
        </div>
        <button 
          onClick={() => setAggregation(a => a === "Daily" ? "Weekly" : "Daily")}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-medium text-white/70 transition-colors"
        >
          {aggregation}
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </button>
      </div>
      
      <div className="p-6 relative z-10">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <LayoutList className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white/80">No request activity</h3>
            <p className="text-sm text-white/40 mt-1 max-w-sm">
              Your request volume will appear here once you start using the platform.
            </p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={12} 
                  tickMargin={10} 
                  minTickGap={15}
                  stroke="rgba(255,255,255,0.4)"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={12} 
                  stroke="rgba(255,255,255,0.4)"
                  tickMargin={10}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="square"
                  wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}
                />
                <Bar dataKey="created" name="Created" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={16} />
                <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={16} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
