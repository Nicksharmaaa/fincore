import React, { useState, useEffect, useMemo } from 'react'
import {
  CheckSquare,
  Clock,
  AlertCircle,
  Plus,
  CheckCircle2,
  Calendar,
  Phone,
  FileText,
  User,
  Filter,
  Check,
  ChevronDown,
  RotateCw,
  Sparkles,
} from 'lucide-react'
import {
  fetchTasksAPI,
  createTaskAPI,
  updateTaskAPI,
  type CRMTask,
} from '../../../services/api'

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<CRMTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filterMode, setFilterMode] = useState<'ALL' | 'TODAY' | 'OVERDUE' | 'HIGH' | 'COMPLETED'>('ALL')

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [callbackModalOpen, setCallbackModalOpen] = useState(false)
  const [callLogModalOpen, setCallLogModalOpen] = useState(false)

  // Task form state
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newClient, setNewClient] = useState('Arjun Kapoor')
  const [newPriority, setNewPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Normal'>('High')
  const [newDue, setNewDue] = useState('Today, 4:30 PM')

  // Call log form state
  const [callClient, setCallClient] = useState('Arjun Kapoor')
  const [callDuration, setCallDuration] = useState('8 mins')
  const [callDisposition, setCallDisposition] = useState<'Interested' | 'Call Back' | 'Unreachable' | 'Proposal Requested'>('Proposal Requested')
  const [callNotes, setCallNotes] = useState('Customer reviewed HDFC Click 2 Protect quotation. Agreed to proceed with video medical scheduling.')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    setLoading(true)
    try {
      const data = await fetchTasksAPI()
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed'
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus as any,
              is_overdue: false,
              completed_at: newStatus === 'Completed' ? 'Just now' : undefined,
            }
          : t
      )
    )
    await updateTaskAPI(taskId, { status: newStatus as any })
  }

  const handleReschedule = async (taskId: string, daysAhead: number) => {
    const dateStr = daysAhead === 1 ? 'Tomorrow, 11:00 AM' : `In ${daysAhead} days, 2:00 PM`
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, due_date: dateStr, is_overdue: false } : t
      )
    )
    await updateTaskAPI(taskId, { due_date: dateStr })
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const newTask: CRMTask = {
      id: `tsk-${Date.now()}`,
      client_name: newClient,
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      status: 'Pending',
      due_date: newDue,
      is_overdue: false,
    }
    setTasks([newTask, ...tasks])
    setCreateModalOpen(false)
    setNewTitle('')
    setNewDesc('')
    await createTaskAPI({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      due_date: newDue,
    })
  }

  const handleScheduleCallback = async (e: React.FormEvent) => {
    e.preventDefault()
    const newTask: CRMTask = {
      id: `tsk-${Date.now()}`,
      client_name: newClient,
      title: `Scheduled Callback: ${newClient} regarding proposal`,
      description: `Callback agenda: Review coverage gap calculations and clear policy wording questions.`,
      priority: 'High',
      status: 'Pending',
      due_date: newDue,
      is_overdue: false,
    }
    setTasks([newTask, ...tasks])
    setCallbackModalOpen(false)
  }

  const handleRecordCallOutcome = (e: React.FormEvent) => {
    e.preventDefault()
    // Append completed call record task
    const completedCall: CRMTask = {
      id: `tsk-${Date.now()}`,
      client_name: callClient,
      title: `Call Recorded: ${callDisposition} (${callDuration})`,
      description: callNotes,
      priority: 'Normal',
      status: 'Completed',
      due_date: 'Today',
      completed_at: 'Just now',
      is_overdue: false,
    }
    setTasks([completedCall, ...tasks])
    setCallLogModalOpen(false)
  }

  // Filtered task list
  const filteredTasks = useMemo(() => {
    let result = [...tasks]
    if (filterMode === 'TODAY') {
      result = result.filter((t) => t.due_date.toLowerCase().includes('today'))
    } else if (filterMode === 'OVERDUE') {
      result = result.filter((t) => t.is_overdue)
    } else if (filterMode === 'HIGH') {
      result = result.filter((t) => t.priority === 'Urgent' || t.priority === 'High')
    } else if (filterMode === 'COMPLETED') {
      result = result.filter((t) => t.status === 'Completed')
    }
    return result
  }, [tasks, filterMode])

  const overdueCount = tasks.filter((t) => t.is_overdue).length

  return (
    <div className="space-y-6 select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D] bg-[#E8F5F2] px-2 py-0.5 rounded">
              Operational Workflow
            </span>
            <span className="text-[11px] text-[#687788]">
              {tasks.filter((t) => t.status === 'Pending').length} Pending Tasks
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-1">
            Follow-Up Cadence & Task Hub
          </h1>
          <p className="text-xs text-[#687788]">
            Manage client advisory callbacks, tele-underwriting coordination, document collection and call logging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCallLogModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E8EF] bg-white hover:bg-[#F7F9FB] text-[#142D4E] text-xs font-semibold transition-colors shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 text-[#16856D]" />
            <span>Record Call Outcome</span>
          </button>

          <button
            onClick={() => setCallbackModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E2E8EF] bg-white hover:bg-[#F7F9FB] text-[#142D4E] text-xs font-semibold transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#142D4E]" />
            <span>Schedule Callback</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Task</span>
          </button>
        </div>
      </div>

      {/* OVERDUE TASKS BANNER (If any overdue tasks exist) */}
      {overdueCount > 0 && (
        <div className="p-4 rounded-xl bg-[#FDF2F2] border border-[#C44545]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#C44545] text-white flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[#C44545]">
                {overdueCount} Overdue Follow-up Task requiring immediate client contact
              </h3>
              <p className="text-[11px] text-[#687788]">
                IRDAI prompt advisory guidelines mandate following up within 24 hours of scheduled client callback.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('OVERDUE')}
              className="px-3 py-1.5 rounded-lg bg-[#C44545] text-white font-semibold text-[11px] shadow-xs"
            >
              Filter Overdue
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="bg-white p-3 rounded-xl border border-[#E2E8EF] shadow-xs flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { key: 'ALL', label: `All Tasks (${tasks.length})` },
            { key: 'TODAY', label: 'Due Today' },
            { key: 'OVERDUE', label: `Overdue (${overdueCount})`, isAlert: overdueCount > 0 },
            { key: 'HIGH', label: 'Urgent & High' },
            { key: 'COMPLETED', label: 'Completed Archive' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterMode(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === tab.key
                  ? tab.isAlert
                    ? 'bg-[#C44545] text-white'
                    : 'bg-[#142D4E] text-white'
                  : tab.isAlert
                  ? 'text-[#C44545] hover:bg-[#FDF2F2]'
                  : 'text-[#687788] hover:bg-[#F7F9FB] hover:text-[#182536]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[#687788] hidden sm:inline">
          Showing <strong>{filteredTasks.length}</strong> items
        </span>
      </div>

      {/* Task Cards List */}
      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs divide-y divide-[#E2E8EF]">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#687788]">
            No tasks match the selected filter.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7F9FB] transition-colors ${
                task.status === 'Completed' ? 'opacity-60 bg-[#F7F9FB]/40' : ''
              }`}
            >
              {/* Checkbox and Task Content */}
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.status === 'Completed'}
                  onChange={() => handleToggleComplete(task.id, task.status)}
                  className="w-4 h-4 rounded mt-0.5 accent-[#16856D] cursor-pointer"
                  title="Toggle task completion"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs font-bold text-[#182536] ${
                        task.status === 'Completed' ? 'line-through text-[#687788]' : ''
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.is_overdue && (
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-[#C44545] text-white px-1.5 py-0.2 rounded">
                        OVERDUE
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-[#687788] leading-normal">{task.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-[#687788] pt-0.5">
                    {task.client_name && (
                      <span>
                        Client: <strong className="text-[#182536]">{task.client_name}</strong>
                      </span>
                    )}
                    {task.lead_number && (
                      <span className="font-mono text-[10px] bg-[#E9F1F5] text-[#142D4E] px-1.5 py-0.2 rounded">
                        {task.lead_number}
                      </span>
                    )}
                    <span>Assigned: {task.assigned_to_name || 'Rahul Sharma'}</span>
                  </div>
                </div>
              </div>

              {/* Priority & Due Date Actions */}
              <div className="flex items-center gap-3 text-xs flex-shrink-0 self-end sm:self-center">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    task.priority === 'Urgent'
                      ? 'bg-[#FDF2F2] text-[#C44545]'
                      : task.priority === 'High'
                      ? 'bg-[#FDF7EE] text-[#C58A36]'
                      : 'bg-[#E9F1F5] text-[#142D4E]'
                  }`}
                >
                  {task.priority}
                </span>

                <span className="text-[11px] text-[#687788] flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{task.due_date}</span>
                </span>

                {/* Reschedule Shortcuts */}
                {task.status !== 'Completed' && (
                  <div className="flex items-center gap-1 pl-2 border-l border-[#E2E8EF]">
                    <button
                      onClick={() => handleReschedule(task.id, 1)}
                      className="px-2 py-1 text-[10px] font-semibold rounded border border-[#E2E8EF] hover:bg-[#E9F1F5] text-[#142D4E]"
                      title="Reschedule +1 Day"
                    >
                      +1 Day
                    </button>
                    <button
                      onClick={() => handleReschedule(task.id, 3)}
                      className="px-2 py-1 text-[10px] font-semibold rounded border border-[#E2E8EF] hover:bg-[#E9F1F5] text-[#142D4E]"
                      title="Reschedule +3 Days"
                    >
                      +3 Days
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: CREATE TASK */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E2E8EF] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                Create Operational Follow-Up Task
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-[#687788] hover:text-[#182536]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#182536] mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Follow-up on 3-year Form 16 submission"
                  className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white focus:outline-none focus:border-[#142D4E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#182536] mb-1">Associated Client</label>
                <input
                  type="text"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  placeholder="Client name"
                  className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white focus:outline-none focus:border-[#142D4E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#182536] mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Details for underwriting follow-up..."
                  className="w-full p-2.5 rounded-lg border border-[#E2E8EF] bg-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full h-8 px-2 rounded-lg border border-[#E2E8EF] bg-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">Due Date & Time *</label>
                  <input
                    type="text"
                    required
                    value={newDue}
                    onChange={(e) => setNewDue(e.target.value)}
                    placeholder="e.g. Today, 5:00 PM"
                    className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2E8EF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8EF] text-[#687788] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white font-semibold shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE CALLBACK */}
      {callbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E2E8EF] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                Schedule Client Advisory Callback
              </h3>
              <button onClick={() => setCallbackModalOpen(false)} className="text-[#687788] hover:text-[#182536]">
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleCallback} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#182536] mb-1">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  placeholder="e.g. Neha Verma"
                  className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white focus:outline-none focus:border-[#142D4E]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#182536] mb-1">Callback Scheduled For *</label>
                <input
                  type="text"
                  required
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  placeholder="e.g. Tomorrow, 11:30 AM"
                  className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8EF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCallbackModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8EF] text-[#687788] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#142D4E] text-white font-semibold shadow-xs"
                >
                  Confirm Callback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECORD CALL OUTCOME */}
      {callLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E2E8EF] max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8EF]">
              <h3 className="text-base font-bold text-[#142D4E] font-['Manrope']">
                Record Call Outcome
              </h3>
              <button onClick={() => setCallLogModalOpen(false)} className="text-[#687788] hover:text-[#182536]">
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordCallOutcome} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#182536] mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={callClient}
                  onChange={(e) => setCallClient(e.target.value)}
                  className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">Call Duration</label>
                  <input
                    type="text"
                    value={callDuration}
                    onChange={(e) => setCallDuration(e.target.value)}
                    placeholder="e.g. 12 mins"
                    className="w-full h-8 px-3 rounded-lg border border-[#E2E8EF] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#182536] mb-1">Call Disposition *</label>
                  <select
                    value={callDisposition}
                    onChange={(e) => setCallDisposition(e.target.value as any)}
                    className="w-full h-8 px-2 rounded-lg border border-[#E2E8EF] bg-white"
                  >
                    <option value="Proposal Requested">Proposal Requested</option>
                    <option value="Interested">Interested / In Progress</option>
                    <option value="Call Back">Call Back Later</option>
                    <option value="Unreachable">Unreachable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#182536] mb-1">Discussion Summary & Action Taken</label>
                <textarea
                  rows={3}
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#E2E8EF] bg-white resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E8EF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCallLogModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8EF] text-[#687788] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#142D4E] text-white font-semibold shadow-xs"
                >
                  Save Call Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
