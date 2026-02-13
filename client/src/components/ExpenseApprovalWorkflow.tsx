import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  ArrowRight,
} from 'lucide-react';

interface ApprovalLevel {
  level: 'manager' | 'director' | 'cfo' | 'owner';
  title: string;
  minAmount: number;
  icon: React.ReactNode;
}

const APPROVAL_LEVELS: ApprovalLevel[] = [
  { level: 'manager', title: 'Manager', minAmount: 0, icon: <User className="w-4 h-4" /> },
  { level: 'director', title: 'Director', minAmount: 5000, icon: <User className="w-4 h-4" /> },
  { level: 'cfo', title: 'CFO', minAmount: 20000, icon: <User className="w-4 h-4" /> },
  { level: 'owner', title: 'Owner', minAmount: 50000, icon: <User className="w-4 h-4" /> },
];

interface ExpenseApprovalWorkflowProps {
  farmId: number;
}

interface PendingApproval {
  id: string;
  expenseId: number;
  amount: number;
  description: string;
  category: string;
  currentLevel: 'manager' | 'director' | 'cfo' | 'owner';
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: Date;
  approvals: {
    manager?: { approved: boolean; date?: Date; notes?: string };
    director?: { approved: boolean; date?: Date; notes?: string };
    cfo?: { approved: boolean; date?: Date; notes?: string };
    owner?: { approved: boolean; date?: Date; notes?: string };
  };
}

export function ExpenseApprovalWorkflow({ farmId }: ExpenseApprovalWorkflowProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);

  // Mock data for pending approvals
  const pendingApprovals: PendingApproval[] = [
    {
      id: 'app-001',
      expenseId: 1,
      amount: 15000,
      description: 'Equipment purchase - Tractor',
      category: 'equipment',
      currentLevel: 'director',
      status: 'pending',
      submittedDate: new Date('2026-02-10'),
      approvals: {
        manager: { approved: true, date: new Date('2026-02-11'), notes: 'Approved' },
        director: { approved: false },
      },
    },
    {
      id: 'app-002',
      expenseId: 2,
      amount: 3500,
      description: 'Feed purchase',
      category: 'feed',
      currentLevel: 'manager',
      status: 'pending',
      submittedDate: new Date('2026-02-12'),
      approvals: {
        manager: { approved: false },
      },
    },
    {
      id: 'app-003',
      expenseId: 3,
      amount: 75000,
      description: 'Land lease agreement',
      category: 'lease',
      currentLevel: 'owner',
      status: 'pending',
      submittedDate: new Date('2026-02-08'),
      approvals: {
        manager: { approved: true, date: new Date('2026-02-09') },
        director: { approved: true, date: new Date('2026-02-10') },
        cfo: { approved: true, date: new Date('2026-02-11') },
        owner: { approved: false },
      },
    },
  ];

  const filteredApprovals = pendingApprovals.filter((approval) => {
    if (filterStatus === 'all') return true;
    return approval.status === filterStatus;
  });

  const getRequiredApprovalLevel = (amount: number): ApprovalLevel => {
    for (let i = APPROVAL_LEVELS.length - 1; i >= 0; i--) {
      if (amount >= APPROVAL_LEVELS[i].minAmount) {
        return APPROVAL_LEVELS[i];
      }
    }
    return APPROVAL_LEVELS[0];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return null;
    }
  };

  const getApprovalIcon = (approved: boolean | undefined) => {
    if (approved === true) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (approved === false) {
      return <Clock className="w-5 h-5 text-yellow-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Expense Approval Workflow</CardTitle>
          <CardDescription>
            Multi-level approval process based on expense amount
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Approval Thresholds */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {APPROVAL_LEVELS.map((level) => (
              <Card key={level.level} className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    {level.icon}
                    <span className="font-semibold">{level.title}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    GHS {level.minAmount.toLocaleString()}+
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter:</span>
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pending Approvals Table */}
          {filteredApprovals.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Current Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{approval.description}</p>
                          <p className="text-sm text-gray-500">{approval.category}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        GHS {approval.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getRequiredApprovalLevel(approval.amount).title}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {approval.submittedDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApproval(approval)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">No pending approvals</p>
            </div>
          )}

          {/* Approval Details */}
          {selectedApproval && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Approval Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-semibold">{selectedApproval.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="font-semibold">GHS {selectedApproval.amount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Approval Chain */}
                <div className="space-y-3">
                  <p className="font-semibold text-sm">Approval Chain:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {APPROVAL_LEVELS.map((level, index) => {
                      const approval = selectedApproval.approvals[level.level];
                      const isRequired = selectedApproval.amount >= level.minAmount;

                      return (
                        <div key={level.level} className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${isRequired ? 'bg-blue-100' : 'bg-gray-100'}`}>
                            {getApprovalIcon(approval?.approved)}
                          </div>
                          <span className="text-sm">{level.title}</span>
                          {index < APPROVAL_LEVELS.length - 1 && (
                            <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" variant="outline">
                    Reject
                  </Button>
                  <Button className="flex-1">Approve</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
