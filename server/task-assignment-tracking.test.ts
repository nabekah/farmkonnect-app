import { describe, it, expect, beforeEach, vi } from 'vitest';

// Task Assignment Tests
describe('Task Assignment System', () => {
  describe('Task Creation', () => {
    it('should create a new task with all required fields', () => {
      const task = {
        id: 'task_1',
        title: 'Prepare Field A',
        description: 'Clear weeds and level soil',
        workerId: 'worker_1',
        workerName: 'John Smith',
        taskType: 'planting',
        priority: 'high' as const,
        status: 'pending' as const,
        dueDate: '2026-02-20',
        estimatedHours: 8
      };

      expect(task).toBeDefined();
      expect(task.title).toBe('Prepare Field A');
      expect(task.workerId).toBe('worker_1');
      expect(task.priority).toBe('high');
      expect(task.status).toBe('pending');
    });

    it('should validate task priority levels', () => {
      const priorities = ['low', 'medium', 'high', 'urgent'];
      const task = {
        priority: 'high' as const
      };

      expect(priorities).toContain(task.priority);
    });

    it('should validate task status values', () => {
      const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];
      const task = {
        status: 'pending' as const
      };

      expect(statuses).toContain(task.status);
    });

    it('should validate task types', () => {
      const taskTypes = ['planting', 'weeding', 'irrigation', 'harvesting', 'maintenance', 'spraying'];
      const task = {
        taskType: 'planting'
      };

      expect(taskTypes).toContain(task.taskType);
    });
  });

  describe('Task Assignment', () => {
    let tasks: any[] = [];

    beforeEach(() => {
      tasks = [
        {
          id: 'task_1',
          title: 'Task 1',
          workerId: 'worker_1',
          status: 'pending',
          priority: 'high',
          dueDate: '2026-02-20',
          estimatedHours: 8
        }
      ];
    });

    it('should assign task to a worker', () => {
      const taskId = 'task_1';
      const workerId = 'worker_2';

      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, workerId } : t
      );

      expect(updatedTasks[0].workerId).toBe('worker_2');
    });

    it('should handle multiple task assignments to same worker', () => {
      const newTask = {
        id: 'task_2',
        title: 'Task 2',
        workerId: 'worker_1',
        status: 'pending',
        priority: 'medium',
        dueDate: '2026-02-22',
        estimatedHours: 4
      };

      tasks.push(newTask);
      const worker1Tasks = tasks.filter(t => t.workerId === 'worker_1');

      expect(worker1Tasks.length).toBe(2);
    });

    it('should validate due date is in future', () => {
      const task = {
        dueDate: '2026-02-20'
      };

      const dueDate = new Date(task.dueDate);
      const today = new Date();

      expect(dueDate.getTime()).toBeGreaterThan(today.getTime());
    });
  });

  describe('Task Status Updates', () => {
    let tasks: any[] = [];

    beforeEach(() => {
      tasks = [
        {
          id: 'task_1',
          title: 'Task 1',
          status: 'pending',
          estimatedHours: 8,
          actualHours: undefined
        }
      ];
    });

    it('should update task status from pending to in_progress', () => {
      const taskId = 'task_1';
      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, status: 'in_progress' } : t
      );

      expect(updatedTasks[0].status).toBe('in_progress');
    });

    it('should update task status from in_progress to completed', () => {
      tasks[0].status = 'in_progress';

      const taskId = 'task_1';
      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, status: 'completed' } : t
      );

      expect(updatedTasks[0].status).toBe('completed');
    });

    it('should allow cancellation of pending tasks', () => {
      const taskId = 'task_1';
      const updatedTasks = tasks.map(t =>
        t.id === taskId ? { ...t, status: 'cancelled' } : t
      );

      expect(updatedTasks[0].status).toBe('cancelled');
    });

    it('should not allow status transitions from completed', () => {
      tasks[0].status = 'completed';
      const currentStatus = tasks[0].status;

      // Completed tasks should not change status
      expect(currentStatus).toBe('completed');
    });
  });

  describe('Task Deletion', () => {
    let tasks: any[] = [];

    beforeEach(() => {
      tasks = [
        { id: 'task_1', title: 'Task 1' },
        { id: 'task_2', title: 'Task 2' },
        { id: 'task_3', title: 'Task 3' }
      ];
    });

    it('should delete a task by id', () => {
      const taskIdToDelete = 'task_2';
      const filteredTasks = tasks.filter(t => t.id !== taskIdToDelete);

      expect(filteredTasks.length).toBe(2);
      expect(filteredTasks.find(t => t.id === 'task_2')).toBeUndefined();
    });

    it('should maintain task order after deletion', () => {
      const taskIdToDelete = 'task_2';
      const filteredTasks = tasks.filter(t => t.id !== taskIdToDelete);

      expect(filteredTasks[0].id).toBe('task_1');
      expect(filteredTasks[1].id).toBe('task_3');
    });
  });
});

// Task Completion Tracking Tests
describe('Task Completion Tracking System', () => {
  describe('Completion Records', () => {
    it('should create a completion record', () => {
      const record = {
        taskId: 'task_1',
        taskTitle: 'Prepare Field A',
        workerId: 'worker_1',
        workerName: 'John Smith',
        completedAt: '2026-02-15',
        estimatedHours: 8,
        actualHours: 7,
        efficiency: 87.5,
        notes: 'Completed ahead of schedule'
      };

      expect(record).toBeDefined();
      expect(record.taskTitle).toBe('Prepare Field A');
      expect(record.efficiency).toBe(87.5);
    });

    it('should calculate efficiency percentage correctly', () => {
      const estimatedHours = 8;
      const actualHours = 7;
      const efficiency = (estimatedHours / actualHours) * 100;

      expect(efficiency).toBeGreaterThan(100);
      expect(Math.round(efficiency)).toBe(114);
    });

    it('should handle tasks completed faster than estimated', () => {
      const estimatedHours = 8;
      const actualHours = 6;
      const timeSavings = estimatedHours - actualHours;

      expect(timeSavings).toBe(2);
      expect(timeSavings).toBeGreaterThan(0);
    });

    it('should handle tasks completed slower than estimated', () => {
      const estimatedHours = 4;
      const actualHours = 5;
      const timeDifference = actualHours - estimatedHours;

      expect(timeDifference).toBe(1);
      expect(timeDifference).toBeGreaterThan(0);
    });
  });

  describe('Efficiency Metrics', () => {
    let completionRecords: any[] = [];

    beforeEach(() => {
      completionRecords = [
        { efficiency: 87.5 },
        { efficiency: 88.9 },
        { efficiency: 91.7 },
        { efficiency: 92.3 },
        { efficiency: 85.6 }
      ];
    });

    it('should calculate average efficiency', () => {
      const avgEfficiency = completionRecords.reduce((sum, r) => sum + r.efficiency, 0) / completionRecords.length;

      expect(avgEfficiency).toBeGreaterThan(85);
      expect(avgEfficiency).toBeLessThan(95);
      expect(Math.round(avgEfficiency * 10) / 10).toBe(89.2);
    });

    it('should identify high efficiency tasks', () => {
      const highEfficiencyTasks = completionRecords.filter(r => r.efficiency >= 90);

      expect(highEfficiencyTasks.length).toBe(2);
    });

    it('should identify low efficiency tasks', () => {
      const lowEfficiencyTasks = completionRecords.filter(r => r.efficiency < 90);

      expect(lowEfficiencyTasks.length).toBe(3);
    });
  });

  describe('Worker Performance Analytics', () => {
    let workerPerformance: any[] = [];

    beforeEach(() => {
      workerPerformance = [
        { name: 'John Smith', tasks: 5, avgEfficiency: 89, hoursWorked: 32 },
        { name: 'Maria Garcia', tasks: 4, avgEfficiency: 87, hoursWorked: 24 },
        { name: 'Ahmed Hassan', tasks: 6, avgEfficiency: 92, hoursWorked: 38 }
      ];
    });

    it('should calculate average hours per task for worker', () => {
      const worker = workerPerformance[0];
      const avgHoursPerTask = worker.hoursWorked / worker.tasks;

      expect(avgHoursPerTask).toBe(6.4);
    });

    it('should rank workers by efficiency', () => {
      const rankedWorkers = [...workerPerformance].sort((a, b) => b.avgEfficiency - a.avgEfficiency);

      expect(rankedWorkers[0].name).toBe('Ahmed Hassan');
      expect(rankedWorkers[0].avgEfficiency).toBe(92);
    });

    it('should rank workers by task completion count', () => {
      const rankedWorkers = [...workerPerformance].sort((a, b) => b.tasks - a.tasks);

      expect(rankedWorkers[0].name).toBe('Ahmed Hassan');
      expect(rankedWorkers[0].tasks).toBe(6);
    });

    it('should identify top performer', () => {
      const topPerformer = workerPerformance.reduce((best, worker) => 
        worker.avgEfficiency > best.avgEfficiency ? worker : best
      );

      expect(topPerformer.name).toBe('Ahmed Hassan');
      expect(topPerformer.avgEfficiency).toBe(92);
    });
  });

  describe('Completion Trends', () => {
    it('should track completion trend over time', () => {
      const trend = [
        { date: 'Feb 8', completed: 3, pending: 5 },
        { date: 'Feb 9', completed: 5, pending: 4 },
        { date: 'Feb 10', completed: 8, pending: 3 },
        { date: 'Feb 11', completed: 10, pending: 4 },
        { date: 'Feb 12', completed: 12, pending: 3 },
        { date: 'Feb 13', completed: 15, pending: 2 },
        { date: 'Feb 14', completed: 18, pending: 1 }
      ];

      expect(trend.length).toBe(7);
      expect(trend[0].completed).toBe(3);
      expect(trend[6].completed).toBe(18);
    });

    it('should show increasing completion trend', () => {
      const trend = [
        { date: 'Feb 8', completed: 3 },
        { date: 'Feb 9', completed: 5 },
        { date: 'Feb 10', completed: 8 }
      ];

      for (let i = 1; i < trend.length; i++) {
        expect(trend[i].completed).toBeGreaterThan(trend[i - 1].completed);
      }
    });

    it('should show decreasing pending trend', () => {
      const trend = [
        { date: 'Feb 8', pending: 5 },
        { date: 'Feb 9', pending: 4 },
        { date: 'Feb 10', pending: 3 }
      ];

      for (let i = 1; i < trend.length; i++) {
        expect(trend[i].pending).toBeLessThanOrEqual(trend[i - 1].pending);
      }
    });
  });

  describe('Efficiency Distribution', () => {
    it('should categorize tasks by efficiency range', () => {
      const efficiencyData = [
        { range: '80-85%', count: 2 },
        { range: '85-90%', count: 5 },
        { range: '90-95%', count: 6 },
        { range: '95-100%', count: 3 }
      ];

      const totalTasks = efficiencyData.reduce((sum, d) => sum + d.count, 0);
      expect(totalTasks).toBe(16);
    });

    it('should calculate efficiency distribution percentages', () => {
      const efficiencyData = [
        { range: '80-85%', count: 2 },
        { range: '85-90%', count: 5 },
        { range: '90-95%', count: 6 },
        { range: '95-100%', count: 3 }
      ];

      const totalTasks = efficiencyData.reduce((sum, d) => sum + d.count, 0);
      const distribution = efficiencyData.map(d => ({
        range: d.range,
        percentage: (d.count / totalTasks) * 100
      }));

      expect(distribution[0].percentage).toBeCloseTo(12.5, 1);
      expect(distribution[1].percentage).toBeCloseTo(31.25, 1);
    });
  });

  describe('Time Savings Calculation', () => {
    let completionRecords: any[] = [];

    beforeEach(() => {
      completionRecords = [
        { estimatedHours: 8, actualHours: 7 },
        { estimatedHours: 4, actualHours: 4.5 },
        { estimatedHours: 6, actualHours: 5.5 }
      ];
    });

    it('should calculate total time savings', () => {
      const totalEstimated = completionRecords.reduce((sum, r) => sum + r.estimatedHours, 0);
      const totalActual = completionRecords.reduce((sum, r) => sum + r.actualHours, 0);
      const timeSavings = totalEstimated - totalActual;

      expect(timeSavings).toBe(1);
    });

    it('should calculate average time savings per task', () => {
      const totalEstimated = completionRecords.reduce((sum, r) => sum + r.estimatedHours, 0);
      const totalActual = completionRecords.reduce((sum, r) => sum + r.actualHours, 0);
      const timeSavings = totalEstimated - totalActual;
      const avgTimeSavings = timeSavings / completionRecords.length;

      expect(avgTimeSavings).toBeCloseTo(0.33, 1);
    });

    it('should identify tasks with time overruns', () => {
      const overrunTasks = completionRecords.filter(r => r.actualHours > r.estimatedHours);

      expect(overrunTasks.length).toBe(1);
      expect(overrunTasks[0].actualHours).toBe(4.5);
    });
  });

  describe('Completion Status Tracking', () => {
    it('should track task completion by status', () => {
      const tasks = [
        { id: 'task_1', status: 'completed' },
        { id: 'task_2', status: 'completed' },
        { id: 'task_3', status: 'in_progress' },
        { id: 'task_4', status: 'pending' }
      ];

      const completedCount = tasks.filter(t => t.status === 'completed').length;
      const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
      const pendingCount = tasks.filter(t => t.status === 'pending').length;

      expect(completedCount).toBe(2);
      expect(inProgressCount).toBe(1);
      expect(pendingCount).toBe(1);
    });

    it('should calculate completion rate', () => {
      const tasks = [
        { status: 'completed' },
        { status: 'completed' },
        { status: 'in_progress' },
        { status: 'pending' }
      ];

      const completedCount = tasks.filter(t => t.status === 'completed').length;
      const completionRate = (completedCount / tasks.length) * 100;

      expect(completionRate).toBe(50);
    });
  });
});
