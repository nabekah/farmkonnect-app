import { getDb } from "../db";
import { notificationLogs, users } from "drizzle-orm/schema";
import { eq } from "drizzle-orm";
import { MultiChannelNotificationService } from "./multiChannelNotificationService";
import { DiseaseRiskPrediction, YieldPrediction } from "./predictiveAnalyticsEngine";

interface AlertConfig {
  diseaseRiskThreshold: number; // 0-1
  yieldDropThreshold: number; // percentage
  enableEmailAlerts: boolean;
  enableSmsAlerts: boolean;
  enablePushAlerts: boolean;
}

class PredictionAlertsService {
  private notificationService: MultiChannelNotificationService;
  private alertConfig: AlertConfig = {
    diseaseRiskThreshold: 0.6,
    yieldDropThreshold: 20,
    enableEmailAlerts: true,
    enableSmsAlerts: true,
    enablePushAlerts: true,
  };

  constructor() {
    this.notificationService = new MultiChannelNotificationService();
  }

  /**
   * Check disease risk predictions and send alerts if needed
   */
  async checkAndAlertDiseaseRisks(
    farmId: string,
    userId: string,
    predictions: DiseaseRiskPrediction[]
  ): Promise<void> {
    const criticalPredictions = predictions.filter(
      (p) => p.probability >= this.alertConfig.diseaseRiskThreshold
    );

    if (criticalPredictions.length === 0) {
      return;
    }

    for (const prediction of criticalPredictions) {
      const title = `⚠️ High Disease Risk: ${prediction.diseaseType}`;
      const content = `
Disease: ${prediction.diseaseType}
Risk Level: ${prediction.riskLevel.toUpperCase()}
Probability: ${(prediction.probability * 100).toFixed(1)}%
Urgency: ${prediction.urgency.toUpperCase()}

Affected Animals: ${prediction.affectedAnimals.join(", ")}

Preventive Measures:
${prediction.preventiveMeasures.map((m) => `• ${m}`).join("\n")}

Please take immediate action to prevent disease spread on your farm.
      `;

      await this.notificationService.sendMultiChannelNotification(
        {
          userId,
          type: "disease_alert",
          title,
          content,
          priority: prediction.urgency === "immediate" ? "high" : "medium",
          channels: {
            push: this.alertConfig.enablePushAlerts,
            email: this.alertConfig.enableEmailAlerts,
            sms: this.alertConfig.enableSmsAlerts,
          },
        },
        prediction.urgency === "immediate"
      );
    }
  }

  /**
   * Check yield predictions and send alerts if significant drop detected
   */
  async checkAndAlertYieldPredictions(
    farmId: string,
    userId: string,
    cropType: string,
    prediction: YieldPrediction,
    historicalAverage: number
  ): Promise<void> {
    const yieldChange = ((prediction.predictedYield - historicalAverage) / historicalAverage) * 100;

    if (yieldChange < -this.alertConfig.yieldDropThreshold) {
      const title = `📉 Significant Yield Drop Predicted: ${cropType}`;
      const content = `
Crop: ${cropType}
Predicted Yield: ${prediction.predictedYield} units
Historical Average: ${historicalAverage} units
Expected Change: ${yieldChange.toFixed(1)}%

Contributing Factors:
• Rainfall: ${(prediction.factors.rainfall * 100).toFixed(0)}% of optimal
• Temperature: ${(prediction.factors.temperature * 100).toFixed(0)}% of optimal
• Soil Health: ${(prediction.factors.soilHealth * 100).toFixed(0)}%
• Fertilizer: ${(prediction.factors.fertilizer * 100).toFixed(0)}% of optimal
• Pesticide: ${(prediction.factors.pesticide * 100).toFixed(0)}% of optimal

Recommendation: ${prediction.recommendation}

Confidence: ${(prediction.confidence * 100).toFixed(0)}%
      `;

      await this.notificationService.sendMultiChannelNotification(
        {
          userId,
          type: "yield_alert",
          title,
          content,
          priority: "high",
          channels: {
            push: this.alertConfig.enablePushAlerts,
            email: this.alertConfig.enableEmailAlerts,
            sms: false, // Don't send SMS for yield alerts
          },
        },
        false
      );
    }
  }

  /**
   * Check market price predictions and send trading alerts
   */
  async checkAndAlertMarketPrices(
    farmId: string,
    userId: string,
    productType: string,
    currentPrice: number,
    prediction: any
  ): Promise<void> {
    const priceChangePercent = ((prediction.predictedPrice - currentPrice) / currentPrice) * 100;

    if (prediction.recommendation === "sell_now" && priceChangePercent > 5) {
      const title = `💰 Optimal Selling Opportunity: ${productType}`;
      const content = `
Product: ${productType}
Current Price: $${currentPrice.toFixed(2)}
Predicted Price: $${prediction.predictedPrice.toFixed(2)}
Expected Change: ${priceChangePercent.toFixed(1)}%

Market Trend: ${prediction.trend.toUpperCase()}
Confidence: ${(prediction.confidence * 100).toFixed(0)}%

Recommendation: SELL NOW
This is an optimal time to sell your ${productType} before prices decline.

Timeframe: ${prediction.timeframe}
      `;

      await this.notificationService.sendMultiChannelNotification(
        {
          userId,
          type: "market_alert",
          title,
          content,
          priority: "high",
          channels: {
            push: this.alertConfig.enablePushAlerts,
            email: this.alertConfig.enableEmailAlerts,
            sms: this.alertConfig.enableSmsAlerts,
          },
        },
        false
      );
    } else if (prediction.recommendation === "wait" && priceChangePercent > 10) {
      const title = `📈 Price Increase Expected: ${productType}`;
      const content = `
Product: ${productType}
Current Price: $${currentPrice.toFixed(2)}
Predicted Price: $${prediction.predictedPrice.toFixed(2)}
Expected Change: ${priceChangePercent.toFixed(1)}%

Market Trend: ${prediction.trend.toUpperCase()}
Confidence: ${(prediction.confidence * 100).toFixed(0)}%

Recommendation: WAIT
Prices are expected to increase. Consider holding your ${productType} for better returns.

Timeframe: ${prediction.timeframe}
      `;

      await this.notificationService.sendMultiChannelNotification(
        {
          userId,
          type: "market_alert",
          title,
          content,
          priority: "medium",
          channels: {
            push: this.alertConfig.enablePushAlerts,
            email: this.alertConfig.enableEmailAlerts,
            sms: false,
          },
        },
        false
      );
    }
  }

  /**
   * Update alert configuration
   */
  updateAlertConfig(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  /**
   * Get current alert configuration
   */
  getAlertConfig(): AlertConfig {
    return { ...this.alertConfig };
  }

  /**
   * Batch check all predictions and send alerts
   */
  async checkAllPredictions(
    farmId: string,
    userId: string,
    predictions: {
      disease: DiseaseRiskPrediction[];
      yield: Array<{ cropType: string; prediction: YieldPrediction; historical: number }>;
      market: Array<{ productType: string; currentPrice: number; prediction: any }>;
    }
  ): Promise<{ alertsSent: number; errors: string[] }> {
    let alertsSent = 0;
    const errors: string[] = [];

    try {
      // Check disease predictions
      await this.checkAndAlertDiseaseRisks(farmId, userId, predictions.disease);
      alertsSent += predictions.disease.filter((p) => p.probability >= this.alertConfig.diseaseRiskThreshold).length;
    } catch (error) {
      errors.push(`Disease alert error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    try {
      // Check yield predictions
      for (const yieldPred of predictions.yield) {
        await this.checkAndAlertYieldPredictions(
          farmId,
          userId,
          yieldPred.cropType,
          yieldPred.prediction,
          yieldPred.historical
        );
      }
      alertsSent += predictions.yield.length;
    } catch (error) {
      errors.push(`Yield alert error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    try {
      // Check market predictions
      for (const marketPred of predictions.market) {
        await this.checkAndAlertMarketPrices(
          farmId,
          userId,
          marketPred.productType,
          marketPred.currentPrice,
          marketPred.prediction
        );
      }
      alertsSent += predictions.market.length;
    } catch (error) {
      errors.push(`Market alert error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    return { alertsSent, errors };
  }
}

export { PredictionAlertsService };
