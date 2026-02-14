'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Target, Award, AlertCircle, CheckCircle, Clock, BarChart3, LineChart as LineChartIcon } from 'lucide-react';

interface WorkerPerformance {
  workerId: number;
  workerName: string;
  currentEfficiency: number;
  efficiencyTrend: number;
  completionRate: number;
  completionTrend: number;
  qualityRating: number;
  qualityTrend: number;
  tasksCompleted: number;
  averageTimeAccuracy: number;
  improvementAreas: string[];
  strengths: string[];
  lastUpdated: string;
}

interface PerformanceMetric {
  date: string;
  efficiency: number;
  completionRate: number;
  qualityRating: number;
}

interface PerformanceComparison {
  metric: string;
  yourValue: number;
  farmAverage: number;
  topPerformer: number;
}

export const WorkerPerformanceTrends = () => {
  const [selectedWorker, setSelectedWorker] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'trends' | 'comparison'>('overview');

  const workers = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Maria Garcia' },
    { id: 3, name: 'Ahmed Hassan' },
    { id: 4, name: 'Sarah Johnson' },
    { id: 5, name: 'David Chen' },
    { id: 6, name: 'Emma Wilson' },
  ];

  // Mock performance data
  const performanceData: Record<number, WorkerPerformance> = {
    1: {
      workerId: 1,
      workerName: 'John Smith',
      currentEfficiency: 92,
      efficiencyTrend: 5,
      completionRate: 94,
      completionTrend: 3,
      qualityRating: 4.3,
      qualityTrend: 0.2,
      tasksCompleted: 156,
      averageTimeAccuracy: 96,
      improvementAreas: ['Reduce task overruns on complex assignments'],
      strengths: ['Consistent quality', 'High reliability', 'Good time management'],
      lastUpdated: '2026-02-14T10:30:00',
    },
    2: {
      workerId: 2,
      workerName: 'Maria Garcia',
      currentEfficiency: 78,
      efficiencyTrend: -8,
      completionRate: 85,
      completionTrend: -5,
      qualityRating: 3.8,
      qualityTrend: -0.3,
      tasksCompleted: 142,
      averageTimeAccuracy: 82,
      improvementAreas: ['Improve task efficiency', 'Reduce time overruns', 'Quality consistency'],
      strengths: ['Good communication', 'Reliable attendance'],
      lastUpdated: '2026-02-14T10:30:00',
    },
    3: {
      workerId: 3,
      workerName: 'Ahmed Hassan',
      currentEfficiency: 96,
      efficiencyTrend: 8,
      completionRate: 98,
      completionTrend: 4,
      qualityRating: 4.7,
      qualityTrend: 0.3,
      tasksCompleted: 178,
      averageTimeAccuracy: 99,
      improvementAreas: [],
      strengths: ['Exceptional efficiency', 'Outstanding quality', 'Excellent reliability', 'Top performer'],
      lastUpdated: '2026-02-14T10:30:00',
    },
    4: {
      workerId: 4,
      workerName: 'Sarah Johnson',
      currentEfficiency: 85,
      efficiencyTrend: 2,
      completionRate: 88,
      completionTrend: 1,
      qualityRating: 4.1,
      qualityTrend: 0.1,
      tasksCompleted: 149,
      averageTimeAccuracy: 89,
      improvementAreas: ['Increase task completion rate', 'Improve efficiency on routine tasks'],
      strengths: ['Good quality output', 'Consistent performer', 'Team player'],
      lastUpdated: '2026-02-14T10:30:00',
    },
    5: {
      workerId: 5,
      workerName: 'David Chen',
      currentEfficiency: 88,
      efficiencyTrend: 3,
      completionRate: 91,
      completionTrend: 2,
      qualityRating: 4.2,
      qualityTrend: 0.2,
      tasksCompleted: 163,
      averageTimeAccuracy: 93,
      improvementAreas: ['Reduce occasional quality variations'],
      strengths: ['Strong efficiency', 'High completion rate', 'Good quality'],
      lastUpdated: '2026-02-14T10:30:00',
    },
    6: {
      workerId: 6,
      workerName: 'Emma Wilson',
      currentEfficiency: 81,
      efficiencyTrend: -2,
      completionRate: 86,
      completionTrend: 0,
      qualityRating: 4.0,
      qualityTrend: 0,
      tasksCompleted: 145,
      averageTimeAccuracy: 87,
      improvementAreas: ['Improve task efficiency', 'Increase completion rate'],
      strengths: ['Consistent quality', 'Reliable worker', 'Good attitude'],
      lastUpdated: '2026-02-14T10:30:00',
    },
  };

  // Mock historical trend data
  const trendData: PerformanceMetric[] = [
    { date: '2026-01-15', efficiency: 88, completionRate: 90, qualityRating: 4.1 },
    { date: '2026-01-22', efficiency: 89, completionRate: 91, qualityRating: 4.2 },
    { date: '2026-01-29', efficiency: 90, completionRate: 92, qualityRating: 4.2 },
    { date: '2026-02-05', efficiency: 91, completionRate: 93, qualityRating: 4.3 },
    { date: '2026-02-12', efficiency: 92, completionRate: 94, qualityRating: 4.3 },
    { date: '2026-02-14', efficiency: 92, completionRate: 94, qualityRating: 4.3 },
  ];

  // Mock comparison data
  const comparisonData: PerformanceComparison[] = [
    { metric: 'Efficiency', yourValue: 92, farmAverage: 87, topPerformer: 96 },
    { metric: 'Completion Rate', yourValue: 94, farmAverage: 89, topPerformer: 98 },
    { metric: 'Quality Rating', yourValue: 4.3, farmAverage: 4.1, topPerformer: 4.7 },
    { metric: 'Time Accuracy', yourValue: 96, farmAverage: 91, topPerformer: 99 },
  ];

  const performance = performanceData[selectedWorker];

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Clock className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPerformanceLevel = (value: number) => {
    if (value >= 95) return { label: 'Exceptional', color: 'bg-green-100 text-green-800' };
    if (value >= 85) return { label: 'Strong', color: 'bg-blue-100 text-blue-800' };
    if (value >= 75) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Worker Performance Trends</h1>
        <p className="text-gray-600">Analyze worker performance metrics, identify trends, and track improvement</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium">Select Worker</label>
          <Select value={selectedWorker.toString()} onValueChange={(val) => setSelectedWorker(parseInt(val))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workers.map(w => (
                <SelectItem key={w.id} value={w.id.toString()}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium">Time Range</label>
          <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Efficiency</span>
              {getTrendIcon(performance.efficiencyTrend)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{performance.currentEfficiency}%</p>
            <p className={`text-xs mt-2 ${getTrendColor(performance.efficiencyTrend)}`}>
              {performance.efficiencyTrend > 0 ? '+' : ''}{performance.efficiencyTrend}% from last period
            </p>
            <Badge className={`mt-3 ${getPerformanceLevel(performance.currentEfficiency).color}`}>
              {getPerformanceLevel(performance.currentEfficiency).label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Completion Rate</span>
              {getTrendIcon(performance.completionTrend)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{performance.completionRate}%</p>
            <p className={`text-xs mt-2 ${getTrendColor(performance.completionTrend)}`}>
              {performance.completionTrend > 0 ? '+' : ''}{performance.completionTrend}% from last period
            </p>
            <Badge className={`mt-3 ${getPerformanceLevel(performance.completionRate).color}`}>
              {getPerformanceLevel(performance.completionRate).label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              <span>Quality Rating</span>
              {getTrendIcon(performance.qualityTrend * 10)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{performance.qualityRating.toFixed(1)}/5</p>
            <p className={`text-xs mt-2 ${getTrendColor(performance.qualityTrend * 10)}`}>
              {performance.qualityTrend > 0 ? '+' : ''}{performance.qualityTrend.toFixed(1)} from last period
            </p>
            <Badge className={`mt-3 ${getPerformanceLevel(performance.qualityRating * 20).color}`}>
              {getPerformanceLevel(performance.qualityRating * 20).label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{performance.tasksCompleted}</p>
            <p className="text-xs text-gray-600 mt-2">
              Avg. {(performance.tasksCompleted / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90)).toFixed(1)} tasks/day
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Time Accuracy: {performance.averageTimeAccuracy}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performance.strengths.length > 0 ? (
                    performance.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm">{strength}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No specific strengths identified</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Improvement Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" /> Improvement Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {performance.improvementAreas.length > 0 ? (
                    performance.improvementAreas.map((area, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                        <p className="text-sm">{area}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-green-600 font-semibold">No improvement areas - Excellent performance!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" /> Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {performance.currentEfficiency < 85 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-semibold text-yellow-900">Efficiency Training</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      Consider providing efficiency training focused on time management and workflow optimization.
                    </p>
                  </div>
                )}
                {performance.completionRate < 85 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-semibold text-yellow-900">Task Completion Support</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      Review task assignments and provide support to improve completion rates.
                    </p>
                  </div>
                )}
                {performance.qualityRating < 4.0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-semibold text-red-900">Quality Improvement Program</p>
                    <p className="text-sm text-red-800 mt-1">
                      Implement quality improvement training and increase supervision on critical tasks.
                    </p>
                  </div>
                )}
                {performance.currentEfficiency >= 95 && performance.completionRate >= 95 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-semibold text-green-900">Recognition & Development</p>
                    <p className="text-sm text-green-800 mt-1">
                      Recognize this worker's exceptional performance. Consider for leadership roles or advanced assignments.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5" /> Performance Trends ({timeRange})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Efficiency Trend */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Efficiency Trend</h4>
                    <span className="text-sm text-gray-600">88% → 92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Steady improvement over the period</p>
                </div>

                {/* Completion Rate Trend */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Completion Rate Trend</h4>
                    <span className="text-sm text-gray-600">90% → 94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Consistent upward trend</p>
                </div>

                {/* Quality Rating Trend */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">Quality Rating Trend</h4>
                    <span className="text-sm text-gray-600">4.1 → 4.3</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '86%' }}></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Slight improvement in quality</p>
                </div>

                {/* Historical Data Table */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Weekly Performance Data</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Week</th>
                          <th className="px-3 py-2 text-left">Efficiency</th>
                          <th className="px-3 py-2 text-left">Completion</th>
                          <th className="px-3 py-2 text-left">Quality</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trendData.map((data, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-3 py-2">{new Date(data.date).toLocaleDateString()}</td>
                            <td className="px-3 py-2">{data.efficiency}%</td>
                            <td className="px-3 py-2">{data.completionRate}%</td>
                            <td className="px-3 py-2">{data.qualityRating.toFixed(1)}/5</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> Performance Comparison
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">How {performance.workerName} compares to farm averages and top performers</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {comparisonData.map((comp, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{comp.metric}</h4>
                      <div className="flex gap-4 text-xs">
                        <span className="text-gray-600">Avg: {comp.farmAverage}</span>
                        <span className="text-green-600 font-semibold">Top: {comp.topPerformer}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-20">{performance.workerName}</span>
                        <div className="flex-1 bg-gray-200 rounded h-6 relative">
                          <div
                            className="bg-blue-600 h-6 rounded flex items-center justify-center text-xs font-semibold text-white"
                            style={{ width: `${Math.min((comp.yourValue / comp.topPerformer) * 100, 100)}%` }}
                          >
                            {comp.yourValue}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-20">Farm Avg</span>
                        <div className="flex-1 bg-gray-100 rounded h-6 relative">
                          <div
                            className="bg-gray-400 h-6 rounded flex items-center justify-center text-xs font-semibold text-white"
                            style={{ width: `${Math.min((comp.farmAverage / comp.topPerformer) * 100, 100)}%` }}
                          >
                            {comp.farmAverage}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-20">Top Performer</span>
                        <div className="flex-1 bg-gray-200 rounded h-6 relative">
                          <div
                            className="bg-green-600 h-6 rounded flex items-center justify-center text-xs font-semibold text-white"
                            style={{ width: '100%' }}
                          >
                            {comp.topPerformer}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ranking */}
          <Card>
            <CardHeader>
              <CardTitle>Farm Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workers.map((worker, idx) => (
                  <div key={worker.id} className={`p-3 rounded border flex items-center justify-between ${selectedWorker === worker.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-gray-600">#{idx + 1}</span>
                      <span className="font-medium">{worker.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{performanceData[worker.id].currentEfficiency}%</span>
                      {performanceData[worker.id].currentEfficiency >= 95 && (
                        <Award className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkerPerformanceTrends;
