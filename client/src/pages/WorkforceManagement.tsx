import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Users, DollarSign, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function WorkforceManagement() {
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);
  const [showNewWorker, setShowNewWorker] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  // Fetch farms
  const { data: farms = [] } = trpc.farms.list.useQuery();

  // Set first farm as default
  useMemo(() => {
    if (farms.length > 0 && !selectedFarmId) {
      setSelectedFarmId(farms[0].id);
    }
  }, [farms, selectedFarmId]);

  // Fetch workers
  const { data: workers = [], isLoading: workersLoading, refetch: refetchWorkers } = trpc.workforce.workers.list.useQuery(
    selectedFarmId ? { farmId: selectedFarmId } : { farmId: 0 },
    { enabled: !!selectedFarmId }
  );

  // Mutations
  const createWorker = trpc.workforce.workers.create.useMutation({
    onSuccess: () => {
      refetchWorkers();
      setShowNewWorker(false);
    },
  });

  const deleteWorker = trpc.workforce.workers.delete.useMutation({
    onSuccess: () => {
      refetchWorkers();
    },
  });

  // Calculate stats
  const stats = {
    totalWorkers: workers.length,
    activeWorkers: workers.filter((w) => w.status === "active").length,
    totalMonthlyPayroll: workers.reduce((sum, w) => sum + parseFloat(w.salary || "0"), 0),
    averageSalary: workers.length > 0 ? workers.reduce((sum, w) => sum + parseFloat(w.salary || "0"), 0) / workers.length : 0,
  };

  const handleAddWorker = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFarmId) return;

    const formData = new FormData(e.currentTarget);

    await createWorker.mutateAsync({
      farmId: selectedFarmId,
      name: (formData.get("name") as string) || "",
      role: (formData.get("role") as string) || "general_laborer",
      contact: (formData.get("contact") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      hireDate: new Date(formData.get("hireDate") as string),
      salary: formData.get("salary") ? parseFloat(formData.get("salary") as string) : undefined,
      salaryFrequency: (formData.get("salaryFrequency") as string) || "monthly",
      status: "active",
    });

    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Workforce Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage workers, payroll, and attendance</p>
        </div>
        <div className="flex flex-col gap-2">
          <Select value={selectedFarmId?.toString() || ""} onValueChange={(val) => setSelectedFarmId(parseInt(val))}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select farm" />
            </SelectTrigger>
            <SelectContent>
              {farms.map((farm) => (
                <SelectItem key={farm.id} value={farm.id.toString()}>
                  {farm.farmName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeWorkers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalMonthlyPayroll.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageSalary.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Worker Button */}
      <Dialog open={showNewWorker} onOpenChange={setShowNewWorker}>
        <DialogTrigger asChild>
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Worker
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Worker</DialogTitle>
            <DialogDescription>Register a new worker to your farm</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWorker} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" defaultValue="general_laborer">
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farm_manager">Farm Manager</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="general_laborer">General Laborer</SelectItem>
                  <SelectItem value="veterinarian">Veterinarian</SelectItem>
                  <SelectItem value="equipment_operator">Equipment Operator</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="contact">Phone</Label>
                <Input id="contact" name="contact" type="tel" placeholder="+1234567890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input id="hireDate" name="hireDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryFrequency">Salary Frequency</Label>
                <Select name="salaryFrequency" defaultValue="monthly">
                  <SelectTrigger id="salaryFrequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Amount</Label>
              <Input id="salary" name="salary" type="number" step="0.01" placeholder="1000" />
            </div>
            <Button type="submit" className="w-full" disabled={createWorker.isPending}>
              {createWorker.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Worker"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Workers Tabs */}
      <Tabs defaultValue="workers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="workers" className="space-y-4">
          {workersLoading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading workers...</p>
              </CardContent>
            </Card>
          ) : workers.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No workers registered yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(workers as any[]).map((worker) => (
                <Card key={worker.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{worker.name}</CardTitle>
                        <CardDescription className="capitalize">{worker.role.replace(/_/g, " ")}</CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          worker.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {worker.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-semibold">{worker.contact || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-semibold text-xs">{worker.email || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Hire Date</p>
                        <p className="font-semibold">{new Date(worker.hireDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Frequency</p>
                        <p className="font-semibold capitalize">{worker.salaryFrequency || "monthly"}</p>
                      </div>
                    </div>
                    {worker.salary && (
                      <div className="border-t pt-2">
                        <p className="text-muted-foreground text-xs">Salary</p>
                        <p className="font-semibold text-lg">${parseFloat(worker.salary || "0").toFixed(2)}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedWorkerId(worker.id)}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Attendance
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => deleteWorker.mutate({ id: worker.id })}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Worker Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Active</span>
                  <span className="font-semibold text-green-600">{stats.activeWorkers}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Inactive</span>
                  <span className="font-semibold">{stats.totalWorkers - stats.activeWorkers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-semibold">{stats.totalWorkers}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Monthly Payroll</span>
                  <span className="font-semibold">${stats.totalMonthlyPayroll.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Average Salary</span>
                  <span className="font-semibold">${stats.averageSalary.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
