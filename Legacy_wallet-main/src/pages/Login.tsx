import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Loader2,
  Info,
  CheckCircle2,
  XCircle,
  Phone,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { MIN_LENGTHS } from "@/lib/validation";
import { validatePasswordSecurity } from "@/lib/passwordSecurity";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, signInWithOtpPhone, loading: authLoading, adminLoading, isAdmin } = useAuth();
  const { t } = useTranslation();
  const isSignupPage = location.pathname === "/signup";

  const [isLogin, setIsLogin] = useState(!isSignupPage);
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [loginMethod, setLoginMethod] = useState<"email" | "otp">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  // Step 2 signup fields
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [age, setAge] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [gender, setGender] = useState("");

  // Calculate password strength
  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= MIN_LENGTHS.PASSWORD) strength += 20;
    if (/[A-Z]/.test(pass)) strength += 20;
    if (/[a-z]/.test(pass)) strength += 20;
    if (/[0-9]/.test(pass)) strength += 20;
        // eslint-disable-next-line no-useless-escape -- [ and ] are literal in regex character class
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) strength += 20;
    return strength;
  };

  // Update password strength on password change
  useEffect(() => {
    if (!isLogin) {
      setPasswordStrength(calculatePasswordStrength(password));
    }
  }, [password, isLogin]);

  // Sync signup mode when navigating between /login and /signup
  useEffect(() => {
    setIsLogin(location.pathname !== "/signup");
    setSignupStep(1);
    setLoginMethod("email");
    setOtpSent(false);
  }, [location.pathname]);

  // Redirect if already logged in: wait for admin role check so admin credentials → admin panel, not user panel
  useEffect(() => {
    if (user && !authLoading && !adminLoading) {
      navigate(isAdmin ? "/admin" : "/dashboard");
    }
  }, [user, authLoading, adminLoading, isAdmin, navigate]);

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = mobile.startsWith("+") ? mobile : `+91${mobile.replace(/\D/g, "")}`;
    if (phone.length < 10) {
      toast.error(t("login.enterPhone") || "Enter a valid mobile number with country code");
      return;
    }
    setLoading(true);
    const { error } = await signInWithOtpPhone(phone);
    setLoading(false);
    if (error) {
      toast.error(error.message || t("login.unexpectedError"));
      return;
    }
    setOtpSent(true);
    toast.success(t("login.otpSentMessage"));
  };

  const handleNext = () => {
    if (!fullName?.trim()) {
      toast.error(t("login.enterFullName"));
      return;
    }
    if (!email?.trim()) {
      toast.error(t("login.fillAllFields"));
      return;
    }
    if (!password) {
      toast.error(t("login.fillAllFields"));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t("resetPassword.passwordsDoNotMatch") || "Passwords do not match");
      return;
    }
    if (passwordStrength < 100) {
      toast.error(t("login.passwordRequirements") || "Please meet all password requirements");
      return;
    }
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
    if (adminEmail && email.trim().toLowerCase() === adminEmail.trim().toLowerCase()) {
      toast.error("This email is reserved for administration. You cannot create an account with it.");
      return;
    }
    setSignupStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error(t("login.fillAllFields"));
      return;
    }

    if (isLogin) {
      // Login flow continues below
    } else {
      // Signup step 2 (Register)
      if (!fullName?.trim()) {
        toast.error(t("login.enterFullName"));
        return;
      }
      if (password !== confirmPassword) {
        toast.error(t("resetPassword.passwordsDoNotMatch") || "Passwords do not match");
        return;
      }
    }

    // Block signup for admin email – reserved for administration only
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
    if (!isLogin && adminEmail && email.trim().toLowerCase() === adminEmail.trim().toLowerCase()) {
      toast.error("This email is reserved for administration. You cannot create an account with it.");
      return;
    }

    setLoading(true);

    // Validate password requirements (only for signup)
    if (!isLogin) {
      // Check password security including leaked password check
      const passwordValidation = await validatePasswordSecurity(password, {
        checkLeaked: true,
        minLength: MIN_LENGTHS.PASSWORD,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true,
      });

      if (!passwordValidation.isValid) {
        setLoading(false);
        
        // Use specific messages for leaked passwords
        if (passwordValidation.isLeaked) {
          if (passwordValidation.leakCount && passwordValidation.leakCount > 1000) {
            toast.error(
              "Password Security Alert",
              {
                description: "This password has been compromised in data breaches. Please choose a unique password.",
                duration: 5000,
              }
            );
          } else {
            toast.error(
              "Password Security Alert", 
              {
                description: "This password has been found in a data breach. Please use a different password.",
                duration: 5000,
              }
            );
          }
        } else {
          // Show a friendly error for other validation issues
          const errorMessage = passwordValidation.errors[0];
          toast.error("Password Requirements Not Met", {
            description: errorMessage,
            duration: 4000,
          });
        }
        
        return;
      }
    }

    try {
      if (isLogin) {
        const { data, error } = await signIn(email, password);
        if (error) {
          // Normalize and show user-friendly messages for auth errors
          const msg = error.message || '';
          if (msg.includes('Invalid login credentials')) {
            toast.error(t("login.invalidCredentials"));
          } else if (msg.toLowerCase().includes('email not confirmed')) {
            toast.error('Please confirm your email using the link we sent you.');
          } else {
            toast.error(error.message);
          }
        } else {
          // Valid credentials – redirect by EMAIL only (password is never checked for admin vs user).
          // Same password on user and admin accounts is fine; Supabase validates each email+password pair.
          const sessionUser = data?.user;
          if (sessionUser?.id) {
            const { error: insertError } = await supabase.from("login_activity").insert({
              user_id: sessionUser.id,
              email: sessionUser.email ?? email,
              logged_at: new Date().toISOString(),
            });
            if (insertError) console.warn("Login activity record failed (admin panel may not show this login):", insertError.message);
          }
          toast.success(t("login.welcomeBackToast"));
          // Redirect: if user is in admin_emails (super admin or created admin) → /admin, else dashboard
          const loginEmail = (sessionUser?.email ?? email).trim().toLowerCase();
          const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase();
          let isAdminUser = envAdminEmail && loginEmail === envAdminEmail; // fallback: .env admin always → /admin
          if (!isAdminUser) {
            let adminList: { email?: string }[] | null = null;
            try {
              const res = await supabase.from("admin_emails").select("email");
              adminList = res.data;
            } catch {
              adminList = null;
            }
            isAdminUser = adminList?.some((r) => (r.email ?? "").trim().toLowerCase() === loginEmail) ?? false;
          }
          navigate(isAdminUser ? "/admin" : "/dashboard");
        }
      } else {
        const { error } = await signUp(email, password, fullName, mobile || undefined);
        
        // Always check for error first - if error exists, show error and return early
        if (error) {
          // Check for various error messages that indicate email already exists
          const errorMsg = (error.message || String(error) || '').toLowerCase();
          if (errorMsg.includes("already registered") || 
              errorMsg.includes("already exists") || 
              errorMsg.includes("user already registered") ||
              errorMsg.includes("email already") ||
              errorMsg.includes("duplicate") ||
              errorMsg.includes("unique constraint")) {
            toast.error(t("login.emailExists"));
            setLoading(false);
            return;
          } else {
            toast.error(error.message || String(error) || t("login.unexpectedError"));
            setLoading(false);
            return;
          }
        }
        
        // Only proceed if there's NO error
        // Verify user was actually created by checking current session
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          toast.error(t("login.unexpectedError"));
          setLoading(false);
          return;
        }
        
        // Save step 2 fields to user metadata (placeholder for backend)
        const metadata: Record<string, unknown> = {
          onboarding_completed: false,
          address1: address1 || undefined,
          address2: address2 || undefined,
          age: age || undefined,
          state: state || undefined,
          postal_code: postalCode || undefined,
          gender: gender || undefined,
        };
        await supabase.auth.updateUser({ data: metadata });
        toast.success(t("login.accountCreated"));
        const signupEmail = email.trim().toLowerCase();
        const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase();
        let isAdminUser = envAdminEmail && signupEmail === envAdminEmail;
        if (!isAdminUser) {
          let adminList: { email?: string }[] | null = null;
          try {
            const res = await supabase.from("admin_emails").select("email");
            adminList = res.data;
          } catch {
            adminList = null;
          }
          isAdminUser = adminList?.some((r) => (r.email ?? "").trim().toLowerCase() === signupEmail) ?? false;
        }
        // First-time users: go to asset selection (onboarding) before dashboard; admins go to admin
        navigate(isAdminUser ? "/admin" : "/onboarding");
      }
    } catch (err) {
      toast.error(t("login.unexpectedError"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && adminLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-gold">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">
              Digital Will
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="heading-section text-foreground mb-2">
              {isLogin ? t("login.welcomeBack") : signupStep === 1 ? t("login.createAccount") : t("login.step2Title")}
            </h1>
            <p className="text-muted-foreground text-base">
              {isLogin
                ? t("login.signInToManage")
                : signupStep === 1
                ? t("login.startSecuring")
                : t("login.step2Subtitle")}
            </p>
          </div>

          {/* Login method toggle - only for Sign In */}
            {isLogin && (
              <div className="flex gap-2 p-1 rounded-lg bg-secondary/50 mb-6">
                <button
                  type="button"
                  onClick={() => { setLoginMethod("email"); setOtpSent(false); }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("login.loginWithEmail")}
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod("otp"); setOtpSent(false); }}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === "otp" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("login.loginWithOtp")}
                </button>
              </div>
            )}

            {isLogin && loginMethod === "otp" ? (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t("login.mobileNumber")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 9876543210"
                      className="input-elevated pl-12 transition-all"
                      disabled={loading || otpSent}
                      autoComplete="tel"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t("login.enterPhone")}</p>
                </div>
                {otpSent ? (
                  <p className="text-sm text-muted-foreground bg-secondary/50 p-4 rounded-lg">
                    {t("login.otpSentMessage")}
                  </p>
                ) : (
                  <Button type="submit" variant="gold" className="w-full gap-2" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {t("login.sendOtp")}
                  </Button>
                )}
              </form>
            ) : !isLogin && signupStep === 2 ? (
          /* Signup Step 2: Address, Age, State, Postal code, Gender, Register */
          <form onSubmit={handleSubmit} className="space-y-5">
            <button
              type="button"
              onClick={() => setSignupStep(1)}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 -mt-2 mb-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back
            </button>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("login.address1")}</label>
              <input
                type="text"
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                placeholder="Street, building"
                className="input-elevated w-full"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("login.address2")}</label>
              <input
                type="text"
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                placeholder="Area, landmark (optional)"
                className="input-elevated w-full"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("login.age")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 3))}
                  placeholder="25"
                  className="input-elevated w-full"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">{t("login.gender")}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input-elevated w-full bg-background"
                  disabled={loading}
                >
                  <option value="">Select</option>
                  <option value="male">{t("login.genderMale")}</option>
                  <option value="female">{t("login.genderFemale")}</option>
                  <option value="other">{t("login.genderOther")}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("login.state")}</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State / Province"
                className="input-elevated w-full"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">{t("login.postalCode")}</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal code"
                className="input-elevated w-full"
                disabled={loading}
              />
            </div>
            <Button variant="gold" className="w-full gap-2 mt-6" size="lg" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  {t("login.register")}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
            ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && signupStep === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("login.username")}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Smith"
                      className="input-elevated pl-12 transition-all w-full"
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("login.emailId")}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@email.com"
                      className="input-elevated pl-12 transition-all w-full"
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("login.mobileOptional")}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 9876543210"
                      className="input-elevated pl-12 transition-all w-full"
                      disabled={loading}
                      autoComplete="tel"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">{t("login.password")}</label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPasswordHint(!showPasswordHint)}>
                            <Info className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-xs font-medium mb-2">Password Requirements:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• At least 8 characters</li>
                            <li>• One uppercase & lowercase letter</li>
                            <li>• One number & special character</li>
                            <li>• Not found in data breaches</li>
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="input-elevated pl-12 pr-12 w-full"
                      disabled={loading}
                      onFocus={() => setShowPasswordHint(true)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-300 ${passwordStrength <= 40 ? "bg-red-500" : passwordStrength <= 60 ? "bg-orange-500" : passwordStrength <= 80 ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${passwordStrength}%` }} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground min-w-[60px]">{passwordStrength <= 40 ? "Weak" : passwordStrength <= 60 ? "Fair" : passwordStrength <= 80 ? "Good" : "Strong"}</span>
                      </div>
                      {showPasswordHint && passwordStrength < 100 && (
                        <div className="mt-2 p-2 bg-secondary/30 rounded-md border border-border/50">
                          <p className="text-xs text-muted-foreground flex items-start gap-2">
                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{passwordStrength < 40 ? "Add uppercase, lowercase, numbers, and special characters." : passwordStrength < 60 ? "Good start! Add more variety." : passwordStrength < 80 ? "Almost there!" : "Great password!"}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("login.confirmPassword")}</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="input-elevated pl-12 w-full"
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button type="button" variant="gold" className="w-full gap-2 mt-6" size="lg" onClick={handleNext} disabled={loading || passwordStrength < 100 || password !== confirmPassword}>
                  {t("login.next")}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                {passwordStrength < 100 && password.length > 0 && (
                  <p className="text-xs text-center text-muted-foreground">Complete all password requirements to continue</p>
                )}
              </>
            )}

            {isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">{t("login.emailAddress")}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@email.com" className="input-elevated pl-12 transition-all w-full" disabled={loading} autoComplete="email" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">{t("login.password")}</label>
                    <Link to="/forgot-password" className="text-sm text-gold hover:underline font-medium">{t("login.forgotPassword")}</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input-elevated pl-12 pr-12 w-full" disabled={loading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded border-border cursor-pointer" />
                    <span className="text-muted-foreground select-none">{t("login.rememberMe")}</span>
                  </label>
                </div>
                <Button variant="gold" className="w-full gap-2 mt-6" size="lg" type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Signing in...</span></> : <>{t("login.signIn")}<ArrowRight className="w-5 h-5" /></>}
                </Button>
              </>
            )}
          </form>
            )}

          {/* Toggle */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const newIsLogin = !isLogin;
                setIsLogin(newIsLogin);
                setPassword("");
                setPasswordStrength(0);
                setShowPasswordHint(false);
                navigate(newIsLogin ? "/login" : "/signup");
              }}
              className="mt-4 text-sm font-semibold text-gold hover:text-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-primary p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-primary to-navy-light" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 text-center text-primary-foreground max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center mx-auto mb-8 shadow-gold">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-semibold mb-4">
            {t("login.secureYourLegacy")}
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            {t("login.joinThousands")}
          </p>
          <div className="mt-8 flex justify-center gap-2">
            {!isLogin
              ? [1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      signupStep === i ? "w-6 bg-gold" : "w-2 bg-gold/40"
                    }`}
                  />
                ))
              : [1, 2, 3].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gold/60" />
                ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
