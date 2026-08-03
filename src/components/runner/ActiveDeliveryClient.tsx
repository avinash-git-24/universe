"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Package, IndianRupee, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { updateRequestStatus, AssignmentWithRequest } from "@/lib/database/requests";
import type { Database } from "@/types/database";

interface ActiveDeliveryClientProps {
  initialAssignment: AssignmentWithRequest;
}

export function ActiveDeliveryClient({ initialAssignment }: ActiveDeliveryClientProps) {
  const router = useRouter();
  const [assignment, setAssignment] = useState(initialAssignment);
  const [isUpdating, setIsUpdating] = useState(false);

  const request = assignment.request;
  const status = request.status;

  const handleUpdateStatus = async (newStatus: Database["public"]["Enums"]["request_status"]) => {
    setIsUpdating(true);
    try {
      const supabase = createClient();
      const success = await updateRequestStatus(supabase, request.id, newStatus);
      
      if (success) {
        if (newStatus === "delivered" || newStatus === "cancelled") {
          router.push("/dashboard/runner");
          router.refresh();
        } else {
          setAssignment((prev) => ({
            ...prev,
            request: { ...prev.request, status: newStatus }
          }));
          router.refresh();
        }
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Status flow UI config
  const getActionBtn = () => {
    switch (status) {
      case "accepted":
        return (
          <Button 
            className="w-full h-14 text-lg font-bold" 
            onClick={() => handleUpdateStatus("picked_up")}
            disabled={isUpdating}
          >
            Mark Picked Up
          </Button>
        );
      case "picked_up":
        return (
          <Button 
            className="w-full h-14 text-lg font-bold" 
            onClick={() => handleUpdateStatus("delivered")}
            disabled={isUpdating}
          >
            Mark Delivered
          </Button>
        );
      default:
        return null; // Delivered/cancelled shouldn't stay on this page
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Active Delivery</h2>
        <Badge variant={status === "picked_up" ? "primary" : "neutral"} className="text-sm px-3 py-1">
          {status === "accepted" ? "Heading to Pickup" : "Heading to Dropoff"}
        </Badge>
      </div>

      <Card className="border-primary shadow-md">
        <CardHeader className="pb-3 border-b bg-secondary/20">
          <CardTitle className="flex justify-between items-center text-lg">
            <span>Reward</span>
            <span className="text-2xl font-extrabold text-primary flex items-center">
              <IndianRupee className="w-5 h-5 mr-1" />
              {request.delivery_fee}
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mr-3 mt-1">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">1. Pickup At</p>
                <p className="text-lg font-bold">{request.pickup_location}</p>
              </div>
            </div>
            
            <div className="w-0.5 h-6 bg-border ml-4 border-l-2 border-dashed"></div>

            <div className="flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mr-3 mt-1">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-1">2. Deliver To</p>
                <p className="text-lg font-bold text-primary">{request.dropoff_location}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <p className="font-semibold flex items-center">
              <Package className="w-4 h-4 mr-2" /> Items to get
            </p>
            <div className="space-y-2">
              {request.items.map((item) => (
                <div key={item.id} className="flex justify-between p-3 bg-secondary/30 rounded-lg">
                  <span className="font-medium">{item.quantity} × {item.name}</span>
                </div>
              ))}
            </div>
            {request.instructions && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg text-sm text-accent-foreground">
                <strong>Instructions:</strong> {request.instructions}
              </div>
            )}
          </div>

          {/* Dummy Contact Actions for UI feel */}
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1">
              <Phone className="w-4 h-4 mr-2" /> Call
            </Button>
            <Button variant="secondary" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" /> Chat
            </Button>
          </div>
        </CardContent>

        <CardFooter className="pt-2 pb-6">
          {getActionBtn()}
        </CardFooter>
      </Card>
    </div>
  );
}
