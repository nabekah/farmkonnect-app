import { useState, useEffect } from 'react';

export interface DashboardPreferences {
  selectedFarmId: number | null;
  visibleKPIs: {
    revenue: boolean;
    expenses: boolean;
    profit: boolean;
    animals: boolean;
    workers: boolean;
    ponds: boolean;
    assets: boolean;
  };
  defaultFarmId?: number | null;
}

const DEFAULT_PREFERENCES: DashboardPreferences = {
  selectedFarmId: null,
  visibleKPIs: {
    revenue: true,
    expenses: true,
    profit: true,
    animals: true,
    workers: true,
    ponds: true,
    assets: true,
  },
};

export const useDashboardPreferences = () => {
  const [preferences, setPreferences] = useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('dashboardPreferences');
    if (stored) {
      try {
        setPreferences(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse dashboard preferences:', error);
        setPreferences(DEFAULT_PREFERENCES);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage whenever they change
  const updatePreferences = (newPreferences: Partial<DashboardPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem('dashboardPreferences', JSON.stringify(updated));
  };

  // Update selected farm
  const setSelectedFarmId = (farmId: number | null) => {
    updatePreferences({ selectedFarmId: farmId });
  };

  // Update KPI visibility
  const setKPIVisibility = (kpi: keyof DashboardPreferences['visibleKPIs'], visible: boolean) => {
    updatePreferences({
      visibleKPIs: {
        ...preferences.visibleKPIs,
        [kpi]: visible,
      },
    });
  };

  // Set default farm
  const setDefaultFarmId = (farmId: number | null) => {
    updatePreferences({ defaultFarmId: farmId });
  };

  // Reset to defaults
  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem('dashboardPreferences');
  };

  return {
    preferences,
    isLoaded,
    updatePreferences,
    setSelectedFarmId,
    setKPIVisibility,
    setDefaultFarmId,
    resetPreferences,
  };
};
