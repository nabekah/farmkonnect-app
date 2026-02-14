import { db } from './db';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface Worker {
  id: string;
  farmId: string;
  name: string;
  role: 'supervisor' | 'field_worker' | 'equipment_operator' | 'specialist';
  phone: string;
  email: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'on_leave';
  hourlyRate: number;
  skills: string[];
}

export interface Task {
  id: string;
  farmId: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate: Date;
  estimatedHours: number;
  actualHours?: number;
  createdAt: Date;
  completedAt?: Date;
}

export interface Schedule {
  id: string;
  farmId: string;
  workerId: string;
  date: Date;
  startTime: string;
  endTime: string;
  taskId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Performance {
  id: string;
  farmId: string;
  workerId: string;
  month: Date;
  tasksCompleted: number;
  tasksOnTime: number;
  averageRating: number;
  hoursWorked: number;
  earnings: number;
  attendance: number; // percentage
}

export class LaborManagementSystem {
  // Worker Management
  async addWorker(farmId: string, worker: Omit<Worker, 'id'>): Promise<Worker> {
    const id = `worker_${Date.now()}`;
    const newWorker: Worker = {
      ...worker,
      id,
      farmId
    };
    // In real implementation, save to database
    return newWorker;
  }

  async getWorkers(farmId: string, status?: string): Promise<Worker[]> {
    // Mock data
    return [
      {
        id: 'w1',
        farmId,
        name: 'John Doe',
        role: 'field_worker',
        phone: '+1234567890',
        email: 'john@farm.com',
        joinDate: new Date('2023-01-15'),
        status: 'active',
        hourlyRate: 15,
        skills: ['planting', 'weeding', 'harvesting']
      },
      {
        id: 'w2',
        farmId,
        name: 'Jane Smith',
        role: 'supervisor',
        phone: '+1234567891',
        email: 'jane@farm.com',
        joinDate: new Date('2022-06-01'),
        status: 'active',
        hourlyRate: 25,
        skills: ['supervision', 'planning', 'training']
      }
    ];
  }

  async updateWorkerStatus(workerId: string, status: Worker['status']): Promise<void> {
    // Update in database
  }

  // Task Management
  async createTask(farmId: string, task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const id = `task_${Date.now()}`;
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date()
    };
    return newTask;
  }

  async getTasks(farmId: string, filters?: { status?: string; workerId?: string; priority?: string }): Promise<Task[]> {
    // Mock data
    return [
      {
        id: 't1',
        farmId,
        title: 'Prepare field for planting',
        description: 'Clear weeds and prepare soil',
        assignedTo: 'w1',
        priority: 'high',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        estimatedHours: 8,
        actualHours: 4,
        createdAt: new Date()
      },
      {
        id: 't2',
        farmId,
        title: 'Irrigation system check',
        description: 'Inspect and repair irrigation lines',
        assignedTo: 'w2',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        estimatedHours: 6,
        createdAt: new Date()
      }
    ];
  }

  async updateTaskStatus(taskId: string, status: Task['status'], actualHours?: number): Promise<void> {
    // Update in database
  }

  async assignTask(taskId: string, workerId: string): Promise<void> {
    // Update task assignment
  }

  // Schedule Management
  async createSchedule(farmId: string, schedule: Omit<Schedule, 'id'>): Promise<Schedule> {
    const id = `sched_${Date.now()}`;
    return { ...schedule, id };
  }

  async getSchedule(farmId: string, date: Date, workerId?: string): Promise<Schedule[]> {
    // Mock data
    return [
      {
        id: 's1',
        farmId,
        workerId: 'w1',
        date,
        startTime: '06:00',
        endTime: '14:00',
        taskId: 't1',
        status: 'scheduled',
        notes: 'Start early due to heat'
      },
      {
        id: 's2',
        farmId,
        workerId: 'w2',
        date,
        startTime: '08:00',
        endTime: '16:00',
        taskId: 't2',
        status: 'scheduled'
      }
    ];
  }

  async generateWeeklySchedule(farmId: string, startDate: Date, tasks: Task[]): Promise<Schedule[]> {
    const schedules: Schedule[] = [];
    const workers = await this.getWorkers(farmId, 'active');
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      for (const task of tasks) {
        const worker = workers[Math.floor(Math.random() * workers.length)];
        schedules.push({
          id: `sched_${Date.now()}_${i}`,
          farmId,
          workerId: worker.id,
          date,
          startTime: '06:00',
          endTime: '14:00',
          taskId: task.id,
          status: 'scheduled'
        });
      }
    }
    
    return schedules;
  }

  // Performance Tracking
  async getWorkerPerformance(farmId: string, workerId: string, month: Date): Promise<Performance> {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    // Mock calculation
    return {
      id: `perf_${workerId}_${month.getTime()}`,
      farmId,
      workerId,
      month,
      tasksCompleted: 12,
      tasksOnTime: 11,
      averageRating: 4.5,
      hoursWorked: 160,
      earnings: 2400,
      attendance: 95
    };
  }

  async getTeamPerformance(farmId: string, month: Date): Promise<Performance[]> {
    const workers = await this.getWorkers(farmId, 'active');
    const performances: Performance[] = [];
    
    for (const worker of workers) {
      const perf = await this.getWorkerPerformance(farmId, worker.id, month);
      performances.push(perf);
    }
    
    return performances;
  }

  // Payroll Management
  async calculatePayroll(farmId: string, month: Date): Promise<{ workerId: string; name: string; hoursWorked: number; hourlyRate: number; totalEarnings: number }[]> {
    const workers = await this.getWorkers(farmId, 'active');
    const payroll = [];
    
    for (const worker of workers) {
      const perf = await this.getWorkerPerformance(farmId, worker.id, month);
      payroll.push({
        workerId: worker.id,
        name: worker.name,
        hoursWorked: perf.hoursWorked,
        hourlyRate: worker.hourlyRate,
        totalEarnings: perf.hoursWorked * worker.hourlyRate
      });
    }
    
    return payroll;
  }

  // Attendance Tracking
  async recordAttendance(farmId: string, workerId: string, date: Date, status: 'present' | 'absent' | 'leave'): Promise<void> {
    // Record in database
  }

  async getAttendanceReport(farmId: string, month: Date): Promise<{ workerId: string; name: string; present: number; absent: number; leave: number; percentage: number }[]> {
    const workers = await this.getWorkers(farmId, 'active');
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    
    return workers.map(worker => ({
      workerId: worker.id,
      name: worker.name,
      present: Math.floor(daysInMonth * 0.9),
      absent: Math.floor(daysInMonth * 0.05),
      leave: Math.floor(daysInMonth * 0.05),
      percentage: 90
    }));
  }

  // Skills Management
  async assignSkill(workerId: string, skill: string): Promise<void> {
    // Add skill to worker
  }

  async getWorkersBySkill(farmId: string, skill: string): Promise<Worker[]> {
    const workers = await this.getWorkers(farmId);
    return workers.filter(w => w.skills.includes(skill));
  }

  // Analytics
  async getLaborCostAnalysis(farmId: string, month: Date): Promise<{ totalCost: number; averageCostPerTask: number; costByRole: Record<string, number> }> {
    const payroll = await this.calculatePayroll(farmId, month);
    const totalCost = payroll.reduce((sum, p) => sum + p.totalEarnings, 0);
    const tasks = await this.getTasks(farmId);
    
    return {
      totalCost,
      averageCostPerTask: totalCost / (tasks.length || 1),
      costByRole: {
        supervisor: 2000,
        field_worker: 1500,
        equipment_operator: 1800,
        specialist: 2200
      }
    };
  }

  async getProductivityMetrics(farmId: string, month: Date): Promise<{ tasksPerWorker: number; averageTaskDuration: number; completionRate: number }> {
    const tasks = await this.getTasks(farmId);
    const workers = await this.getWorkers(farmId, 'active');
    
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalHours = tasks.reduce((sum, t) => sum + (t.actualHours || t.estimatedHours), 0);
    
    return {
      tasksPerWorker: tasks.length / (workers.length || 1),
      averageTaskDuration: totalHours / (tasks.length || 1),
      completionRate: (completedTasks / tasks.length) * 100
    };
  }
}

export const laborManagement = new LaborManagementSystem();
