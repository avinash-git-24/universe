"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp, BarChart2, ChevronDown } from "lucide-react";
import { useState } from "react";

interface VolumeChartProps {
  data: { date: string; amount: number }[];
  title: string;
  description?: string;
}

interface VolumeTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: VolumeTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0f0d]/90 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-4 text-sm min-w-[140px]">
        <p className="font-medium text-white/50 mb-1">{label}</p>
        <p className="font-bold text-white text-lg">
          ₹{payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function VolumeChart({ data, title, description }: VolumeChartProps) {
  const [aggregation, setAggregation] = useState<"Daily" | "Weekly">("Daily");
  const hasData = data && data.some((d) => d.amount > 0);

  // In a real app, we would aggregate the data by week if "Weekly" is selected.
  // For now, we will just use the passed daily data.
  
  return (
    <div className="bg-[#0d1310] border border-white/5 rounded-2xl overflow-hidden relative group w-full">
      <div className="p-6 pb-2 border-b border-white/5 relative z-10 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
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
          <div className="flex flex-col items-center justify-center py-16 text-center h-[350px]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10">
              <BarChart2 className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white/80">No spending data yet</h3>
            <p className="text-sm text-white/40 mt-1 max-w-sm">
              Your spending over the selected time range will appear here once you make requests.
            </p>
          </div>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={12} 
                  tickMargin={12}
                  minTickGap={20}
                  stroke="rgba(255,255,255,0.4)"
                />
                <YAxis 
                  tickFormatter={(value) => `₹${value}`}
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={12} 
                  stroke="rgba(255,255,255,0.4)"
                  tickMargin={12}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  activeDot={{ r: 6, fill: "#10b981", stroke: "#0d1310", strokeWidth: 2 }}
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
