import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardPreferences, DashboardPreferences } from '@/hooks/useDashboardPreferences';
import { trpc } from '@/lib/trpc';

interface DashboardPreferencesSettingsProps {
  onClose?: () => void;
}

export const DashboardPreferencesSettings = ({ onClose }: DashboardPreferencesSettingsProps) => {
  const { preferences, setKPIVisibility, setDefaultFarmId, resetPreferences } = useDashboardPreferences();
  const { data: farms } = trpc.farms.list.useQuery();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleKPIToggle = (kpi: keyof DashboardPreferences['visibleKPIs']) => {
    setKPIVisibility(kpi, !preferences.visibleKPIs[kpi]);
  };

  const handleResetPreferences = () => {
    resetPreferences();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KPI Display Settings</CardTitle>
          <CardDescription>Choose which KPIs to display on your home dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="revenue"
                checked={preferences.visibleKPIs.revenue}
                onCheckedChange={() => handleKPIToggle('revenue')}
              />
              <Label htmlFor="revenue" className="cursor-pointer">Total Revenue</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expenses"
                checked={preferences.visibleKPIs.expenses}
                onCheckedChange={() => handleKPIToggle('expenses')}
              />
              <Label htmlFor="expenses" className="cursor-pointer">Total Expenses</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="profit"
                checked={preferences.visibleKPIs.profit}
                onCheckedChange={() => handleKPIToggle('profit')}
              />
              <Label htmlFor="profit" className="cursor-pointer">Net Profit</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="animals"
                checked={preferences.visibleKPIs.animals}
                onCheckedChange={() => handleKPIToggle('animals')}
              />
              <Label htmlFor="animals" className="cursor-pointer">Active Animals</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="workers"
                checked={preferences.visibleKPIs.workers}
                onCheckedChange={() => handleKPIToggle('workers')}
              />
              <Label htmlFor="workers" className="cursor-pointer">Active Workers</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ponds"
                checked={preferences.visibleKPIs.ponds}
                onCheckedChange={() => handleKPIToggle('ponds')}
              />
              <Label htmlFor="ponds" className="cursor-pointer">Active Fish Ponds</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="assets"
                checked={preferences.visibleKPIs.assets}
                onCheckedChange={() => handleKPIToggle('assets')}
              />
              <Label htmlFor="assets" className="cursor-pointer">Active Assets</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Farm Selection</CardTitle>
          <CardDescription>Choose your default farm for dashboard display</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={preferences.defaultFarmId?.toString() || 'all'}
            onValueChange={(value) => {
              if (value === 'all') {
                setDefaultFarmId(null);
              } else {
                setDefaultFarmId(parseInt(value, 10));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select default farm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Farms</SelectItem>
              {farms?.map((farm) => (
                <SelectItem key={farm.id} value={farm.id.toString()}>
                  {farm.farmName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reset Preferences</CardTitle>
          <CardDescription>Restore all settings to their default values</CardDescription>
        </CardHeader>
        <CardContent>
          {showResetConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to reset all dashboard preferences to their defaults?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleResetPreferences}
                >
                  Confirm Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(true)}
            >
              Reset to Defaults
            </Button>
          )}
        </CardContent>
      </Card>

      {onClose && (
        <Button onClick={onClose} className="w-full">
          Close Settings
        </Button>
      )}
    </div>
  );
};
