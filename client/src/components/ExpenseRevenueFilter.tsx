import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface FilterOptions {
  startDate: string;
  endDate: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
}

interface ExpenseRevenueFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  isRevenue?: boolean;
}

export function ExpenseRevenueFilter({
  onFilterChange,
  categories,
  isRevenue = false,
}: ExpenseRevenueFilterProps) {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [filters, setFilters] = useState<FilterOptions>({
    startDate: thirtyDaysAgo,
    endDate: today,
    category: '',
    minAmount: undefined,
    maxAmount: undefined,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {
      startDate: thirtyDaysAgo,
      endDate: today,
      category: '',
      minAmount: undefined,
      maxAmount: undefined,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const isFiltered = filters.category || filters.minAmount || filters.maxAmount;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {isRevenue ? 'Revenue' : 'Expense'} Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <Label htmlFor="category">
              {isRevenue ? 'Revenue Type' : 'Category'}
            </Label>
            <Select
              value={filters.category || ''}
              onValueChange={(value) => handleFilterChange('category', value || '')}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAmount">Min Amount (GHS)</Label>
              <Input
                id="minAmount"
                type="number"
                placeholder="0"
                value={filters.minAmount || ''}
                onChange={(e) =>
                  handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Max Amount (GHS)</Label>
              <Input
                id="maxAmount"
                type="number"
                placeholder="No limit"
                value={filters.maxAmount || ''}
                onChange={(e) =>
                  handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          {/* Reset Button */}
          {isFiltered && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleReset}
            >
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
