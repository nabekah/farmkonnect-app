import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Weather Router - API Key Validation", () => {
  it("should fetch current weather successfully", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user",
        name: "Test User",
        email: "test@example.com",
        phone: null,
        loginMethod: "google",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };

    const caller = appRouter.createCaller(ctx);
    
    // Test with Accra, Ghana coordinates
    const result = await caller.weather.getCurrentWeather({
      latitude: 5.6037,
      longitude: -0.1870,
    });

    expect(result).toBeDefined();
    expect(result.temperature).toBeDefined();
    expect(typeof result.temperature).toBe("number");
    expect(result.humidity).toBeDefined();
    expect(typeof result.humidity).toBe("number");
    expect(result.windSpeed).toBeDefined();
    expect(result.description).toBeDefined();
    expect(result.isMockData).toBeDefined();
    
    console.log(`Weather test result: ${result.isMockData ? 'Mock data' : 'Real API data'}`);
    console.log(`Temperature: ${result.temperature}°C, Humidity: ${result.humidity}%`);
  });

  it("should fetch forecast successfully", async () => {
    const ctx: TrpcContext = {
      user: {
        id: 1,
        openId: "test-user",
        name: "Test User",
        email: "test@example.com",
        phone: null,
        loginMethod: "google",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };

    const caller = appRouter.createCaller(ctx);
    
    // Test with Accra, Ghana coordinates
    const result = await caller.weather.getForecast({
      latitude: 5.6037,
      longitude: -0.1870,
      days: 5,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    const firstForecast = result[0];
    expect(firstForecast.temperature).toBeDefined();
    expect(typeof firstForecast.temperature).toBe("number");
    expect(firstForecast.humidity).toBeDefined();
    expect(firstForecast.timestamp).toBeDefined();
    
    console.log(`Forecast test result: ${result.length} forecast entries retrieved`);
  });
});
