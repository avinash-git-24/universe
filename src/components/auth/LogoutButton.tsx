"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { ROUTES } from "@/constants/routes";

interface LogoutButtonProps {
  variant?: "primary" | "accent" | "secondary" | "ghost" | "destructive" | "link";
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export function LogoutButton({ 
  variant = "ghost", 
  className = "", 
  showIcon = true,
  label = "Log out"
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push(ROUTES.LOGIN);
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant} 
      className={className} 
      onClick={handleLogout}
      disabled={isLoading}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {isLoading ? "Logging out..." : label}
    </Button>
  );
}
