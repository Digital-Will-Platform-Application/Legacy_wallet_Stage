import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Mic,
  Video,
  MessageSquare,
  FolderOpen,
  Users,
  Shield,
  ChevronRight,
  Clock,
  Loader2,
  BarChart3,
  PieChart,
  TrendingUp,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Link as LinkIcon,
  CheckCircle2,
  ArrowRight,
  Trash2,
  Edit3,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Will {
  id: string;
  title: string;
  status: string;
  type: string;
  updated_at: string;
  content: string | null;
  transcript: string | null;
  audio_url: string | null;
  video_url: string | null;
  notes: string | null;
}

interface Asset {
  id: string;
  name: string;
  category: string;
  estimated_value: number | null;
  currency: string | null;
}

interface WillStatusStats {
  draft: number;
  in_progress: number;
  review: number;
  completed: number;
}

interface Recipient {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  relationship: string | null;
  is_verified: boolean;
  created_at: string;
  image_url: string | null;
}

const MOBILE_BREAKPOINT = 385;

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const [wills, setWills] = useState<Will[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [assetAllocations, setAssetAllocations] = useState<Array<{
    id: string;
    asset_id: string;
    recipient_id: string;
    allocation_percentage: number;
  }>>([]);
  const [assetCount, setAssetCount] = useState(0);
  const [recipientCount, setRecipientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isManagingWills, setIsManagingWills] = useState(false);
  const [selectedWills, setSelectedWills] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // First-time users must complete asset selection (onboarding) before seeing dashboard
  useEffect(() => {
    if (user?.user_metadata?.onboarding_completed === false) {
      navigate("/onboarding", { replace: true });
    }
  }, [user?.user_metadata?.onboarding_completed, navigate]);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const pieOuterRadius = windowWidth <= MOBILE_BREAKPOINT ? 50 : 70;

  const fetchData = async () => {
    try {
      const [willsRes, assetsRes, recipientsRes, allocationsRes] = await Promise.all([
        supabase.from("wills").select("id, title, status, type, updated_at, content, transcript, audio_url, video_url, notes").order("updated_at", { ascending: false }),
        supabase.from("assets").select("id, name, category, estimated_value, currency"),
        supabase.from("recipients").select("id, full_name, email, phone, relationship, is_verified, created_at").order("created_at", { ascending: false }),
        supabase.from("asset_allocations").select("id, asset_id, recipient_id, allocation_percentage"),
      ]);

      if (willsRes.data) setWills(willsRes.data);
      if (assetsRes.data) {
        setAssets(assetsRes.data);
        setAssetCount(assetsRes.data.length);
      }
      if (recipientsRes.data) {
        setRecipients(recipientsRes.data.map((r): Recipient => ({ ...r, image_url: null })));
        setRecipientCount(recipientsRes.data.length);
      }
      if (allocationsRes.data) {
        setAssetAllocations(allocationsRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleManageMode = () => {
    setIsManagingWills(!isManagingWills);
    setSelectedWills(new Set());
  };

  const toggleWillSelection = (willId: string) => {
    const newSelected = new Set(selectedWills);
    if (newSelected.has(willId)) {
      newSelected.delete(willId);
    } else {
      newSelected.add(willId);
    }
    setSelectedWills(newSelected);
  };

  const selectAllWills = () => {
    if (selectedWills.size === wills.length) {
      setSelectedWills(new Set());
    } else {
      setSelectedWills(new Set(wills.map((w) => w.id)));
    }
  };

  const handleDeleteWills = async () => {
    if (selectedWills.size === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedWills.size} will${selectedWills.size > 1 ? "s" : ""}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const willIds = Array.from(selectedWills);
      
      // Delete wills from database
      const { error } = await supabase
        .from("wills")
        .delete()
        .in("id", willIds);

      if (error) throw error;

      // Update local state
      setWills(wills.filter((w) => !selectedWills.has(w.id)));
      setSelectedWills(new Set());
      setIsManagingWills(false);

      // Show success message
      const deletedCount = willIds.length;
      if (deletedCount === 1) {
        const deletedWill = wills.find((w) => w.id === willIds[0]);
        toast.success(`"${deletedWill?.title}" has been deleted successfully.`);
      } else {
        toast.success(`${deletedCount} wills have been deleted successfully.`);
      }
    } catch (error: any) {
      console.error("Error deleting wills:", error);
      toast.error(`Failed to delete wills: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate will completion statistics
  const willStatusStats: WillStatusStats = wills.reduce(
    (acc, will) => {
      const status = will.status as keyof WillStatusStats;
      if (status in acc) {
        acc[status]++;
      }
      return acc;
    },
    { draft: 0, in_progress: 0, review: 0, completed: 0 }
  );

  const totalWills = wills.length;
  const completedWills = willStatusStats.completed;
  const completionPercentage = totalWills > 0 ? Math.round((completedWills / totalWills) * 100) : 0;

  // Prepare will status data for chart
  const willStatusData = [
    { name: "Draft", value: willStatusStats.draft, fill: "#94a3b8" },
    { name: "In Progress", value: willStatusStats.in_progress, fill: "#fbbf24" },
    { name: "Under Review", value: willStatusStats.review, fill: "#3b82f6" },
    { name: "Completed", value: willStatusStats.completed, fill: "#10b981" },
  ].filter(item => item.value > 0);

  // Calculate asset distribution by category
  const assetCategoryData = assets.reduce((acc, asset) => {
    const category = asset.category || "other";
    const existing = acc.find(item => item.name === category);
    if (existing) {
      existing.count++;
      existing.value += asset.estimated_value || 0;
    } else {
      acc.push({
        name: category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
        count: 1,
        value: asset.estimated_value || 0,
        fill: getCategoryColor(category),
      });
    }
    return acc;
  }, [] as Array<{ name: string; count: number; value: number; fill: string }>);

  // Calculate asset value distribution by recipients
  const recipientValueData = recipients.map(recipient => {
    const totalValue = assetAllocations
      .filter(allocation => allocation.recipient_id === recipient.id)
      .reduce((sum, allocation) => {
        const asset = assets.find(a => a.id === allocation.asset_id);
        if (asset && asset.estimated_value) {
          const allocatedValue = (asset.estimated_value * allocation.allocation_percentage) / 100;
          return sum + allocatedValue;
        }
        return sum;
      }, 0);

    return {
      name: recipient.full_name,
      value: totalValue,
      fill: getRecipientColor(recipient.id),
    };
  })
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      property: "#8b5cf6",
      investment: "#06b6d4",
      bank_account: "#10b981",
      vehicle: "#f59e0b",
      jewelry: "#ec4899",
      digital_asset: "#6366f1",
      insurance: "#14b8a6",
      business: "#f97316",
      other: "#64748b",
    };
    return colors[category] || "#64748b";
  }

  function getRecipientColor(recipientId: string): string {
    // Modern, professional color palette
    const colors = [
      "#fbbf24", // gold
      "#1e3a8a", // navy
      "#065f46", // sage-dark
      "#8b5cf6", // purple
      "#06b6d4", // cyan
      "#ec4899", // pink
      "#f59e0b", // amber
      "#10b981", // green
    ];
    // Use a simple hash to consistently assign colors
    let hash = 0;
    for (let i = 0; i < recipientId.length; i++) {
      hash = recipientId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Display currency: convert stored (USD) to INR for display
  const USD_TO_INR = 83;
  const formatINR = (value: number) => {
    const inr = value * USD_TO_INR;
    return `₹${inr.toLocaleString("en-IN", { maximumFractionDigits: 0, minimumFractionDigits: 0 })}`;
  };

  const chartConfig = {
    count: {
      label: "Count",
    },
    value: {
      label: "Value",
    },
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return t("dashboard.draft");
      case "in_progress": return t("dashboard.inProgress");
      case "review": return t("dashboard.underReview");
      case "completed": return t("dashboard.completed");
      default: return status;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diff = now.getTime() - updated.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return days === 1 
        ? t("dashboard.dayAgo", { count: days })
        : t("dashboard.daysAgo", { count: days });
    }
    if (hours > 0) {
      return hours === 1
        ? t("dashboard.hourAgo", { count: hours })
        : t("dashboard.hoursAgo", { count: hours });
    }
    return t("dashboard.justNow");
  };

  const getWillIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "chat":
        return MessageSquare;
      case "audio":
        return Mic;
      default:
        return FileText;
    }
  };

  const getWillTypeLabel = (type: string) => {
    switch (type) {
      case "video":
        return t("dashboard.videoWill") || "Video Will";
      case "chat":
        return t("dashboard.chatWill") || "Chat Will";
      case "audio":
        return t("dashboard.audioWill") || "Audio Will";
      case "text":
        return t("dashboard.textWill") || "Text Will";
      default:
        return t("dashboard.will");
    }
  };

  const getWillPreview = (will: Will) => {
    if (will.transcript) {
      return will.transcript.length > 100 
        ? will.transcript.substring(0, 100) + "..." 
        : will.transcript;
    }
    if (will.content) {
      return will.content.length > 100 
        ? will.content.substring(0, 100) + "..." 
        : will.content;
    }
    if (will.audio_url) {
      return t("dashboard.audioRecordingAvailable") || "Audio recording available";
    }
    if (will.video_url) {
      return t("dashboard.videoRecordingAvailable") || "Video recording available";
    }
    return t("dashboard.noContentYet") || "No content yet";
  };

  const hasWillContent = (will: Will) => {
    return !!(will.content || will.transcript || will.audio_url || will.video_url);
  };

  const quickActions = [
    { icon: Mic, label: t("dashboard.recordAudio"), href: "/create/audio", color: "from-gold to-gold-light" },
    { icon: Video, label: t("dashboard.recordVideo"), href: "/create/video", color: "from-navy to-navy-light" },
    { icon: MessageSquare, label: t("dashboard.chatWill"), href: "/create/chat", color: "from-sage-dark to-sage" },
    { icon: FolderOpen, label: t("dashboard.manageAssets"), href: "/assets", color: "from-gold to-gold-light" },
  ];

  const stats = [
    { label: t("dashboard.totalAssets"), value: assetCount.toString(), icon: FolderOpen },
    { label: t("dashboard.recipients"), value: recipientCount.toString(), icon: Users },
    { label: t("dashboard.activeWills"), value: wills.length.toString(), icon: FileText },
    { label: t("dashboard.secure"), value: t("common.yes"), icon: Shield },
  ];

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || t("common.there") || "there";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="p-6 pb-12 max-mobile:p-3 max-mobile:pb-8">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 max-mobile:mb-4"
          >
            <h1 className="heading-section text-foreground mb-2 max-mobile:text-lg">{t("dashboard.welcomeBack", { name: userName })}</h1>
            <p className="text-muted-foreground text-sm max-mobile:text-xs">{t("dashboard.manageLegacy")}</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-mobile:gap-2 max-mobile:mb-6 mb-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="card-elevated text-center max-mobile:py-3 max-mobile:px-2">
                <stat.icon className="w-6 h-6 text-gold mx-auto mb-2 max-mobile:w-5 max-mobile:h-5" />
                <p className="font-serif text-2xl font-semibold text-foreground max-mobile:text-lg">{stat.value}</p>
                <p className="text-sm text-muted-foreground max-mobile:text-xs">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Analytics Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 max-mobile:mb-6"
          >
            <div className="dashboard-analytics-header flex items-center gap-2 mb-4 max-mobile:mb-3">
              <BarChart3 className="w-5 h-5 text-gold shrink-0 max-mobile:w-4 max-mobile:h-4" />
              <h2 className="font-serif text-xl font-semibold text-foreground max-mobile:text-base">{t("dashboard.analytics")}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-mobile:gap-4 mb-8">
              {/* Will Completion Progress */}
              <Card className="card-elevated dashboard-analytics-card max-mobile:overflow-hidden">
                <CardHeader className="max-mobile:px-4 max-mobile:py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 max-mobile:flex-col">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2 text-base max-mobile:text-sm">
                        <TrendingUp className="w-5 h-5 text-gold shrink-0 max-mobile:w-4 max-mobile:h-4" />
                        <span className="truncate">{t("dashboard.willCompletionProgress")}</span>
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm max-mobile:text-xs">
                        {t("dashboard.ofWillsCompleted", { completed: completedWills, total: totalWills })}
                      </CardDescription>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-3xl font-bold text-foreground max-mobile:text-2xl">{completionPercentage}%</div>
                      <div className="text-sm text-muted-foreground max-mobile:text-xs">{t("dashboard.completionRate")}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="max-mobile:px-4 max-mobile:pt-0 max-mobile:pb-4">
                  <div className="space-y-4 max-mobile:space-y-3">
                    <Progress 
                      value={completionPercentage} 
                      className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-gold [&>div]:to-gold-light" 
                    />
                    <div className="space-y-3">
                      {willStatusData.length > 0 ? (
                        <ChartContainer config={chartConfig} className="chart-container-mobile h-[200px] max-mobile:h-[160px] w-full max-w-full min-w-0 overflow-hidden !aspect-auto">
                          <RechartsPieChart>
                            <Pie
                              data={willStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={pieOuterRadius}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {willStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </RechartsPieChart>
                        </ChartContainer>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No will data available</p>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 max-mobile:gap-1.5 max-mobile:pt-1.5">
                      {willStatusData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm max-mobile:text-xs">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="text-muted-foreground">{item.name}:</span>
                          <span className="font-semibold text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Asset Distribution by Category */}
              <Card className="card-elevated dashboard-analytics-card max-mobile:overflow-hidden">
                <CardHeader className="max-mobile:px-4 max-mobile:py-3">
                  <CardTitle className="flex items-center gap-2 text-base max-mobile:text-sm">
                    <PieChart className="w-5 h-5 text-gold shrink-0 max-mobile:w-4 max-mobile:h-4" />
                    <span className="truncate">{t("dashboard.assetDistributionByCategory")}</span>
                  </CardTitle>
                  <CardDescription className="text-sm max-mobile:text-xs">
                    {t("dashboard.totalAssetsAcross", { count: assetCount, categories: assetCategoryData.length })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-mobile:px-4 max-mobile:pt-0 max-mobile:pb-4">
                  {assetCategoryData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="chart-container-mobile h-[200px] max-mobile:h-[160px] w-full max-w-full min-w-0 overflow-hidden !aspect-auto">
                      <RechartsPieChart>
                        <Pie
                          data={assetCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={pieOuterRadius}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {assetCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ChartContainer>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No assets available</p>
                    </div>
                  )}
                  <div className="mt-4 space-y-2">
                    {assetCategoryData.slice(0, 4).map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.fill }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-foreground">{item.count}</span>
                          {item.value > 0 && (
                            <span className="text-muted-foreground text-xs">
                              {formatINR(item.value)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Asset Value Distribution by Recipients */}
            {recipientValueData.length > 0 && (
              <Card className="card-elevated border-2 border-border/50 mt-8">
                <CardHeader className="pb-4 pt-6 px-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="space-y-2">
                      <CardTitle className="flex items-center gap-3 text-xl flex-wrap">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <span>{t("dashboard.assetValueByRecipients")}</span>
                      </CardTitle>
                      <CardDescription className="text-base">
                        {t("dashboard.totalValueAllocated", {
                          value: formatINR(recipientValueData.reduce((sum, item) => sum + item.value, 0)),
                        })}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 px-6 pb-6">
                  <ChartContainer config={chartConfig} className="h-[320px] w-full">
                    <BarChart 
                      data={recipientValueData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <defs>
                        {recipientValueData.map((entry, index) => {
                          const recipient = recipients.find(r => r.full_name === entry.name);
                          const baseColor = recipient ? getRecipientColor(recipient.id) : entry.fill;
                          return (
                            <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={baseColor} stopOpacity={1} />
                              <stop offset="100%" stopColor={baseColor} stopOpacity={0.75} />
                            </linearGradient>
                          );
                        })}
                      </defs>
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        tick={{ 
                          fontSize: 13,
                          fill: "hsl(var(--muted-foreground))",
                          fontWeight: 500
                        }}
                        interval={0}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        tick={{ 
                          fontSize: 12,
                          fill: "hsl(var(--muted-foreground))",
                          fontWeight: 500
                        }}
                        tickFormatter={(value) => {
                          const inr = value * USD_TO_INR;
                          if (inr >= 10000000) {
                            return `₹${(inr / 10000000).toFixed(1)}Cr`;
                          } else if (inr >= 100000) {
                            return `₹${(inr / 100000).toFixed(1)}L`;
                          } else if (inr >= 1000) {
                            return `₹${(inr / 1000).toFixed(0)}k`;
                          }
                          return `₹${inr}`;
                        }}
                      />
                      <ChartTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const recipient = recipients.find(r => r.full_name === data.payload.name);
                            const color = recipient ? getRecipientColor(recipient.id) : data.payload.fill;
                            return (
                              <div className="rounded-lg border border-border bg-background/95 backdrop-blur-sm p-4 shadow-xl">
                                <div className="flex items-center gap-2.5 mb-2">
                                  <div
                                    className="w-3.5 h-3.5 rounded-full shadow-sm"
                                    style={{ backgroundColor: color }}
                                  />
                                  <span className="font-semibold text-foreground text-sm">{data.payload.name}</span>
                                </div>
                                <div className="text-xl font-bold text-foreground">
                                  {formatINR(Number(data.value))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[12, 12, 0, 0]}
                        barSize={65}
                      >
                        {recipientValueData.map((entry, index) => {
                          const recipient = recipients.find(r => r.full_name === entry.name);
                          const color = recipient ? getRecipientColor(recipient.id) : entry.fill;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`url(#gradient-${index})`}
                            />
                          );
                        })}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                  <div className="mt-6 pt-5 border-t border-border/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {recipientValueData.map((item) => {
                        const recipient = recipients.find(r => r.full_name === item.name);
                        const color = recipient ? getRecipientColor(recipient.id) : item.fill;
                        return (
                          <div 
                            key={item.name} 
                            className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/40 hover:bg-secondary/60 transition-all duration-200 border border-border/30 hover:border-border/50 hover:shadow-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: color }}
                              />
                              <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-foreground ml-3 whitespace-nowrap">
                              {formatINR(item.value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="font-serif text-xl font-semibold text-foreground mb-4">{t("dashboard.quickActions")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.href}>
                  <div className="card-interactive flex flex-col items-center py-6 group">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recipients Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold text-foreground">{t("dashboard.recipients")}</h2>
              <Link to="/recipients">
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="w-4 h-4" />
                  {t("common.manage")}
                </Button>
              </Link>
            </div>

            {recipients.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipients.map((recipient) => (
                  <div key={recipient.id} className="card-elevated">
                    <div className="flex items-start gap-3 mb-3">
                      {recipient.image_url ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-border">
                          <img 
                            src={recipient.image_url} 
                            alt={recipient.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initial if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              if (target.parentElement) {
                                target.parentElement.innerHTML = `<div class="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center flex-shrink-0"><span class="text-primary font-semibold text-sm">${recipient.full_name.charAt(0).toUpperCase()}</span></div>`;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold text-sm">
                            {recipient.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground">{recipient.full_name}</h3>
                        {recipient.relationship && (
                          <p className="text-sm text-muted-foreground capitalize">
                            {recipient.relationship}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-border">
                      {recipient.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground truncate">{recipient.email}</span>
                        </div>
                      )}
                      {recipient.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{recipient.phone}</span>
                        </div>
                      )}
                      {!recipient.email && !recipient.phone && (
                        <p className="text-sm text-muted-foreground">{t("dashboard.noContactInformation")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-elevated text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{t("dashboard.noRecipientsYet")}</h3>
                <p className="text-muted-foreground mb-4">{t("dashboard.addRecipientsToWill")}</p>
                <Link to="/recipients">
                  <Button variant="gold" className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t("dashboard.addRecipients")}
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* My Wills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-semibold text-foreground">{t("dashboard.myWills")}</h2>
              <div className="flex items-center gap-2">
                {wills.length > 0 && (
                  <Button
                    variant={isManagingWills ? "outline" : "ghost"}
                    size="sm"
                    onClick={toggleManageMode}
                    className="gap-2"
                  >
                    {isManagingWills ? (
                      <>
                        <X className="w-4 h-4" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        Manage
                      </>
                    )}
                  </Button>
                )}
                {!isManagingWills && (
                  <Link to="/create">
                    <Button variant="gold" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      {t("dashboard.newWill")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Manage Mode Controls */}
            {isManagingWills && wills.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedWills.size === wills.length}
                    onChange={selectAllWills}
                    className="w-4 h-4 rounded border-border cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedWills.size === 0
                      ? "Select wills to delete"
                      : `${selectedWills.size} will${selectedWills.size > 1 ? "s" : ""} selected`}
                  </span>
                </div>
                {selectedWills.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteWills}
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete {selectedWills.size > 1 ? `(${selectedWills.size})` : ""}
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            <div className="space-y-4">
              {wills.map((will) => {
                const WillIcon = getWillIcon(will.type);
                const hasContent = hasWillContent(will);
                const preview = getWillPreview(will);
                const isSelected = selectedWills.has(will.id);
                
                const WillContent = (
                  <div className={`card-interactive p-5 hover:shadow-lg transition-all duration-200 ${
                    isManagingWills ? "cursor-pointer" : ""
                  } ${isSelected ? "ring-2 ring-gold" : ""}`}>
                    <div className="flex items-start gap-4">
                      {/* Checkbox for manage mode */}
                      {isManagingWills && (
                        <div className="flex items-center pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleWillSelection(will.id);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 rounded border-border cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Will Type Icon */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 ${
                        will.type === "video" 
                          ? "from-navy to-navy-light" 
                          : will.type === "chat"
                          ? "from-sage-dark to-sage"
                          : "from-gold to-gold-light"
                      }`}>
                        <WillIcon className="w-7 h-7 text-primary-foreground" />
                      </div>

                        {/* Will Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="font-semibold text-foreground truncate">{will.title}</h3>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                  will.status === "completed"
                                    ? "bg-sage/20 text-sage-dark" 
                                    : will.status === "in_progress"
                                    ? "bg-gold/20 text-gold"
                                    : will.status === "review"
                                    ? "bg-blue-500/20 text-blue-600"
                                    : "bg-secondary text-muted-foreground"
                                }`}>
                                  {getStatusLabel(will.status)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1.5">
                                  <WillIcon className="w-3.5 h-3.5" />
                                  {getWillTypeLabel(will.type)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />
                                  {getTimeAgo(will.updated_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Will Content Preview */}
                          {hasContent && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                {preview}
                              </p>
                            </div>
                          )}

                          {/* Will Status Indicators */}
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                            {hasContent && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <CheckCircle className="w-3.5 h-3.5 text-sage-dark" />
                                <span>{t("dashboard.contentAdded") || "Content Added"}</span>
                              </div>
                            )}
                            {will.notes && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <FileText className="w-3.5 h-3.5 text-gold" />
                                <span>{t("dashboard.hasNotes") || "Has Notes"}</span>
                              </div>
                            )}
                            {!hasContent && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{t("dashboard.noContent") || "No content yet"}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {!isManagingWills && (
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                );
                
                return isManagingWills ? (
                  <div key={will.id} onClick={() => toggleWillSelection(will.id)}>
                    {WillContent}
                  </div>
                ) : (
                  <Link key={will.id} to={`/will/${will.id}`}>
                    {WillContent}
                  </Link>
                );
              })}

              {/* Empty State */}
              {wills.length === 0 && (
                <div className="card-elevated text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{t("dashboard.noWillsYet")}</h3>
                  <p className="text-muted-foreground mb-4">{t("dashboard.createFirstWill")}</p>
                  <Link to="/create">
                    <Button variant="gold" className="gap-2">
                      <Plus className="w-4 h-4" />
                      {t("dashboard.createYourFirstWill")}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tutorial Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                {t("dashboard.tutorialTitle") || "How to Get Started"}
              </h2>
              <p className="text-muted-foreground">
                {t("dashboard.tutorialSubtitle") || "Follow these simple steps to create and manage your digital will"}
              </p>
            </div>

            <div className="relative">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {/* Step 1: Create Will */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="card-elevated h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gold mb-1">
                              {t("dashboard.tutorial.step1") || "Step 1"}
                            </div>
                            <CardTitle className="text-lg">
                              {t("dashboard.tutorial.createWill") || "Create Your Will"}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {t("dashboard.tutorial.createWillDescription") || "Choose your preferred method to create your will - audio, video, or chat-based."}
                        </CardDescription>
                        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.createWillStep1") || "Click 'New Will' or go to Create section"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.createWillStep2") || "Select Audio, Video, or Chat option"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.createWillStep3") || "Record or type your wishes"}</span>
                          </li>
                        </ul>
                        <Link to="/create">
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            {t("dashboard.tutorial.getStarted") || "Get Started"}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  {/* Step 2: Add Assets */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="card-elevated h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
                            <FolderOpen className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-navy mb-1">
                              {t("dashboard.tutorial.step2") || "Step 2"}
                            </div>
                            <CardTitle className="text-lg">
                              {t("dashboard.tutorial.addAssets") || "Add Your Assets"}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {t("dashboard.tutorial.addAssetsDescription") || "List all your assets including property, investments, vehicles, and more."}
                        </CardDescription>
                        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.addAssetsStep1") || "Go to Assets section from Quick Actions"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.addAssetsStep2") || "Click 'Add Asset' button"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.addAssetsStep3") || "Fill in asset details and save"}</span>
                          </li>
                        </ul>
                        <Link to="/assets">
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            {t("dashboard.tutorial.manageAssets") || "Manage Assets"}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  {/* Step 3: Create Recipients */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="card-elevated h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-dark to-sage flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-sage-dark mb-1">
                              {t("dashboard.tutorial.step3") || "Step 3"}
                            </div>
                            <CardTitle className="text-lg">
                              {t("dashboard.tutorial.createRecipients") || "Create Recipients"}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {t("dashboard.tutorial.createRecipientsDescription") || "Add the people who will receive your assets and messages."}
                        </CardDescription>
                        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.createRecipientsStep1") || "Click 'Manage' in Recipients section"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.createRecipientsStep2") || "Click 'Add Recipient' button"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.createRecipientsStep3") || "Enter name, email, phone, and relationship"}</span>
                          </li>
                        </ul>
                        <Link to="/recipients">
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            {t("dashboard.tutorial.manageRecipients") || "Manage Recipients"}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  {/* Step 4: Assign Recipients */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="card-elevated h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
                            <LinkIcon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-gold mb-1">
                              {t("dashboard.tutorial.step4") || "Step 4"}
                            </div>
                            <CardTitle className="text-lg">
                              {t("dashboard.tutorial.assignRecipients") || "Assign Recipients"}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {t("dashboard.tutorial.assignRecipientsDescription") || "Link your assets to the recipients who should receive them."}
                        </CardDescription>
                        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.assignRecipientsStep1") || "Go to Assets section"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.assignRecipientsStep2") || "Click 'Assign Recipients' on any asset"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.assignRecipientsStep3") || "Select recipients and save"}</span>
                          </li>
                        </ul>
                        <Link to="/assets">
                          <Button variant="outline" size="sm" className="w-full gap-2">
                            {t("dashboard.tutorial.assignNow") || "Assign Now"}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </CarouselItem>

                  {/* Step 5: Review & Finalize */}
                  <CarouselItem className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card className="card-elevated h-full">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-dark to-sage flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-sage-dark mb-1">
                              {t("dashboard.tutorial.step5") || "Step 5"}
                            </div>
                            <CardTitle className="text-lg">
                              {t("dashboard.tutorial.reviewFinalize") || "Review & Finalize"}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="mb-4">
                          {t("dashboard.tutorial.reviewFinalizeDescription") || "Review all sections of your will and finalize it."}
                        </CardDescription>
                        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.reviewFinalizeStep1") || "Go to Review Will section"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.reviewFinalizeStep2") || "Check all sections are complete"}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-sage-dark mt-0.5 flex-shrink-0" />
                            <span>{t("dashboard.tutorial.reviewFinalizeStep3") || "Click 'Finalize Will' to complete"}</span>
                          </li>
                        </ul>
                        <Link to="/review">
                          <Button variant="gold" size="sm" className="w-full gap-2">
                            {t("dashboard.tutorial.reviewNow") || "Review Now"}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-12" />
                <CarouselNext className="hidden md:flex -right-12" />
              </Carousel>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
