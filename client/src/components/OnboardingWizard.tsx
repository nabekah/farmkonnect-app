import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import {
  CheckCircle2,
  Tractor,
  Beef,
  DollarSign,
  Bell,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";


interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingWizard({ open, onClose, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();


  // Form state
  const [farmData, setFarmData] = useState({
    name: "",
    location: "",
    size: "",
    description: "",
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Mark onboarding as complete in localStorage
    localStorage.setItem("farmkonnect_onboarding_complete", "true");
    console.log('Onboarding complete');
    onComplete();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to FarmKonnect</DialogTitle>
          <DialogDescription>
            Let's get you started with a quick setup tour
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="py-6">
          {step === 1 && <Step1Welcome />}
          {step === 2 && <Step2CreateFarm farmData={farmData} setFarmData={setFarmData} />}
          {step === 3 && <Step3AddLivestock />}
          {step === 4 && <Step4FinancialTracking />}
          {step === 5 && <Step5TourComplete setLocation={setLocation} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip Tour
            </Button>
            <Button onClick={handleNext}>
              {step < totalSteps ? (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Complete
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Step1Welcome() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <Tractor className="w-10 h-10 text-green-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Welcome to FarmKonnect!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          FarmKonnect is your comprehensive agricultural management platform. Let's take a quick tour to help you get started.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <FeatureHighlight
          icon={<DollarSign className="w-6 h-6" />}
          title="Financial Management"
          description="Track all your farm expenses and revenue"
        />
        <FeatureHighlight
          icon={<Beef className="w-6 h-6" />}
          title="Livestock Management"
          description="Monitor animal health and breeding"
        />
        <FeatureHighlight
          icon={<Bell className="w-6 h-6" />}
          title="Smart Alerts"
          description="Get notified about important farm events"
        />
      </div>
    </div>
  );
}

function Step2CreateFarm({
  farmData,
  setFarmData,
}: {
  farmData: any;
  setFarmData: (data: any) => void;
}) {

  const createFarmMutation = trpc.farms.create.useMutation({
    onSuccess: () => {
      console.log('Farm created successfully');
    },
    onError: (error) => {
      console.error('Error creating farm:', error.message);
    },
  });

  const handleCreateFarm = () => {
    if (farmData.name && farmData.location) {
      createFarmMutation.mutate({
        farmName: farmData.name,
        location: farmData.location,
        sizeHectares: farmData.size || undefined,
        farmType: "mixed",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Create Your First Farm</h3>
        <p className="text-muted-foreground">
          Register your farm to start tracking operations
        </p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="farm-name">Farm Name *</Label>
          <Input
            id="farm-name"
            placeholder="e.g., Green Valley Farm"
            value={farmData.name}
            onChange={(e) => setFarmData({ ...farmData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="farm-location">Location *</Label>
          <Input
            id="farm-location"
            placeholder="e.g., Accra, Ghana"
            value={farmData.location}
            onChange={(e) => setFarmData({ ...farmData, location: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="farm-size">Size (acres)</Label>
          <Input
            id="farm-size"
            type="number"
            placeholder="e.g., 50"
            value={farmData.size}
            onChange={(e) => setFarmData({ ...farmData, size: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="farm-description">Description</Label>
          <Textarea
            id="farm-description"
            placeholder="Brief description of your farm"
            value={farmData.description}
            onChange={(e) => setFarmData({ ...farmData, description: e.target.value })}
          />
        </div>
        <Button
          onClick={handleCreateFarm}
          disabled={!farmData.name || !farmData.location || createFarmMutation.isPending}
          className="w-full"
        >
          {createFarmMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Farm"
          )}
        </Button>
      </div>
    </div>
  );
}

function Step3AddLivestock() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Livestock Management</h3>
        <p className="text-muted-foreground">
          Track your animals, health records, and breeding information
        </p>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beef className="w-5 h-5" />
              Animal Registry
            </CardTitle>
            <CardDescription>
              Register each animal with a unique tag ID, track health records, breeding cycles, and performance metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Individual animal profiles with unique IDs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Health records and vaccination tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Breeding records and offspring tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Performance metrics and weight tracking</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground text-center">
          You can add your first animal from the Livestock Management page after completing this tour.
        </p>
      </div>
    </div>
  );
}

function Step4FinancialTracking() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Financial Tracking</h3>
        <p className="text-muted-foreground">
          Monitor your farm's financial health with comprehensive tracking
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Tracking</CardTitle>
            <CardDescription>
              Record all farm expenses including feed, labor, equipment, and utilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Categorize expenses</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Track payment methods</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Generate expense reports</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Tracking</CardTitle>
            <CardDescription>
              Record all income from crop sales, livestock sales, and products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Track sales by source</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Monitor buyer information</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Calculate profit margins</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Step5TourComplete({ setLocation }: { setLocation: (path: string) => void }) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">You're All Set!</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          You've completed the onboarding tour. Start exploring FarmKonnect's powerful features to manage your farm operations efficiently.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <Button
          variant="outline"
          className="h-auto py-4"
          onClick={() => setLocation("/farm-finance")}
        >
          <div className="text-left">
            <div className="font-semibold">Start with Finances</div>
            <div className="text-sm text-muted-foreground">Track your first expense or revenue</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4"
          onClick={() => setLocation("/livestock-management")}
        >
          <div className="text-left">
            <div className="font-semibold">Add Your Animals</div>
            <div className="text-sm text-muted-foreground">Register your first livestock</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4"
          onClick={() => setLocation("/workforce-management")}
        >
          <div className="text-left">
            <div className="font-semibold">Manage Workers</div>
            <div className="text-sm text-muted-foreground">Add your farm workers</div>
          </div>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4"
          onClick={() => setLocation("/analytics-dashboard")}
        >
          <div className="text-left">
            <div className="font-semibold">View Analytics</div>
            <div className="text-sm text-muted-foreground">See your farm insights</div>
          </div>
        </Button>
      </div>
    </div>
  );
}

function FeatureHighlight({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2 p-4 rounded-lg bg-muted/50">
      <div className="flex justify-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          {icon}
        </div>
      </div>
      <div className="text-center">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}
