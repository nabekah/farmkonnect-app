import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Shield, Users, Key, Activity, AlertTriangle, CheckCircle, XCircle, Clock, Lock } from "lucide-react";

export default function SecurityDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const utils = trpc.useUtils();

  // Toast function
  const toast = (props: { title: string; description?: string; variant?: "default" | "destructive" }) => {
    const toastEl = document.createElement("div");
    toastEl.className = `fixed bottom-4 right-4 bg-${props.variant === "destructive" ? "red" : "green"}-600 text-white px-6 py-3 rounded-lg shadow-lg z-50`;
    toastEl.innerHTML = `<strong>${props.title}</strong>${props.description ? `<br/><span class="text-sm">${props.description}</span>` : ""}`;
    document.body.appendChild(toastEl);
    setTimeout(() => toastEl.remove(), 3000);
  };

  // ============================================================================
  // OVERVIEW TAB
  // ============================================================================
  const { data: auditStats } = trpc.security.auditLogs.getStatistics.useQuery();
  const { data: pendingApprovals } = trpc.security.approval.listPendingApprovals.useQuery();
  const { data: activeSessions } = trpc.security.sessions.listAllSessions.useQuery({});

  const seedSystem = trpc.security.system.seedSecuritySystem.useMutation({
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message });
      utils.security.invalidate();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // ============================================================================
  // USER APPROVAL TAB
  // ============================================================================
  const approveUser = trpc.security.approval.approveUser.useMutation({
    onSuccess: () => {
      toast({ title: "User Approved", description: "User account has been activated" });
      utils.security.approval.listPendingApprovals.invalidate();
    },
  });

  const rejectUser = trpc.security.approval.rejectUser.useMutation({
    onSuccess: () => {
      toast({ title: "User Rejected", description: "User account has been rejected" });
      utils.security.approval.listPendingApprovals.invalidate();
    },
  });

  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // ============================================================================
  // ACCOUNT MANAGEMENT TAB
  // ============================================================================
  const { data: users } = trpc.security.account.listUsers.useQuery({
    status: "all",
    approvalStatus: "all",
  });

  const disableAccount = trpc.security.account.disableAccount.useMutation({
    onSuccess: () => {
      toast({ title: "Account Disabled" });
      utils.security.account.listUsers.invalidate();
    },
  });

  const enableAccount = trpc.security.account.enableAccount.useMutation({
    onSuccess: () => {
      toast({ title: "Account Enabled" });
      utils.security.account.listUsers.invalidate();
    },
  });

  const suspendAccount = trpc.security.account.suspendAccount.useMutation({
    onSuccess: () => {
      toast({ title: "Account Suspended" });
      utils.security.account.listUsers.invalidate();
    },
  });

  const [accountAction, setAccountAction] = useState<{ userId: number; action: string; reason?: string } | null>(null);

  // ============================================================================
  // RBAC TAB
  // ============================================================================
  const { data: roles } = trpc.security.rbac.listRoles.useQuery();
  const { data: modules } = trpc.security.rbac.listModulePermissions.useQuery();

  const createRole = trpc.security.rbac.createRole.useMutation({
    onSuccess: () => {
      toast({ title: "Role Created" });
      utils.security.rbac.listRoles.invalidate();
    },
  });

  const [newRole, setNewRole] = useState({ roleName: "", displayName: "", description: "" });

  // ============================================================================
  // AUDIT LOGS TAB
  // ============================================================================
  const { data: auditLogs } = trpc.security.auditLogs.list.useQuery({
    limit: 50,
  });

  // ============================================================================
  // SESSIONS TAB
  // ============================================================================
  const terminateSession = trpc.security.sessions.terminateSession.useMutation({
    onSuccess: () => {
      toast({ title: "Session Terminated" });
      utils.security.sessions.listAllSessions.invalidate();
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Manage system security, users, and permissions</p>
        </div>
        <Button onClick={() => seedSystem.mutate()} disabled={seedSystem.isPending}>
          <Shield className="mr-2 h-4 w-4" />
          Initialize Security System
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals
            {pendingApprovals && pendingApprovals.length > 0 && (
              <Badge className="ml-2" variant="destructive">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="rbac">RBAC</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApprovals?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Users awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSessions?.filter((s) => s.isActive).length || 0}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditStats?.failedLoginAttempts || 0}</div>
                <p className="text-xs text-muted-foreground">Total failed attempts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MFA Enrollments</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{auditStats?.mfaEnrollments || 0}</div>
                <p className="text-xs text-muted-foreground">Users with MFA</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Security Overview</CardTitle>
              <CardDescription>System security status and recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Status</span>
                  <Badge variant="default">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Security Level</span>
                  <Badge variant="default">High</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Security Scan</span>
                  <span className="text-sm text-muted-foreground">Just now</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USER APPROVALS TAB */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending User Approvals</CardTitle>
              <CardDescription>Review and approve new user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingApprovals && pendingApprovals.length > 0 ? (
                <div className="space-y-4">
                  {pendingApprovals.map((request: any) => (
                    <div key={request.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">User ID: {request.userId}</p>
                        <p className="text-sm text-muted-foreground">Requested Role: {request.requestedRole || "N/A"}</p>
                        <p className="text-sm text-muted-foreground">Justification: {request.justification || "None provided"}</p>
                        <p className="text-xs text-muted-foreground">
                          Requested: {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveUser.mutate({ userId: request.userId })}
                          disabled={approveUser.isPending}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="destructive" onClick={() => setSelectedUserId(request.userId)}>
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reject User</DialogTitle>
                              <DialogDescription>Provide a reason for rejection</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Rejection Reason</Label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Enter reason for rejection..."
                                />
                              </div>
                              <Button
                                onClick={() => {
                                  if (selectedUserId && rejectionReason) {
                                    rejectUser.mutate({ userId: selectedUserId, reviewNotes: rejectionReason });
                                    setRejectionReason("");
                                    setSelectedUserId(null);
                                  }
                                }}
                                disabled={!rejectionReason || rejectUser.isPending}
                              >
                                Confirm Rejection
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No pending approvals</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNT MANAGEMENT TAB */}
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>Manage user account status and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {users?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{user.name || `User ${user.id}`}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={user.accountStatus === "active" ? "default" : "destructive"}>
                          {user.accountStatus}
                        </Badge>
                        <Badge variant={user.approvalStatus === "approved" ? "default" : "secondary"}>
                          {user.approvalStatus}
                        </Badge>
                        {user.mfaEnabled && (
                          <Badge variant="outline">
                            <Key className="mr-1 h-3 w-3" />
                            MFA
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.accountStatus === "active" && (
                        <>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                Disable
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Disable Account</DialogTitle>
                                <DialogDescription>Provide a reason for disabling this account</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Reason for disabling..."
                                  onChange={(e) => setAccountAction({ userId: user.id, action: "disable", reason: e.target.value })}
                                />
                                <Button
                                  onClick={() => {
                                    if (accountAction?.reason) {
                                      disableAccount.mutate({ userId: user.id, reason: accountAction.reason });
                                      setAccountAction(null);
                                    }
                                  }}
                                  disabled={!accountAction?.reason}
                                >
                                  Confirm Disable
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Suspend
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Suspend Account</DialogTitle>
                                <DialogDescription>Temporarily suspend this account</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Reason for suspension..."
                                  onChange={(e) => setAccountAction({ userId: user.id, action: "suspend", reason: e.target.value })}
                                />
                                <Button
                                  onClick={() => {
                                    if (accountAction?.reason) {
                                      suspendAccount.mutate({ userId: user.id, reason: accountAction.reason });
                                      setAccountAction(null);
                                    }
                                  }}
                                  disabled={!accountAction?.reason}
                                >
                                  Confirm Suspend
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                      {(user.accountStatus === "disabled" || user.accountStatus === "suspended") && (
                        <Button size="sm" onClick={() => enableAccount.mutate({ userId: user.id })}>
                          Enable
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RBAC TAB */}
        <TabsContent value="rbac" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
              <CardDescription>Manage roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Shield className="mr-2 h-4 w-4" />
                      Create New Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Custom Role</DialogTitle>
                      <DialogDescription>Define a new role with custom permissions</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Role Name</Label>
                        <Input
                          value={newRole.roleName}
                          onChange={(e) => setNewRole({ ...newRole, roleName: e.target.value })}
                          placeholder="e.g., data_analyst"
                        />
                      </div>
                      <div>
                        <Label>Display Name</Label>
                        <Input
                          value={newRole.displayName}
                          onChange={(e) => setNewRole({ ...newRole, displayName: e.target.value })}
                          placeholder="e.g., Data Analyst"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newRole.description}
                          onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                          placeholder="Role description..."
                        />
                      </div>
                      <Button
                        onClick={() => {
                          createRole.mutate(newRole);
                          setNewRole({ roleName: "", displayName: "", description: "" });
                        }}
                        disabled={!newRole.roleName || !newRole.displayName}
                      >
                        Create Role
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="space-y-2">
                  <h3 className="font-medium">Existing Roles</h3>
                  {roles?.map((role: any) => (
                    <div key={role.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{role.displayName}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                        {role.isSystemRole && <Badge variant="outline">System Role</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIT LOGS TAB */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Logs</CardTitle>
              <CardDescription>Track all security-related events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs?.map((log: any) => (
                  <div key={log.id} className="flex items-start justify-between border-b pb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.severity === "high" || log.severity === "critical" ? "destructive" : "default"}>
                          {log.severity}
                        </Badge>
                        <span className="font-medium">{log.eventType}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{log.eventDescription}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.createdAt).toLocaleString()} • User ID: {log.userId || "System"} • IP: {log.ipAddress || "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SESSIONS TAB */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Monitor and manage user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeSessions?.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">User ID: {session.userId}</p>
                      <p className="text-sm text-muted-foreground">{session.deviceName || "Unknown Device"}</p>
                      <p className="text-xs text-muted-foreground">
                        IP: {session.ipAddress} • Last Activity: {new Date(session.lastActivity).toLocaleString()}
                      </p>
                      <Badge variant={session.isActive ? "default" : "secondary"}>
                        {session.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {session.isActive && (
                      <Button size="sm" variant="destructive" onClick={() => terminateSession.mutate({ sessionId: session.id })}>
                        <Lock className="mr-1 h-4 w-4" />
                        Terminate
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
