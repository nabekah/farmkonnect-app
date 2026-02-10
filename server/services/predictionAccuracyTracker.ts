import { getDb } from "../db";
import { eq, and, gte, lte } from "drizzle-orm";

interface PredictionRecord {
  predictionId: string;
  farmId: string;
  predictionType: "yield" | "disease" | "market";
  cropType?: string;
  productType?: string;
  predictedValue: number;
  confidence: number;
  predictionDate: Date;
  actualValue?: number;
  accuracy?: number;
  recordedDate?: Date;
}

interface AccuracyMetrics {
  totalPredictions: number;
  recordedOutcomes: number;
  averageAccuracy: number;
  accuracyByType: {
    yield: number;
    disease: number;
    market: number;
  };
  accuracyByConfidence: {
    high: number; // > 0.8
    medium: number; // 0.5-0.8
    low: number; // < 0.5
  };
  trend: "improving" | "stable" | "declining";
}

class PredictionAccuracyTracker {
  private predictions: Map<string, PredictionRecord> = new Map();

  /**
   * Record a prediction for future accuracy tracking
   */
  recordPrediction(prediction: PredictionRecord): void {
    this.predictions.set(prediction.predictionId, {
      ...prediction,
      predictionDate: new Date(prediction.predictionDate),
    });
  }

  /**
   * Record actual outcome and calculate accuracy
   */
  recordOutcome(predictionId: string, actualValue: number): PredictionRecord | null {
    const prediction = this.predictions.get(predictionId);
    if (!prediction) {
      return null;
    }

    // Calculate accuracy based on prediction type
    let accuracy = this.calculateAccuracy(
      prediction.predictionType,
      prediction.predictedValue,
      actualValue
    );

    const updated: PredictionRecord = {
      ...prediction,
      actualValue,
      accuracy,
      recordedDate: new Date(),
    };

    this.predictions.set(predictionId, updated);
    return updated;
  }

  /**
   * Get accuracy metrics for a farm
   */
  getAccuracyMetrics(farmId: string, timeframeMonths: number = 3): AccuracyMetrics {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - timeframeMonths);

    const farmPredictions = Array.from(this.predictions.values()).filter(
      (p) => p.farmId === farmId && p.predictionDate >= cutoffDate
    );

    const recordedPredictions = farmPredictions.filter((p) => p.accuracy !== undefined);

    // Calculate metrics by type
    const accuracyByType = {
      yield: this.calculateAverageAccuracy(
        recordedPredictions.filter((p) => p.predictionType === "yield")
      ),
      disease: this.calculateAverageAccuracy(
        recordedPredictions.filter((p) => p.predictionType === "disease")
      ),
      market: this.calculateAverageAccuracy(
        recordedPredictions.filter((p) => p.predictionType === "market")
      ),
    };

    // Calculate metrics by confidence level
    const accuracyByConfidence = {
      high: this.calculateAverageAccuracy(
        recordedPredictions.filter((p) => p.confidence > 0.8)
      ),
      medium: this.calculateAverageAccuracy(
        recordedPredictions.filter((p) => p.confidence >= 0.5 && p.confidence <= 0.8)
      ),
      low: this.calculateAverageAccuracy(
        recordedPredictions.filter((p) => p.confidence < 0.5)
      ),
    };

    // Calculate trend
    const halfPoint = Math.floor(recordedPredictions.length / 2);
    const firstHalf = recordedPredictions.slice(0, halfPoint);
    const secondHalf = recordedPredictions.slice(halfPoint);

    const firstHalfAccuracy = this.calculateAverageAccuracy(firstHalf);
    const secondHalfAccuracy = this.calculateAverageAccuracy(secondHalf);

    let trend: "improving" | "stable" | "declining" = "stable";
    if (secondHalfAccuracy > firstHalfAccuracy + 5) {
      trend = "improving";
    } else if (secondHalfAccuracy < firstHalfAccuracy - 5) {
      trend = "declining";
    }

    return {
      totalPredictions: farmPredictions.length,
      recordedOutcomes: recordedPredictions.length,
      averageAccuracy: this.calculateAverageAccuracy(recordedPredictions),
      accuracyByType,
      accuracyByConfidence,
      trend,
    };
  }

  /**
   * Get predictions with low accuracy for model retraining
   */
  getLowAccuracyPredictions(farmId: string, threshold: number = 60): PredictionRecord[] {
    return Array.from(this.predictions.values()).filter(
      (p) =>
        p.farmId === farmId &&
        p.accuracy !== undefined &&
        p.accuracy < threshold &&
        p.recordedDate !== undefined
    );
  }

  /**
   * Get predictions by confidence level
   */
  getPredictionsByConfidence(
    farmId: string,
    minConfidence: number,
    maxConfidence: number
  ): PredictionRecord[] {
    return Array.from(this.predictions.values()).filter(
      (p) =>
        p.farmId === farmId &&
        p.confidence >= minConfidence &&
        p.confidence <= maxConfidence
    );
  }

  /**
   * Calculate model improvement recommendations
   */
  getModelImprovementRecommendations(farmId: string): string[] {
    const metrics = this.getAccuracyMetrics(farmId);
    const recommendations: string[] = [];

    // Check overall accuracy
    if (metrics.averageAccuracy < 70) {
      recommendations.push(
        "Overall model accuracy is below 70%. Consider collecting more training data or adjusting model parameters."
      );
    }

    // Check accuracy by type
    if (metrics.accuracyByType.yield < 65) {
      recommendations.push(
        "Yield prediction accuracy is low. Collect more historical crop data and environmental factors."
      );
    }
    if (metrics.accuracyByType.disease < 65) {
      recommendations.push(
        "Disease risk prediction accuracy is low. Gather more animal health records and disease patterns."
      );
    }
    if (metrics.accuracyByType.market < 65) {
      recommendations.push(
        "Market price prediction accuracy is low. Include more external market factors and economic indicators."
      );
    }

    // Check confidence calibration
    if (metrics.accuracyByConfidence.high < metrics.accuracyByConfidence.low) {
      recommendations.push(
        "High-confidence predictions are less accurate than low-confidence ones. Recalibrate confidence scoring."
      );
    }

    // Check trend
    if (metrics.trend === "declining") {
      recommendations.push(
        "Model accuracy is declining. Retrain with recent data to adapt to changing conditions."
      );
    }

    // Check recorded outcomes
    if (metrics.recordedOutcomes < metrics.totalPredictions * 0.5) {
      recommendations.push(
        "Less than 50% of predictions have recorded outcomes. Encourage users to log actual results for better model training."
      );
    }

    return recommendations;
  }

  /**
   * Export accuracy data for analysis
   */
  exportAccuracyData(farmId: string): {
    predictions: PredictionRecord[];
    metrics: AccuracyMetrics;
    recommendations: string[];
  } {
    const farmPredictions = Array.from(this.predictions.values()).filter(
      (p) => p.farmId === farmId
    );

    return {
      predictions: farmPredictions,
      metrics: this.getAccuracyMetrics(farmId),
      recommendations: this.getModelImprovementRecommendations(farmId),
    };
  }

  // Helper methods
  private calculateAccuracy(
    predictionType: string,
    predicted: number,
    actual: number
  ): number {
    if (actual === 0) return 0;

    const percentError = Math.abs((predicted - actual) / actual) * 100;

    // Convert error to accuracy percentage
    // 0% error = 100% accuracy, 100% error = 0% accuracy
    const accuracy = Math.max(0, 100 - percentError);

    return Math.round(accuracy * 100) / 100;
  }

  private calculateAverageAccuracy(predictions: PredictionRecord[]): number {
    if (predictions.length === 0) return 0;

    const sum = predictions.reduce((acc, p) => acc + (p.accuracy || 0), 0);
    return Math.round((sum / predictions.length) * 100) / 100;
  }
}

export { PredictionAccuracyTracker, PredictionRecord, AccuracyMetrics };
