import { multiChannelNotificationService } from "./multiChannelNotificationService";

export interface PredictionAlert {
  id: string;
  farmId: string;
  userId: string;
  type: "high_disease_risk" | "low_yield_prediction" | "market_opportunity" | "urgent_action";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  predictionData: {
    predictionType: "yield" | "disease" | "market";
    value: number;
    threshold: number;
    confidence: number;
    cropType?: string;
    productType?: string;
  };
  recommendedActions: string[];
  createdAt: Date;
  expiresAt: Date;
}

export class PredictionAlertsIntegration {
  /**
   * Check predictions and generate alerts for high-risk conditions
   */
  static async checkAndGenerateAlerts(farmId: string, userId: string): Promise<PredictionAlert[]> {
    const alerts: PredictionAlert[] = [];

    try {
      // TODO: Fetch predictions from database
      // const predictions = await getPredictionsForFarm(farmId);

      // Mock predictions for demonstration
      const mockPredictions = [
        {
          type: "disease",
          value: 0.85,
          threshold: 0.7,
          confidence: 0.92,
          cropType: "Poultry",
        },
        {
          type: "yield",
          value: 2.1,
          threshold: 3.5,
          confidence: 0.78,
          cropType: "Maize",
        },
        {
          type: "market",
          value: 180,
          threshold: 200,
          confidence: 0.65,
          productType: "Maize",
        },
      ];

      // Check each prediction for alert conditions
      for (const pred of mockPredictions) {
        if (pred.type === "disease" && pred.value > pred.threshold) {
          alerts.push(
            this.createDiseaseRiskAlert(farmId, userId, pred as any)
          );
        } else if (pred.type === "yield" && pred.value < pred.threshold) {
          alerts.push(
            this.createLowYieldAlert(farmId, userId, pred as any)
          );
        } else if (pred.type === "market" && pred.value < pred.threshold) {
          alerts.push(
            this.createMarketOpportunityAlert(farmId, userId, pred as any)
          );
        }
      }

      return alerts;
    } catch (error) {
      console.error("Error checking predictions for alerts:", error);
      return [];
    }
  }

  /**
   * Create disease risk alert
   */
  private static createDiseaseRiskAlert(
    farmId: string,
    userId: string,
    prediction: any
  ): PredictionAlert {
    const severity =
      prediction.value > 0.8
        ? "critical"
        : prediction.value > 0.7
          ? "high"
          : "medium";

    return {
      id: `alert-${Date.now()}`,
      farmId,
      userId,
      type: "high_disease_risk",
      severity,
      title: `⚠️ High Disease Risk Detected - ${prediction.cropType}`,
      message: `Disease risk for ${prediction.cropType} is ${(prediction.value * 100).toFixed(1)}% (threshold: ${(prediction.threshold * 100).toFixed(1)}%). Confidence: ${(prediction.confidence * 100).toFixed(0)}%`,
      predictionData: {
        predictionType: "disease",
        value: prediction.value,
        threshold: prediction.threshold,
        confidence: prediction.confidence,
        cropType: prediction.cropType,
      },
      recommendedActions: [
        "Increase monitoring frequency",
        "Review biosecurity protocols",
        "Consult with veterinarian",
        "Prepare preventive treatments",
        "Isolate affected animals if present",
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };
  }

  /**
   * Create low yield prediction alert
   */
  private static createLowYieldAlert(
    farmId: string,
    userId: string,
    prediction: any
  ): PredictionAlert {
    const severity =
      prediction.value < prediction.threshold * 0.5
        ? "critical"
        : prediction.value < prediction.threshold * 0.75
          ? "high"
          : "medium";

    return {
      id: `alert-${Date.now()}`,
      farmId,
      userId,
      type: "low_yield_prediction",
      severity,
      title: `📉 Low Yield Prediction - ${prediction.cropType}`,
      message: `Predicted yield for ${prediction.cropType} is ${prediction.value} tons/ha (expected: ${prediction.threshold} tons/ha). Confidence: ${(prediction.confidence * 100).toFixed(0)}%`,
      predictionData: {
        predictionType: "yield",
        value: prediction.value,
        threshold: prediction.threshold,
        confidence: prediction.confidence,
        cropType: prediction.cropType,
      },
      recommendedActions: [
        "Review soil health and nutrient levels",
        "Increase irrigation if needed",
        "Check pest and disease management",
        "Consult with agronomist",
        "Adjust fertilizer application",
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    };
  }

  /**
   * Create market opportunity alert
   */
  private static createMarketOpportunityAlert(
    farmId: string,
    userId: string,
    prediction: any
  ): PredictionAlert {
    return {
      id: `alert-${Date.now()}`,
      farmId,
      userId,
      type: "market_opportunity",
      severity: "low",
      title: `💰 Market Price Alert - ${prediction.productType}`,
      message: `Predicted price for ${prediction.productType} is $${prediction.value}/ton (above target: $${prediction.threshold}/ton). Consider selling soon.`,
      predictionData: {
        predictionType: "market",
        value: prediction.value,
        threshold: prediction.threshold,
        confidence: prediction.confidence,
        productType: prediction.productType,
      },
      recommendedActions: [
        "Monitor market trends closely",
        "Contact potential buyers",
        "Prepare product for sale",
        "Check storage conditions",
        "Review pricing strategy",
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    };
  }

  /**
   * Send prediction alerts via multi-channel notification system
   */
  static async sendPredictionAlerts(
    alerts: PredictionAlert[],
    userPreferences: {
      pushNotifications: boolean;
      emailNotifications: boolean;
      smsNotifications: boolean;
      quietHours?: { start: string; end: string };
    }
  ): Promise<void> {
    for (const alert of alerts) {
      try {
        // Check if within quiet hours
        if (userPreferences.quietHours) {
          const now = new Date();
          const currentTime = now.getHours() * 60 + now.getMinutes();
          const [startHour, startMin] = userPreferences.quietHours.start
            .split(":")
            .map(Number);
          const [endHour, endMin] = userPreferences.quietHours.end
            .split(":")
            .map(Number);
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;

          if (currentTime >= startTime && currentTime <= endTime) {
            // Skip notifications during quiet hours for low severity alerts
            if (alert.severity === "low" || alert.severity === "medium") {
              continue;
            }
          }
        }

        // Send via multi-channel notification service
        await multiChannelNotificationService.sendNotification({
          userId: alert.userId,
          type: alert.type,
          title: alert.title,
          message: alert.message,
          channels: {
            push: userPreferences.pushNotifications,
            email: userPreferences.emailNotifications,
            sms: userPreferences.smsNotifications,
          },
          metadata: {
            farmId: alert.farmId,
            severity: alert.severity,
            predictionType: alert.predictionData.predictionType,
            recommendedActions: alert.recommendedActions,
          },
        });
      } catch (error) {
        console.error(`Failed to send prediction alert ${alert.id}:`, error);
      }
    }
  }

  /**
   * Get active alerts for a farm
   */
  static async getActiveAlerts(farmId: string): Promise<PredictionAlert[]> {
    try {
      // TODO: Fetch from database
      // const alerts = await db.select().from(predictionAlerts)
      //   .where(and(eq(predictionAlerts.farmId, farmId), gt(predictionAlerts.expiresAt, new Date())));
      // return alerts;

      return [];
    } catch (error) {
      console.error("Error fetching active alerts:", error);
      return [];
    }
  }

  /**
   * Dismiss alert
   */
  static async dismissAlert(alertId: string): Promise<void> {
    try {
      // TODO: Update alert status in database
      // await db.update(predictionAlerts)
      //   .set({ dismissed: true })
      //   .where(eq(predictionAlerts.id, alertId));
    } catch (error) {
      console.error("Error dismissing alert:", error);
    }
  }
}

export default PredictionAlertsIntegration;
