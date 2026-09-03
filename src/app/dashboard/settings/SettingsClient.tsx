"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Lock, LogOut, Trash2, Bell, Shield, Activity, User, Eye, EyeOff, 
  Save, CheckCircle2, X, ChevronDown, Laptop, HelpCircle, 
  ExternalLink, ShoppingBag, Volume2, Mail, ShieldCheck, Sparkles 
} from "lucide-react";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];

const SectionCard = ({ 
  title, 
  icon, 
  subtitle,
  children 
}: { 
  title: string; 
  icon: React.ReactNode; 
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-[#0A0F0C]/80 rounded-2xl p-5 sm:p-7 border border-emerald-500/15 backdrop-blur-xl shadow-xl mb-6 relative overflow-hidden group">
    {/* Subtle top-right accent glow */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full blur-2xl pointer-events-none" />
    
    <div className="flex items-start justify-between gap-4 mb-6 border-b border-white/[0.06] pb-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#00E676] shrink-0 shadow-[0_0_10px_rgba(0,230,118,0.15)]">
          {icon}
        </div>
        <div>
          <h2 className="text-white font-bold text-base sm:text-lg m-0 tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-white/50 text-xs m-0 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
    {children}
  </div>
);

const ToggleItem = ({ 
  label, 
  desc, 
  checked, 
  onChange,
  icon 
}: { 
  label: string; 
  desc: string; 
  checked: boolean; 
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between py-3.5 border-b border-white/[0.04] last:border-0 group">
    <div className="flex items-start gap-3 pr-4">
      {icon && <div className="mt-0.5 text-emerald-400 shrink-0">{icon}</div>}
      <div>
        <p className="text-white font-semibold text-sm m-0 group-hover:text-white/90 transition-colors">
          {label}
        </p>
        <p className="text-white/50 text-xs m-0 mt-0.5 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-12 h-6.5 rounded-full transition-colors duration-200 ease-in-out cursor-pointer p-0.5 border ${
        checked
          ? "bg-[#00E676] border-[#00E676] shadow-[0_0_12px_rgba(0,230,118,0.35)]"
          : "bg-white/10 border-white/15 hover:bg-white/15"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5.5" : "translate-x-0"
        }`}
      />
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

  // Client-side local preferences
  const [notifyMarketplace, setNotifyMarketplace] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("universe_pref_marketplace");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const [soundAlerts, setSoundAlerts] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("universe_pref_sounds");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Password Strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) || /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-400" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-400" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-emerald-400", text: "text-emerald-400" };
    return { score: 4, label: "Strong", color: "bg-[#00E676]", text: "text-[#00E676]" };
  };

  const pwdStrength = getPasswordStrength(newPassword);

  // University identification
  const isMarwadi = email.toLowerCase().includes("marwadiuniversity.ac.in") || email.toLowerCase().includes("marwadi");
  const universityName = isMarwadi ? "Marwadi University" : "Campus Verified";

  // --- HANDLERS ---

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsSuccess(false);

    try {
      // Save local preferences
      if (typeof window !== "undefined") {
        localStorage.setItem("universe_pref_marketplace", String(notifyMarketplace));
        localStorage.setItem("universe_pref_sounds", String(soundAlerts));
      }

      const { error } = await supabase
        .from("user_settings")
        .upsert(
          {
            user_id: userId,
            notify_request_updates: notifyRequests,
            notify_delivery_updates: notifyDeliveries,
            notify_chat_messages: notifyChats,
            profile_visibility: profileVis,
            activity_visibility: activityVis,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      setSettingsSuccess(true);
      router.refresh();
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: unknown) {
      console.error("Settings update error:", err);
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
      setTimeout(() => setPwdSuccess(false), 3500);
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
      const { error } = await supabase.rpc('delete_own_account');
      if (error) throw error;

      await supabase.auth.signOut();
      router.push("/login");
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Unable to delete account. Please try again later.");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-white">

      {/* 1. STUDENT IDENTITY & PROFILE BANNER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0c1410] to-[#0A0F0C] border border-emerald-500/20 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E676] via-teal-500 to-emerald-700 flex items-center justify-center text-black font-black text-2xl shrink-0 shadow-[0_0_20px_rgba(0,230,118,0.35)] overflow-hidden">
            {initialProfile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={initialProfile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <span>
                {initialProfile.full_name?.slice(0, 2).toUpperCase() || email.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-lg sm:text-xl font-extrabold text-white m-0 tracking-tight">
                {initialProfile.full_name || "UniVerse Student"}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                <CheckCircle2 size={12} className="text-[#00E676]" />
                {initialProfile.account_status === "active" ? "Active Student" : "Active"}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white/70 border border-white/10 capitalize">
                {initialProfile.role || "Student"}
              </span>
            </div>
            <p className="text-xs text-white/60 m-0 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-emerald-400 font-medium">🎓 {universityName}</span>
              {initialProfile.enrollment_number && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="font-mono text-white/80">{initialProfile.enrollment_number}</span>
                </>
              )}
              {initialProfile.department && (
                <>
                  <span className="text-white/30">•</span>
                  <span className="text-white/70">{initialProfile.department}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/profile"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-bold transition-all hover:scale-102 self-start sm:self-auto shrink-0 shadow-sm relative z-10 cursor-pointer"
        >
          <User size={14} className="text-emerald-400" />
          <span>Edit Profile</span>
          <ExternalLink size={12} className="text-white/40" />
        </Link>
      </div>

      {/* 2. ACCOUNT & SECURITY */}
      <SectionCard 
        title="Account & Security" 
        icon={<Shield size={20} />} 
        subtitle="Manage your credentials, login email, and security sessions"
      >
        {/* Read-Only Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-6">
          <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl hover:bg-white/[0.04] transition-colors">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Mail size={13} className="text-emerald-400" /> University Email
            </p>
            <p className="text-white font-semibold text-sm m-0 truncate" title={email}>{email}</p>
          </div>

          <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/[0.04] transition-colors">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" /> Account Status
              </p>
              <p className="text-white font-semibold text-sm m-0 capitalize flex items-center gap-2">
                <span>{initialProfile.account_status || "Active"}</span>
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-[#00E676]" />
            </div>
          </div>
        </div>

        {/* Active Session & Device Security Card */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Laptop size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold text-sm m-0">Current Browser Session</h4>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                  Active Now
                </span>
              </div>
              <p className="text-white/50 text-xs m-0 mt-0.5">
                Web Client · Authenticated via Supabase TLS 1.3
              </p>
            </div>
          </div>
          <div className="text-[11px] text-white/50 font-mono bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5 shrink-0 self-start sm:self-auto flex items-center gap-1.5">
            <span>🔒 End-to-End Encrypted</span>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="pt-2 border-t border-white/[0.06]">
          <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <Lock size={16} className="text-emerald-400" />
            <span>Change Password</span>
          </h3>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            {/* Current Password */}
            <div className="relative">
              <Input
                id="current-pwd"
                label="Current Password"
                type={showCurrentPwd ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
              />
              <button 
                type="button" 
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                className="absolute right-3 top-[38px] text-white/40 hover:text-white transition-colors cursor-pointer"
                title={showCurrentPwd ? "Hide password" : "Show password"}
              >
                {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* New Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  id="new-pwd"
                  label="New Password"
                  type={showNewPwd ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-[38px] text-white/40 hover:text-white transition-colors cursor-pointer"
                  title={showNewPwd ? "Hide password" : "Show password"}
                >
                  {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/50">Password Strength:</span>
                      <span className={`font-bold ${pwdStrength.text}`}>{pwdStrength.label}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 h-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full rounded-full transition-all duration-300 ${
                            pwdStrength.score >= step ? pwdStrength.color : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  id="confirm-pwd"
                  label="Confirm New Password"
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock size={16} />}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  className="absolute right-3 top-[38px] text-white/40 hover:text-white transition-colors cursor-pointer"
                  title={showConfirmPwd ? "Hide password" : "Show password"}
                >
                  {showConfirmPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {pwdError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm flex items-center justify-between shadow-sm">
                <span>{pwdError}</span>
                <button type="button" onClick={() => setPwdError(null)} className="hover:text-red-300 cursor-pointer">
                  <X size={15} />
                </button>
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3.5 bg-[#00E676]/10 border border-[#00E676]/20 rounded-xl text-[#00E676] text-xs sm:text-sm flex items-center gap-2 shadow-sm">
                <CheckCircle2 size={16} /> 
                <span>Your password has been changed successfully.</span>
              </div>
            )}

            <div className="flex justify-end mt-2">
              <Button 
                type="submit" 
                disabled={!currentPassword || !newPassword || !confirmPassword || pwdLoading}
                isLoading={pwdLoading}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,230,118,0.25)] hover:shadow-[0_0_20px_rgba(0,230,118,0.4)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Password
              </Button>
            </div>
          </form>
        </div>
      </SectionCard>

      {/* 3. PREFERENCES (NOTIFICATIONS & PRIVACY) */}
      <SectionCard 
        title="Preferences" 
        icon={<Bell size={20} />} 
        subtitle="Manage alerts, marketplace notifications, and profile privacy"
      >
        {/* Notifications */}
        <div className="mb-6">
          <h3 className="text-white font-bold text-sm sm:text-base mb-3 flex items-center gap-2">
            <span>Campus Notifications</span>
          </h3>
          <div className="flex flex-col">
            <ToggleItem 
              label="Request Updates" 
              desc="Receive notifications when your delivery requests change status." 
              checked={notifyRequests} 
              onChange={setNotifyRequests} 
            />
            <ToggleItem 
              label="Delivery Updates" 
              desc="Receive notifications for your active runner assignments." 
              checked={notifyDeliveries} 
              onChange={setNotifyDeliveries} 
            />
            <ToggleItem 
              label="Chat Messages" 
              desc="Receive notifications when someone sends you a message." 
              checked={notifyChats} 
              onChange={setNotifyChats} 
            />
            <ToggleItem 
              label="Marketplace & Resale Alerts" 
              desc="Notify when an offer, inquiry, or purchase is made on your campus listings." 
              checked={notifyMarketplace} 
              onChange={setNotifyMarketplace} 
              icon={<ShoppingBag size={16} />}
            />
            <ToggleItem 
              label="Audio Chimes" 
              desc="Play gentle sound alerts on new deliveries or incoming chats." 
              checked={soundAlerts} 
              onChange={setSoundAlerts} 
              icon={<Volume2 size={16} />}
            />
          </div>
        </div>

        {/* Privacy Controls */}
        <div className="mb-6 pt-4 border-t border-white/[0.06]">
          <h3 className="text-white font-bold text-sm sm:text-base mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" />
            <span>Privacy Controls</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/80">Profile Visibility</label>
              <div className="relative">
                <select 
                  value={profileVis} 
                  onChange={(e) => setProfileVis(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-white/[0.03] text-white border border-white/10 rounded-xl text-sm outline-none focus:border-[#00E676] appearance-none hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <option value="public" className="bg-[#050A07] text-white">Public (Visible to everyone)</option>
                  <option value="runners_only" className="bg-[#050A07] text-white">Runners Only</option>
                  <option value="private" className="bg-[#050A07] text-white">Private</option>
                </select>
                <div className="absolute right-3 top-3 text-white/40 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white/80">Activity Visibility</label>
              <div className="relative">
                <select 
                  value={activityVis} 
                  onChange={(e) => setActivityVis(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-white/[0.03] text-white border border-white/10 rounded-xl text-sm outline-none focus:border-[#00E676] appearance-none hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  <option value="public" className="bg-[#050A07] text-white">Public</option>
                  <option value="private" className="bg-[#050A07] text-white">Private (Only me)</option>
                </select>
                <div className="absolute right-3 top-3 text-white/40 pointer-events-none">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {settingsError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm mb-4">
            {settingsError}
          </div>
        )}

        {settingsSuccess && (
          <div className="p-3.5 bg-[#00E676]/10 border border-[#00E676]/20 rounded-xl text-[#00E676] text-xs sm:text-sm mb-4 flex items-center gap-2 shadow-sm">
            <CheckCircle2 size={16} /> 
            <span>Notification and privacy preferences saved successfully.</span>
          </div>
        )}

        <div className="flex justify-end border-t border-white/[0.06] pt-5 mt-2">
          <Button 
            type="button" 
            onClick={handleSaveSettings}
            isLoading={settingsLoading}
            className="bg-[#00E676] hover:bg-[#00E676]/90 text-black font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(0,230,118,0.3)] hover:scale-102 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save size={16} /> 
            <span>Save Preferences</span>
          </Button>
        </div>
      </SectionCard>

      {/* 4. DANGER ZONE */}
      <SectionCard 
        title="Danger Zone" 
        icon={<Activity size={20} className="text-red-400" />}
        subtitle="Manage active session logout or permanent account termination"
      >
        <div className="flex flex-col gap-3.5">
          {/* Sign Out Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/[0.02] border border-white/10 rounded-xl gap-4 hover:bg-white/[0.04] transition-colors">
            <div>
              <h4 className="text-white font-semibold text-sm m-0">Sign Out</h4>
              <p className="text-white/50 text-xs m-0 mt-0.5">
                Securely log out of your UniVerse account on this device.
              </p>
            </div>
            <Button 
              onClick={handleSignOut}
              variant="ghost"
              className="border border-white/20 text-white hover:bg-white/10 rounded-xl px-4 py-2 text-xs font-bold shrink-0 cursor-pointer"
            >
              <LogOut size={15} className="mr-2" /> Sign Out
            </Button>
          </div>

          {/* Delete Account Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-red-500/[0.05] border border-red-500/20 rounded-xl gap-4">
            <div>
              <h4 className="text-red-400 font-bold text-sm m-0">Delete Account</h4>
              <p className="text-white/50 text-xs m-0 mt-0.5">
                Permanently delete your account and all associated campus data. This cannot be undone.
              </p>
            </div>
            <Button 
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-4 py-2 text-xs font-bold shrink-0 cursor-pointer"
            >
              <Trash2 size={15} className="mr-2" /> Delete Account
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* 5. APP INFO & CAMPUS SUPPORT FOOTER */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/40 pt-4 pb-8 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white/70">UniVerse Campus</span>
          <span>v2.4 (Cosmic Edition)</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <a 
            href="mailto:support@universe-campus.app" 
            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
          >
            <HelpCircle size={13} /> Campus Support
          </a>
        </div>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0c1410] border border-red-500/30 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative space-y-4">
            <h3 className="text-red-400 font-extrabold text-lg m-0 flex items-center gap-2">
              <Activity size={20} /> 
              <span>Delete Account Permanently</span>
            </h3>
            
            <p className="text-white/70 text-xs sm:text-sm leading-relaxed m-0">
              You are about to permanently delete your UniVerse account. 
              All your active requests, campus deliveries, marketplace listings, chat history, and ratings will be permanently erased. 
              <strong className="text-white block mt-1"> This action cannot be undone.</strong>
            </p>

            <div className="py-2">
              <label className="text-xs font-semibold text-white mb-2 block">
                Type <strong className="text-red-400">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 bg-white/[0.03] text-white border border-red-500/30 rounded-xl outline-none focus:border-red-500 text-center font-bold tracking-widest text-sm"
              />
            </div>

            {deleteError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2 border-t border-white/10">
              <Button
                variant="ghost"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmation(""); setDeleteError(null); }}
                disabled={deleteLoading}
                className="text-white hover:bg-white/10 text-xs px-4 py-2 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                isLoading={deleteLoading}
                disabled={deleteConfirmation !== "DELETE"}
                className="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-xl disabled:opacity-50 cursor-pointer"
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

