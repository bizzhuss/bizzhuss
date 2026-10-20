import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { TaskFormModal } from '@/components/forms/TaskFormModal';
import { formatDate } from '@/lib/utils';
import { 
    Briefcase, 
    Kanban, 
    Table as TableIcon, 
    Plus, 
    Calendar, 
    User, 
    CheckCircle2, 
    ArrowRight, 
    ArrowLeft, 
    Clock, 
    AlertCircle, 
    Filter,
    Shield
} from 'lucide-react';

export default function EmployeeWorkspace({ tasks = [], employees = [], departments = [], metrics = {}, filters = {} }) {
    const { auth } = usePage().props;
    const userPerms = auth?.user?.permissions || [];
    const canCreateTask = 
        auth?.user?.role === 'super_admin' ||
        userPerms.includes('*') ||
        userPerms.includes('module.kanban') ||
        userPerms.includes('/admin/workforce/tasks');

    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [departmentFilter, setDepartmentFilter] = useState(filters.department || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');

    const handleFilterChange = (dep, prio) => {
        router.get('/employee', {
            department: dep !== 'all' ? dep : undefined,
            priority: prio !== 'all' ? prio : undefined,
        }, { preserveState: true });
    };

    const handleStatusMove = (taskId, newStatus) => {
        router.patch(`/employee/tasks/${taskId}/status`, {
            status: newStatus,
        }, { preserveScroll: true });
    };

    const columns = [
        { id: 'todo', title: 'To Do', color: 'border-slate-300 text-slate-700 bg-slate-100', dot: 'bg-slate-400' },
        { id: 'in_progress', title: 'In Progress', color: 'border-sky-300 text-sky-700 bg-sky-50', dot: 'bg-sky-500' },
        { id: 'review', title: 'Review / QA', color: 'border-purple-300 text-purple-700 bg-purple-50', dot: 'bg-purple-500' },
        { id: 'completed', title: 'Completed', color: 'border-emerald-300 text-emerald-700 bg-emerald-50', dot: 'bg-emerald-500' },
    ];

    const getNextStatus = (current) => {
        if (current === 'todo') return 'in_progress';
        if (current === 'in_progress') return 'review';
        if (current === 'review') return 'completed';
        return null;
    };

    const getPrevStatus = (current) => {
        if (current === 'completed') return 'review';
        if (current === 'review') return 'in_progress';
        if (current === 'in_progress') return 'todo';
        return null;
    };

    return (
        <MainLayout>
            <Head title="Employee Workforce Workspace - Bizzhuss" />

            {/* Header & View Mode Switcher */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Workforce Management Workspace
                        </h1>
                        <Badge variant="blue" className="text-xs">
                            Tier 4 Operational Desk
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Operational triage, fulfillment quality assurance, and cross-departmental duty management.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher Toggle */}
                    <div className="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode('kanban')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                viewMode === 'kanban'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Kanban className="w-3.5 h-3.5" />
                            <span>Kanban Board</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                viewMode === 'table'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                            <span>Table View</span>
                        </button>
                    </div>

                    {canCreateTask && (
                        <Button
                            variant="primary"
                            icon={Plus}
                            onClick={() => setIsTaskModalOpen(true)}
                        >
                            Create Task
                        </Button>
                    )}
                </div>
            </div>

            {/* Operational Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase">Active Backlog</p>
                        <p className="text-xl font-bold text-slate-900 mt-0.5">{metrics.total || 0}</p>
                    </div>
                    <Briefcase className="w-6 h-6 text-brand-600 opacity-80" />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-slate-500 uppercase">In Progress</p>
                        <p className="text-xl font-bold text-sky-600 mt-0.5">{metrics.in_progress || 0}</p>
                    </div>
                    <Clock className="w-6 h-6 text-sky-500 opacity-80" />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-rose-600 uppercase">Urgent Escalations</p>
                        <p className="text-xl font-bold text-rose-600 mt-0.5">{metrics.urgent || 0}</p>
                    </div>
                    <AlertCircle className="w-6 h-6 text-rose-500 opacity-80" />
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-[11px] font-semibold text-emerald-600 uppercase">Completed</p>
                        <p className="text-xl font-bold text-emerald-600 mt-0.5">{metrics.completed || 0}</p>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-80" />
                </div>
            </div>

            {/* Department Filters Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700">Filter Department:</span>
                    <select
                        value={departmentFilter}
                        onChange={(e) => {
                            setDepartmentFilter(e.target.value);
                            handleFilterChange(e.target.value, priorityFilter);
                        }}
                        className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
                    >
                        <option value="all">All Departments</option>
                        {departments.map((d) => (
                            <option key={d} value={d}>
                                {d}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Priority:</span>
                    <select
                        value={priorityFilter}
                        onChange={(e) => {
                            setPriorityFilter(e.target.value);
                            handleFilterChange(departmentFilter, e.target.value);
                        }}
                        className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none"
                    >
                        <option value="all">All Priorities</option>
                        <option value="urgent">Urgent 🔥</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* View Mode 1: Interactive Kanban Board View */}
            {viewMode === 'kanban' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {columns.map((column) => {
                        const colTasks = tasks.filter((t) => t.status === column.id);
                        return (
                            <div key={column.id} className="flex flex-col bg-slate-100/70 rounded-2xl p-4 border border-slate-200">
                                {/* Column Header */}
                                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${column.dot}`} />
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                            {column.title}
                                        </h3>
                                    </div>
                                    <span className="bg-white text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                        {colTasks.length}
                                    </span>
                                </div>

                                {/* Task Cards */}
                                <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px]">
                                    {colTasks.length === 0 ? (
                                        <div className="h-28 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">
                                            No tasks in this lane
                                        </div>
                                    ) : (
                                        colTasks.map((task) => {
                                            const nextStatus = getNextStatus(task.status);
                                            const prevStatus = getPrevStatus(task.status);
                                            return (
                                                <div
                                                    key={task.id}
                                                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <StatusBadge status={task.priority} className="text-[10px]" />
                                                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                            {task.department}
                                                        </span>
                                                    </div>

                                                    <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                                                        {task.title}
                                                    </h4>

                                                    {task.description && (
                                                        <p className="text-[11px] text-slate-500 line-clamp-2">
                                                            {task.description}
                                                        </p>
                                                    )}

                                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px] font-bold">
                                                                {task.assignee ? task.assignee.name.slice(0, 1) : '?'}
                                                            </div>
                                                            <span className="truncate max-w-[90px]">
                                                                {task.assignee ? task.assignee.name : 'Unassigned'}
                                                            </span>
                                                        </div>

                                                        {task.due_date && (
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>{formatDate(task.due_date)}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quick Transition Arrows */}
                                                    <div className="flex items-center justify-between pt-1">
                                                        {prevStatus ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusMove(task.id, prevStatus)}
                                                                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors text-[10px] flex items-center gap-0.5"
                                                                title="Move Back"
                                                            >
                                                                <ArrowLeft className="w-3 h-3" />
                                                                <span>Back</span>
                                                            </button>
                                                        ) : (
                                                            <div />
                                                        )}

                                                        {nextStatus && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStatusMove(task.id, nextStatus)}
                                                                className="text-brand-600 hover:text-brand-800 p-1 rounded hover:bg-brand-50 transition-colors text-[10px] font-semibold flex items-center gap-0.5"
                                                                title="Advance Status"
                                                            >
                                                                <span>Advance</span>
                                                                <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* View Mode 2: Operational Table View */
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3.5">Task Description</th>
                                    <th className="px-4 py-3.5">Department</th>
                                    <th className="px-4 py-3.5">Priority</th>
                                    <th className="px-4 py-3.5">Assigned To</th>
                                    <th className="px-4 py-3.5">Status</th>
                                    <th className="px-4 py-3.5">Due Date</th>
                                    <th className="px-6 py-3.5 text-right">Quick Transition</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50/60">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900">{task.title}</div>
                                            {task.description && (
                                                <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                                    {task.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="font-medium text-slate-800">{task.department}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={task.priority} />
                                        </td>
                                        <td className="px-4 py-4">
                                            {task.assignee ? task.assignee.name : <span className="text-slate-400 italic">Unassigned</span>}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusBadge status={task.status} />
                                        </td>
                                        <td className="px-4 py-4 text-slate-500">
                                            {formatDate(task.due_date)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusMove(task.id, e.target.value)}
                                                className="text-xs font-semibold rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none"
                                            >
                                                <option value="todo">To Do</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="review">Review</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Task Creation Modal */}
            {canCreateTask && (
                <TaskFormModal
                    isOpen={isTaskModalOpen}
                    onClose={() => setIsTaskModalOpen(false)}
                    employees={employees}
                    departments={departments}
                    postUrl="/employee/tasks"
                />
            )}
        </MainLayout>
    );
}
