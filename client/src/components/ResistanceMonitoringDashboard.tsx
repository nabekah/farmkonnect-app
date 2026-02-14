import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ResistancePattern {
  pestDiseaseName: string;
  treatmentName: string;
  resistanceLevel: 'susceptible' | 'low' | 'moderate' | 'high' | 'extreme';
  averageEffectiveness: number;
  trendDirection: 'improving' | 'stable' | 'declining';
  recordCount: number;
  confidenceScore: number;
}

interface ResistanceAlert {
  id: string;
  severity: 'warning' | 'critical';
  pestDiseaseName: string;
  treatmentName: string;
  message: string;
  detectedDate: string;
}

const RESISTANCE_COLORS = {
  susceptible: '#10b981',
  low: '#84cc16',
  moderate: '#f59e0b',
  high: '#ef4444',
  extreme: '#7c3aed',
};

export function ResistanceMonitoringDashboard() {
  const [selectedTreatment, setSelectedTreatment] = useState<ResistancePattern | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const patterns: ResistancePattern[] = [
    {
      pestDiseaseName: 'Rice Blast',
      treatmentName: 'Tricyclazole',
      resistanceLevel: 'high',
      averageEffectiveness: 45,
      trendDirection: 'declining',
      recordCount: 12,
      confidenceScore: 92,
    },
    {
      pestDiseaseName: 'Rice Stem Borer',
      treatmentName: 'Carbofuran',
      resistanceLevel: 'moderate',
      averageEffectiveness: 68,
      trendDirection: 'stable',
      recordCount: 8,
      confidenceScore: 78,
    },
    {
      pestDiseaseName: 'Wheat Rust',
      treatmentName: 'Propiconazole',
      resistanceLevel: 'low',
      averageEffectiveness: 82,
      trendDirection: 'improving',
      recordCount: 6,
      confidenceScore: 65,
    },
    {
      pestDiseaseName: 'Corn Leaf Blight',
      treatmentName: 'Azoxystrobin',
      resistanceLevel: 'susceptible',
      averageEffectiveness: 91,
      trendDirection: 'stable',
      recordCount: 5,
      confidenceScore: 58,
    },
  ];

  const alerts: ResistanceAlert[] = [
    {
      id: '1',
      severity: 'critical',
      pestDiseaseName: 'Rice Blast',
      treatmentName: 'Tricyclazole',
      message: 'EXTREME resistance detected. Stop using immediately.',
      detectedDate: '2026-02-12',
    },
    {
      id: '2',
      severity: 'warning',
      pestDiseaseName: 'Rice Stem Borer',
      treatmentName: 'Carbofuran',
      message: 'Moderate resistance detected. Plan rotation strategy.',
      detectedDate: '2026-02-10',
    },
  ];

  const effectivenessTrend = [
    { month: 'Aug', effectiveness: 88, recordCount: 2 },
    { month: 'Sep', effectiveness: 82, recordCount: 3 },
    { month: 'Oct', effectiveness: 75, recordCount: 2 },
    { month: 'Nov', effectiveness: 62, recordCount: 2 },
    { month: 'Dec', effectiveness: 48, recordCount: 2 },
    { month: 'Jan', effectiveness: 45, recordCount: 1 },
  ];

  const resistanceDistribution = [
    { name: 'Susceptible', value: 1, fill: '#10b981' },
    { name: 'Low', value: 1, fill: '#84cc16' },
    { name: 'Moderate', value: 1, fill: '#f59e0b' },
    { name: 'High', value: 1, fill: '#ef4444' },
  ];

  const filteredPatterns = filterLevel === 'all'
    ? patterns
    : patterns.filter(p => p.resistanceLevel === filterLevel);

  const getResistanceColor = (level: string) => RESISTANCE_COLORS[level as keyof typeof RESISTANCE_COLORS] || '#gray';

  const getTrendIcon = (direction: string) => {
    if (direction === 'improving') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (direction === 'declining') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <span className="w-4 h-4 text-gray-600">—</span>;
  };

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Resistance Monitoring</h1>
        <p className="text-gray-600 mt-1">Track treatment effectiveness and detect emerging resistance patterns</p>
      </div>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map(alert => (
            <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'}>
              <AlertCircle className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'}`} />
              <AlertDescription className={alert.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'}>
                <strong>{alert.pestDiseaseName} / {alert.treatmentName}:</strong> {alert.message}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">High Risk</p>
              <p className="text-3xl font-bold text-red-600">1</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Moderate Risk</p>
              <p className="text-3xl font-bold text-orange-600">1</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Declining</p>
              <p className="text-3xl font-bold text-red-600">1</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Improving</p>
              <p className="text-3xl font-bold text-green-600">1</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Effectiveness Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Effectiveness Trend (Rice Blast / Tricyclazole)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={effectivenessTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="effectiveness" stroke="#ef4444" strokeWidth={2} name="Effectiveness %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resistance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resistance Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resistanceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resistanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Resistance Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['all', 'susceptible', 'low', 'moderate', 'high', 'extreme'].map(level => (
              <Button
                key={level}
                variant={filterLevel === level ? 'default' : 'outline'}
                onClick={() => setFilterLevel(level)}
                className="text-xs"
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resistance Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resistance Patterns ({filteredPatterns.length})</CardTitle>
          <CardDescription>Sorted by resistance level and trend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredPatterns.map((pattern, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setSelectedTreatment(pattern)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{pattern.pestDiseaseName}</p>
                      <p className="text-sm text-gray-600">/ {pattern.treatmentName}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {pattern.recordCount} records • Confidence: {pattern.confidenceScore}%
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge style={{ backgroundColor: getResistanceColor(pattern.resistanceLevel) }} className="text-white mb-2">
                      {pattern.resistanceLevel.toUpperCase()}
                    </Badge>
                    <div className="flex items-center justify-end gap-1 text-sm">
                      {getTrendIcon(pattern.trendDirection)}
                      <span className="text-gray-600">{pattern.trendDirection}</span>
                    </div>
                  </div>
                </div>

                {/* Effectiveness Bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Effectiveness</span>
                    <span className="font-semibold">{pattern.averageEffectiveness}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${pattern.averageEffectiveness}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Pattern Details */}
      {selectedTreatment && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedTreatment.pestDiseaseName} / {selectedTreatment.treatmentName} - Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Resistance Level</p>
                <Badge style={{ backgroundColor: getResistanceColor(selectedTreatment.resistanceLevel) }} className="text-white mt-1">
                  {selectedTreatment.resistanceLevel}
                </Badge>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Average Effectiveness</p>
                <p className="text-2xl font-bold text-blue-600">{selectedTreatment.averageEffectiveness}%</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-600">Trend</p>
                <div className="flex items-center gap-1 mt-1">
                  {getTrendIcon(selectedTreatment.trendDirection)}
                  <span className="font-semibold">{selectedTreatment.trendDirection}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-semibold mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm">
                {selectedTreatment.resistanceLevel === 'high' && (
                  <>
                    <li>• Reduce treatment frequency immediately</li>
                    <li>• Rotate with alternative chemical class</li>
                    <li>• Increase application rate cautiously</li>
                  </>
                )}
                {selectedTreatment.resistanceLevel === 'moderate' && (
                  <>
                    <li>• Monitor effectiveness closely</li>
                    <li>• Plan rotation strategy</li>
                    <li>• Consider combination treatments</li>
                  </>
                )}
                {selectedTreatment.trendDirection === 'declining' && (
                  <li>• Increase monitoring frequency</li>
                )}
              </ul>
            </div>

            <Button className="w-full">View Full Analysis Report</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
