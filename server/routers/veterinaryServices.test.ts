import { describe, it, expect, beforeAll } from "vitest";
import { db } from "../db";

describe("Veterinary Services Database Tests", () => {
  beforeAll(async () => {
    // Verify database connection
    expect(db).toBeDefined();
  });

  it("should retrieve all veterinarians from database", async () => {
    const result = await db.query.veterinarians.findMany({ limit: 10 });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should retrieve all extension agents from database", async () => {
    const result = await db.query.extensionAgents.findMany({ limit: 10 });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should retrieve all appointments from database", async () => {
    const result = await db.query.appointments.findMany({ limit: 10 });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should retrieve all prescriptions from database", async () => {
    const result = await db.query.prescriptions.findMany({ limit: 10 });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should retrieve telemedicine sessions from database", async () => {
    const result = await db.query.telemedicineSessions.findMany({ limit: 10 });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should retrieve calendar syncs from database", async () => {
    const result = await db.query.calendarSyncs.findMany({ limit: 10 });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should retrieve notification preferences from database", async () => {
    const result = await db.query.notificationPreferences.findMany({ limit: 10 });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should retrieve notification logs from database", async () => {
    const result = await db.query.notificationLogs.findMany({ limit: 10 });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should verify veterinarian data integrity", async () => {
    const result = await db.query.veterinarians.findMany({ limit: 1 });
    if (result.length > 0) {
      const vet = result[0];
      expect(vet.id).toBeDefined();
      expect(vet.name).toBeDefined();
      expect(vet.specialty).toBeDefined();
      expect(vet.region).toBeDefined();
      expect(vet.phone).toBeDefined();
      expect(vet.email).toBeDefined();
    }
  });

  it("should verify prescription data integrity", async () => {
    const result = await db.query.prescriptions.findMany({ limit: 1 });
    if (result.length > 0) {
      const presc = result[0];
      expect(presc.id).toBeDefined();
      expect(presc.medication_name).toBeDefined();
      expect(presc.dosage).toBeDefined();
      expect(presc.frequency).toBeDefined();
      expect(presc.duration).toBeDefined();
      expect(presc.start_date).toBeDefined();
      expect(presc.expiry_date).toBeDefined();
    }
  });

  it("should verify appointment data integrity", async () => {
    const result = await db.query.appointments.findMany({ limit: 1 });
    if (result.length > 0) {
      const apt = result[0];
      expect(apt.id).toBeDefined();
      expect(apt.appointment_date).toBeDefined();
      expect(apt.appointment_time).toBeDefined();
      expect(apt.consultation_type).toBeDefined();
    }
  });

  it("should verify telemedicine session data integrity", async () => {
    const result = await db.query.telemedicineSessions.findMany({ limit: 1 });
    if (result.length > 0) {
      const session = result[0];
      expect(session.id).toBeDefined();
      expect(session.meeting_link).toBeDefined();
      expect(session.platform).toBeDefined();
      expect(session.start_time).toBeDefined();
    }
  });

  it("should verify calendar sync data integrity", async () => {
    const result = await db.query.calendarSyncs.findMany({ limit: 1 });
    if (result.length > 0) {
      const sync = result[0];
      expect(sync.id).toBeDefined();
      expect(sync.calendar_provider).toBeDefined();
      expect(sync.email).toBeDefined();
      expect(sync.access_token).toBeDefined();
    }
  });

  it("should verify notification preference data integrity", async () => {
    const result = await db.query.notificationPreferences.findMany({ limit: 1 });
    if (result.length > 0) {
      const pref = result[0];
      expect(pref.id).toBeDefined();
      expect(pref.user_id).toBeDefined();
      expect(typeof pref.appointment_reminders).toBe("boolean");
      expect(typeof pref.prescription_alerts).toBe("boolean");
    }
  });

  it("should verify notification log data integrity", async () => {
    const result = await db.query.notificationLogs.findMany({ limit: 1 });
    if (result.length > 0) {
      const log = result[0];
      expect(log.id).toBeDefined();
      expect(log.user_id).toBeDefined();
      expect(log.notification_type).toBeDefined();
      expect(log.message_content).toBeDefined();
    }
  });
});
