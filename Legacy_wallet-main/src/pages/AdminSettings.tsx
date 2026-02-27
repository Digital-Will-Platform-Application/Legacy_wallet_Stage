import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ChevronRight, Users, UserPlus, Trash2, Lock, Mail, User } from "lucide-react";
import { MIN_LENGTHS } from "@/lib/validation";
import { validateName, validateEmail } from "@/lib/validation";
import { validatePasswordSecurity } from "@/lib/passwordSecurity";

interface AdminRow {
  email: string;
  role: string;
  created_at: string;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase();

  // Only Super Admin can access this page; admins are redirected to dashboard
  useEffect(() => {
    if (!user || !isAdmin) return;
    if (!isSuperAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, isSuperAdmin, navigate]);

  const loadAdmins = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("admin_emails")
        .select("email, role, created_at")
        .order("created_at", { ascending: true });
      if (err) throw err;
      setAdmins(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admins.");
      toast.error("Could not load admin list.");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    const name = newAdminName.trim();
    const email = newAdminEmail.trim().toLowerCase();
    const password = newAdminPassword;

    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      toast.error(nameCheck.error ?? "Invalid name");
      return;
    }
    const emailCheck = validateEmail(email, true);
    if (!emailCheck.isValid) {
      toast.error(emailCheck.error ?? "Invalid email");
      return;
    }
    if (envAdminEmail && email === envAdminEmail) {
      toast.error("This email is the Super Admin. Use Admin Settings only to create additional admins.");
      return;
    }

    const passwordValidation = await validatePasswordSecurity(password, {
      checkLeaked: true,
      minLength: MIN_LENGTHS.PASSWORD,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
    });
    if (!passwordValidation.isValid) {
      const msg = passwordValidation.errors?.[0] ?? "Password does not meet requirements.";
      toast.error(msg);
      return;
    }

    setAdding(true);
    try {
      // Create the user in Supabase Auth so they can log in with this email/password
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      // If user already exists, we still add them to admin_emails so they become admin
      const alreadyRegistered = signUpError?.message?.toLowerCase().includes("already registered");
      if (signUpError && !alreadyRegistered) {
        throw signUpError;
      }

      const { error: insertErr } = await supabase.from("admin_emails").insert({ email, role: "admin" });
      if (insertErr) {
        if (insertErr.message?.includes("duplicate") || insertErr.message?.includes("unique")) {
          toast.error("This email is already an admin.");
        } else {
          throw insertErr;
        }
        setAdding(false);
        return;
      }

      toast.success(
        "Admin created. They can log in with this email and password; they will be redirected to the Admin Panel (not the user page)."
      );
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      await loadAdmins();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("duplicate") || msg.includes("unique")) {
        toast.error("This email is already an admin.");
      } else {
        toast.error(msg || "Could not create admin.");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (!isSuperAdmin) return;
    const row = admins.find((r) => r.email === email);
    if (row?.role === "super_admin") {
      toast.error("You cannot remove the Super Admin.");
      return;
    }
    setRemoving(email);
    try {
      const { error: err } = await supabase.from("admin_emails").delete().eq("email", email);
      if (err) throw err;
      toast.success("Admin removed.");
      await loadAdmins();
    } catch (e) {
      toast.error("Could not remove admin.");
    } finally {
      setRemoving(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1000px] mx-auto bg-gradient-to-b from-background to-muted/20 min-h-full">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/admin" className="hover:text-foreground transition-colors">Super Admin</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Admin Settings</span>
      </nav>
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary border-b-2 border-primary pb-1 inline-block mb-2">
          Admin Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Create admins here. New admins will sign in and be redirected to the Admin Panel (same layout without Admin Settings).
        </p>
      </div>

      <Card className="mb-6 border-primary/20 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Create admin
          </CardTitle>
          <CardDescription>
            Enter name, email, and password. A new account is created and added as Admin. When they log in with these credentials they are redirected to the Admin Panel (same as Super Admin except Admin Settings is hidden).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Jane Doe"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="pl-9 max-w-sm"
                  disabled={adding}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="pl-9 max-w-sm"
                  disabled={adding}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Min 8 chars, upper, lower, number, special"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="pl-9 max-w-sm"
                  disabled={adding}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Same rules as user signup (strong password, not leaked).</p>
            </div>
            <Button type="submit" disabled={adding || !newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save — Create admin
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Admins ({admins.length})
          </CardTitle>
          <CardDescription>
            Super Admin and created admins. Only Super Admin can add or remove.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive py-8 px-4 text-center">{error}</p>
          ) : admins.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No admins in list.</p>
          ) : (
            <div className="table-responsive overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Added</TableHead>
                    <TableHead className="font-semibold w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((row) => (
                    <TableRow key={row.email} className="bg-background">
                      <TableCell className="font-medium">{row.email}</TableCell>
                      <TableCell>
                        <span className={row.role === "super_admin" ? "text-amber-600 dark:text-amber-400 font-medium" : "text-muted-foreground"}>
                          {row.role === "super_admin" ? "Super Admin" : "Admin"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(row.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {row.role === "super_admin" ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveAdmin(row.email)}
                            disabled={removing === row.email}
                          >
                            {removing === row.email ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            Remove
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
