"use client";

import { Activity, Clock, Hexagon, CheckCircle2, XCircle, CreditCard, Box } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityListProps {
  activities: {
    id: string;
    type: "request_created" | "request_completed" | "request_cancelled" | "payment" | "earning";
    title: string;
    description: string;
    date: Date;
    amount?: number;
  }[];
  title?: string;
}

export function RecentActivityList({ activities, title = "Recent Activity" }: RecentActivityListProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "request_created":
        return <Box className="w-4 h-4 text-blue-400" />;
      case "request_completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "request_cancelled":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "payment":
      case "earning":
        return <CreditCard className="w-4 h-4 text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-white/50" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "request_created": return "bg-blue-500/10 border-blue-500/20";
      case "request_completed": return "bg-emerald-500/10 border-emerald-500/20";
      case "request_cancelled": return "bg-red-500/10 border-red-500/20";
      case "payment":
      case "earning": return "bg-purple-500/10 border-purple-500/20";
      default: return "bg-white/5 border-white/10";
    }
  };

  return (
    <div className="bg-[#0c1410]/80 backdrop-blur-md border border-white/10 hover:border-emerald-500/25 rounded-2xl overflow-hidden relative group flex flex-col h-full w-full transition-all shadow-sm">
      <div className="p-6 pb-4 border-b border-white/5 relative z-10 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-400" />
          {title}
        </h2>
        <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
          View All
        </button>
      </div>
      
      <div className="p-6 relative z-10 flex-1 w-full">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Activity className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-sm font-medium text-white/60">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {activities.map((activity, index) => (
              <div key={activity.id || index} className="flex gap-4 items-center w-full">
                
                <div className="relative">
                  <Hexagon className={`w-10 h-10 stroke-1 ${
                    activity.type === "request_created" ? "text-blue-500/30 fill-blue-500/10" : 
                    activity.type === "request_completed" ? "text-emerald-500/30 fill-emerald-500/10" :
                    activity.type === "request_cancelled" ? "text-red-500/30 fill-red-500/10" :
                    "text-white/10 fill-white/5"
                  }`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getIcon(activity.type)}
                  </div>
                </div>
                
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-white/90">{activity.title}</p>
                    <p className="text-sm text-white/50">{activity.description}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-sm font-medium text-white/40">
                      {formatDistanceToNow(activity.date, { addSuffix: true })}
                    </span>
                    {activity.amount !== undefined && (
                      <p className="text-xs font-bold text-white/70 mt-0.5">
                        ₹{activity.amount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
