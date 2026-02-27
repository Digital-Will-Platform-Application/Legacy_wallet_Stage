import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BarChart3, Loader2, RefreshCw, ChevronRight, TrendingUp, TrendingDown, LogIn, UserPlus, Calendar } from "lucide-react";

function startOfTodayUTC(): string { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d.toISOString(); }
function startOfThisWeekUTC(): string { const d = new Date(); const day = d.getUTCDay(); const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); d.setUTCDate(diff); d.setUTCHours(0, 0, 0, 0); return d.toISOString(); }
function startOfThisMonthUTC(): string { const d = new Date(); d.setUTCDate(1); d.setUTCHours(0, 0, 0, 0); return d.toISOString(); }
function startOfLastWeekUTC(): string { const d = new Date(); const day = d.getUTCDay(); const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); d.setUTCDate(diff - 7); d.setUTCHours(0, 0, 0, 0); return d.toISOString(); }
function startOfLastMonthUTC(): string { const d = new Date(); d.setUTCMonth(d.getUTCMonth() - 1); d.setUTCDate(1); d.setUTCHours(0, 0, 0, 0); return d.toISOString(); }

interface PeriodStats { logins: number; signups: number; }
interface AnalyticsData {
  last1Day: PeriodStats; last1Week: PeriodStats; last1Month: PeriodStats;
  thisWeek: PeriodStats; lastWeek: PeriodStats; thisMonth: PeriodStats; lastMonth: PeriodStats;
}

const AdminAnalyticsReports = () => {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user || !isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const todayStart = startOfTodayUTC();
      const thisWeekStart = startOfThisWeekUTC();
      const thisMonthStart = startOfThisMonthUTC();
      const lastWeekStart = startOfLastWeekUTC();
      const lastMonthStart = startOfLastMonthUTC();
      const [loginsTodayRes, loginsThisWeekRes, loginsThisMonthRes, loginsLastWeekRes, loginsLastMonthRes, signupsTodayRes, signupsThisWeekRes, signupsThisMonthRes, signupsLastWeekRes, signupsLastMonthRes] = await Promise.all([
        supabase.from("login_activity").select("id", { count: "exact", head: true }).gte("logged_at", todayStart),
        supabase.from("login_activity").select("id", { count: "exact", head: true }).gte("logged_at", thisWeekStart),
        supabase.from("login_activity").select("id", { count: "exact", head: true }).gte("logged_at", thisMonthStart),
        supabase.from("login_activity").select("id", { count: "exact", head: true }).gte("logged_at", lastWeekStart).lt("logged_at", thisWeekStart),
        supabase.from("login_activity").select("id", { count: "exact", head: true }).gte("logged_at", lastMonthStart).lt("logged_at", thisMonthStart),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", thisWeekStart),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", thisMonthStart),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", lastWeekStart).lt("created_at", thisWeekStart),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", lastMonthStart).lt("created_at", thisMonthStart),
      ]);
      setData({
        last1Day: { logins: loginsTodayRes.count ?? 0, signups: signupsTodayRes.count ?? 0 },
        last1Week: { logins: loginsThisWeekRes.count ?? 0, signups: signupsThisWeekRes.count ?? 0 },
        last1Month: { logins: loginsThisMonthRes.count ?? 0, signups: signupsThisMonthRes.count ?? 0 },
        thisWeek: { logins: loginsThisWeekRes.count ?? 0, signups: signupsThisWeekRes.count ?? 0 },
        lastWeek: { logins: loginsLastWeekRes.count ?? 0, signups: signupsLastWeekRes.count ?? 0 },
        thisMonth: { logins: loginsThisMonthRes.count ?? 0, signups: signupsThisMonthRes.count ?? 0 },
        lastMonth: { logins: loginsLastMonthRes.count ?? 0, signups: signupsLastMonthRes.count ?? 0 },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load analytics.");
      toast.error("Could not load analytics and reports.");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  const formatChange = (current: number, previous: number): { text: string; up: boolean } => {
    if (previous === 0) return { text: current > 0 ? "+100%" : "—", up: current > 0 };
    const pct = Math.round(((current - previous) / previous) * 100);
    return { text: pct >= 0 ? `+${pct}%` : `${pct}%`, up: pct >= 0 };
  };

  if (loading) return (<div className="p-6 md:p-8 flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>);
  if (error) return (<div className="p-6 md:p-8 max-w-[1400px] mx-auto"><p className="text-destructive mb-4">{error}</p><Button onClick={loadData} className="gap-2"><RefreshCw className="w-4 h-4" /> Retry</Button></div>);

  const d = data!;
  const weekVsWeekLogins = formatChange(d.thisWeek.logins, d.lastWeek.logins);
  const weekVsWeekSignups = formatChange(d.thisWeek.signups, d.lastWeek.signups);
  const monthVsMonthLogins = formatChange(d.thisMonth.logins, d.lastMonth.logins);
  const monthVsMonthSignups = formatChange(d.thisMonth.signups, d.lastMonth.signups);

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto bg-gradient-to-b from-background to-muted/20 min-h-full">
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4"><Link to="/admin" className="hover:text-foreground transition-colors">Admin</Link><ChevronRight className="w-4 h-4" /><span className="text-foreground font-medium">Analytics & Reports</span></nav>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div><h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary border-b-2 border-primary pb-1 inline-block mb-2">Analytics & Reports</h1><p className="text-muted-foreground text-sm mt-1">Logins and signups by period with comparison</p></div>
        <Button variant="outline" size="sm" onClick={loadData} className="gap-2"><RefreshCw className="w-4 h-4" /> Refresh</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-primary/20 shadow-md"><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />1 Day</CardTitle><CardDescription>Today (UTC)</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><LogIn className="w-4 h-4" /> Logins</span><span className="font-semibold text-lg">{d.last1Day.logins}</span></div><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><UserPlus className="w-4 h-4" /> New signups</span><span className="font-semibold text-lg">{d.last1Day.signups}</span></div></CardContent></Card>
        <Card className="border-primary/20 shadow-md"><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />1 Week</CardTitle><CardDescription>This week (UTC)</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><LogIn className="w-4 h-4" /> Logins</span><span className="font-semibold text-lg">{d.last1Week.logins}</span></div><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><UserPlus className="w-4 h-4" /> New signups</span><span className="font-semibold text-lg">{d.last1Week.signups}</span></div></CardContent></Card>
        <Card className="border-primary/20 shadow-md"><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />1 Month</CardTitle><CardDescription>This month (UTC)</CardDescription></CardHeader><CardContent className="space-y-3"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><LogIn className="w-4 h-4" /> Logins</span><span className="font-semibold text-lg">{d.last1Month.logins}</span></div><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground flex items-center gap-1"><UserPlus className="w-4 h-4" /> New signups</span><span className="font-semibold text-lg">{d.last1Month.signups}</span></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-border shadow-md"><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" />This week vs last week</CardTitle></CardHeader><CardContent><div className="space-y-4"><div className="flex items-center justify-between"><span className="text-sm">Logins</span><span className={weekVsWeekLogins.up ? "text-emerald-600" : "text-red-600"}>{weekVsWeekLogins.up ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />} {weekVsWeekLogins.text}</span></div><div className="flex items-center justify-between"><span className="text-sm">New signups</span><span className={weekVsWeekSignups.up ? "text-emerald-600" : "text-red-600"}>{weekVsWeekSignups.up ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />} {weekVsWeekSignups.text}</span></div></div></CardContent></Card>
        <Card className="border-border shadow-md"><CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4" />This month vs last month</CardTitle></CardHeader><CardContent><div className="space-y-4"><div className="flex items-center justify-between"><span className="text-sm">Logins</span><span className={monthVsMonthLogins.up ? "text-emerald-600" : "text-red-600"}>{monthVsMonthLogins.up ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />} {monthVsMonthLogins.text}</span></div><div className="flex items-center justify-between"><span className="text-sm">New signups</span><span className={monthVsMonthSignups.up ? "text-emerald-600" : "text-red-600"}>{monthVsMonthSignups.up ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />} {monthVsMonthSignups.text}</span></div></div></CardContent></Card>
      </div>
      <Card className="border-border/80 shadow-md overflow-hidden"><CardHeader className="bg-muted/30 border-b border-border/50"><CardTitle className="flex items-center gap-2"><BarChart3 className="w-4 h-4" />Report summary</CardTitle></CardHeader><CardContent className="p-0"><div className="table-responsive overflow-x-auto"><Table><TableHeader><TableRow className="bg-muted/40"><TableHead className="font-semibold">Period</TableHead><TableHead className="font-semibold text-right">Logins</TableHead><TableHead className="font-semibold text-right">New signups</TableHead><TableHead className="font-semibold text-right">Comparison</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell className="font-medium">1 Day</TableCell><TableCell className="text-right">{d.last1Day.logins}</TableCell><TableCell className="text-right">{d.last1Day.signups}</TableCell><TableCell className="text-right text-muted-foreground">—</TableCell></TableRow><TableRow className="bg-muted/20"><TableCell className="font-medium">1 Week</TableCell><TableCell className="text-right">{d.last1Week.logins}</TableCell><TableCell className="text-right">{d.last1Week.signups}</TableCell><TableCell className="text-right"><span className={weekVsWeekLogins.up ? "text-emerald-600" : "text-red-600"}>{weekVsWeekLogins.text} vs last week</span></TableCell></TableRow><TableRow><TableCell className="font-medium">1 Month</TableCell><TableCell className="text-right">{d.last1Month.logins}</TableCell><TableCell className="text-right">{d.last1Month.signups}</TableCell><TableCell className="text-right"><span className={monthVsMonthSignups.up ? "text-emerald-600" : "text-red-600"}>{monthVsMonthSignups.text} vs last month</span></TableCell></TableRow></TableBody></Table></div></CardContent></Card>
    </div>
  );
};

export default AdminAnalyticsReports;
