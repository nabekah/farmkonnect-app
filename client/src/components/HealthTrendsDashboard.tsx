import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, AlertCircle } from "lucide-react";

interface HealthTrendsDashboardProps {
  farmId?: number;
}

export function HealthTrendsDashboard({ farmId }: HealthTrendsDashboardProps) {
  const [selectedBreed, setSelectedBreed] = useState<string>("");
  const [months, setMonths] = useState(6);

  const { data: vaccinationTrends } = trpc.healthTrendsAnalytics.getVaccinationTrends.useQuery({
    farmId,
    breed: selectedBreed,
    months,
  });

  const { data: healthIssuesTrends } = trpc.healthTrendsAnalytics.getHealthIssuesTrends.useQuery({
    farmId,
    breed: selectedBreed,
    months,
  });

  const { data: performanceTrends } = trpc.healthTrendsAnalytics.getPerformanceTrends.useQuery({
    farmId,
    breed: selectedBreed,
    months,
  });

  const { data: breedComparison } = trpc.healthTrendsAnalytics.getBreedHealthComparison.useQuery({
    farmId,
    months,
  });

  const { data: animalHealthScores } = trpc.healthTrendsAnalytics.getAnimalHealthScores.useQuery({
    farmId,
    limit: 10,
  });

  const { data: vaccinationCoverage } = trpc.healthTrendsAnalytics.getVaccinationCoverageReport.useQuery({
    farmId,
    breed: selectedBreed,
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 items-end">
          <div>
            <label className="text-sm font-semibold">Breed Filter</label>
            <input
              type="text"
              placeholder="All breeds"
              value={selectedBreed}
              onChange={(e) => setSelectedBreed(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold">Time Range</label>
            <select
              value={months}
              onChange={(e) => setMonths(parseInt(e.target.value))}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value={1}>Last Month</option>
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last Year</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Vaccination Trends */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5" />
          <h3 className="font-semibold">Vaccination Trends</h3>
        </div>
        {vaccinationTrends && vaccinationTrends.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Month</th>
                  <th className="text-left py-2">Vaccine</th>
                  <th className="text-right py-2">Total</th>
                  <th className="text-right py-2">Animals</th>
                  <th className="text-right py-2">Completed</th>
                </tr>
              </thead>
              <tbody>
                {vaccinationTrends.slice(0, 10).map((trend: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2">{trend.month}</td>
                    <td className="py-2">{trend.vaccineName}</td>
                    <td className="text-right py-2">{trend.totalVaccinations}</td>
                    <td className="text-right py-2">{trend.animalsVaccinated}</td>
                    <td className="text-right py-2">{trend.completedCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No vaccination data available</p>
        )}
      </Card>

      {/* Health Issues Trends */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-semibold">Health Issues Trends</h3>
        </div>
        {healthIssuesTrends && healthIssuesTrends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthIssuesTrends.slice(0, 6).map((trend: any, idx: number) => (
              <Card key={idx} className="p-3 bg-gray-50">
                <p className="text-sm font-semibold">{trend.month}</p>
                <div className="text-xs text-gray-600 space-y-1 mt-2">
                  <p>Total Issues: {trend.totalIssues}</p>
                  <p>Animals Affected: {trend.animalsAffected}</p>
                  <p className="text-red-600">High: {trend.highSeverity}</p>
                  <p className="text-yellow-600">Medium: {trend.mediumSeverity}</p>
                  <p className="text-green-600">Low: {trend.lowSeverity}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No health issues data available</p>
        )}
      </Card>

      {/* Breed Comparison */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5" />
          <h3 className="font-semibold">Breed Health Comparison</h3>
        </div>
        {breedComparison && breedComparison.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Breed</th>
                  <th className="text-right py-2">Total</th>
                  <th className="text-right py-2">Active</th>
                  <th className="text-right py-2">Issues</th>
                  <th className="text-right py-2">Vaccination %</th>
                </tr>
              </thead>
              <tbody>
                {breedComparison.map((breed: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2">{breed.breed}</td>
                    <td className="text-right py-2">{breed.totalAnimals}</td>
                    <td className="text-right py-2">{breed.activeAnimals}</td>
                    <td className="text-right py-2">{breed.healthIssuesCount}</td>
                    <td className="text-right py-2">{breed.vaccinationCoveragePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No breed comparison data available</p>
        )}
      </Card>

      {/* Animal Health Scores */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Animals Needing Attention</h3>
        {animalHealthScores && animalHealthScores.length > 0 ? (
          <div className="space-y-2">
            {animalHealthScores.slice(0, 5).map((animal: any) => (
              <div key={animal.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold text-sm">{animal.tagId}</p>
                  <p className="text-xs text-gray-600">{animal.breed} - {animal.gender}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">{animal.healthScore}/100</p>
                  <p className={`text-xs ${
                    animal.healthStatus === "critical" ? "text-red-600" :
                    animal.healthStatus === "poor" ? "text-orange-600" :
                    animal.healthStatus === "fair" ? "text-yellow-600" :
                    "text-green-600"
                  }`}>
                    {animal.healthStatus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No animal data available</p>
        )}
      </Card>

      {/* Vaccination Coverage Report */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Vaccination Coverage Report</h3>
        {vaccinationCoverage && vaccinationCoverage.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Vaccine</th>
                  <th className="text-right py-2">Coverage %</th>
                  <th className="text-right py-2">Vaccinated</th>
                  <th className="text-right py-2">Pending</th>
                  <th className="text-right py-2">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {vaccinationCoverage.map((vac: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2">{vac.vaccineName}</td>
                    <td className="text-right py-2">
                      <span className={vac.coveragePercent >= 80 ? "text-green-600" : "text-orange-600"}>
                        {vac.coveragePercent}%
                      </span>
                    </td>
                    <td className="text-right py-2">{vac.vaccinatedAnimals}</td>
                    <td className="text-right py-2">{vac.pendingAnimals}</td>
                    <td className="text-right py-2 text-red-600">{vac.overdueAnimals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No vaccination data available</p>
        )}
      </Card>
    </div>
  );
}
