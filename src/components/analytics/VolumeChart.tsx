"use client";

import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface VolumeChartProps {
  data: { date: string; amount: number; rawDate: Date }[];
  title: string;
  description?: string;
  type?: "bar" | "line";
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

// Format for tooltip
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg shadow-sm p-3 text-sm">
        <p className="font-semibold">{label}</p>
        <p className="text-primary mt-1">
          ₹{payload[0].value?.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function VolumeChart({ 
  data, 
  title, 
  description, 
  type = "bar",
  color = "hsl(var(--primary))"
}: VolumeChartProps) {
  
  return (
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={12} 
                  tickMargin={10} 
                  minTickGap={15}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={12} 
                  tickFormatter={(val) => `₹${val}`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.5)" }} />
                <Bar 
                  dataKey="amount" 
                  fill={color} 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={40} 
                />
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={12} 
                  tickMargin={10} 
                  minTickGap={15}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={12} 
                  tickFormatter={(val) => `₹${val}`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke={color} 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: color }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
