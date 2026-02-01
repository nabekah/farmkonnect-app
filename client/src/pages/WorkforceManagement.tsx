import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Users, DollarSign, Calendar } from "lucide-react";

export default function WorkforceManagement() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [showNewWorker, setShowNewWorker] = useState(false);
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);

  const handleAddWorker = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const worker = {
      id: Date.now(),
      name: formData.get("name"),
      role: formData.get("role"),
      contact: formData.get("contact"),
      hireDate: formData.get("hireDate"),
      salary: formData.get("salary"),
      status: "active",
      createdAt: new Date(),
    };
    setWorkers([...workers, worker]);
    setShowNewWorker(false);
    (e.target as HTMLFormElement).reset();
  };

  const recordPayment = (workerId: number, workerName: string) => {
    const payment = {
      id: Date.now(),
      workerId,
      workerName,
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      paymentMethod: "cash",
      notes: "",
    };
    setPayrollRecords([...payrollRecords, payment]);
  };

  const deleteWorker = (id: number) => {
    setWorkers(workers.filter(w => w.id !== id));
  };

  const stats = {
    totalWorkers: workers.length,
    activeWorkers: workers.filter(w => w.status === "active").length,
    totalMonthlyPayroll: workers.reduce((sum, w) => sum + (parseFloat(w.salary) || 0), 0),
    averageSalary: workers.length > 0 ? (workers.reduce((sum, w) => sum + (parseFloat(w.salary) || 0), 0) / workers.length).toFixed(2) : 0,
  };

  const WorkerCard = ({ worker }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{worker.name}</CardTitle>
            <CardDescription className="capitalize">{worker.role}</CardDescription>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            worker.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}>
            {worker.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <p className="text-muted-foreground">Contact</p>
            <p className="font-semibold">{worker.contact}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground">Hire Date</p>
            <p className="font-semibold">{worker.hireDate}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-muted-foreground">Monthly Salary</p>
            <p className="font-semibold">₵{parseFloat(worker.salary).toFixed(2)}</p>
          </div>
        </div>
        <div className="flex gap-2 pt-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => recordPayment(worker.id, worker.name)}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Pay
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteWorker(worker.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Workforce Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage farm workers and payroll</p>
        </div>
        <Dialog open={showNewWorker} onOpenChange={setShowNewWorker}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto"><Plus className="w-4 h-4 mr-2" />Add Worker</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Farm Worker</DialogTitle>
              <DialogDescription>Register a new worker</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddWorker} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="Worker name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="general_laborer">
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_laborer">General Laborer</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" name="contact" placeholder="0XX XXX XXXX" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">Hire Date</Label>
                <Input id="hireDate" name="hireDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Monthly Salary (GHS)</Label>
                <Input id="salary" name="salary" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <Button type="submit" className="w-full">Add Worker</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkers}</div>
            <p className="text-xs text-muted-foreground">{stats.activeWorkers} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.totalMonthlyPayroll.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{stats.averageSalary}</div>
            <p className="text-xs text-muted-foreground">Per worker</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeWorkers}</div>
            <p className="text-xs text-muted-foreground">On duty</p>
          </CardContent>
        </Card>
      </div>

      {/* Workers List */}
      {workers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No workers registered yet</p>
          </CardContent>
        </Card>
      )}

      {/* Payroll Records */}
      {payrollRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
            <CardDescription>Recent worker payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {payrollRecords.slice(-10).map((record) => (
                <div key={record.id} className="border rounded-lg p-4 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{record.workerName}</p>
                    <p className="text-sm text-muted-foreground">{record.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₵{record.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{record.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
