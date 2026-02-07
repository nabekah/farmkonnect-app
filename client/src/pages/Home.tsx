import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
  Tractor,
  Sprout,
  Beef,
  ShoppingCart,
  BarChart3,
  Cloud,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Leaf,
  MapPin,
  Play,
  X,
  DollarSign,
  Users,
  Fish,
  Wrench,
  Wallet,
  UserCog,
  PieChart,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { WeatherWidget } from "@/components/WeatherWidget";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { WorkerQuickActions } from "@/components/WorkerQuickActions";
import { FarmComparisonView } from "@/components/FarmComparisonView";
import { FarmAlertsCenter, type FarmAlert } from "@/components/FarmAlertsCenter";
import { FarmRecommendations } from "@/components/FarmRecommendations";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Set page title and meta tags for SEO
  useEffect(() => {
    document.title = "FarmKonnect - Smart Agricultural Management Platform";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "FarmKonnect is a comprehensive farm management platform for tracking crops, livestock, weather, and marketplace sales across Ghana and West Africa."
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <AuthenticatedHome user={user} setLocation={setLocation} />
    );
  }

  return <LandingPage />;
}

function AuthenticatedHome({ user, setLocation }: { user: any; setLocation: (path: string) => void }) {
  // Check if onboarding is complete
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const completed = localStorage.getItem("farmkonnect_onboarding_complete");
    return !completed;
  });

  // State for farm filter - null means All Farms
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(() => {
    const saved = localStorage.getItem("farmkonnect_selected_farm");
    return saved ? parseInt(saved) : null;
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Persist farm selection to localStorage
  useEffect(() => {
    if (isInitialized) {
      if (selectedFarmId === null) {
        localStorage.removeItem("farmkonnect_selected_farm");
      } else {
        localStorage.setItem("farmkonnect_selected_farm", selectedFarmId.toString());
      }
    }
  }, [selectedFarmId, isInitialized]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };
  // Fetch KPI data
  const { data: farms } = trpc.farms.list.useQuery();
  const farmId = farms && farms.length > 0 ? farms[0].id : 1;

  // Initialize on first load
  useEffect(() => {
    if (farms && farms.length > 0 && !isInitialized) {
      setIsInitialized(true);
    }
  }, [farms, isInitialized]);

  // Determine which farm ID to use for queries
  const queryFarmId = selectedFarmId || (farms && farms.length > 0 ? farms[0].id : 1);
  const isAllFarmsSelected = selectedFarmId === null;

  // Financial data - use consolidated queries when All Farms selected
  const { data: expenses } = isAllFarmsSelected 
    ? trpc.financial.allExpenses.useQuery()
    : trpc.financial.expenses.list.useQuery({ farmId: queryFarmId });
  const { data: revenue } = isAllFarmsSelected
    ? trpc.financial.allRevenue.useQuery()
    : trpc.financial.revenue.list.useQuery({ farmId: queryFarmId });

  // Livestock data - use consolidated query when All Farms selected
  const { data: animals } = isAllFarmsSelected
    ? trpc.livestock.allAnimals.useQuery()
    : trpc.livestock.animals.list.useQuery({ farmId: queryFarmId });

  // Workforce data - always get all workers, filter based on selection
  const { data: allWorkers } = trpc.workforce.workers.getAllWorkers.useQuery({});
  const { data: farmWorkers } = trpc.workforce.workers.list.useQuery(
    { farmId: queryFarmId },
    { enabled: !!queryFarmId }
  );
  
  // Use all owner's workers if All Farms selected, otherwise use farm-specific workers
  const workers = isAllFarmsSelected ? allWorkers : farmWorkers;

  // Fish farming data
  const { data: ponds } = trpc.fishFarming.ponds.list.useQuery({ farmId: queryFarmId });

  // Assets data - use consolidated query when All Farms selected
  const { data: assets } = isAllFarmsSelected
    ? trpc.assets.allAssets.useQuery()
    : trpc.assets.assets.list.useQuery({ farmId: queryFarmId });

  // Calculate KPIs
  const totalRevenue = revenue?.reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0) || 0;
  const netProfit = totalRevenue - totalExpenses;
  const activeAnimals = animals?.filter(a => a.status === "active").length || 0;
  const activeWorkers = workers?.filter(w => w.status === "active").length || 0;
  const activePonds = ponds?.filter(p => p.status === "active").length || 0;
  const activeAssets = assets?.filter(a => a.status === "active").length || 0;

  // Generate farm-specific alerts
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const farmAlerts: FarmAlert[] = [];
  farms?.forEach((farm) => {
    if (netProfit < 0) {
      farmAlerts.push({
        id: `loss-${farm.id}`,
        farmId: farm.id,
        farmName: farm.farmName,
        type: "error",
        title: "Operating at Loss",
        message: `Farm is currently operating at a loss. Review expenses and revenue sources.`,
        timestamp: new Date(),
        actionUrl: "/farm-finance",
        actionLabel: "View Finance",
      });
    }
  });
  const visibleAlerts = farmAlerts.filter(a => !dismissedAlerts.has(a.id));

  return (
    <>
      <OnboardingWizard
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-base md:text-lg text-gray-600">Manage your agricultural operations efficiently with FarmKonnect</p>
        </div>

        {/* Farm Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter by Farm:</label>
          <select
            value={selectedFarmId || ""}
            onChange={(e) => setSelectedFarmId(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Farms</option>
            {farms?.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.farmName}
              </option>
            ))}
          </select>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
          <KPICard
            title="Total Revenue"
            value={`GH₵ ${totalRevenue.toLocaleString()}`}
            trend={totalRevenue > totalExpenses ? "up" : "down"}
            trendValue={totalRevenue > 0 ? `${((netProfit / totalRevenue) * 100).toFixed(1)}%` : "0%"}
            icon={<DollarSign className="w-6 h-6" />}
            color="text-green-600"
            onClick={() => setLocation("/farm-finance")}
          />
          <KPICard
            title="Total Expenses"
            value={`GH₵ ${totalExpenses.toLocaleString()}`}
            trend="neutral"
            trendValue={`${expenses?.length || 0} transactions`}
            icon={<Wallet className="w-6 h-6" />}
            color="text-red-600"
            onClick={() => setLocation("/farm-finance")}
          />
          <KPICard
            title="Active Animals"
            value={activeAnimals.toString()}
            trend="neutral"
            trendValue={`${animals?.length || 0} total`}
            icon={<Beef className="w-6 h-6" />}
            color="text-amber-600"
            onClick={() => setLocation("/livestock-management")}
          />
          <KPICard
            title="Active Workers"
            value={activeWorkers.toString()}
            trend="neutral"
            trendValue={`${workers?.length || 0} total`}
            icon={<Users className="w-6 h-6" />}
            color="text-blue-600"
            onClick={() => setLocation("/workforce-management")}
          />
          <KPICard
            title="Fish Ponds"
            value={activePonds.toString()}
            trend="neutral"
            trendValue={`${ponds?.length || 0} total`}
            icon={<Fish className="w-6 h-6" />}
            color="text-cyan-600"
            onClick={() => setLocation("/fish-farming")}
          />
          <KPICard
            title="Farm Assets"
            value={activeAssets.toString()}
            trend="neutral"
            trendValue={`${assets?.length || 0} total`}
            icon={<Wrench className="w-6 h-6" />}
            color="text-purple-600"
            onClick={() => setLocation("/asset-management")}
          />
          <KPICard
            title="Net Profit"
            value={`GH₵ ${netProfit.toLocaleString()}`}
            trend={netProfit > 0 ? "up" : netProfit < 0 ? "down" : "neutral"}
            trendValue={netProfit > 0 ? "Profitable" : netProfit < 0 ? "Loss" : "Break-even"}
            icon={<TrendingUp className="w-6 h-6" />}
            color={netProfit > 0 ? "text-green-600" : netProfit < 0 ? "text-red-600" : "text-gray-600"}
            onClick={() => setLocation("/analytics-dashboard")}
          />
          <KPICard
            title="Analytics"
            value="View"
            trend="neutral"
            trendValue="Detailed insights"
            icon={<PieChart className="w-6 h-6" />}
            color="text-indigo-600"
            onClick={() => setLocation("/analytics-dashboard")}
          />
        </div>

        {/* Alerts Section */}
        {visibleAlerts.length > 0 && (
          <FarmAlertsCenter
            alerts={visibleAlerts}
            onDismiss={(id) => setDismissedAlerts(prev => new Set([...prev, id]))}
          />
        )}

        {/* Weather Widget */}
        <WeatherWidget farmId={queryFarmId} />

        {/* Quick Actions */}
        {user.role === "field_worker" && <WorkerQuickActions />}

        {/* Farm Recommendations */}
        <FarmRecommendations farmId={queryFarmId} />

        {/* Farm Comparison */}
        {isAllFarmsSelected && <FarmComparisonView />}
      </div>
    </>
  );
}

function LandingPage() {
  const [showVideo, setShowVideo] = useState(false);
  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-green-950 dark:via-gray-900 dark:to-green-950">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 md:space-y-8 order-2 lg:order-1 scroll-animate fade-left">
              <div className="space-y-3 md:space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Manage Your Farm Efficiently
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300">
                  Real-time monitoring and analytics for modern farming
                </p>
              </div>
              <a href={loginUrl} className="inline-block">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-lg w-full sm:w-auto">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>

            {/* Right: Hero Image Placeholder */}
            <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-green-200 to-green-100 dark:from-green-900 dark:to-green-800 rounded-2xl overflow-hidden shadow-xl order-1 lg:order-2 scroll-animate fade-right">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Tractor className="h-20 sm:h-24 w-20 sm:w-24 text-green-700 dark:text-green-300 mx-auto mb-3 sm:mb-4" />
                  <p className="text-green-700 dark:text-green-300 font-semibold text-sm sm:text-base">Farm Management Illustration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-8 md:mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-stagger-in">
            {/* Feature 1: Analytics */}
            <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-shadow scroll-animate fade-up">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                  <CardTitle>Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Real-time monitoring and analytics for modern farming. Track your farm's performance with detailed insights.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2: Livestock */}
            <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-shadow scroll-animate fade-up">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Beef className="h-8 w-8 text-green-600" />
                  <CardTitle>Livestock</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Monitor and manage livestock to lower costs as modern farming. Track health, breeding, and productivity.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3: Activity Tracking */}
            <Card className="border-l-4 border-l-green-600 hover:shadow-lg transition-shadow scroll-animate fade-up">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="h-8 w-8 text-green-600" />
                  <CardTitle>Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Farm analytics is a modern farm management platform. Track all activities and optimize operations.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-green-50 dark:bg-green-950">
        <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Join thousands of farmers using FarmKonnect to manage their operations more efficiently.
          </p>
          <a href={loginUrl} className="inline-block">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-lg w-full sm:w-auto">
              Start Your Free Trial
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

function KPICard({
  title,
  value,
  trend = "neutral",
  trendValue,
  icon,
  color = "text-gray-600",
  onClick,
}: KPICardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white shadow-md hover:shadow-xl"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-semibold text-gray-700">{title}</CardTitle>
          {icon && <div className={`${color} opacity-80`}>{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl md:text-3xl font-bold text-gray-900">{value}</div>
        {trendValue && (
          <div className="flex items-center gap-1">
            {trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
            {trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
            <span className={`text-xs font-medium ${
              trend === "up" ? "text-green-600" :
              trend === "down" ? "text-red-600" :
              "text-gray-600"
            }`}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
