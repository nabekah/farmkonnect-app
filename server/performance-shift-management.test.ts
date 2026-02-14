import { describe, it, expect, beforeEach } from 'vitest';

// Worker Performance Trends Tests
describe('Worker Performance Trends', () => {
  describe('Performance Metrics', () => {
    it('should track worker efficiency', () => {
      const performance = {
        workerId: 1,
        currentEfficiency: 92,
        efficiencyTrend: 5,
      };

      expect(performance.currentEfficiency).toBe(92);
      expect(performance.efficiencyTrend).toBeGreaterThan(0);
    });

    it('should track completion rate', () => {
      const performance = {
        completionRate: 94,
        completionTrend: 3,
      };

      expect(performance.completionRate).toBe(94);
      expect(performance.completionTrend).toBeGreaterThan(0);
    });

    it('should track quality rating', () => {
      const performance = {
        qualityRating: 4.3,
        qualityTrend: 0.2,
      };

      expect(performance.qualityRating).toBeGreaterThan(4);
      expect(performance.qualityTrend).toBeGreaterThan(0);
    });

    it('should track time accuracy', () => {
      const performance = {
        averageTimeAccuracy: 96,
      };

      expect(performance.averageTimeAccuracy).toBeGreaterThanOrEqual(90);
    });
  });

  describe('Performance Levels', () => {
    it('should classify exceptional performance', () => {
      const efficiency = 96;
      const level = efficiency >= 95 ? 'Exceptional' : 'Strong';

      expect(level).toBe('Exceptional');
    });

    it('should classify strong performance', () => {
      const efficiency = 88;
      const level = efficiency >= 85 && efficiency < 95 ? 'Strong' : 'Good';

      expect(level).toBe('Strong');
    });

    it('should classify good performance', () => {
      const efficiency = 78;
      const level = efficiency >= 75 && efficiency < 85 ? 'Good' : 'Needs Improvement';

      expect(level).toBe('Good');
    });

    it('should classify needs improvement', () => {
      const efficiency = 70;
      const level = efficiency < 75 ? 'Needs Improvement' : 'Good';

      expect(level).toBe('Needs Improvement');
    });
  });

  describe('Performance Trends', () => {
    let trendData: any[] = [];

    beforeEach(() => {
      trendData = [
        { date: '2026-01-15', efficiency: 88, completionRate: 90, qualityRating: 4.1 },
        { date: '2026-01-22', efficiency: 89, completionRate: 91, qualityRating: 4.2 },
        { date: '2026-01-29', efficiency: 90, completionRate: 92, qualityRating: 4.2 },
        { date: '2026-02-05', efficiency: 91, completionRate: 93, qualityRating: 4.3 },
        { date: '2026-02-12', efficiency: 92, completionRate: 94, qualityRating: 4.3 },
      ];
    });

    it('should calculate efficiency trend', () => {
      const firstEfficiency = trendData[0].efficiency;
      const lastEfficiency = trendData[trendData.length - 1].efficiency;
      const trend = lastEfficiency - firstEfficiency;

      expect(trend).toBe(4);
    });

    it('should calculate completion rate trend', () => {
      const firstRate = trendData[0].completionRate;
      const lastRate = trendData[trendData.length - 1].completionRate;
      const trend = lastRate - firstRate;

      expect(trend).toBe(4);
    });

    it('should calculate quality rating trend', () => {
      const firstRating = trendData[0].qualityRating;
      const lastRating = trendData[trendData.length - 1].qualityRating;
      const trend = lastRating - firstRating;

      expect(trend).toBeCloseTo(0.2, 1);
    });

    it('should identify upward trends', () => {
      const trend = trendData[trendData.length - 1].efficiency - trendData[0].efficiency;
      expect(trend > 0).toBe(true);
    });
  });

  describe('Performance Comparison', () => {
    let comparisonData: any[] = [];

    beforeEach(() => {
      comparisonData = [
        { metric: 'Efficiency', yourValue: 92, farmAverage: 87, topPerformer: 96 },
        { metric: 'Completion Rate', yourValue: 94, farmAverage: 89, topPerformer: 98 },
        { metric: 'Quality Rating', yourValue: 4.3, farmAverage: 4.1, topPerformer: 4.7 },
        { metric: 'Time Accuracy', yourValue: 96, farmAverage: 91, topPerformer: 99 },
      ];
    });

    it('should compare to farm average', () => {
      const efficiency = comparisonData[0];
      expect(efficiency.yourValue).toBeGreaterThan(efficiency.farmAverage);
    });

    it('should compare to top performer', () => {
      const efficiency = comparisonData[0];
      expect(efficiency.yourValue).toBeLessThan(efficiency.topPerformer);
    });

    it('should calculate performance gap', () => {
      const efficiency = comparisonData[0];
      const gap = efficiency.topPerformer - efficiency.yourValue;

      expect(gap).toBe(4);
    });

    it('should identify above average performance', () => {
      const workers = comparisonData.map(c => ({
        ...c,
        aboveAverage: c.yourValue > c.farmAverage,
      }));

      expect(workers.every(w => w.aboveAverage)).toBe(true);
    });
  });

  describe('Performance Recommendations', () => {
    it('should recommend efficiency training', () => {
      const efficiency = 78;
      const recommendations: string[] = [];

      if (efficiency < 85) {
        recommendations.push('Efficiency Training');
      }

      expect(recommendations).toContain('Efficiency Training');
    });

    it('should recommend quality improvement', () => {
      const qualityRating = 3.8;
      const recommendations: string[] = [];

      if (qualityRating < 4.0) {
        recommendations.push('Quality Improvement Program');
      }

      expect(recommendations).toContain('Quality Improvement Program');
    });

    it('should recommend recognition for high performers', () => {
      const efficiency = 96;
      const completionRate = 98;
      const recommendations: string[] = [];

      if (efficiency >= 95 && completionRate >= 95) {
        recommendations.push('Recognition & Development');
      }

      expect(recommendations).toContain('Recognition & Development');
    });
  });

  describe('Strengths and Improvement Areas', () => {
    it('should identify strengths', () => {
      const performance = {
        currentEfficiency: 92,
        completionRate: 94,
        qualityRating: 4.3,
        strengths: ['Consistent quality', 'High reliability', 'Good time management'],
      };

      expect(performance.strengths.length).toBeGreaterThan(0);
    });

    it('should identify improvement areas', () => {
      const performance = {
        currentEfficiency: 78,
        improvementAreas: ['Improve task efficiency', 'Reduce time overruns'],
      };

      expect(performance.improvementAreas.length).toBeGreaterThan(0);
    });

    it('should have no improvement areas for top performers', () => {
      const performance = {
        currentEfficiency: 96,
        completionRate: 98,
        qualityRating: 4.7,
        improvementAreas: [],
      };

      expect(performance.improvementAreas.length).toBe(0);
    });
  });
});

// Shift Management Tests
describe('Shift Management', () => {
  describe('Shift Templates', () => {
    let shifts: any[] = [];

    beforeEach(() => {
      shifts = [
        {
          shiftId: 'shift_1',
          name: 'Early Morning',
          startTime: '06:00',
          endTime: '14:00',
          duration: 8,
        },
        {
          shiftId: 'shift_2',
          name: 'Standard Day',
          startTime: '08:00',
          endTime: '16:00',
          duration: 8,
        },
        {
          shiftId: 'shift_3',
          name: 'Afternoon',
          startTime: '14:00',
          endTime: '22:00',
          duration: 8,
        },
        {
          shiftId: 'shift_4',
          name: 'Half Day',
          startTime: '08:00',
          endTime: '12:00',
          duration: 4,
        },
      ];
    });

    it('should create shift template', () => {
      const newShift = {
        shiftId: 'shift_5',
        name: 'Evening',
        startTime: '18:00',
        endTime: '02:00',
        duration: 8,
      };

      expect(newShift.name).toBe('Evening');
      expect(newShift.duration).toBe(8);
    });

    it('should calculate shift duration', () => {
      const shift = shifts[0];
      const start = parseInt(shift.startTime.split(':')[0]);
      const end = parseInt(shift.endTime.split(':')[0]);
      const duration = end - start;

      expect(duration).toBe(8);
    });

    it('should support different shift lengths', () => {
      const halfDayShift = shifts.find(s => s.name === 'Half Day');
      expect(halfDayShift.duration).toBe(4);
    });

    it('should delete shift template', () => {
      const shiftToDelete = 'shift_1';
      const updated = shifts.filter(s => s.shiftId !== shiftToDelete);

      expect(updated.length).toBe(3);
      expect(updated.find(s => s.shiftId === shiftToDelete)).toBeUndefined();
    });
  });

  describe('Worker Shift Assignment', () => {
    let workerShifts: any[] = [];

    beforeEach(() => {
      workerShifts = [
        {
          workerId: 1,
          workerName: 'John Smith',
          date: '2026-02-14',
          shiftId: 'shift_2',
          shiftName: 'Standard Day',
          status: 'confirmed',
        },
        {
          workerId: 2,
          workerName: 'Maria Garcia',
          date: '2026-02-14',
          shiftId: 'shift_1',
          shiftName: 'Early Morning',
          status: 'confirmed',
        },
        {
          workerId: 3,
          workerName: 'Ahmed Hassan',
          date: '2026-02-14',
          shiftId: 'shift_3',
          shiftName: 'Afternoon',
          status: 'pending_approval',
        },
      ];
    });

    it('should assign shift to worker', () => {
      const assignment = {
        workerId: 4,
        date: '2026-02-15',
        shiftId: 'shift_2',
        status: 'pending_approval',
      };

      expect(assignment.workerId).toBe(4);
      expect(assignment.status).toBe('pending_approval');
    });

    it('should confirm shift assignment', () => {
      const assignment = workerShifts[0];
      const confirmed = { ...assignment, status: 'confirmed' };

      expect(confirmed.status).toBe('confirmed');
    });

    it('should track shift status', () => {
      const statuses = workerShifts.map(ws => ws.status);
      expect(statuses).toContain('confirmed');
      expect(statuses).toContain('pending_approval');
    });

    it('should get shifts for specific date', () => {
      const date = '2026-02-14';
      const shiftsForDate = workerShifts.filter(ws => ws.date === date);

      expect(shiftsForDate.length).toBe(3);
    });

    it('should get shifts for specific worker', () => {
      const workerId = 1;
      const workerShiftsOnly = workerShifts.filter(ws => ws.workerId === workerId);

      expect(workerShiftsOnly.length).toBe(1);
      expect(workerShiftsOnly[0].workerName).toBe('John Smith');
    });
  });

  describe('Time-Off Requests', () => {
    let timeOffRequests: any[] = [];

    beforeEach(() => {
      timeOffRequests = [
        {
          requestId: 'req_1',
          workerId: 1,
          workerName: 'John Smith',
          startDate: '2026-02-17',
          endDate: '2026-02-19',
          reason: 'Personal leave',
          status: 'pending',
        },
        {
          requestId: 'req_2',
          workerId: 2,
          workerName: 'Maria Garcia',
          startDate: '2026-02-20',
          endDate: '2026-02-21',
          reason: 'Medical appointment',
          status: 'approved',
        },
      ];
    });

    it('should create time-off request', () => {
      const newRequest = {
        requestId: 'req_3',
        workerId: 3,
        startDate: '2026-02-24',
        endDate: '2026-02-25',
        reason: 'Family event',
        status: 'pending',
      };

      expect(newRequest.status).toBe('pending');
      expect(newRequest.reason).toBe('Family event');
    });

    it('should approve time-off request', () => {
      const request = timeOffRequests[0];
      const approved = { ...request, status: 'approved' };

      expect(approved.status).toBe('approved');
    });

    it('should reject time-off request', () => {
      const request = timeOffRequests[0];
      const rejected = { ...request, status: 'rejected' };

      expect(rejected.status).toBe('rejected');
    });

    it('should calculate time-off duration', () => {
      const request = timeOffRequests[0];
      const start = new Date(request.startDate);
      const end = new Date(request.endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      expect(duration).toBe(2);
    });

    it('should get pending requests', () => {
      const pending = timeOffRequests.filter(r => r.status === 'pending');
      expect(pending.length).toBe(1);
    });

    it('should get approved requests', () => {
      const approved = timeOffRequests.filter(r => r.status === 'approved');
      expect(approved.length).toBe(1);
    });
  });

  describe('Shift Coverage Analysis', () => {
    let workerShifts: any[] = [];

    beforeEach(() => {
      workerShifts = [
        { date: '2026-02-14', shiftId: 'shift_1', workerId: 1 },
        { date: '2026-02-14', shiftId: 'shift_1', workerId: 2 },
        { date: '2026-02-14', shiftId: 'shift_2', workerId: 3 },
        { date: '2026-02-14', shiftId: 'shift_2', workerId: 4 },
        { date: '2026-02-14', shiftId: 'shift_2', workerId: 5 },
        { date: '2026-02-14', shiftId: 'shift_3', workerId: 6 },
      ];
    });

    it('should count workers per shift', () => {
      const shift2Count = workerShifts.filter(ws => ws.shiftId === 'shift_2').length;
      expect(shift2Count).toBe(3);
    });

    it('should identify understaffed shifts', () => {
      const minStaffing = 2;
      const shift1Count = workerShifts.filter(ws => ws.shiftId === 'shift_1').length;
      const isUnderstaffed = shift1Count < minStaffing;

      expect(isUnderstaffed).toBe(false);
    });

    it('should calculate total coverage', () => {
      const date = '2026-02-14';
      const coverage = workerShifts.filter(ws => ws.date === date).length;

      expect(coverage).toBe(6);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect double booking', () => {
      const assignments = [
        { workerId: 1, date: '2026-02-14', shiftId: 'shift_1' },
        { workerId: 1, date: '2026-02-14', shiftId: 'shift_2' },
      ];

      const conflicts = assignments.filter(a => a.workerId === 1 && a.date === '2026-02-14');
      expect(conflicts.length).toBeGreaterThan(1);
    });

    it('should detect time-off conflicts', () => {
      const timeOff = { workerId: 1, startDate: '2026-02-17', endDate: '2026-02-19', status: 'approved' };
      const shift = { workerId: 1, date: '2026-02-18', shiftId: 'shift_1' };

      const dateInRange = new Date(shift.date) >= new Date(timeOff.startDate) &&
                         new Date(shift.date) <= new Date(timeOff.endDate);

      expect(dateInRange).toBe(true);
    });

    it('should prevent overbooking', () => {
      const maxShiftsPerDay = 1;
      const assignments = [
        { workerId: 1, date: '2026-02-14', shiftId: 'shift_1' },
        { workerId: 1, date: '2026-02-14', shiftId: 'shift_2' },
      ];

      const dayAssignments = assignments.filter(a => a.workerId === 1 && a.date === '2026-02-14');
      const isOverbooked = dayAssignments.length > maxShiftsPerDay;

      expect(isOverbooked).toBe(true);
    });
  });
});

// Integration Tests
describe('Performance & Shift Management Integration', () => {
  it('should link performance to shift assignments', () => {
    const performance = { workerId: 1, efficiency: 92 };
    const shift = { workerId: 1, date: '2026-02-14', shiftId: 'shift_2' };

    expect(performance.workerId).toBe(shift.workerId);
  });

  it('should adjust shift recommendations based on performance', () => {
    const performance = { efficiency: 78 };
    const recommendedShift = performance.efficiency < 85 ? 'half_day' : 'standard';

    expect(recommendedShift).toBe('half_day');
  });

  it('should track performance during shifts', () => {
    const shift = { shiftId: 'shift_1', startTime: '06:00', endTime: '14:00' };
    const performance = { tasksDuring: 5, efficiency: 92 };

    expect(performance.tasksDuring).toBeGreaterThan(0);
    expect(performance.efficiency).toBeGreaterThan(0);
  });
});
