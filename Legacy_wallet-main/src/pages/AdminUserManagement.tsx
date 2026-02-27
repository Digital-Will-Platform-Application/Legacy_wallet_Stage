import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw, ChevronRight, Search } from "lucide-react";

const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500"];

function getInitials(fullName: string | null, email: string | null): string {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return fullName.slice(0, 2).toUpperCase();
  }
  if (email && email.length >= 2) return email.slice(0, 2).toUpperCase();
  return "??";
}

function getAvatarColor(userId: string): string {
  let n = 0;
  for (let i = 0; i < userId.length; i++) n += userId.charCodeAt(i);
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface LastLoginMap {
  [user_id: string]: string;
}

const AdminUserManagement = () => {
  const { user, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [lastLoginMap, setLastLoginMap] = useState<LastLoginMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const { data: profilesData, error: profilesErr } = await supabase.from("profiles").select("id, user_id, full_name, email, phone, created_at, updated_at").order("created_at", { ascending: false }).limit(5000);
      if (profilesErr) throw profilesErr;
      const { data: loginsData, error: loginsErr } = await supabase.from("login_activity").select("user_id, logged_at").order("logged_at", { ascending: false });
      if (loginsErr) throw loginsErr;
      const lastByUser: LastLoginMap = {};
      (loginsData ?? []).forEach((row: { user_id: string; logged_at: string }) => { if (!lastByUser[row.user_id]) lastByUser[row.user_id] = row.logged_at; });
      setProfiles(profilesData ?? []);
      setLastLoginMap(lastByUser);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
      toast.error("Could not load user management data.");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = profiles.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (row.user_id ?? "").toLowerCase().includes(q) || (row.full_name ?? "").toLowerCase().includes(q) || (row.email ?? "").toLowerCase().includes(q) || (row.phone ?? "").toLowerCase().includes(q);
  });

  const formatDate = (iso: string | undefined) => (iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "N/A");

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto bg-gradient-to-b from-background to-muted/20 min-h-full">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">User Management</span>
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="w-full">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary border-b-2 border-primary pb-1 inline-block mb-2">User Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and view all registered users</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2 shrink-0"><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button>
      </div>
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users by name, email, mobile..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-10" />
        </div>
      </div>
      <Card className="border-border/80 shadow-md overflow-hidden">
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : error ? <p className="text-sm text-destructive py-8 px-4 text-center">{error}</p> : filtered.length === 0 ? <p className="text-sm text-muted-foreground py-8 text-center">{searchQuery ? "No users match your search." : "No users yet."}</p> : (
            <div className="table-responsive overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-muted/50"><TableHead className="font-semibold whitespace-nowrap">ID</TableHead><TableHead className="font-semibold whitespace-nowrap">Name</TableHead><TableHead className="font-semibold whitespace-nowrap">Email</TableHead><TableHead className="font-semibold whitespace-nowrap">Mobile</TableHead><TableHead className="font-semibold whitespace-nowrap">Location</TableHead><TableHead className="font-semibold whitespace-nowrap">Last Login</TableHead><TableHead className="font-semibold whitespace-nowrap">Created At</TableHead><TableHead className="font-semibold whitespace-nowrap">Updated At</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filtered.map((row, i) => {
                    const initials = getInitials(row.full_name, row.email);
                    const avatarColor = getAvatarColor(row.user_id);
                    const rowNum = filtered.length - i;
                    return (
                      <TableRow key={row.id} className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <TableCell className="font-medium text-muted-foreground whitespace-nowrap">#{rowNum}</TableCell>
                        <TableCell className="whitespace-nowrap"><div className="flex items-center gap-2"><div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0 ${avatarColor}`}>{initials}</div><span className="font-medium">{row.full_name ?? "—"}</span></div></TableCell>
                        <TableCell className="whitespace-nowrap max-w-[200px] truncate" title={row.email ?? ""}>{row.email ?? "—"}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{row.phone ? row.phone : "—"}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">—</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{lastLoginMap[row.user_id] ? formatDate(lastLoginMap[row.user_id]) : "N/A"}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(row.created_at)}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(row.updated_at)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserManagement;
