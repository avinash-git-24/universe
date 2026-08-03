import Link from "next/link";
import { Plus, Bike, User, Package, Wallet, MessageSquare, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/request/new" className="block">
          <Button className="w-full justify-start h-11">
            <Plus className="w-4 h-4 mr-3" /> Create Request
          </Button>
        </Link>
        <Link href="/dashboard/requests" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <Package className="w-4 h-4 mr-3" /> My Requests
          </Button>
        </Link>
        <Link href="/dashboard/runner" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <Bike className="w-4 h-4 mr-3" /> Runner Mode
          </Button>
        </Link>
        <Link href="/dashboard/wallet" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <Wallet className="w-4 h-4 mr-3" /> Wallet
          </Button>
        </Link>
        <Link href="/dashboard/chat" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <MessageSquare className="w-4 h-4 mr-3" /> Chat
          </Button>
        </Link>
        <Link href="/dashboard/analytics" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <BarChart3 className="w-4 h-4 mr-3" /> Analytics
          </Button>
        </Link>
        <Link href="/complete-profile" className="block">
          <Button variant="secondary" className="w-full justify-start h-11">
            <User className="w-4 h-4 mr-3" /> Edit Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
