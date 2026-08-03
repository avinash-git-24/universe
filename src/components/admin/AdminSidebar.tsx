"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Deliveries", href: "/admin/deliveries", icon: Package },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 bg-background border-r border-b md:border-b-0 sticky top-16 z-30 shrink-0">
      <div className="p-6">
        <h2 className="text-lg font-bold tracking-tight mb-6 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-primary" />
          Admin Panel
        </h2>
        
        <nav className="space-y-2 flex md:block overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href} className="min-w-fit">
                <Button 
                  variant={isActive ? "secondary" : "ghost"} 
                  className={`w-full justify-start ${isActive ? "font-bold text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className={`w-4 h-4 mr-3 ${isActive ? "text-primary" : ""}`} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
