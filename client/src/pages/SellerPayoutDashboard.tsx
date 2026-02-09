import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';

export const SellerPayoutDashboard: React.FC = () => {
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutMethod, setPayoutMethod] = useState<'bank_transfer' | 'mobile_money' | 'check'>('bank_transfer');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [earlyPayoutAmount, setEarlyPayoutAmount] = useState<string>('');

  const utils = trpc.useUtils();

  // Fetch payout data
  const { data: summary, isLoading: summaryLoading } = trpc.settlementTaxPayout.getPayoutSummary.useQuery({});
  const { data: history, isLoading: historyLoading } = trpc.settlementTaxPayout.getPayoutHistory.useQuery({ limit: 20 });
  const { data: earlyRequests } = trpc.settlementTaxPayout.getEarlyPayoutRequests.useQuery({});

  // Mutations
  const requestPayoutMutation = trpc.settlementTaxPayout.requestPayout.useMutation({
    onSuccess: () => {
      toast.success('Payout request submitted successfully');
      setPayoutAmount('');
      setBankAccount('');
      setMobileNumber('');
      utils.settlementTaxPayout.getPayoutSummary.invalidate();
      utils.settlementTaxPayout.getPayoutHistory.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to request payout');
    },
  });

  const requestEarlyPayoutMutation = trpc.settlementTaxPayout.requestEarlyPayout.useMutation({
    onSuccess: () => {
      toast.success('Early payout request submitted. A 2% fee will be applied.');
      setEarlyPayoutAmount('');
      utils.settlementTaxPayout.getEarlyPayoutRequests.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to request early payout');
    },
  });

  const handleRequestPayout = () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      toast.error('Please enter a valid payout amount');
      return;
    }

    if (payoutMethod === 'bank_transfer' && !bankAccount) {
      toast.error('Please enter your bank account number');
      return;
    }

    if (payoutMethod === 'mobile_money' && !mobileNumber) {
      toast.error('Please enter your mobile number');
      return;
    }

    requestPayoutMutation.mutate({
      amount: parseFloat(payoutAmount),
      payoutMethod,
      bankAccount: payoutMethod === 'bank_transfer' ? bankAccount : undefined,
      mobileNumber: payoutMethod === 'mobile_money' ? mobileNumber : undefined,
    });
  };

  const handleRequestEarlyPayout = () => {
    if (!earlyPayoutAmount || parseFloat(earlyPayoutAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    requestEarlyPayoutMutation.mutate({
      amount: parseFloat(earlyPayoutAmount),
    });
  };

  if (summaryLoading) {
    return <div className="p-4">Loading payout dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Seller Payout Dashboard</h1>
        <p className="text-gray-600">Manage your payouts and view payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GH₵{summary?.availableBalance.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-gray-600">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GH₵{summary?.pendingAmount.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-gray-600">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payout</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.lastPayoutDate ? new Date(summary.lastPayoutDate).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs text-gray-600">Most recent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.nextPayoutDate ? new Date(summary.nextPayoutDate).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs text-gray-600">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="request" className="w-full">
        <TabsList>
          <TabsTrigger value="request">Request Payout</TabsTrigger>
          <TabsTrigger value="early">Early Payout</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Request Payout */}
        <TabsContent value="request">
          <Card>
            <CardHeader>
              <CardTitle>Request Standard Payout</CardTitle>
              <CardDescription>Request your monthly payout (minimum GH₵50)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payout Amount (GH₵)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  min="50"
                  step="0.01"
                />
                <p className="text-xs text-gray-600">
                  Available: GH₵{summary?.availableBalance.toFixed(2) || '0.00'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payout Method</label>
                <Select value={payoutMethod} onValueChange={(value: any) => setPayoutMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {payoutMethod === 'bank_transfer' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bank Account Number</label>
                  <Input
                    placeholder="Enter your bank account number"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
              )}

              {payoutMethod === 'mobile_money' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Money Number</label>
                  <Input
                    placeholder="Enter your mobile money number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>
              )}

              <Button
                onClick={handleRequestPayout}
                disabled={requestPayoutMutation.isPending}
                className="w-full"
              >
                {requestPayoutMutation.isPending ? 'Processing...' : 'Request Payout'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Early Payout */}
        <TabsContent value="early">
          <Card>
            <CardHeader>
              <CardTitle>Request Early Payout</CardTitle>
              <CardDescription>Get your funds faster with a 2% fee (minimum GH₵100)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>2% fee</strong> will be deducted from your payout amount. Funds typically arrive within 24 hours.
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Early Payout Amount (GH₵)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={earlyPayoutAmount}
                  onChange={(e) => setEarlyPayoutAmount(e.target.value)}
                  min="100"
                  step="0.01"
                />
                <p className="text-xs text-gray-600">
                  Available: GH₵{summary?.availableBalance.toFixed(2) || '0.00'}
                </p>
              </div>

              {earlyPayoutAmount && (
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Requested Amount:</span>
                    <span className="font-medium">GH₵{parseFloat(earlyPayoutAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee (2%):</span>
                    <span className="font-medium text-red-600">-GH₵{(parseFloat(earlyPayoutAmount) * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between text-sm font-bold">
                    <span>You will receive:</span>
                    <span className="text-green-600">GH₵{(parseFloat(earlyPayoutAmount) * 0.98).toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleRequestEarlyPayout}
                disabled={requestEarlyPayoutMutation.isPending}
                className="w-full"
              >
                {requestEarlyPayoutMutation.isPending ? 'Processing...' : 'Request Early Payout'}
              </Button>
            </CardContent>
          </Card>

          {/* Early Payout Requests */}
          {earlyRequests && earlyRequests.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Early Payout Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {earlyRequests.map((request) => (
                    <div key={request.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">GH₵{request.netAmount.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(request.requestDate).toLocaleDateString()} • {request.status}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your recent payout transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Method</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(history?.payouts || []).map((payout) => (
                      <tr key={payout.id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{new Date(payout.requestedDate).toLocaleDateString()}</td>
                        <td className="py-2 font-medium">GH₵{payout.amount.toFixed(2)}</td>
                        <td className="py-2 capitalize">{payout.payoutMethod.replace('_', ' ')}</td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              payout.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : payout.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : payout.status === 'processing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-2 text-gray-600">{payout.transactionId || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(!history?.payouts || history.payouts.length === 0) && (
                <div className="text-center py-8 text-gray-600">
                  <p>No payout history yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Payouts</p>
              <p className="text-xl font-bold">{history?.totalPayouts || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold">GH₵{history?.totalAmount.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold text-green-600">GH₵{history?.completedAmount.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Minimum Amount</p>
              <p className="text-xl font-bold">GH₵{summary?.minimumPayoutAmount || '50'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
