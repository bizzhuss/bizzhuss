import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
    Users, 
    UserPlus, 
    Search, 
    Briefcase, 
    Building2, 
    CheckCircle2, 
    Clock, 
    Target, 
    Edit, 
    Trash2, 
    X, 
    Filter,
    Shield,
    AlertTriangle,
    Mail,
    Phone,
    Key,
    ShieldCheck,
    CheckSquare,
    Settings,
    Store,
    Megaphone,
    Sparkles,
    Lock,
    Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_PERMISSIONS = [
    {
        id: 'tier.vendor_portal',
        name: 'Vendor Portal (Tier 3)',
        badge: 'Tier 3',
        desc: 'Access to vendor merchant management, product catalog & fulfillment (/vendor)',
        icon: Store,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
        id: 'tier.employee_desk',
        name: 'Employee Desk (Tier 4)',
        badge: 'Tier 4',
        desc: 'Access to workforce desk, operational assignments & personal tickets (/employee)',
        icon: Briefcase,
        color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    {
        id: 'tier.marketing_hub',
        name: 'Marketing Hub (Tier 5)',
        badge: 'Tier 5',
        desc: 'Access to marketing campaigns, banners & curation hub (/marketing)',
        icon: Megaphone,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
];

const MODULE_PERMISSIONS = [
    {
        id: 'module.central_command',
        name: 'Central Command',
        path: '/admin',
        desc: 'Admin dashboard metrics & platform telemetry overview',
        icon: Target,
    },
    {
        id: 'module.vendor_oversight',
        name: 'Vendor Oversight & Governance',
        path: '/admin/vendors',
        desc: 'Manage vendor approvals, commission rates & shop status',
        icon: Store,
    },
    {
        id: 'module.storefront_curation',
        name: 'Storefront Curation',
        path: '/admin/marketing/curation',
        desc: 'Merchandising, flash sales & featured showcase products',
        icon: Sparkles,
    },
    {
        id: 'module.departments',
        name: 'Departments & Hierarchy',
        path: '/admin/workforce/departments',
        desc: 'Corporate departments & operational designation titles',
        icon: Building2,
    },
    {
        id: 'module.workforce',
        name: 'Workforce Directory',
        path: '/admin/workforce/employees',
        desc: 'Workforce personnel directory & staff permission delegation',
        icon: Users,
    },
    {
        id: 'module.kanban',
        name: 'Task Delegation & Kanban',
        path: '/admin/workforce/tasks',
        desc: 'Interactive operational task kanban board & assignments',
        icon: CheckSquare,
    },
    {
        id: 'module.platform_settings',
        name: 'Platform Settings',
        path: '/admin/settings',
        desc: 'Global configurations, maintenance mode & financial payouts',
        icon: Settings,
    },
];

export default function Employees({ employees = [], departments = [], metrics = {}, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [departmentFilter, setDepartmentFilter] = useState(filters.department || 'all');

    // Onboarding Modal State
    const [isOnboardOpen, setIsOnboardOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        department_id: '',
        designation_id: '',
        employee_code: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
        monthly_target: 25,
    });

    // Edit Modal State
    const [editingEmployee, setEditingEmployee] = useState(null);

    // Delete Confirmation
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    // Staff Permissions & Tier Access Modal State
    const [permissionEmployee, setPermissionEmployee] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [isSavingPermissions, setIsSavingPermissions] = useState(false);

    const handleOpenPermissions = (emp) => {
        setPermissionEmployee(emp);
        setSelectedPermissions(emp.user?.permissions || []);
    };

    const togglePermission = (permId) => {
        setSelectedPermissions(prev =>
            prev.includes(permId)
                ? prev.filter(p => p !== permId)
                : [...prev, permId]
        );
    };

    const selectAllModules = () => {
        const moduleIds = MODULE_PERMISSIONS.map(m => m.id);
        setSelectedPermissions(prev => Array.from(new Set([...prev, ...moduleIds])));
    };

    const clearAllPermissions = () => {
        setSelectedPermissions([]);
    };

    const handleSavePermissions = (e) => {
        e.preventDefault();
        if (!permissionEmployee) return;

        setIsSavingPermissions(true);
        router.post(`/admin/workforce/employees/${permissionEmployee.id}/permissions`, {
            permissions: selectedPermissions,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSavingPermissions(false);
                setPermissionEmployee(null);
            },
            onError: () => {
                setIsSavingPermissions(false);
            }
        });
    };

    // Filter designations based on selected department in create form
    const selectedDeptObj = departments.find(d => d.id === parseInt(formData.department_id));
    const availableDesignations = selectedDeptObj ? selectedDeptObj.designations : [];

    // Filter designations based on selected department in edit form
    const editDeptObj = editingEmployee ? departments.find(d => d.id === parseInt(editingEmployee.department_id)) : null;
    const editAvailableDesignations = editDeptObj ? editDeptObj.designations : [];

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/workforce/employees', {
            search: searchQuery || undefined,
            department: departmentFilter !== 'all' ? departmentFilter : undefined,
        }, { preserveState: true });
    };

    const handleDeptFilter = (deptId) => {
        setDepartmentFilter(deptId);
        router.get('/admin/workforce/employees', {
            department: deptId !== 'all' ? deptId : undefined,
            search: searchQuery || undefined,
        }, { preserveState: true });
    };

    const handleOnboardSubmit = (e) => {
        e.preventDefault();
        router.post('/admin/workforce/employees', formData, {
            onSuccess: () => {
                setIsOnboardOpen(false);
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    phone: '',
                    department_id: '',
                    designation_id: '',
                    employee_code: 'EMP-' + Math.floor(1000 + Math.random() * 9000),
                    monthly_target: 25,
                });
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editingEmployee) return;

        router.put(`/admin/workforce/employees/${editingEmployee.id}`, {
            name: editingEmployee.user.name,
            phone: editingEmployee.user.phone,
            department_id: editingEmployee.department_id,
            designation_id: editingEmployee.designation_id,
            monthly_target: editingEmployee.monthly_target,
            status: editingEmployee.status,
        }, {
            onSuccess: () => setEditingEmployee(null),
        });
    };

    const handleDeleteEmployee = () => {
        if (!employeeToDelete) return;

        router.delete(`/admin/workforce/employees/${employeeToDelete.id}`, {
            onSuccess: () => setEmployeeToDelete(null),
        });
    };

    return (
        <MainLayout>
            <Head title="Employee Directory & Workforce Management - Admin Suite | Bizzhuss" />

            <AdminHeader 
                title="Workforce Directory & Onboarding"
                subtitle="Onboard enterprise staff, allocate departmental responsibilities, and monitor monthly resolved task KPIs."
                actions={
                    <Button 
                        variant="primary" 
                        icon={UserPlus} 
                        onClick={() => setIsOnboardOpen(true)}
                    >
                        Onboard New Employee
                    </Button>
                }
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Total Staff Roster"
                    value={`${metrics.total_employees || 0} Personnel`}
                    subtitle="Registered workforce accounts"
                    icon={Users}
                    color="brand"
                />
                <StatCard
                    title="Active On Duty"
                    value={`${metrics.active_personnel || 0} Active`}
                    subtitle="Available for task delegation"
                    icon={CheckCircle2}
                    color="emerald"
                />
                <StatCard
                    title="Tasks in Execution"
                    value={`${metrics.total_active_tasks || 0} Tickets`}
                    subtitle="Currently in progress or review"
                    icon={Clock}
                    color="sky"
                />
                <StatCard
                    title="Resolved Deliverables"
                    value={`${metrics.total_completed_tasks || 0} Tasks`}
                    subtitle="Cumulative completed tickets"
                    icon={Target}
                    color="purple"
                />
            </div>

            {/* Filter and Search Bar */}
            <Card className="mb-6">
                <div className="p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    {/* Department Dropdown Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                            value={departmentFilter}
                            onChange={(e) => handleDeptFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl outline-none focus:border-brand-500 cursor-pointer"
                        >
                            <option value="all">All Departments ({departments.length})</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, employee code, or email..."
                                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:bg-white transition-all"
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">
                            Search
                        </Button>
                    </form>
                </div>
            </Card>

            {/* Employee Directory Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                                <th className="px-5 py-3.5">Employee</th>
                                <th className="px-4 py-3.5">Code</th>
                                <th className="px-4 py-3.5">Department & Role</th>
                                <th className="px-4 py-3.5 text-center">Active Tasks</th>
                                <th className="px-4 py-3.5 text-center">Resolved Tasks</th>
                                <th className="px-4 py-3.5 text-center">Monthly Target</th>
                                <th className="px-4 py-3.5 text-center">Status</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {employees.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-5 py-12 text-center text-slate-400">
                                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                        <p className="font-semibold text-slate-600">No workforce personnel found</p>
                                        <p className="text-[11px] text-slate-400 mt-1">Try clearing your filters or onboard a new employee.</p>
                                    </td>
                                </tr>
                            ) : (
                                employees.map((emp) => {
                                    const targetCompletionPct = Math.min(
                                        100, 
                                        Math.round((emp.completed_tasks_count / Math.max(1, emp.monthly_target)) * 100)
                                    );

                                    return (
                                        <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Employee Name & Avatar */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                                        {emp.user?.avatar ? (
                                                            <img src={emp.user.avatar} alt={emp.user.name} className="w-full h-full object-cover rounded-xl" />
                                                        ) : (
                                                            emp.user?.name.slice(0, 2).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-900 block">
                                                            {emp.user?.name}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400">
                                                            {emp.user?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Employee Code */}
                                            <td className="px-4 py-4 font-mono font-semibold text-slate-800">
                                                {emp.employee_code}
                                            </td>

                                            {/* Department & Role */}
                                            <td className="px-4 py-4">
                                                <span className="font-bold text-slate-800 block">
                                                    {emp.department?.name || 'General Operations'}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[11px] text-brand-600 font-medium">
                                                        {emp.designation?.title || 'Staff Associate'}
                                                    </span>
                                                    {emp.user?.permissions && emp.user.permissions.length > 0 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenPermissions(emp)}
                                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
                                                            title={`${emp.user.permissions.length} permissions granted: ${emp.user.permissions.join(', ')}`}
                                                        >
                                                            <Key className="w-2.5 h-2.5 text-amber-600" />
                                                            <span>{emp.user.permissions.length} perms</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenPermissions(emp)}
                                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                                                            title="Default role permissions only. Click to assign granular access."
                                                        >
                                                            <Shield className="w-2.5 h-2.5 text-slate-400" />
                                                            <span>Default role</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Active Tasks */}
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-md">
                                                    <Clock className="w-3 h-3 text-sky-500" />
                                                    {emp.active_tasks_count}
                                                </span>
                                            </td>

                                            {/* Completed Tasks */}
                                            <td className="px-4 py-4 text-center">
                                                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                    {emp.completed_tasks_count}
                                                </span>
                                            </td>

                                            {/* Monthly Target & Progress */}
                                            <td className="px-4 py-4 text-center">
                                                <div className="max-w-[120px] mx-auto">
                                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                                                        <span>{emp.completed_tasks_count} / {emp.monthly_target}</span>
                                                        <span>{targetCompletionPct}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all ${
                                                                targetCompletionPct >= 100 
                                                                    ? 'bg-emerald-500' 
                                                                    : targetCompletionPct >= 60 
                                                                        ? 'bg-brand-500' 
                                                                        : 'bg-amber-400'
                                                            }`} 
                                                            style={{ width: `${targetCompletionPct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-4 text-center">
                                                <StatusBadge status={emp.status} />
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenPermissions(emp)}
                                                        className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 border border-amber-200 transition-colors cursor-pointer"
                                                        title="Manage Permissions & Tier Access"
                                                    >
                                                        <Key className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingEmployee({
                                                            ...emp,
                                                            department_id: emp.department?.id || '',
                                                            designation_id: emp.designation?.id || '',
                                                        })}
                                                        className="p-1.5 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                                                        title="Edit Employee"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEmployeeToDelete(emp)}
                                                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                                                        title="Delete Employee"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Onboard Employee Modal */}
            {isOnboardOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                                    <UserPlus className="w-4 h-4" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Onboard New Employee</h3>
                            </div>
                            <button onClick={() => setIsOnboardOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleOnboardSubmit} className="space-y-4 mt-5 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Rachel Adams"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Employee Code *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.employee_code}
                                        onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-mono font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Company Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="rachel@bizzhuss.com"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Temporary Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Department *</label>
                                    <select
                                        required
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value, designation_id: '' })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 bg-white font-semibold cursor-pointer"
                                    >
                                        <option value="">Select Division</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Designation Title *</label>
                                    <select
                                        required
                                        disabled={!formData.department_id}
                                        value={formData.designation_id}
                                        onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 bg-white font-semibold cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {formData.department_id ? 'Select Role' : 'Select Dept First'}
                                        </option>
                                        {availableDesignations.map((desig) => (
                                            <option key={desig.id} value={desig.id}>
                                                {desig.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Monthly Target (Tasks) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="500"
                                        value={formData.monthly_target}
                                        onChange={(e) => setFormData({ ...formData, monthly_target: parseInt(e.target.value) || 25 })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <Button type="button" variant="secondary" onClick={() => setIsOnboardOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" icon={UserPlus}>
                                    Complete Onboarding
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            {editingEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">
                                Edit Employee: {editingEmployee.user?.name}
                            </h3>
                            <button onClick={() => setEditingEmployee(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 mt-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editingEmployee.user.name}
                                    onChange={(e) => setEditingEmployee({
                                        ...editingEmployee,
                                        user: { ...editingEmployee.user, name: e.target.value }
                                    })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-semibold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Department</label>
                                    <select
                                        value={editingEmployee.department_id}
                                        onChange={(e) => setEditingEmployee({
                                            ...editingEmployee,
                                            department_id: e.target.value,
                                            designation_id: ''
                                        })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-semibold"
                                    >
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Designation</label>
                                    <select
                                        value={editingEmployee.designation_id}
                                        onChange={(e) => setEditingEmployee({
                                            ...editingEmployee,
                                            designation_id: e.target.value
                                        })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-semibold"
                                    >
                                        {editAvailableDesignations.map((desig) => (
                                            <option key={desig.id} value={desig.id}>{desig.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Monthly Target</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editingEmployee.monthly_target}
                                        onChange={(e) => setEditingEmployee({
                                            ...editingEmployee,
                                            monthly_target: parseInt(e.target.value) || 25
                                        })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                                    <select
                                        value={editingEmployee.status}
                                        onChange={(e) => setEditingEmployee({
                                            ...editingEmployee,
                                            status: e.target.value
                                        })}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-semibold"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <Button type="button" variant="secondary" onClick={() => setEditingEmployee(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Permissions & Tier Access Modal */}
            {permissionEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full my-8 shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold border border-amber-500/20 shadow-xs">
                                    <Key className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                        Manage Staff Permissions & Tier Access
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                        <span className="font-semibold text-slate-700">{permissionEmployee.user?.name}</span>
                                        <span>•</span>
                                        <span className="font-mono text-[11px] text-slate-600 font-bold">{permissionEmployee.employee_code}</span>
                                        <span>•</span>
                                        <span className="text-brand-600 font-medium">{permissionEmployee.department?.name || 'General Operations'}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setPermissionEmployee(null)} 
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
                            {/* Super Admin Tier 2 Protection Banner */}
                            <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-800">
                                <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <div className="leading-relaxed">
                                    <span className="font-bold text-amber-300 block text-xs">Super Admin Tier 2 Protection</span>
                                    <p className="text-[11px] text-slate-300 mt-0.5">
                                        Tier 2 (Command Center) is strictly reserved for root administrators and cannot be assigned to normal staff. Below, you can delegate access to individual operational sub-modules or secondary tiers.
                                    </p>
                                </div>
                            </div>

                            {/* Presets / Toolbar */}
                            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Active Grants:
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                                        {selectedPermissions.length} selected
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={selectAllModules}
                                        className="text-[11px] font-bold text-brand-600 hover:text-brand-700 px-2.5 py-1 rounded-lg hover:bg-brand-50 transition-colors cursor-pointer"
                                    >
                                        Select All Admin Modules
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        onClick={clearAllPermissions}
                                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* SECTION 1: Top Portals & Tier Delegations */}
                            <div>
                                <div className="mb-3">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                                        Top Portals & Tier Delegations
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Allow this employee to switch into dedicated tier portals alongside their staff responsibilities.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2.5">
                                    {TIER_PERMISSIONS.map((tier) => {
                                        const Icon = tier.icon;
                                        const isChecked = selectedPermissions.includes(tier.id);

                                        return (
                                            <label
                                                key={tier.id}
                                                onClick={() => togglePermission(tier.id)}
                                                className={cn(
                                                    "flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all cursor-pointer select-none",
                                                    isChecked
                                                        ? "bg-amber-50/50 border-amber-400 shadow-xs ring-1 ring-amber-400/30"
                                                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300"
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {}}
                                                    className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                                                />
                                                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5", tier.color)}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 text-xs">
                                                            {tier.name}
                                                        </span>
                                                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-bold">
                                                            {tier.badge}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                        {tier.desc}
                                                    </p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SECTION 2: Admin / Operational Sub-Modules */}
                            <div>
                                <div className="mb-3">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                        <Settings className="w-3.5 h-3.5 text-brand-600" />
                                        Admin Operational Modules (Sub-Tabs)
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Select which operational tabs and commands in the Super Admin suite this employee can access.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {MODULE_PERMISSIONS.map((mod) => {
                                        const Icon = mod.icon;
                                        const isChecked = selectedPermissions.includes(mod.id);

                                        return (
                                            <label
                                                key={mod.id}
                                                onClick={() => togglePermission(mod.id)}
                                                className={cn(
                                                    "flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer select-none",
                                                    isChecked
                                                        ? "bg-brand-50/50 border-brand-400 shadow-xs ring-1 ring-brand-400/30"
                                                        : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300"
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {}}
                                                    className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <Icon className={cn("w-3.5 h-3.5", isChecked ? "text-brand-600" : "text-slate-500")} />
                                                        <span className="font-bold text-slate-900 text-xs truncate">
                                                            {mod.name}
                                                        </span>
                                                    </div>
                                                    <span className="font-mono text-[10px] text-brand-600 block mt-0.5">
                                                        {mod.path}
                                                    </span>
                                                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                                                        {mod.desc}
                                                    </p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={() => setPermissionEmployee(null)}
                                disabled={isSavingPermissions}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="button" 
                                variant="primary" 
                                icon={Check}
                                onClick={handleSavePermissions}
                                disabled={isSavingPermissions}
                            >
                                {isSavingPermissions ? 'Saving Permissions...' : 'Save Permissions'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Employee Confirmation Modal */}
            {employeeToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Remove Employee</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Are you sure you want to remove <strong className="text-slate-800">{employeeToDelete.user?.name}</strong> ({employeeToDelete.employee_code})? Their user account and active task assignments will be removed.
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="secondary" onClick={() => setEmployeeToDelete(null)}>Cancel</Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDeleteEmployee}>Remove Employee</Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
