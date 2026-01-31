import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
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
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Leaf,
  MapPin,
  Play,
  X,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { WeatherWidget } from "@/components/WeatherWidget";

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Welcome back, {user.name}!</h1>
          <p className="text-lg text-muted-foreground">Manage your agricultural operations efficiently with FarmKonnect</p>
        </div>

        {/* Weather Widget */}
        <div className="mb-8">
          <WeatherWidget
            latitude={5.6037}
            longitude={-0.1870}
            showForecast={true}
          />
        </div>

        {/* Quick Actions Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Quick Actions for Farm Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickActionCard
              icon={<Tractor className="w-8 h-8" />}
              title="Manage Farms"
              description="Register and manage your farms"
              onClick={() => setLocation("/farms")}
              color="bg-green-500"
            />
            <QuickActionCard
              icon={<Sprout className="w-8 h-8" />}
              title="Track Crops"
              description="Monitor crop cycles and yields"
              onClick={() => setLocation("/crops")}
              color="bg-emerald-500"
            />
            <QuickActionCard
              icon={<Beef className="w-8 h-8" />}
              title="Livestock Management"
              description="Manage animals and health records"
              onClick={() => setLocation("/livestock")}
              color="bg-amber-500"
            />
            <QuickActionCard
              icon={<ShoppingCart className="w-8 h-8" />}
              title="Agricultural Marketplace"
              description="Buy and sell agricultural products"
              onClick={() => setLocation("/marketplace")}
              color="bg-blue-500"
            />
            <QuickActionCard
              icon={<BarChart3 className="w-8 h-8" />}
              title="Analytics & Reports"
              description="View performance insights"
              onClick={() => setLocation("/analytics")}
              color="bg-purple-500"
            />
            <QuickActionCard
              icon={<Cloud className="w-8 h-8" />}
              title="Weather Forecasts"
              description="Check weather and recommendations"
              onClick={() => setLocation("/weather-alerts")}
              color="bg-cyan-500"
            />
          </div>
        </div>
      </div>
    );
  }

  // Public Landing Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 dark:from-green-600/5 dark:to-emerald-600/5"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Smart Agricultural Management System
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Grow Smarter with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400">
                FarmKonnect
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              Manage your farms, track crops, monitor livestock, and boost productivity with real-time weather insights and IoT integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href={getLoginUrl()}>
                <Button size="lg" className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <Link href="/register">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                  Create Account
                </Button>
              </Link>
            </div>
            
            {/* Demo Video Player */}
            <DemoVideoPlayer />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="10,000+" label="Active Farmers" />
            <StatCard number="50,000+" label="Farms Managed" />
            <StatCard number="99.9%" label="Uptime" />
            <StatCard number="24/7" label="Support" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive tools designed for modern agricultural management in Ghana and West Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Tractor className="w-12 h-12 text-green-600 dark:text-green-400" />}
              title="Farm Management"
              description="Register multiple farms with GPS coordinates, track farm size, and categorize by type (crop, livestock, mixed)."
              features={[
                "GPS location tracking",
                "Multi-farm management",
                "Farm type categorization",
                "Detailed farm profiles",
              ]}
            />
            <FeatureCard
              icon={<Sprout className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />}
              title="Crop Tracking"
              description="Monitor crop cycles, log soil tests, record fertilizer applications, and track harvest yields."
              features={[
                "Crop cycle management",
                "Soil health monitoring",
                "Fertilizer tracking",
                "Yield analytics",
              ]}
            />
            <FeatureCard
              icon={<Beef className="w-12 h-12 text-amber-600 dark:text-amber-400" />}
              title="Livestock Management"
              description="Track animals, manage health records, monitor breeding, and optimize feeding schedules."
              features={[
                "Animal registration",
                "Health record tracking",
                "Breeding management",
                "Feeding optimization",
              ]}
            />
            <FeatureCard
              icon={<Cloud className="w-12 h-12 text-cyan-600 dark:text-cyan-400" />}
              title="Weather & IoT"
              description="Real-time weather forecasts, IoT sensor monitoring, and smart irrigation recommendations."
              features={[
                "5-day weather forecasts",
                "IoT sensor integration",
                "Soil moisture tracking",
                "Smart irrigation alerts",
              ]}
            />
            <FeatureCard
              icon={<ShoppingCart className="w-12 h-12 text-blue-600 dark:text-blue-400" />}
              title="Marketplace"
              description="List and sell agricultural products, browse offerings, manage orders, and track revenue."
              features={[
                "Product listings",
                "Order management",
                "Inventory tracking",
                "Sales analytics",
              ]}
            />
            <FeatureCard
              icon={<BarChart3 className="w-12 h-12 text-purple-600 dark:text-purple-400" />}
              title="Analytics & Insights"
              description="Data-driven insights with yield charts, soil trends, livestock metrics, and revenue reports."
              features={[
                "Yield distribution charts",
                "Soil health trends",
                "Performance metrics",
                "Revenue tracking",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Farmers Across Ghana
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See how FarmKonnect is transforming agricultural operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Kwame Mensah"
              role="Crop Farmer"
              location="Ashanti Region, Ghana"
              image="👨🏿‍🌾"
              quote="FarmKonnect has transformed how I manage my 20-hectare maize farm. The weather alerts help me plan irrigation perfectly, and I've increased my yields by 35% in just one season!"
              rating={5}
            />
            <TestimonialCard
              name="Ama Boateng"
              role="Livestock Manager"
              location="Greater Accra, Ghana"
              image="👩🏿‍🌾"
              quote="Managing 150 cattle was overwhelming until I found FarmKonnect. The breeding tracker and health records keep everything organized. I can't imagine farming without it now."
              rating={5}
            />
            <TestimonialCard
              name="Kofi Asante"
              role="Mixed Farm Owner"
              location="Eastern Region, Ghana"
              image="👨🏿‍🌾"
              quote="The marketplace feature helped me connect directly with buyers. I'm now selling my vegetables at better prices without middlemen. My revenue increased by 40% this year!"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose FarmKonnect?
            </h2>
            <p className="text-xl text-green-50 max-w-2xl mx-auto">
              Join thousands of farmers who are transforming their agricultural operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard
              icon={<Zap className="w-10 h-10" />}
              title="Smart Irrigation"
              description="Optimize water usage with weather-based recommendations and soil moisture monitoring."
            />
            <BenefitCard
              icon={<TrendingUp className="w-10 h-10" />}
              title="Increase Yields"
              description="Make data-driven decisions to improve crop performance and livestock productivity."
            />
            <BenefitCard
              icon={<ShoppingCart className="w-10 h-10" />}
              title="Direct Sales"
              description="Sell your products directly to buyers through our integrated marketplace platform."
            />
            <BenefitCard
              icon={<Shield className="w-10 h-10" />}
              title="Real-time Alerts"
              description="Get instant notifications for critical events like breeding due dates and low stock alerts."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Transform Your Farm?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Join FarmKonnect today and start managing your agricultural operations more efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={getLoginUrl()}>
                  <Button size="lg" className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </a>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 dark:bg-black text-gray-300">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Tractor className="w-6 h-6 text-green-500" />
            <span className="text-xl font-bold text-white">FarmKonnect</span>
          </div>
          <p className="text-sm">
            © 2026 FarmKonnect. Agricultural Management System for Ghana and West Africa.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Component: Quick Action Card (for logged-in users)
function QuickActionCard({
  icon,
  title,
  description,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-green-500 dark:hover:border-green-400" onClick={onClick}>
      <CardHeader>
        <div className={`w-16 h-16 ${color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="ghost" className="w-full group-hover:bg-green-50 dark:group-hover:bg-green-900/20">
          Go to {title.split(" ")[0]}
          <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Component: Stat Card
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
        {number}
      </div>
      <div className="text-gray-600 dark:text-gray-300 font-medium">{label}</div>
    </div>
  );
}

// Component: Feature Card
function FeatureCard({
  icon,
  title,
  description,
  features,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500 dark:hover:border-green-400">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-2xl mb-2">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// Component: Demo Video Player
function DemoVideoPlayer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div 
          className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
          onClick={() => setIsOpen(true)}
        >
          {/* Video Thumbnail */}
          <div className="aspect-video bg-gradient-to-br from-green-900 to-emerald-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-white ml-1" />
              </div>
              <p className="text-white text-lg font-semibold">Watch 2-Minute Demo</p>
              <p className="text-green-100 text-sm mt-2">See FarmKonnect in Action</p>
            </div>
          </div>
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Video Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div className="relative w-full max-w-5xl">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {/* Placeholder for video - replace with actual video URL */}
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <p className="text-2xl font-bold mb-4">Demo Video Coming Soon</p>
                  <p className="text-gray-400 mb-6">Replace this with your actual video URL</p>
                  <p className="text-sm text-gray-500">Suggested: Upload video to YouTube/Vimeo and embed here</p>
                </div>
              </div>
              {/* 
              Uncomment and replace with your video URL:
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                title="FarmKonnect Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Component: Testimonial Card
function TestimonialCard({
  name,
  role,
  location,
  image,
  quote,
  rating,
}: {
  name: string;
  role: string;
  location: string;
  image: string;
  quote: string;
  rating: number;
}) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl">{image}</div>
          <div>
            <CardTitle className="text-lg mb-1">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{role}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {location}
            </p>
          </div>
        </div>
        <div className="flex gap-1 mb-3">
          {Array.from({ length: rating }).map((_, i) => (
            <span key={i} className="text-yellow-500 text-lg">★</span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300 italic">"{quote}"</p>
      </CardContent>
    </Card>
  );
}

// Component: Benefit Card
function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="bg-white/10 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-green-50">{description}</p>
    </div>
  );
}
