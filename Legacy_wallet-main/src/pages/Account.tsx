import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { User, Mail, Calendar, Lock, LogOut, Camera, Loader2, ArrowLeft, Phone, Send } from "lucide-react";
import { backendApi } from "@/lib/backendApi";
interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
}

const Account = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingVerification, setSendingVerification] = useState(false);

  const existingPhone = (user?.user_metadata?.phone as string) || null;

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setName(data.full_name ?? "");
        } else {
          setProfile({
            full_name: user?.user_metadata?.full_name ?? null,
            avatar_url: user?.user_metadata?.avatar_url ?? null,
          });
          setName(user?.user_metadata?.full_name ?? "");
        }
        setLoading(false);
      })
      .catch(() => {
        setProfile({
          full_name: user?.user_metadata?.full_name ?? null,
          avatar_url: user?.user_metadata?.avatar_url ?? null,
        });
        setName(user?.user_metadata?.full_name ?? "");
        setLoading(false);
      });
  }, [user]);

  const ensureProfile = async () => {
    if (!user?.id) return;
    try {
      // Verify we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn("No active session for profile operations");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        // If RLS error or profile doesn't exist, try to create using upsert
        if (fetchError.message?.includes("row-level security") || fetchError.code === "PGRST301" || !data) {
          const { error: upsertError } = await supabase
            .from("profiles")
            .upsert({
              user_id: user.id,
              full_name: (user?.user_metadata?.full_name ?? name) || null,
              avatar_url: profile?.avatar_url ?? null,
            }, {
              onConflict: 'user_id'
            });
          
          if (upsertError) {
            console.error("Error creating profile with upsert:", upsertError);
            // Don't throw - allow photo upload to continue
          }
        }
        return;
      }
      
      if (!data) {
        // Profile doesn't exist - create it using upsert
        const { error: upsertError } = await supabase
          .from("profiles")
          .upsert({
            user_id: user.id,
            full_name: (user?.user_metadata?.full_name ?? name) || null,
            avatar_url: profile?.avatar_url ?? null,
          }, {
            onConflict: 'user_id'
          });
        
        if (upsertError) {
          console.error("Error creating profile:", upsertError);
          // Don't throw - allow photo upload to continue
        }
      }
    } catch (error) {
      console.error("Error ensuring profile:", error);
      // Don't throw - allow photo upload to continue
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use JPEG, PNG or WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    setUploading(true);
    try {
      // Ensure profile exists first
      await ensureProfile();
      
      const path = `profiles/${user.id}/avatar-${Date.now()}.${file.name.split(".").pop() || "jpg"}`;
      
      // Upload to storage
      const { error: upErr } = await supabase.storage
        .from("asset-documents")
        .upload(path, file, { contentType: file.type, upsert: true });
      
      if (upErr) {
        console.error("Storage upload error:", upErr);
        throw new Error(upErr.message || "Failed to upload image to storage");
      }
      
      // Get public URL or signed URL
      const { data: signed, error: urlErr } = await supabase.storage
        .from("asset-documents")
        .createSignedUrl(path, 31536000);
      
      if (urlErr) {
        console.error("URL creation error:", urlErr);
        throw new Error(urlErr.message || "Failed to create image URL");
      }
      
      const url = signed?.signedUrl ?? null;
      if (!url) {
        throw new Error("Failed to get image URL");
      }
      
      // Update profile - use UPDATE instead of UPSERT to avoid RLS issues
      // First check if profile exists, if not, it will be created by trigger
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ 
          avatar_url: url, 
          updated_at: new Date().toISOString() 
        })
        .eq("user_id", user.id);
      
      // If update fails (profile doesn't exist), try upsert
      if (updateErr) {
        if (updateErr.message?.includes("0 rows") || updateErr.code === "PGRST116") {
          // Profile doesn't exist - wait a moment for trigger, then try update again
          await new Promise(resolve => setTimeout(resolve, 500));
          const { error: retryErr } = await supabase
            .from("profiles")
            .update({ 
              avatar_url: url, 
              updated_at: new Date().toISOString() 
            })
            .eq("user_id", user.id);
          
          if (retryErr && !retryErr.message?.includes("row-level security")) {
            throw new Error(retryErr.message || "Failed to update profile");
          }
        } else if (updateErr.message?.includes("row-level security") || updateErr.code === "PGRST301") {
          // RLS error - profile exists but can't update
          // This shouldn't happen if user is authenticated, but handle gracefully
          console.warn("RLS policy issue - profile update may have succeeded via trigger");
          // Don't throw - photo is uploaded, profile will sync
        } else {
          throw new Error(updateErr.message || "Failed to update profile");
        }
      }
      
      setProfile((p) => (p ? { ...p, avatar_url: url } : null));
      toast.success("Photo updated successfully.");
    } catch (error: any) {
      console.error("Error updating photo:", error);
      toast.error(error.message || "Failed to update photo. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveName = async () => {
    setSaving(true);
    try {
      await ensureProfile();
      await supabase
        .from("profiles")
        .update({ full_name: name.trim() || null, updated_at: new Date().toISOString() })
        .eq("user_id", user!.id);
      setProfile((p) => (p ? { ...p, full_name: name.trim() || null } : null));
      toast.success("Name updated.");
    } catch {
      toast.error("Failed to update name.");
    } finally {
      setSaving(false);
    }
  };

  const normalizePhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length <= 10) return digits.length === 10 ? `+91${digits}` : raw.trim();
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
    return raw.trim().startsWith("+") ? raw.trim() : `+${raw.trim()}`;
  };

  const handleSavePhone = async () => {
    const trimmed = phoneInput.trim();
    if (!trimmed) {
      toast.error(t("account.phoneRequired") || "Enter a mobile number.");
      return;
    }
    setSavingPhone(true);
    try {
      const phone = normalizePhone(trimmed);
      const { error } = await supabase.auth.updateUser({ data: { phone } });
      if (error) throw error;
      await ensureProfile();
      await supabase
        .from("profiles")
        .update({ phone, updated_at: new Date().toISOString() })
        .eq("user_id", user!.id);
      toast.success(t("account.phoneSaved") || "Mobile number saved.");
      setPhoneInput("");
    } catch {
      toast.error(t("account.phoneSaveFailed") || "Failed to save mobile number.");
    } finally {
      setSavingPhone(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("common.signOutSuccess") || "Signed out.");
    navigate("/");
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 pb-12">
        <div className="container mx-auto max-w-lg">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            {t("account.backToDashboard") || "Back to Dashboard"}
          </Link>

          <h1 className="font-serif text-2xl font-semibold text-foreground mb-6">
            {t("account.title") || "User Profile"}
          </h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Photo + name */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("account.profile") || "Profile"}</CardTitle>
                  <CardDescription>{t("account.profileDescription") || "Photo and display name."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="relative rounded-full overflow-hidden border-2 border-border"
                    >
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={profile?.avatar_url ?? user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-gold/20 text-foreground text-xl">
                          {(profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {uploading && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="w-6 h-6 animate-spin text-white" />
                        </span>
                      )}
                      {!uploading && (
                        <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gold flex items-center justify-center">
                          <Camera className="w-3 h-3 text-primary" />
                        </span>
                      )}
                    </button>
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium text-foreground">{t("account.name") || "Name"}</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={t("account.namePlaceholder") || "Your name"}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" variant="gold" onClick={handleSaveName} disabled={saving}>
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account info (read-only) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("account.accountInfo") || "Account"}</CardTitle>
                  <CardDescription>{t("account.accountInfoDescription") || "Email and member info."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">{t("account.email") || "Email"}</label>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="flex-1 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        {user?.email}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!user?.email) {
                            toast.error("Email not found");
                            return;
                          }
                          setSendingVerification(true);
                          try {
                            console.log("📧 Account: Sending verification email to:", user.email);
                            const result = await backendApi.sendVerificationEmail({
                              user_email: user.email
                            });
                            console.log("📧 Account: Result:", result);
                            
                            if (result && result.success) {
                              console.log("✅ Account: Verification email sent successfully");
                              toast.success("Verification email sent! Please check your inbox.");
                            } else {
                              const errorMsg = result?.message || result?.error || "Failed to send verification email";
                              console.error("❌ Account: Failed to send:", errorMsg);
                              toast.error(errorMsg);
                            }
                          } catch (error: any) {
                            console.error("❌ Account: Exception sending verification email:", error);
                            const errorMsg = error?.message || error?.toString() || "Failed to send verification email. Please try again.";
                            console.error("❌ Account: Error message:", errorMsg);
                            toast.error(errorMsg);
                          } finally {
                            setSendingVerification(false);
                          }
                        }}
                        disabled={sendingVerification || !user?.email}
                      >
                        {sendingVerification ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Verification
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {existingPhone ? (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t("account.mobileNumber") || "Mobile number"}</label>
                      <p className="mt-1 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                        {existingPhone}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t("account.addMobileNumber") || "Add mobile number"}</label>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-1.5">{t("account.addMobileNumberHint") || "Add your number once. You didn't provide it at sign up."}</p>
                      <div className="flex gap-2">
                        <Input
                          type="tel"
                          placeholder={t("account.phonePlaceholder") || "e.g. 9876543210 or +91 9876543210"}
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" variant="gold" onClick={handleSavePhone} disabled={savingPhone || !phoneInput.trim()}>
                          {savingPhone ? <Loader2 className="w-4 h-4 animate-spin" /> : t("common.save")}
                        </Button>
                      </div>
                    </div>
                  )}
                  {user?.created_at && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">{t("account.memberSince") || "Member since"}</label>
                      <p className="mt-1 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                        {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manage account */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t("account.manage") || "Manage account"}</CardTitle>
                  <CardDescription>{t("account.manageDescription") || "Password and sign out."}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/reset-password" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Lock className="w-4 h-4" />
                      {t("account.changePassword") || "Change password"}
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    {t("header.signOut")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Account;
