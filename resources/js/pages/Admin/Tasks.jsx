import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';
import { 
    CheckSquare, 
    Plus, 
    Kanban, 
    Table as TableIcon, 
    Clock, 
    CheckCircle2, 
    AlertTriangle, 
    AlertCircle, 
    Trophy, 
    TrendingUp, 
    Paperclip, 
    Activity, 
    Search, 
    Filter, 
    X, 
    Calendar, 
    ArrowRight, 
    User, 
    Trash2, 
    Send,
    ShieldAlert,
    ExternalLink
} from 'lucide-react';

export default function Tasks({ 
    tasks = [], 
    kanban = {}, 
    metrics = {}, 
    leaderboard = [], 
    overdueTasks = [], 
    recentActivities = [], 
    employees = [], 
    categories = [],
    filters = {} 
}) {
    const { auth } = usePage().props;
    const userPerms = auth?.user?.permissions || [];
    const canCreateTask = 
        auth?.user?.role === 'super_admin' ||
        userPerms.includes('*') ||
        userPerms.includes('module.kanban') ||
        userPerms.includes('/admin/workforce/tasks');

    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [assigneeFilter, setAssigneeFilter] = useState(filters.assigned_to || 'all');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    // Delegation Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        category: 'Product Approval',
        due_date: '',
    });

    // Task Detail & Activity Modal
    const [selectedTask, setSelectedTask] = useState(null);
    const [progressInput, setProgressInput] = useState(0);
    const [proofInput, setProofInput] = useState('');
    const [statusNote, setStatusNote] = useState('');

    // Delete Task Confirm
    const [taskToDelete, setTaskToDelete] = useState(null);

    const handleFilterApply = (updates = {}) => {
        router.get('/admin/workforce/tasks', {
            priority: (updates.priority !== undefined ? updates.priority : priorityFilter) !== 'all' ? (updates.priority !== undefined ? updates.priority : priorityFilter) : undefined,
            category: (updates.category !== undefined ? updates.category : categoryFilter) !== 'all' ? (updates.category !== undefined ? updates.category : categoryFilter) : undefined,
            assigned_to: (updates.assigned_to !== undefined ? updates.assigned_to : assigneeFilter) !== 'all' ? (updates.assigned_to !== undefined ? updates.assigned_to : assigneeFilter) : undefined,
            search: searchQuery || undefined,
        }, { preserveState: true });
    };

    const handleCreateTask = (e) => {
        e.preventDefault();
        if (!canCreateTask) return;
        router.post('/admin/workforce/tasks', createForm, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setCreateForm({
                    title: '',
                    description: '',
                    assigned_to: '',
                    priority: 'medium',
                    category: 'Product Approval',
                    due_date: '',
                });
            },
        });
    };

    const handleStatusTransition = (taskId, newStatus) => {
        router.patch(`/admin/workforce/tasks/${taskId}/status`, {
            status: newStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                if (selectedTask && selectedTask.id === taskId) {
                    setSelectedTask(prev => ({ ...prev, status: newStatus }));
                }
            }
        });
    };

    const handleProgressUpdate = (e) => {
        e.preventDefault();
        if (!selectedTask) return;

        router.patch(`/admin/workforce/tasks/${selectedTask.id}/progress`, {
            progress: parseInt(progressInput),
            proof_attachment: proofInput || undefined,
            note: statusNote || undefined,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedTask(prev => ({
                    ...prev,
                    progress: parseInt(progressInput),
                    proof_attachment: proofInput || prev.proof_attachment,
                    status: parseInt(progressInput) === 100 ? 'completed' : prev.status,
                }));
                setStatusNote('');
            },
        });
    };

    const handleDeleteTask = () => {
        if (!taskToDelete) return;
        router.delete(`/admin/workforce/tasks/${taskToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setTaskToDelete(null),
        });
    };

    const openTaskDetail = (task) => {
        setSelectedTask(task);
        setProgressInput(task.progress || 0);
        setProofInput(task.proof_attachment || '');
        setStatusNote('');
    };

    return (
        <MainLayout>
            <Head title="Task Delegation & Workforce Performance - Admin Suite | Bizzhuss" />

            <AdminHeader 
                title="Task Delegation & Employee Performance Tracking"
                subtitle="Assign operational deliverables, oversee Kanban flow across departments, and track employee on-time completion scores."
                actions={
                    canCreateTask ? (
                        <Button 
                            variant="primary" 
                            icon={Plus} 
                            onClick={() => setIsCreateOpen(true)}
                        >
                            Delegate New Task
                        </Button>
                    ) : null
                }
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
                <StatCard
                    title="Total Tasks"
                    value={metrics.total_tasks || 0}
                    icon={CheckSquare}
                    color="brand"
                />
                <StatCard
                    title="Backlog"
                    value={metrics.todo_tasks || 0}
                    icon={Clock}
                    color="slate"
                />
                <StatCard
                    title="In Progress"
                    value={metrics.in_progress_tasks || 0}
                    icon={Activity}
                    color="sky"
                />
                <StatCard
                    title="Under Review"
                    value={metrics.review_tasks || 0}
                    icon={AlertCircle}
                    color="amber"
                />
                <StatCard
                    title="Completed"
                    value={metrics.completed_tasks || 0}
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatCard
                    title="Bottlenecks / Overdue"
                    value={metrics.overdue_count || 0}
                    icon={AlertTriangle}
                    color={metrics.overdue_count > 0 ? 'rose' : 'slate'}
                />
            </div>

            {/* Bottleneck Alert Banner (if overdue tasks exist) */}
            {overdueTasks.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 mb-8 text-xs text-rose-900 animate-in fade-in">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-sm text-rose-950 flex items-center gap-2">
                                <span>Operational Bottleneck Warning: {overdueTasks.length} Overdue Task(s)</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-200 text-rose-800 uppercase">
                                    Action Required
                                </span>
                            </h3>
                            <p className="text-rose-700 mt-1 leading-relaxed">
                                The following deliverables have breached their SLA due dates without final review or sign-off. Reassign or expedite with the designated personnel:
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {overdueTasks.slice(0, 4).map((ot) => (
                                    <button
                                        key={ot.id}
                                        onClick={() => openTaskDetail(ot)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-slate-800 hover:border-rose-400 font-semibold transition-all shadow-xs cursor-pointer"
                                    >
                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                        <span>{ot.title}</span>
                                        <span className="text-[10px] text-slate-400">({ot.assignee?.name})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter & View Switcher Bar */}
            <Card className="mb-6">
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Priority Filter */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => {
                                setPriorityFilter(e.target.value);
                                handleFilterApply({ priority: e.target.value });
                            }}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
                        >
                            <option value="all">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                handleFilterApply({ category: e.target.value });
                            }}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        {/* Assignee Filter */}
                        <select
                            value={assigneeFilter}
                            onChange={(e) => {
                                setAssigneeFilter(e.target.value);
                                handleFilterApply({ assigned_to: e.target.value });
                            }}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
                        >
                            <option value="all">All Personnel</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* View Switcher Toggle & Search */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                    viewMode === 'kanban' 
                                        ? 'bg-white text-slate-900 shadow-xs' 
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <Kanban className="w-3.5 h-3.5" />
                                <span>Kanban</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                                    viewMode === 'table' 
                                        ? 'bg-white text-slate-900 shadow-xs' 
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <TableIcon className="w-3.5 h-3.5" />
                                <span>Table</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* KANBAN BOARD VIEW */}
            {viewMode === 'kanban' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    {/* Column: Backlog */}
                    <div className="bg-slate-100/70 p-4 rounded-3xl border border-slate-200/80 flex flex-col min-h-[500px]">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                                <span className="uppercase tracking-wider">Backlog</span>
                            </div>
                            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold text-[11px]">
                                {kanban.todo.length}
                            </span>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto">
                            {kanban.todo.map((task) => (
                                <TaskCard key={task.id} task={task} onOpen={openTaskDetail} onAdvance={() => handleStatusTransition(task.id, 'in_progress')} />
                            ))}
                        </div>
                    </div>

                    {/* Column: In Progress */}
                    <div className="bg-slate-100/70 p-4 rounded-3xl border border-slate-200/80 flex flex-col min-h-[500px]">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                                <span className="uppercase tracking-wider">In Progress</span>
                            </div>
                            <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                                {kanban.in_progress.length}
                            </span>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto">
                            {kanban.in_progress.map((task) => (
                                <TaskCard key={task.id} task={task} onOpen={openTaskDetail} onAdvance={() => handleStatusTransition(task.id, 'review')} />
                            ))}
                        </div>
                    </div>

                    {/* Column: Under Review */}
                    <div className="bg-slate-100/70 p-4 rounded-3xl border border-slate-200/80 flex flex-col min-h-[500px]">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                <span className="uppercase tracking-wider">Under Review</span>
                            </div>
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                                {kanban.review.length}
                            </span>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto">
                            {kanban.review.map((task) => (
                                <TaskCard key={task.id} task={task} onOpen={openTaskDetail} onAdvance={() => handleStatusTransition(task.id, 'completed')} />
                            ))}
                        </div>
                    </div>

                    {/* Column: Completed */}
                    <div className="bg-slate-100/70 p-4 rounded-3xl border border-slate-200/80 flex flex-col min-h-[500px]">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs font-bold text-slate-700">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                <span className="uppercase tracking-wider">Completed</span>
                            </div>
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                                {kanban.completed.length}
                            </span>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto">
                            {kanban.completed.map((task) => (
                                <TaskCard key={task.id} task={task} onOpen={openTaskDetail} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* INTERACTIVE TABLE VIEW */
                <Card className="mb-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                    <th className="px-5 py-3.5">Task Description</th>
                                    <th className="px-4 py-3.5">Category</th>
                                    <th className="px-4 py-3.5 text-center">Priority</th>
                                    <th className="px-4 py-3.5">Assignee</th>
                                    <th className="px-4 py-3.5 text-center">Due Date</th>
                                    <th className="px-4 py-3.5 text-center">Progress</th>
                                    <th className="px-4 py-3.5 text-center">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50/80">
                                        <td className="px-5 py-4">
                                            <span className="font-bold text-slate-900 block">{task.title}</span>
                                            {task.description && (
                                                <span className="text-[11px] text-slate-400 line-clamp-1">{task.description}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                                                {task.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <PriorityBadge priority={task.priority} />
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="font-semibold text-slate-900 block">{task.assignee?.name}</span>
                                            <span className="text-[11px] text-slate-400">{task.assignee?.email}</span>
                                        </td>
                                        <td className="px-4 py-4 text-center text-[11px]">
                                            {formatDate(task.due_date)}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <span className="font-bold text-slate-800">{task.progress || 0}%</span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <StatusBadge status={task.status} />
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => openTaskDetail(task)}
                                                className="px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-lg border border-brand-200"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* TWO-COLUMN SECTION: TOP PERFORMER LEADERBOARD & RECENT AUDIT LOGS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Employee Performance Leaderboard */}
                <div className="lg:col-span-7">
                    <Card>
                        <CardHeader className="border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        Top Performer Leaderboard & Accountability
                                    </CardTitle>
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Resolved KPI Rank
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                            <th className="px-4 py-3">Rank</th>
                                            <th className="px-4 py-3">Employee</th>
                                            <th className="px-3 py-3 text-center">Resolved</th>
                                            <th className="px-3 py-3 text-center">On-Time</th>
                                            <th className="px-3 py-3 text-center">Target Progress</th>
                                            <th className="px-4 py-3 text-center">Accountability</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                        {leaderboard.map((emp, index) => (
                                            <tr key={emp.id} className="hover:bg-slate-50/80">
                                                <td className="px-4 py-3.5 font-bold">
                                                    {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="font-bold text-slate-900 block">{emp.name}</span>
                                                    <span className="text-[11px] text-slate-400">{emp.department} • {emp.designation}</span>
                                                </td>
                                                <td className="px-3 py-3.5 text-center font-bold text-emerald-600">
                                                    {emp.completed_tasks} / {emp.total_tasks}
                                                </td>
                                                <td className="px-3 py-3.5 text-center font-bold">
                                                    <span className={emp.on_time_rate >= 80 ? 'text-emerald-600' : 'text-amber-600'}>
                                                        {emp.on_time_rate}%
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3.5 text-center">
                                                    <span className="text-[11px] font-bold text-slate-700 block">
                                                        {emp.target_progress}%
                                                    </span>
                                                    <div className="w-16 bg-slate-100 rounded-full h-1 mx-auto mt-1 overflow-hidden">
                                                        <div 
                                                            className="bg-brand-500 h-full rounded-full" 
                                                            style={{ width: `${emp.target_progress}%` }} 
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 text-center">
                                                    {emp.is_bottleneck ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                                            <AlertTriangle className="w-3 h-3 text-rose-500" />
                                                            Attention Flag
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                            On Track
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Timestamped Task Activity Log */}
                <div className="lg:col-span-5">
                    <Card>
                        <CardHeader className="border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-sky-500" />
                                    <CardTitle className="text-base font-bold text-slate-900">
                                        Task Activity Audit Trail
                                    </CardTitle>
                                </div>
                                <span className="text-[11px] text-slate-400 font-mono">Live Feed</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 max-h-[380px] overflow-y-auto">
                            {recentActivities.length === 0 ? (
                                <p className="text-xs text-slate-400 text-center py-8">No task activities recorded yet.</p>
                            ) : (
                                <div className="space-y-3.5 text-xs">
                                    {recentActivities.map((act) => (
                                        <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-none">
                                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                                {act.user?.name ? act.user.name.slice(0, 2).toUpperCase() : 'SYS'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-slate-900">{act.user?.name || 'Admin'}</span>
                                                    <span className="text-[10px] text-slate-400">{formatDate(act.created_at)}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-600 mt-0.5">{act.note}</p>
                                                {act.task && (
                                                    <span className="inline-block mt-1 text-[10px] font-mono text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded">
                                                        Ticket: {act.task.title}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Task Detail & Activity Audit Modal */}
            {selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                        {selectedTask.category || 'General'}
                                    </span>
                                    <PriorityBadge priority={selectedTask.priority} />
                                    <StatusBadge status={selectedTask.status} />
                                </div>
                                <h2 className="text-xl font-bold text-slate-900 mt-2">
                                    {selectedTask.title}
                                </h2>
                            </div>
                            <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Task Information */}
                        <div className="my-5 text-xs space-y-3">
                            {selectedTask.description && (
                                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                    {selectedTask.description}
                                </p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned To</span>
                                    <span className="font-bold text-slate-900 block mt-0.5">{selectedTask.assignee?.name}</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Due Date</span>
                                    <span className="font-bold text-slate-900 block mt-0.5">{formatDate(selectedTask.due_date)}</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Current Progress</span>
                                    <span className="font-bold text-emerald-600 block mt-0.5">{selectedTask.progress || 0}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Proof Attachment Display */}
                        {selectedTask.proof_attachment && (
                            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs">
                                <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1.5">
                                    <Paperclip className="w-4 h-4 text-emerald-600" />
                                    Submitted Proof / Deliverable Reference
                                </span>
                                <a 
                                    href={selectedTask.proof_attachment} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-emerald-700 hover:underline break-all font-mono text-[11px] flex items-center gap-1"
                                >
                                    <span>{selectedTask.proof_attachment}</span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                </a>
                            </div>
                        )}

                        {/* Progress Update & Proof Form */}
                        <form onSubmit={handleProgressUpdate} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6 text-xs space-y-3">
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                                Update Execution Progress & Attach Proof
                            </h4>

                            <div>
                                <div className="flex items-center justify-between mb-1 text-slate-700 font-bold">
                                    <span>Completion Percentage</span>
                                    <span>{progressInput}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={progressInput}
                                    onChange={(e) => setProgressInput(e.target.value)}
                                    className="w-full accent-brand-600 cursor-pointer"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Proof Attachment URL / Document Ref</label>
                                <input
                                    type="text"
                                    value={proofInput}
                                    onChange={(e) => setProofInput(e.target.value)}
                                    placeholder="https://drive.google.com/... or internal report code"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Progress Update Note</label>
                                <input
                                    type="text"
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    placeholder="Brief note on deliverable status..."
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button type="submit" variant="primary" size="sm">
                                    Save Progress
                                </Button>
                            </div>
                        </form>

                        {/* Audit Trail for this specific task */}
                        <div>
                            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
                                Ticket Activity History
                            </h4>
                            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-2 text-xs">
                                {!selectedTask.activities || selectedTask.activities.length === 0 ? (
                                    <p className="p-3 text-slate-400 text-center">No history recorded.</p>
                                ) : (
                                    selectedTask.activities.map((a) => (
                                        <div key={a.id} className="p-2.5 flex items-start justify-between">
                                            <div>
                                                <span className="font-bold text-slate-800">{a.user?.name || 'System'}</span>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{a.note}</p>
                                            </div>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDate(a.created_at)}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Task Modal */}
            {canCreateTask && isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Delegate Workforce Task</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-4 mt-5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.title}
                                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                                    placeholder="e.g. Audit Vendor Electronics KYC & Tax Docs"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Detailed Description</label>
                                <textarea
                                    rows="3"
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                    placeholder="Actionable directives, criteria, and compliance steps..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Assign To *</label>
                                    <select
                                        required
                                        value={createForm.assigned_to}
                                        onChange={(e) => setCreateForm({ ...createForm, assigned_to: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-semibold"
                                    >
                                        <option value="">Select Personnel</option>
                                        {employees.map((e) => (
                                            <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Category *</label>
                                    <select
                                        required
                                        value={createForm.category}
                                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-semibold"
                                    >
                                        {categories.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Priority Level *</label>
                                    <select
                                        value={createForm.priority}
                                        onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-semibold"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        value={createForm.due_date}
                                        onChange={(e) => setCreateForm({ ...createForm, due_date: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary">
                                    Assign Task
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}

// Kanban Task Card Component
function TaskCard({ task, onOpen, onAdvance }) {
    return (
        <div 
            onClick={() => onOpen(task)}
            className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                    {task.category || 'Ops'}
                </span>
                <PriorityBadge priority={task.priority} />
            </div>

            <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                {task.title}
            </h4>

            {task.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {task.description}
                </p>
            )}

            {/* Progress Bar */}
            <div className="mt-3">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{task.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all ${
                            task.progress >= 100 
                                ? 'bg-emerald-500' 
                                : task.progress >= 50 
                                    ? 'bg-sky-500' 
                                    : 'bg-brand-500'
                        }`} 
                        style={{ width: `${task.progress || 0}%` }}
                    />
                </div>
            </div>

            {/* Card Footer: Assignee & Due Date */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                    <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[9px] shrink-0">
                        {task.assignee?.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="truncate">{task.assignee?.name}</span>
                </div>

                <div className="flex items-center gap-1 text-[10px]">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formatDate(task.due_date)}</span>
                </div>
            </div>

            {/* Quick advance status trigger */}
            {onAdvance && (
                <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center justify-end">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdvance();
                        }}
                        className="text-[10px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 px-2 py-0.5 rounded bg-brand-50 hover:bg-brand-100 transition-colors"
                    >
                        <span>Advance Flow</span>
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            )}
        </div>
    );
}
