import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Trash2, Edit2, Shield } from "lucide-react";
import { toast } from "sonner";

interface WorkerManagementProps {
  farmId: string;
  farmName: string;
}

export const WorkerManagement: React.FC<WorkerManagementProps> = ({
  farmId,
  farmName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [newWorkerEmail, setNewWorkerEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"manager" | "worker" | "viewer">("worker");

  const { data: workers = [], refetch } = trpc.rbac.getFarmWorkers.useQuery(
    { farmId },
    { enabled: !!farmId }
  );

  const assignWorkerMutation = trpc.rbac.assignWorkerToFarm.useMutation({
    onSuccess: () => {
      toast.success("Worker assigned successfully!");
      setNewWorkerEmail("");
      setSelectedRole("worker");
      refetch();
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign worker");
    }
  });

  const updateRoleMutation = trpc.rbac.updateWorkerRole.useMutation({
    onSuccess: () => {
      toast.success("Worker role updated successfully!");
      refetch();
      setEditingWorkerId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update worker role");
    }
  });

  const deactivateWorkerMutation = trpc.rbac.deactivateWorker.useMutation({
    onSuccess: () => {
      toast.success("Worker deactivated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to deactivate worker");
    }
  });

  const handleAssignWorker = async () => {
    if (!newWorkerEmail.trim()) {
      toast.error("Please enter a worker email");
      return;
    }

    assignWorkerMutation.mutate({
      userId: newWorkerEmail,
      farmId,
      role: selectedRole
    });
  };

  const handleUpdateRole = (workerId: string, newRole: "manager" | "worker" | "viewer") => {
    updateRoleMutation.mutate({
      workerId,
      farmId,
      newRole
    });
  };

  const handleDeactivate = (workerId: string) => {
    if (confirm("Are you sure you want to deactivate this worker?")) {
      deactivateWorkerMutation.mutate({
        workerId,
        farmId
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "worker":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "owner":
        return "Full access - can manage all farm data and workers";
      case "manager":
        return "Can view and manage farm data, record expenses";
      case "worker":
        return "Can view assigned farm and record activities";
      case "viewer":
        return "Read-only access to farm data";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <div>
              <CardTitle>Worker Management</CardTitle>
              <CardDescription>Manage farm workers and their access levels</CardDescription>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Assign Worker
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Assign Worker to {farmName}</DialogTitle>
                <DialogDescription>
                  Add a new worker to your farm and assign them a role
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Worker Email</Label>
                  <Input
                    id="email"
                    placeholder="worker@example.com"
                    value={newWorkerEmail}
                    onChange={(e) => setNewWorkerEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager - Full farm management</SelectItem>
                      <SelectItem value="worker">Worker - Record activities and view data</SelectItem>
                      <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">
                    {getRoleDescription(selectedRole)}
                  </p>
                </div>

                <Button
                  onClick={handleAssignWorker}
                  disabled={assignWorkerMutation.isPending}
                  className="w-full"
                >
                  {assignWorkerMutation.isPending ? "Assigning..." : "Assign Worker"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {workers && workers.length > 0 ? (
          <div className="space-y-3">
            {workers.map((worker: any) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                      {worker.userId.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{worker.userId}</p>
                      <p className="text-sm text-gray-500">
                        Assigned: {new Date(worker.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(worker.role)}`}>
                    {worker.role.charAt(0).toUpperCase() + worker.role.slice(1)}
                  </span>

                  {editingWorkerId === worker.id ? (
                    <Select
                      value={worker.role}
                      onValueChange={(newRole) => handleUpdateRole(worker.id, newRole as any)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="worker">Worker</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingWorkerId(worker.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeactivate(worker.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No workers assigned yet</p>
            <p className="text-sm text-gray-400">Click "Assign Worker" to add your first team member</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
