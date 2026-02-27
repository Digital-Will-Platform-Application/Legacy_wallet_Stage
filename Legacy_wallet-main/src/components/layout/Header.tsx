import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, LogOut, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileIconError, setProfileIconError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading, isAdmin, isSuperAdmin } = useAuth();
  const { t } = useTranslation();

  const navLinks = [
    { href: "/", label: t("header.home") },
    { href: "/about", label: t("header.about") },
    { href: "/learn-more", label: t("header.faq") },
    { href: "/contact", label: t("header.contactUs") },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    toast.success(t("common.signOutSuccess") || "Signed out successfully");
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-gold">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">
              Digital Will
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {!loading && user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Shield className="w-4 h-4" />
                      {isSuperAdmin ? "Super Admin" : "Admin"}
                    </Button>
                  </Link>
                )}
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    {t("header.dashboard")}
                  </Button>
                </Link>
                <Link to="/account" title={t("header.profile")} aria-label={t("header.profile")}>
                  <Button variant="outline" size="icon" className="rounded-full h-9 w-9 shrink-0 p-0 overflow-hidden">
                    {profileIconError ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <img src="/profile-icon.png" alt="" className="w-5 h-5 object-contain brightness-0 dark:invert" onError={() => setProfileIconError(true)} />
                    )}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  {t("header.signOut")}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="gold" size="sm">
                    {t("header.login")}
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="gold" size="sm">
                    {t("header.signUp")}
                  </Button>
                </Link>
              </>
            )}
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium py-2 ${
                    isActive(link.href)
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="py-2">
                <LanguageSwitcher showText={true} />
              </div>
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {!loading && user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full gap-2">
                          <Shield className="w-4 h-4" />
                          {isSuperAdmin ? "Super Admin" : "Admin"}
                        </Button>
                      </Link>
                    )}
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        {t("header.dashboard")}
                      </Button>
                    </Link>
                    <Link to="/account" onClick={() => setMobileMenuOpen(false)} title={t("header.profile")} aria-label={t("header.profile")}>
                      <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shrink-0 p-0 overflow-hidden">
                        {profileIconError ? (
                          <User className="w-5 h-5" />
                        ) : (
                          <img src="/profile-icon.png" alt="" className="w-6 h-6 object-contain brightness-0 dark:invert" onError={() => setProfileIconError(true)} />
                        )}
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full gap-2" 
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      {t("header.signOut")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="gold" className="w-full">
                        {t("header.login")}
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="gold" className="w-full">
                        {t("header.signUp")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
