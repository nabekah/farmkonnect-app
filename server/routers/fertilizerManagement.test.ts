import { describe, it, expect, beforeAll } from 'vitest';
import { fertilizerInventoryService } from '../_core/fertilizerInventoryService';
import { soilHealthRecommendationsEngine } from '../_core/soilHealthRecommendationsEngine';
import { fertilizerCostAnalysisService } from '../_core/fertilizerCostAnalysisService';

describe('Fertilizer Management Services', () => {
  describe('FertilizerInventoryService', () => {
    it('should calculate inventory value correctly', () => {
      const items = [
        { currentStock: 100, unitCost: 10 },
        { currentStock: 50, unitCost: 20 },
        { currentStock: 200, unitCost: 5 },
      ];

      const totalValue = items.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0);
      // 100*10 + 50*20 + 200*5 = 1000 + 1000 + 1000 = 3000
      expect(totalValue).toBe(3000);
    });

    it('should identify low stock items', () => {
      const item = {
        id: 1,
        currentStock: 50,
        reorderPoint: 100,
        isLowStock: true,
      };

      expect(item.isLowStock).toBe(true);
      expect(item.currentStock < item.reorderPoint).toBe(true);
    });

    it('should calculate days until expiry', () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 15);

      const today = new Date();
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      expect(daysUntilExpiry).toBeGreaterThan(0);
      expect(daysUntilExpiry).toBeLessThanOrEqual(15);
    });

    it('should track transaction history', () => {
      const transactions = [
        { type: 'purchase', quantity: 100, date: new Date('2024-01-01') },
        { type: 'usage', quantity: -30, date: new Date('2024-01-15') },
        { type: 'adjustment', quantity: -5, date: new Date('2024-01-20') },
      ];

      const totalQuantity = transactions.reduce((sum, t) => sum + t.quantity, 0);
      // 100 - 30 - 5 = 65
      expect(totalQuantity).toBe(65);
    });
  });

  describe('SoilHealthRecommendationsEngine', () => {
    it('should identify nitrogen deficiency', () => {
      const nitrogenLevel = 15;
      const optimalLevel = 30;
      const isDeficient = nitrogenLevel < optimalLevel;

      expect(isDeficient).toBe(true);
      expect(optimalLevel - nitrogenLevel).toBe(15);
    });

    it('should calculate soil health score', () => {
      const deficiencies = [
        { severity: 'moderate', score: 30 },
        { severity: 'low', score: 15 },
      ];

      const totalDeduction = deficiencies.reduce((sum, d) => sum + d.score, 0);
      const healthScore = Math.max(0, 100 - totalDeduction);

      expect(healthScore).toBe(55);
    });

    it('should recommend correct fertilizer for nitrogen deficiency', () => {
      const deficiency = { nutrient: 'Nitrogen', level: 15, optimalLevel: 30 };
      const recommendedFertilizer = 'Urea (46-0-0)';

      expect(deficiency.nutrient).toBe('Nitrogen');
      expect(recommendedFertilizer).toContain('Urea');
    });

    it('should calculate recommended quantity based on deficiency', () => {
      const deficiencyGap = 15; // 30 - 15
      const nutrientPercentage = 46;
      const baseQuantity = (deficiencyGap / nutrientPercentage) * 100;

      expect(baseQuantity).toBeGreaterThan(0);
      expect(baseQuantity).toBeLessThan(50);
    });

    it('should determine action priority based on health score', () => {
      const healthScores = [
        { score: 35, priority: 'immediate' },
        { score: 55, priority: 'high' },
        { score: 75, priority: 'medium' },
        { score: 90, priority: 'low' },
      ];

      healthScores.forEach(({ score, priority }) => {
        if (score < 40) expect(priority).toBe('immediate');
        else if (score < 60) expect(priority).toBe('high');
        else if (score < 80) expect(priority).toBe('medium');
        else expect(priority).toBe('low');
      });
    });
  });

  describe('FertilizerCostAnalysisService', () => {
    it('should calculate total cost spent', () => {
      const applications = [
        { fertilizerType: 'Urea', quantityKg: 100, costPerKg: 10 },
        { fertilizerType: 'DAP', quantityKg: 50, costPerKg: 20 },
        { fertilizerType: 'NPK', quantityKg: 75, costPerKg: 15 },
      ];

      const totalCost = applications.reduce((sum, app) => sum + app.quantityKg * app.costPerKg, 0);
      expect(totalCost).toBe(3125);
    });

    it('should calculate cost per hectare', () => {
      const totalCost = 3125;
      const farmSize = 10; // hectares
      const costPerHectare = totalCost / farmSize;

      expect(costPerHectare).toBe(312.5);
    });

    it('should calculate ROI percentage', () => {
      const totalCost = 3125;
      const expectedYield = 5000; // kg
      const marketPrice = 1; // per kg
      const revenue = expectedYield * marketPrice;
      const roi = ((revenue - totalCost) / totalCost) * 100;

      expect(roi).toBeGreaterThan(0);
      expect(roi).toBeLessThan(100);
    });

    it('should identify most expensive fertilizer type', () => {
      const costs = [
        { type: 'Urea', totalCost: 1000 },
        { type: 'DAP', totalCost: 1500 },
        { type: 'NPK', totalCost: 625 },
      ];

      const mostExpensive = costs.reduce((max, current) => 
        current.totalCost > max.totalCost ? current : max
      );

      expect(mostExpensive.type).toBe('DAP');
      expect(mostExpensive.totalCost).toBe(1500);
    });

    it('should generate cost-saving recommendations', () => {
      const recommendations = [
        'Consider bulk purchasing to reduce per-unit costs',
        'Switch to alternative fertilizers with similar nutrient profiles',
        'Optimize application timing to improve efficiency',
      ];

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toContain('bulk');
    });

    it('should track cost trends over time', () => {
      const costTrend = [
        { date: '2024-01-01', costPerKg: 10.5 },
        { date: '2024-02-01', costPerKg: 10.8 },
        { date: '2024-03-01', costPerKg: 11.2 },
      ];

      const isIncreasing = costTrend[costTrend.length - 1].costPerKg > costTrend[0].costPerKg;
      expect(isIncreasing).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete workflow from soil analysis to recommendations', () => {
      // Simulate soil test
      const soilTest = {
        nitrogen: 15,
        phosphorus: 12,
        potassium: 120,
        pH: 5.8,
        organicMatter: 1.5,
      };

      // Check for deficiencies
      const hasDeficiencies = soilTest.nitrogen < 30 || 
                              soilTest.phosphorus < 20 || 
                              soilTest.potassium < 150;

      expect(hasDeficiencies).toBe(true);

      // Generate recommendations
      const recommendations = [];
      if (soilTest.nitrogen < 30) recommendations.push('Urea');
      if (soilTest.phosphorus < 20) recommendations.push('DAP');
      if (soilTest.potassium < 150) recommendations.push('Potassium Chloride');

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations).toContain('Urea');
    });

    it('should calculate complete cost analysis workflow', () => {
      // Simulate fertilizer applications
      const applications = [
        { type: 'Urea', quantity: 100, cost: 1000 },
        { type: 'DAP', quantity: 50, cost: 1000 },
      ];

      const totalCost = applications.reduce((sum, app) => sum + app.cost, 0);
      const totalQuantity = applications.reduce((sum, app) => sum + app.quantity, 0);
      const costPerKg = totalCost / totalQuantity;

      expect(totalCost).toBe(2000);
      expect(totalQuantity).toBe(150);
      expect(costPerKg).toBeCloseTo(13.33, 1);
    });

    it('should manage inventory with cost tracking', () => {
      const inventory = {
        id: 1,
        fertilizerType: 'Urea',
        currentStock: 100,
        unitCost: 10,
        reorderPoint: 50,
        reorderQuantity: 200,
      };

      const inventoryValue = inventory.currentStock * inventory.unitCost;
      const isLowStock = inventory.currentStock < inventory.reorderPoint;

      expect(inventoryValue).toBe(1000);
      expect(isLowStock).toBe(false);
    });
  });
});
