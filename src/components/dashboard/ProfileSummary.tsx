import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, MapPin, Hash, Phone } from "lucide-react";
import type { Profile } from "@/lib/database/requests";

interface ProfileSummaryProps {
  profile: Profile;
  email: string;
}

export function ProfileSummary({ profile, email }: ProfileSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <User className="w-5 h-5 mr-2 text-primary" />
          Profile Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start">
          <User className="w-4 h-4 mr-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium leading-none">Name</p>
            <p className="text-sm text-muted-foreground mt-1">{profile.full_name || "Not set"}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Mail className="w-4 h-4 mr-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium leading-none">Email</p>
            <p className="text-sm text-muted-foreground mt-1">{email}</p>
          </div>
        </div>

        <div className="flex items-start">
          <Hash className="w-4 h-4 mr-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium leading-none">Enrollment Number</p>
            <p className="text-sm text-muted-foreground mt-1">{profile.enrollment_number || "Not set"}</p>
          </div>
        </div>

        {/* Mock fields as requested, since schema cannot be modified */}
        <div className="flex items-start">
          <MapPin className="w-4 h-4 mr-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium leading-none">Hostel & Room</p>
            <p className="text-sm text-muted-foreground mt-1">Not provided</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <Phone className="w-4 h-4 mr-3 mt-0.5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium leading-none">Phone</p>
            <p className="text-sm text-muted-foreground mt-1">Not provided</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
