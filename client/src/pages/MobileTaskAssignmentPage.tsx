import React, { useState } from 'react'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Filter,
  Search,
  ChevronRight,
  Calendar,
  User,
  Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface Task {
  id: number
  title: string
  description: string
  assignedTo: string
  assignedToId: number
  dueDate: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'pending' | 'in_progress' | 'completed'
  estimatedHours: number
  actualHours?: number
  type: string
  location?: string
}

interface Worker {
  id: number
  name: string
  role: string
  availability: number
  currentTasks: number
  skills: string[]
}

export default function MobileTaskAssignmentPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Prepare Field A for Planting',
      description: 'Clear weeds and level soil in Field A',
      assignedTo: 'John Doe',
      assignedToId: 1,
      dueDate: '2026-02-20',
      priority: 'high',
      status: 'in_progress',
      estimatedHours: 8,
      actualHours: 6,
      type: 'Planting',
      location: 'Field A',
    },
    {
      id: 2,
      title: 'Irrigate North Field',
      description: 'Water the north field thoroughly',
      assignedTo: 'Maria Garcia',
      assignedToId: 2,
      dueDate: '2026-02-19',
      priority: 'medium',
      status: 'pending',
      estimatedHours: 4,
      type: 'Irrigation',
      location: 'North Field',
    },
    {
      id: 3,
      title: 'Equipment Maintenance',
      description: 'Service and oil all tractors',
      assignedTo: 'Robert Johnson',
      assignedToId: 3,
      dueDate: '2026-02-21',
      priority: 'medium',
      status: 'pending',
      estimatedHours: 6,
      type: 'Maintenance',
      location: 'Equipment Shed',
    },
  ])

  const [workers] = useState<Worker[]>([
    {
      id: 1,
      name: 'John Doe',
      role: 'Field Worker',
      availability: 8,
      currentTasks: 2,
      skills: ['Irrigation', 'Pest Control', 'Equipment Operation'],
    },
    {
      id: 2,
      name: 'Maria Garcia',
      role: 'Soil Specialist',
      availability: 6,
      currentTasks: 1,
      skills: ['Soil Management', 'Crop Monitoring'],
    },
    {
      id: 3,
      name: 'Robert Johnson',
      role: 'Equipment Technician',
      availability: 8,
      currentTasks: 1,
      skills: ['Equipment Maintenance', 'Irrigation'],
    },
  ])

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>(
    'all'
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress'
      case 'pending':
        return 'Pending'
      case 'completed':
        return 'Completed'
      default:
        return status
    }
  }

  const handleAssignTask = (task: Task) => {
    setSelectedTask(task)
    setShowAssignModal(true)
  }

  const handleReassignTask = (workerId: number) => {
    if (selectedTask) {
      const worker = workers.find((w) => w.id === workerId)
      if (worker) {
        setTasks(
          tasks.map((t) =>
            t.id === selectedTask.id
              ? { ...t, assignedTo: worker.name, assignedToId: worker.id }
              : t
          )
        )
        setShowAssignModal(false)
        setSelectedTask(null)
      }
    }
  }

  const handleUpdateTaskStatus = (taskId: number, newStatus: 'pending' | 'in_progress' | 'completed') => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
  }

  const stats = {
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Task Assignment</h1>
          <Button
            onClick={() => setShowAssignModal(true)}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Task
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filterStatus}
            onValueChange={(v) => setFilterStatus(v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="space-y-3 p-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No tasks found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="p-4">
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{task.title}</h3>
                      <p className="text-xs text-gray-600">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {getStatusIcon(task.status)}
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>{task.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{task.estimatedHours}h est.</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <User className="w-3 h-3" />
                      <span>{task.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Flag className="w-3 h-3" />
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge and Actions */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs font-semibold text-gray-600">
                      {getStatusLabel(task.status)}
                    </span>
                    <div className="flex gap-2">
                      {task.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignTask(task)}
                          className="text-xs"
                        >
                          Reassign
                        </Button>
                      )}
                      {task.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                          className="text-xs bg-blue-600 hover:bg-blue-700"
                        >
                          Start
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          className="text-xs bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reassign Modal */}
      {showAssignModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-white rounded-t-lg p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Reassign Task</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-900">{selectedTask.title}</p>
              <p className="text-xs text-gray-600 mt-1">Currently assigned to {selectedTask.assignedTo}</p>
            </div>

            <p className="text-sm font-semibold text-gray-900 mb-3">Select Worker</p>

            <div className="space-y-2">
              {workers.map((worker) => (
                <button
                  key={worker.id}
                  onClick={() => handleReassignTask(worker.id)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900">{worker.name}</p>
                    <span className="text-xs font-semibold text-gray-600">{worker.role}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Availability: {worker.availability}h</span>
                    <span>Tasks: {worker.currentTasks}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {worker.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => setShowAssignModal(false)}
              variant="outline"
              className="w-full mt-4"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
