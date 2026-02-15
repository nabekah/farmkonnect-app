import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

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

const TaskAssignmentScreen = () => {
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

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.type.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [tasks, filterStatus, searchQuery])

  const stats = {
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#dc2626'
      case 'high':
        return '#f97316'
      case 'medium':
        return '#eab308'
      case 'low':
        return '#22c55e'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle'
      case 'in_progress':
        return 'clock-outline'
      case 'pending':
        return 'alert-circle-outline'
      default:
        return 'help-circle-outline'
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

  const handleUpdateTaskStatus = (
    taskId: number,
    newStatus: 'pending' | 'in_progress' | 'completed'
  ) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
  }

  const renderTaskCard = ({ item }: { item: Task }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskTitleContainer}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDescription}>{item.description}</Text>
        </View>
        <MaterialCommunityIcons
          name={getStatusIcon(item.status)}
          size={24}
          color={getPriorityColor(item.priority)}
        />
      </View>

      <View style={styles.taskDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.dueDate}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.estimatedHours}h est.</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{item.assignedTo}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="flag" size={16} color={getPriorityColor(item.priority)} />
          <Text
            style={[
              styles.detailText,
              { color: getPriorityColor(item.priority), fontWeight: '600' },
            ]}
          >
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.taskActions}>
        <Text style={styles.statusLabel}>{getStatusLabel(item.status)}</Text>
        <View style={styles.actionButtons}>
          {item.status !== 'completed' && (
            <TouchableOpacity
              style={styles.reassignButton}
              onPress={() => handleAssignTask(item)}
            >
              <Text style={styles.reassignButtonText}>Reassign</Text>
            </TouchableOpacity>
          )}
          {item.status === 'pending' && (
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleUpdateTaskStatus(item.id, 'in_progress')}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          )}
          {item.status === 'in_progress' && (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleUpdateTaskStatus(item.id, 'completed')}
            >
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )

  const renderStatCard = (label: string, count: number, color: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Assignment</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
        {(['all', 'pending', 'in_progress', 'completed'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filterStatus === status && styles.filterTabActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === status && styles.filterTabTextActive,
              ]}
            >
              {status === 'all'
                ? 'All'
                : status === 'in_progress'
                  ? 'In Progress'
                  : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {renderStatCard('Pending', stats.pending, '#f97316')}
        {renderStatCard('In Progress', stats.inProgress, '#3b82f6')}
        {renderStatCard('Completed', stats.completed, '#22c55e')}
      </View>

      {/* Tasks List */}
      <FlatList
        data={filteredTasks}
        renderItem={renderTaskCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.tasksList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="inbox-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>No tasks found</Text>
          </View>
        }
      />

      {/* Reassign Modal */}
      <Modal
        visible={showAssignModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAssignModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reassign Task</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <View style={styles.modalTaskInfo}>
                <Text style={styles.modalTaskTitle}>{selectedTask.title}</Text>
                <Text style={styles.modalTaskSubtitle}>
                  Currently assigned to {selectedTask.assignedTo}
                </Text>
              </View>
            )}

            <Text style={styles.modalLabel}>Select Worker</Text>

            <FlatList
              data={workers}
              renderItem={({ item: worker }) => (
                <TouchableOpacity
                  style={styles.workerOption}
                  onPress={() => handleReassignTask(worker.id)}
                >
                  <View>
                    <Text style={styles.workerName}>{worker.name}</Text>
                    <Text style={styles.workerRole}>{worker.role}</Text>
                    <View style={styles.workerInfo}>
                      <Text style={styles.workerInfoText}>
                        Availability: {worker.availability}h
                      </Text>
                      <Text style={styles.workerInfoText}>Tasks: {worker.currentTasks}</Text>
                    </View>
                    <View style={styles.skillsContainer}>
                      {worker.skills.map((skill) => (
                        <View key={skill} style={styles.skillTag}>
                          <Text style={styles.skillTagText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#9ca3af" />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAssignModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#111827',
  },
  filterTabs: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  filterTabActive: {
    backgroundColor: '#3b82f6',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  tasksList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskDetails: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  reassignButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  reassignButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  startButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  startButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  completeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalTaskInfo: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalTaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  modalTaskSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  workerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  workerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  workerRole: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  workerInfo: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  workerInfoText: {
    fontSize: 11,
    color: '#6b7280',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  skillTagText: {
    fontSize: 10,
    color: '#374151',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
})

export default TaskAssignmentScreen
