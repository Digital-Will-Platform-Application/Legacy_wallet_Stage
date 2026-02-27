import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail, Calendar, Lock, ArrowLeft, Phone, Camera, Loader2, ChevronRight } from "lucide-react";

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
}

const AdminAccount = () => {
  const { user, updatePassword, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const existingPhone = (user?.user_metadata?.phone as string) || null;

  useEffect(() => {
    if (!user?.id) return;
    void Promise.resolve(
      supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle()
    )
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
    const { data } = await supabase.from("profiles").select("id").eq("user_id", user.id).maybeSingle();
    if (data) return;
    await supabase.from("profiles").insert({
      user_id: user.id,
      full_name: (user?.user_metadata?.full_name ?? name) || null,
      avatar_url: profile?.avatar_url ?? null,
    });
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
      const path = `profiles/${user.id}/avatar-${Date.now()}.${file.name.split(".").pop() || "jpg"}`;
      const { error: upErr } = await supabase.storage
        .from("asset-documents")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from("asset-documents").createSignedUrl(path, 31536000);
      const url = signed?.signedUrl ?? null;
      if (!url) throw new Error("No URL");
      await ensureProfile();
      await supabase.from("profiles").update({ avatar_url: url, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      setProfile((p) => (p ? { ...p, avatar_url: url } : null));
      toast.success("Photo updated.");
    } catch {
      toast.error("Failed to update photo.");
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
      toast.error("Enter a mobile number.");
      return;
    }
    setSavingPhone(true);
    try {
      const phone = normalizePhone(trimmed);
      const { error } = await supabase.auth.updateUser({ data: { phone } });
      if (error) throw error;
      toast.success("Mobile number saved.");
      setPhoneInput("");
    } catch {
      toast.error("Failed to save mobile number.");
    } finally {
      setSavingPhone(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) throw error;
      toast.success("Password updated.");
      setNewPassword("");
    } catch {
      toast.error("Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="p-6 md:p-8 max-w-lg mx-auto bg-gradient-to-b from-background to-muted/20 min-h-full">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Profile</span>
      </nav>
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="font-serif text-2xl font-semibold text-foreground mb-6">Admin Profile</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Photo and display name.</CardDescription>
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
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" variant="gold" onClick={handleSaveName} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
              <CardDescription>Email and mobile number.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="mt-1 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  {user?.email}
                </p>
              </div>
              {existingPhone ? (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mobile number</label>
                  <p className="mt-1 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                    {existingPhone}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Add mobile number</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="tel"
                      placeholder="e.g. 9876543210 or +91 9876543210"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" variant="gold" onClick={handleSavePhone} disabled={savingPhone || !phoneInput.trim()}>
                      {savingPhone ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </div>
              )}
              {user?.created_at && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member since</label>
                  <p className="mt-1 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                    {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: "long" })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Change password
              </CardTitle>
              <CardDescription>Set a new password for your admin account.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <Input
                  type="password"
                  placeholder="New password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                />
                <Button type="submit" variant="gold" disabled={changingPassword || !newPassword.trim()}>
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AdminAccount;
