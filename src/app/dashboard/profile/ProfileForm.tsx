"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Mail, CheckCircle2, Upload, Trash2, Camera, Save, ShieldCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function ProfileForm({ 
  userId, 
  email, 
  initialData 
}: { 
  userId: string; 
  email: string; 
  initialData: Partial<Profile>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [fullName, setFullName] = useState(initialData.full_name || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatar_url || null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size (2MB limit)
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Upload to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update profile record
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    if (!avatarUrl) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Extract file path from public URL to delete from storage
      // The public URL looks like: https://[project].supabase.co/storage/v1/object/public/avatars/user_id/profile.png
      const pathSegments = avatarUrl.split('/avatars/');
      if (pathSegments.length > 1) {
        const filePath = pathSegments[1];
        await supabase.storage.from('avatars').remove([filePath]);
      }

      // 2. Clear profile reference
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (updateError) throw updateError;

      setAvatarUrl(null);
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to remove photo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (updateError) throw updateError;
      
      setSuccess(true);
      router.refresh(); 
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for rendering initials avatar if no photo
  const initial = fullName ? fullName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        background: "rgba(10,15,12,0.6)",
        borderRadius: "20px",
        padding: "2rem",
        border: "1px solid rgba(102,255,178,0.1)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        width: "100%",
        marginBottom: "1rem"
      }}>
        {/* Photo Section */}
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", marginBottom: "2.5rem" }}>
          
          <div style={{ position: "relative" }}>
            {/* Avatar Container */}
            <div style={{
              width: "120px", height: "120px", borderRadius: "50%",
              background: avatarUrl ? "transparent" : "#00E676", color: "#000",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "3rem",
              boxShadow: "0 0 25px rgba(0,230,118,0.3)",
              border: "2px solid #00E676",
              overflow: "hidden",
              position: "relative"
            }}>
              {avatarUrl ? (
                <Image 
                  src={avatarUrl} 
                  alt="Profile Photo" 
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                initial
              )}
            </div>
            
            {/* Camera Button Over Avatar */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: "absolute", bottom: "0", right: "0",
                width: "36px", height: "36px", borderRadius: "50%",
                background: "#050A07", border: "1px solid rgba(255,255,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", cursor: "pointer", transition: "all 0.2s"
              }}
              className="hover:border-[#00E676] hover:text-[#00E676]"
              disabled={uploading || loading}
            >
              <Camera size={16} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>Profile Photo</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem", margin: 0, marginBottom: "0.5rem" }}>
              Upload a clear photo so others can recognize you.
            </p>
            
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload}
                accept="image/jpeg, image/png, image/webp" 
                style={{ display: "none" }} 
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || loading}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  background: "transparent", color: "#00E676",
                  border: "1px solid rgba(0,230,118,0.3)", borderRadius: "8px",
                  padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: 600,
                  cursor: (uploading || loading) ? "not-allowed" : "pointer",
                  opacity: (uploading || loading) ? 0.5 : 1,
                  transition: "all 0.2s"
                }}
                className="hover:bg-[rgba(0,230,118,0.1)]"
              >
                <Upload size={16} />
                {uploading ? "Uploading..." : "Upload Photo"}
              </button>
              
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={!avatarUrl || uploading || loading}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  background: "transparent", color: "#EF4444",
                  border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px",
                  padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: 600,
                  cursor: (!avatarUrl || uploading || loading) ? "not-allowed" : "pointer",
                  opacity: (!avatarUrl || uploading || loading) ? 0.5 : 1,
                  transition: "all 0.2s"
                }}
                className="hover:bg-[rgba(239,68,68,0.1)]"
              >
                <Trash2 size={16} />
                Remove Photo
              </button>
            </div>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", margin: 0, marginTop: "0.25rem" }}>
              JPG, PNG or WebP. Max size 2MB.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Read-only email */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[0.9rem] font-semibold text-white font-[family-name:var(--font-inter)] mb-1">
              University Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[#A7B8B0]"><Mail size={16} /></span>
              <input 
                disabled
                value={email}
                className="w-full pl-10 pr-4 py-2.5 bg-[rgba(255,255,255,0.02)] text-white/50 border border-[rgba(255,255,255,0.05)] rounded-[var(--radius-md)] cursor-not-allowed text-sm font-[family-name:var(--font-inter)] outline-none"
              />
            </div>
            <p className="text-[0.8rem] text-[#A7B8B0]/60 mt-1 font-[family-name:var(--font-inter)]">
              Your email cannot be changed as it is tied to your university identity.
            </p>
          </div>

          {/* Full Name */}
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-[0.9rem] font-semibold text-white font-[family-name:var(--font-inter)] mb-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-[#A7B8B0]"><User size={16} /></span>
              <input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-2.5 bg-[rgba(255,255,255,0.02)] text-white border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-md)] text-sm font-[family-name:var(--font-inter)] outline-none focus:border-[#00E676] transition-colors"
              />
            </div>
            <p className="text-[0.8rem] text-[#A7B8B0]/60 mt-1 font-[family-name:var(--font-inter)]">
              Enter your full name as it appears on your university records.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-[family-name:var(--font-inter)] flex items-center justify-between mt-2">
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} className="text-red-500 hover:text-red-400">
                <X size={14} />
              </button>
            </div>
          )}

          {success && (
            <div className="p-4 bg-[#00E676]/5 border border-[#00E676]/20 rounded-xl flex justify-between items-start relative mt-2">
              <div className="flex gap-3 items-start">
                <div style={{ background: "#00E676", borderRadius: "50%", padding: "4px", color: "#000" }}>
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h4 style={{ color: "#00E676", fontWeight: 600, fontSize: "0.9rem", margin: 0, marginBottom: "0.25rem" }}>
                    Profile updated successfully.
                  </h4>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: 0 }}>
                    Your changes have been saved.
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setSuccess(false)} className="text-[#00E676] opacity-50 hover:opacity-100">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-3 items-center border-t border-[rgba(255,255,255,0.05)] pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              style={{ color: "#fff", padding: "0.8rem 1.5rem" }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={loading}
              style={{
                background: "#00E676", color: "#000", fontWeight: 800, fontSize: "0.9rem",
                borderRadius: "8px", padding: "0.8rem 1.5rem",
                boxShadow: "0 0 15px rgba(0,230,118,0.2)",
                display: "flex", alignItems: "center", gap: "0.5rem"
              }}
              className="hover:scale-105 transition-transform"
            >
              <Save size={16} />
              Save Changes
            </Button>
          </div>

        </form>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
        <ShieldCheck size={14} />
        <span>Your information is secure and encrypted.</span>
      </div>
    </div>
  );
}
