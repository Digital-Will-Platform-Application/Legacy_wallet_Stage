import { useState, useEffect, useCallback, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
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
import {
  LayoutDashboard,
  Users,
  FileText,
  User,
  LogOut,
  Shield,
  Loader2,
  Filter,
  RefreshCw,
  BarChart3,
  Search,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type ReportFilter = "today" | "this_week" | "all_users";

interface LoginActivityRow {
  id: string;
  user_id: string;
  email: string | null;
  logged_at: string;
}

interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
}

const startOfTodayUTC = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

const startOfThisWeekUTC = () => {
  const d = new Date();
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

const fetchLoginActivityToday = async (): Promise<LoginActivityRow[]> => {
  const todayStart = startOfTodayUTC();
  const { data, error } = await supabase
    .from("login_activity")
    .select("id, user_id, email, logged_at")
    .gte("logged_at", todayStart)
    .order("logged_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

const fetchProfiles = async (filter: "this_week" | "all_users"): Promise<ProfileRow[]> => {
  const weekStart = startOfThisWeekUTC();
  let query = supabase
    .from("profiles")
    .select("id, user_id, full_name, email, phone, created_at")
    .order("created_at", { ascending: false })
    .limit(10000);
  if (filter === "this_week") {
    query = query.gte("created_at", weekStart);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

interface OverviewStats {
  totalUsers: number;
  loginsToday: number;
  signupsThisWeek: number;
}

const AdminDashboardContent = () => {
  const { user, isAdmin } = useAuth();
  const [reportFilter, setReportFilter] = useState<ReportFilter>("today");
  const [todayLogins, setTodayLogins] = useState<LoginActivityRow[]>([]);
  const [weekSignups, setWeekSignups] = useState<ProfileRow[]>([]);
  const [loadingReport, setLoadingReport] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOverview = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoadingOverview(true);
    try {
      const todayStart = startOfTodayUTC();
      const weekStart = startOfThisWeekUTC();
      const [totalRes, todayRes, weekRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("login_activity").select("id", { count: "exact", head: true }).gte("logged_at", todayStart),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
      ]);
      setOverviewStats({
        totalUsers: totalRes.count ?? 0,
        loginsToday: todayRes.count ?? 0,
        signupsThisWeek: weekRes.count ?? 0,
      });
    } catch {
      setOverviewStats(null);
    } finally {
      setLoadingOverview(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const loadData = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoadingReport(true);
    setFetchError(null);
    try {
      if (reportFilter === "today") {
        const data = await fetchLoginActivityToday();
        setTodayLogins(data);
      } else {
        const data = await fetchProfiles(reportFilter === "this_week" ? "this_week" : "all_users");
        setWeekSignups(data);
      }
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load data.");
      toast.error("Could not load report data.");
    } finally {
      setLoadingReport(false);
    }
  }, [user, isAdmin, reportFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredWeekSignups = weekSignups.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (row.full_name ?? "").toLowerCase().includes(q) || (row.email ?? "").toLowerCase().includes(q) || (row.phone ?? "").toLowerCase().includes(q);
  });
  const filteredTodayLogins = todayLogins.filter((row) =>
    (row.email ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const displayList = reportFilter === "today" ? filteredTodayLogins : filteredWeekSignups;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto bg-gradient-to-b from-background to-muted/20 min-h-full">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Dashboard</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview of users, logins, and signups.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchOverview(); loadData(); }} disabled={loadingReport || loadingOverview} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loadingReport || loadingOverview ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total registered users</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOverview ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="text-2xl font-semibold">{overviewStats?.totalUsers ?? "—"}</span>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Logins today</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOverview ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="text-2xl font-semibold">{overviewStats?.loginsToday ?? "—"}</span>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New accounts this week</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingOverview ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="text-2xl font-semibold">{overviewStats?.signupsThisWeek ?? "—"}</span>}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant={reportFilter === "today" ? "default" : "outline"} size="sm" onClick={() => setReportFilter("today")}>Logged in today</Button>
        <Button variant={reportFilter === "this_week" ? "default" : "outline"} size="sm" onClick={() => setReportFilter("this_week")}>Accounts this week</Button>
        <Button variant={reportFilter === "all_users" ? "default" : "outline"} size="sm" onClick={() => setReportFilter("all_users")}>All registered users</Button>
      </div>

      <div className="mb-4">
        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-xs" />
      </div>

      <Card className="border-border/80 shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            {reportFilter === "today" ? "Today's logins" : reportFilter === "this_week" ? "Accounts created this week" : "All registered users"}
          </CardTitle>
          <CardDescription>
            {reportFilter === "today" ? "List of users who logged in today." : reportFilter === "this_week" ? "New signups this week." : "Full list of all users."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loadingReport ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : fetchError ? (
            <p className="text-sm text-destructive py-8 px-4 text-center">{fetchError}</p>
          ) : reportFilter === "today" ? (
            displayList.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No logins recorded today yet.</p>
            ) : (
              <div className="table-responsive overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="bg-muted/40"><TableHead className="font-semibold">Email</TableHead><TableHead className="font-semibold">Logged at</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(displayList as LoginActivityRow[]).map((row) => (
                      <TableRow key={row.id}><TableCell className="font-medium">{row.email ?? "—"}</TableCell><TableCell className="text-muted-foreground">{new Date(row.logged_at).toLocaleString()}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : displayList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No users match.</p>
          ) : (
            <div className="table-responsive overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-muted/40"><TableHead className="font-semibold">Name</TableHead><TableHead className="font-semibold">Email</TableHead><TableHead className="font-semibold">Phone</TableHead><TableHead className="font-semibold">Created at</TableHead></TableRow></TableHeader>
                <TableBody>
                  {displayList.map((row) => (
                    <TableRow key={row.id}><TableCell className="font-medium">{row.full_name ?? "—"}</TableCell><TableCell>{row.email ?? "—"}</TableCell><TableCell>{row.phone ?? "—"}</TableCell><TableCell className="text-muted-foreground">{new Date(row.created_at).toLocaleString()}</TableCell></TableRow>
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

const SIDEBAR_WIDTH_COLLAPSED = 72;
const SIDEBAR_WIDTH_EXPANDED = 224;

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isAdmin, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) setLoading(false);
    else setLoading(false);
  }, [user, isAdmin]);
  useEffect(() => () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); }, []);

  const handleSidebarEnter = () => {
    if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; }
    setSidebarOpen(true);
  };
  const handleSidebarLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setSidebarOpen(false), 200);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out.");
    navigate("/");
  };

  if (loading) return (<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>);
  if (!user || !isAdmin) { navigate("/login", { replace: true }); return null; }

  const isProfilePage = location.pathname === "/admin/account";
  const isUsersPage = location.pathname === "/admin/users";
  const isAnalyticsPage = location.pathname === "/admin/analytics";
  const isSettingsPage = location.pathname === "/admin/settings";
  const isDashboardPage = location.pathname === "/admin" && !isUsersPage && !isAnalyticsPage && !isSettingsPage;
  const sidebarWidth = sidebarOpen ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  const iconLinkClass = (active: boolean) =>
    `flex items-center justify-center w-12 h-12 rounded-lg text-sm font-medium transition-all ${
      active ? "bg-amber-500/20 text-amber-300 border-l-2 border-amber-400" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
    }`;

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className="fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 border-r border-slate-700/50 shadow-xl overflow-hidden transition-[width] duration-200 ease-out"
        style={{ width: sidebarWidth }}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        {sidebarOpen ? (
          <div className="w-56 shrink-0 flex flex-col min-h-full">
            <div className="p-4 border-b border-slate-700/50 shrink-0">
              <Link to="/admin" className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center ring-2 ring-amber-400/30 shrink-0"><Shield className="w-5 h-5 text-amber-400" /></div>
                <div className="min-w-0 overflow-hidden"><span className="font-serif font-semibold text-white block truncate">{isSuperAdmin ? "Super Admin" : "Admin"}</span><span className="text-[10px] uppercase tracking-wider text-slate-400 block">{isSuperAdmin ? "Super Admin panel" : "Admin panel"}</span></div>
              </Link>
            </div>
            <nav className="p-2 flex-1">
              <Link to="/admin" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isDashboardPage ? "bg-amber-500/20 text-amber-300 border border-amber-400/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}><LayoutDashboard className="w-4 h-4 shrink-0" /><span className="truncate">Dashboard</span></Link>
              <Link to="/admin/users" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isUsersPage ? "bg-amber-500/20 text-amber-300 border border-amber-400/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}><Users className="w-4 h-4 shrink-0" /><span className="truncate">User Management</span></Link>
              <Link to="/admin/analytics" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isAnalyticsPage ? "bg-amber-500/20 text-amber-300 border border-amber-400/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}><BarChart3 className="w-4 h-4 shrink-0" /><span className="truncate">Analytics & Reports</span></Link>
              <Link to="/admin/account" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isProfilePage ? "bg-amber-500/20 text-amber-300 border border-amber-400/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}><User className="w-4 h-4 shrink-0" /><span className="truncate">Profile</span></Link>
              {isSuperAdmin && (
                <Link to="/admin/settings" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isSettingsPage ? "bg-amber-500/20 text-amber-300 border border-amber-400/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}><Settings className="w-4 h-4 shrink-0" /><span className="truncate">Admin Settings</span></Link>
              )}
            </nav>
            <div className="p-2 border-t border-slate-700/50 shrink-0">
              {user?.email && <p className="px-3 py-1.5 text-xs text-slate-400 truncate" title={user.email}>{user.email}</p>}
              <Button variant="ghost" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 min-w-0" onClick={handleSignOut}><LogOut className="w-4 h-4 shrink-0" /><span className="truncate">Sign out</span></Button>
            </div>
          </div>
        ) : (
          /* Collapsed: icon-only strip */
          <div className="flex flex-col items-center py-4 h-full w-full">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center ring-2 ring-amber-400/30 shrink-0 mb-4">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <nav className="flex-1 flex flex-col items-center gap-1">
              <Link to="/admin" title="Dashboard" className={iconLinkClass(isDashboardPage)}><LayoutDashboard className="w-5 h-5" /></Link>
              <Link to="/admin/users" title="User Management" className={iconLinkClass(isUsersPage)}><Users className="w-5 h-5" /></Link>
              <Link to="/admin/analytics" title="Analytics & Reports" className={iconLinkClass(isAnalyticsPage)}><BarChart3 className="w-5 h-5" /></Link>
              <Link to="/admin/account" title="Profile" className={iconLinkClass(isProfilePage)}><User className="w-5 h-5" /></Link>
              {isSuperAdmin && <Link to="/admin/settings" title="Admin Settings" className={iconLinkClass(isSettingsPage)}><Settings className="w-5 h-5" /></Link>}
            </nav>
            <button type="button" onClick={handleSignOut} title="Sign out" className="mt-auto flex items-center justify-center w-12 h-12 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-auto bg-muted/20 transition-[margin] duration-200 ease-out" style={{ marginLeft: sidebarWidth }}><Outlet /></main>
    </div>
  );
};

export default AdminLayout;
export { AdminDashboardContent };
