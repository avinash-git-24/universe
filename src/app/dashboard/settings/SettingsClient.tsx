"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, LogOut, Trash2, Bell, Shield, Activity, User, Eye, EyeOff, Save, CheckCircle2, X, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];

const SectionCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-[#0A0F0C]/60 rounded-2xl p-4 sm:p-7 border border-[#66FFB2]/10 backdrop-blur-xl shadow-2xl mb-6">
    <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-3 sm:pb-4">
      <div className="text-[#00E676]">{icon}</div>
      <h2 className="text-white font-bold text-base sm:text-lg m-0">{title}</h2>
    </div>
    {children}
  </div>
);

const ToggleItem = ({ label, desc, checked, onChange }: { label: string, desc: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <div className="flex items-start justify-between py-3 border-b border-[rgba(255,255,255,0.02)] last:border-0">
    <div>
      <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem", margin: 0 }}>{label}</p>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0, marginTop: "0.25rem" }}>{desc}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: "44px", height: "24px", borderRadius: "12px",
        background: checked ? "#00E676" : "rgba(255,255,255,0.1)",
        position: "relative", cursor: "pointer", transition: "all 0.2s ease"
      }}
    >
      <div style={{
        width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
        position: "absolute", top: "2px", left: checked ? "22px" : "2px",
        transition: "all 0.2s ease", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
      }} />
    </button>
  </div>
);

export function SettingsClient({ 
  userId, 
  email, 
  initialProfile,
  initialSettings
}: { 
  userId: string; 
  email: string; 
  initialProfile: Partial<Profile>;
  initialSettings: Partial<UserSettings>;
}) {
  const router = useRouter();
  const supabase = createClient();

  // Settings State
  const [notifyRequests, setNotifyRequests] = useState(initialSettings.notify_request_updates ?? true);
  const [notifyDeliveries, setNotifyDeliveries] = useState(initialSettings.notify_delivery_updates ?? true);
  const [notifyChats, setNotifyChats] = useState(initialSettings.notify_chat_messages ?? true);
  const [profileVis, setProfileVis] = useState(initialSettings.profile_visibility || 'public');
  const [activityVis, setActivityVis] = useState(initialSettings.activity_visibility || 'public');

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // --- HANDLERS ---

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsSuccess(false);

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          notify_request_updates: notifyRequests,
          notify_delivery_updates: notifyDeliveries,
          notify_chat_messages: notifyChats,
          profile_visibility: profileVis,
          activity_visibility: activityVis,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", userId);

      if (error) throw error;

      setSettingsSuccess(true);
      router.refresh();
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: unknown) {
      setSettingsError(err instanceof Error ? err.message : "Unable to update your settings. Please try again.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwdError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }

    setPwdLoading(true);

    try {
      // 1. Verify current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword
      });

      if (signInError) {
        throw new Error("Current password is incorrect.");
      }

      // 2. Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setPwdSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setDeleteError("Please type DELETE to confirm.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      // Call the secure RPC function to delete the auth.users record
      const { error } = await supabase.rpc('delete_own_account');
      if (error) throw error;

      // Upon success, sign out and redirect
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Unable to delete account. Please try again later.");
      setDeleteLoading(false);
    }
  };

  // --- UI COMPONENTS ---

  return (
    <div className="flex flex-col gap-6">

      {/* ACCOUNT & SECURITY */}
      <SectionCard title="Account & Security" icon={<Shield size={20} />}>
        
        {/* Read-Only Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl">
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>University Email</p>
            <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem" }}>{email}</p>
          </div>
          <div className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl flex items-center justify-between">
            <div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>Account Status</p>
              <p style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem", textTransform: "capitalize" }}>
                {initialProfile.account_status || 'Active'}
              </p>
            </div>
            {initialProfile.account_status === 'active' && <CheckCircle2 size={24} color="#00E676" />}
          </div>
        </div>

        {/* Change Password Form */}
        <div>
          <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>Change Password</h3>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            
            <div className="relative">
              <Input
                id="current-pwd"
                label="Current Password"
                type={showPwd ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
              />
              <button 
                type="button" 
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-[38px] text-[rgba(255,255,255,0.4)] hover:text-white"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                id="new-pwd"
                label="New Password"
                type={showPwd ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
              />
              <Input
                id="confirm-pwd"
                label="Confirm New Password"
                type={showPwd ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
              />
            </div>

            {pwdError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center justify-between">
                <span>{pwdError}</span>
                <button type="button" onClick={() => setPwdError(null)} className="hover:text-red-400"><X size={14} /></button>
              </div>
            )}
            {pwdSuccess && (
              <div className="p-3 bg-[#00E676]/10 border border-[#00E676]/20 rounded-xl text-[#00E676] text-sm flex items-center gap-2">
                <CheckCircle2 size={16} /> Your password was changed successfully.
              </div>
            )}

            <div className="flex justify-end mt-2">
              <Button 
                type="submit" 
                disabled={!currentPassword || !newPassword || !confirmPassword}
                isLoading={pwdLoading}
                style={{
                  background: "rgba(255,255,255,0.05)", color: "#fff", 
                  border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                  padding: "0.6rem 1.25rem", fontSize: "0.85rem", fontWeight: 600
                }}
                className="hover:bg-[rgba(255,255,255,0.1)]"
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </SectionCard>

      {/* NOTIFICATIONS & PRIVACY */}
      <SectionCard title="Preferences" icon={<Bell size={20} />}>
        
        <div className="mb-6">
          <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "1rem", marginBottom: "0.5rem" }}>Notifications</h3>
          <div className="flex flex-col">
            <ToggleItem 
              label="Request Updates" 
              desc="Receive notifications when your delivery requests change status." 
              checked={notifyRequests} onChange={setNotifyRequests} 
            />
            <ToggleItem 
              label="Delivery Updates" 
              desc="Receive notifications for your active runner assignments." 
              checked={notifyDeliveries} onChange={setNotifyDeliveries} 
            />
            <ToggleItem 
              label="Chat Messages" 
              desc="Receive notifications when someone sends you a message." 
              checked={notifyChats} onChange={setNotifyChats} 
            />
          </div>
        </div>

        <div className="mb-6">
          <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "1rem", marginBottom: "1rem" }}>Privacy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-white">Profile Visibility</label>
              <div className="relative">
                <select 
                  value={profileVis} 
                  onChange={(e) => setProfileVis(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-[rgba(255,255,255,0.02)] text-white border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-md)] text-sm outline-none focus:border-[#00E676] appearance-none"
                >
                  <option value="public" className="bg-[#050A07] text-white">Public (Visible to everyone)</option>
                  <option value="runners_only" className="bg-[#050A07] text-white">Runners Only</option>
                  <option value="private" className="bg-[#050A07] text-white">Private</option>
                </select>
                <div className="absolute right-3 top-3 text-[#A7B8B0] pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-white">Activity Visibility</label>
              <div className="relative">
                <select 
                  value={activityVis} 
                  onChange={(e) => setActivityVis(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-[rgba(255,255,255,0.02)] text-white border border-[rgba(255,255,255,0.1)] rounded-[var(--radius-md)] text-sm outline-none focus:border-[#00E676] appearance-none"
                >
                  <option value="public" className="bg-[#050A07] text-white">Public</option>
                  <option value="private" className="bg-[#050A07] text-white">Private (Only me)</option>
                </select>
                <div className="absolute right-3 top-3 text-[#A7B8B0] pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {settingsError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm mb-4">
            {settingsError}
          </div>
        )}
        {settingsSuccess && (
          <div className="p-3 bg-[#00E676]/10 border border-[#00E676]/20 rounded-xl text-[#00E676] text-sm mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} /> Notification and privacy preferences saved.
          </div>
        )}

        <div className="flex justify-end border-t border-[rgba(255,255,255,0.05)] pt-6 mt-2">
          <Button 
            type="button" 
            onClick={handleSaveSettings}
            isLoading={settingsLoading}
            style={{
              background: "#00E676", color: "#000", fontWeight: 800, fontSize: "0.9rem",
              borderRadius: "8px", padding: "0.8rem 1.5rem",
              boxShadow: "0 0 15px rgba(0,230,118,0.2)",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}
            className="hover:scale-105 transition-transform"
          >
            <Save size={16} /> Save Preferences
          </Button>
        </div>

      </SectionCard>

      {/* DANGER ZONE */}
      <SectionCard title="Danger Zone" icon={<Activity size={20} color="#EF4444" />}>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl gap-4">
            <div>
              <h4 style={{ color: "#fff", fontWeight: 600, fontSize: "0.95rem", margin: 0 }}>Sign Out</h4>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: 0, marginTop: "0.25rem" }}>
                Securely log out of your UniVerse account on this device.
              </p>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="ghost"
              style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#fff", flexShrink: 0 }}
              className="hover:bg-[rgba(255,255,255,0.1)]"
            >
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] rounded-xl gap-4">
            <div>
              <h4 style={{ color: "#EF4444", fontWeight: 600, fontSize: "0.95rem", margin: 0 }}>Delete Account</h4>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: 0, marginTop: "0.25rem" }}>
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button 
              onClick={() => setShowDeleteModal(true)}
              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", flexShrink: 0 }}
              className="hover:bg-[rgba(239,68,68,0.2)]"
            >
              <Trash2 size={16} className="mr-2" /> Delete Account
            </Button>
          </div>
        </div>

      </SectionCard>

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div style={{
            background: "#0A0F0C", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "450px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ color: "#EF4444", fontWeight: 800, fontSize: "1.3rem", margin: 0, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity size={20} /> Delete Account
            </h3>
            
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1.5rem" }}>
              You are about to permanently delete your UniVerse account. 
              All your requests, active deliveries, chat messages, and profile data will be permanently erased. 
              <strong> This action cannot be undone.</strong>
            </p>

            <div className="mb-6">
              <label className="text-sm font-semibold text-white mb-2 block">
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-3 bg-[rgba(255,255,255,0.02)] text-white border border-[rgba(239,68,68,0.3)] rounded-[var(--radius-md)] outline-none focus:border-[#EF4444] text-center font-bold tracking-widest"
              />
            </div>

            {deleteError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm mb-4">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); setDeleteError(null); }}
                disabled={deleteLoading}
                style={{ color: "#fff" }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                isLoading={deleteLoading}
                disabled={deleteConfirmation !== "DELETE"}
                style={{ background: "#EF4444", color: "#fff", fontWeight: 600 }}
              >
                Permanently Delete
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
