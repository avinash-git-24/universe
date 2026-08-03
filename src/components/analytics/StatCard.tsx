"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number; // percentage, e.g., 5.2 or -2.1
  description?: string;
}

export function StatCard({ title, value, icon, trend, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {trend !== undefined ? (
          <div className="flex items-center text-xs mt-1">
            {trend > 0 ? (
              <span className="flex items-center text-emerald-500 font-medium">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                {trend}%
              </span>
            ) : trend < 0 ? (
              <span className="flex items-center text-destructive font-medium">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                {Math.abs(trend)}%
              </span>
            ) : (
              <span className="flex items-center text-muted-foreground font-medium">
                <Minus className="w-3 h-3 mr-1" />
                0%
              </span>
            )}
            <span className="text-muted-foreground ml-1 text-xs">from last month</span>
          </div>
        ) : description ? (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
