import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  LogOut,
  Loader2,
  User,
  FileText,
  Users,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SIDEBAR_WIDTH_COLLAPSED = 72;
const SIDEBAR_WIDTH_EXPANDED = 224;

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }, []);

  const handleSidebarEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSidebarOpen(true);
  };
  const handleSidebarLeave = () => {
    closeTimeoutRef.current = setTimeout(() => setSidebarOpen(false), 200);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  const isDashboard = location.pathname === "/dashboard";
  const isWillManagement = location.pathname === "/wills";
  const isRecipientManagement = location.pathname === "/recipients";
  const isProfile = location.pathname === "/account";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) {
    navigate("/login", { replace: true });
    return null;
  }

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
            {/* Top: user name */}
            <div className="p-4 border-b border-slate-700/50 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center ring-2 ring-amber-400/30 shrink-0">
                  <User className="w-5 h-5 text-amber-400" />
                </div>
                <div className="min-w-0 overflow-hidden">
                  <span className="font-serif font-semibold text-white block truncate">{displayName}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 block">My account</span>
                </div>
              </div>
            </div>
            <nav className="p-2 flex-1">
              <Link to="/dashboard" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isDashboard ? "bg-amber-500/20 text-amber-300 border border-amber-400/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}>
                <LayoutDashboard className="w-4 h-4 shrink-0" /><span className="truncate">Dashboard</span>
              </Link>
              <Link to="/wills" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isWillManagement ? "bg-amber-500/20 text-amber-300 border border-amber-400/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}>
                <FileText className="w-4 h-4 shrink-0" /><span className="truncate">Will Management</span>
              </Link>
              <Link to="/recipients" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isRecipientManagement ? "bg-amber-500/20 text-amber-300 border border-amber-400/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}>
                <Users className="w-4 h-4 shrink-0" /><span className="truncate">Recipient Management</span>
              </Link>
              <Link to="/account" className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all min-w-0 ${isProfile ? "bg-amber-500/20 text-amber-300 border border-amber-400/20" : "text-slate-300 hover:text-white hover:bg-slate-700/50"}`}>
                <UserCircle className="w-4 h-4 shrink-0" /><span className="truncate">Profile</span>
              </Link>
            </nav>
            <div className="p-2 border-t border-slate-700/50 shrink-0">
              {user?.email && <p className="px-3 py-1.5 text-xs text-slate-400 truncate" title={user.email}>{user.email}</p>}
              <Button variant="ghost" className="w-full justify-start gap-2 text-slate-300 hover:text-white hover:bg-slate-700/50 min-w-0" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 shrink-0" /><span className="truncate">Sign out</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Collapsed: icon-only strip */
          <div className="flex flex-col items-center py-4 h-full w-full">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center ring-2 ring-amber-400/30 shrink-0 mb-4">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <nav className="flex-1 flex flex-col items-center gap-1">
              <Link to="/dashboard" title="Dashboard" className={iconLinkClass(isDashboard)}><LayoutDashboard className="w-5 h-5" /></Link>
              <Link to="/wills" title="Will Management" className={iconLinkClass(isWillManagement)}><FileText className="w-5 h-5" /></Link>
              <Link to="/recipients" title="Recipient Management" className={iconLinkClass(isRecipientManagement)}><Users className="w-5 h-5" /></Link>
              <Link to="/account" title="Profile" className={iconLinkClass(isProfile)}><UserCircle className="w-5 h-5" /></Link>
            </nav>
            <button type="button" onClick={handleSignOut} title="Sign out" className={`mt-auto flex items-center justify-center w-12 h-12 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all`}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </aside>
      <main
        className="flex-1 min-w-0 overflow-auto bg-muted/20 transition-[margin] duration-200 ease-out max-mobile:min-w-0"
        style={{ marginLeft: sidebarWidth }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
