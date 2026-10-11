import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { 
    Building2, 
    Briefcase, 
    Users, 
    Plus, 
    Edit2, 
    Trash2, 
    X, 
    FolderPlus, 
    Layers, 
    CheckCircle2, 
    AlertTriangle,
    Tag
} from 'lucide-react';

export default function Departments({ departments = [], metrics = {} }) {
    // Department Modals
    const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
    const [deptForm, setDeptForm] = useState({ name: '', description: '' });
    const [editingDept, setEditingDept] = useState(null);
    const [deptToDelete, setDeptToDelete] = useState(null);

    // Designation Modals
    const [isCreateDesigOpen, setIsCreateDesigOpen] = useState(false);
    const [targetDeptForDesig, setTargetDeptForDesig] = useState(null);
    const [desigTitle, setDesigTitle] = useState('');
    const [desigToDelete, setDesigToDelete] = useState(null);

    // Department Handlers
    const handleCreateDepartment = (e) => {
        e.preventDefault();
        router.post('/admin/workforce/departments', deptForm, {
            onSuccess: () => {
                setIsCreateDeptOpen(false);
                setDeptForm({ name: '', description: '' });
            },
        });
    };

    const handleUpdateDepartment = (e) => {
        e.preventDefault();
        if (!editingDept) return;
        router.put(`/admin/workforce/departments/${editingDept.id}`, {
            name: editingDept.name,
            description: editingDept.description,
        }, {
            onSuccess: () => setEditingDept(null),
        });
    };

    const handleDeleteDepartment = () => {
        if (!deptToDelete) return;
        router.delete(`/admin/workforce/departments/${deptToDelete.id}`, {
            onSuccess: () => setDeptToDelete(null),
        });
    };

    // Designation Handlers
    const handleCreateDesignation = (e) => {
        e.preventDefault();
        if (!targetDeptForDesig || !desigTitle) return;

        router.post('/admin/workforce/designations', {
            department_id: targetDeptForDesig.id,
            title: desigTitle,
        }, {
            onSuccess: () => {
                setIsCreateDesigOpen(false);
                setDesigTitle('');
                setTargetDeptForDesig(null);
            },
        });
    };

    const handleDeleteDesignation = () => {
        if (!desigToDelete) return;
        router.delete(`/admin/workforce/designations/${desigToDelete.id}`, {
            onSuccess: () => setDesigToDelete(null),
        });
    };

    return (
        <MainLayout>
            <Head title="Department & Designation Hierarchy - Admin Suite | Bizzhuss" />

            <AdminHeader 
                title="Workforce Department & Role Hierarchy"
                subtitle="Structure operational divisions, configure executive and operational designations, and allocate staff responsibilities."
                actions={
                    <Button 
                        variant="primary" 
                        icon={FolderPlus} 
                        onClick={() => setIsCreateDeptOpen(true)}
                    >
                        New Department
                    </Button>
                }
            />

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <StatCard
                    title="Active Divisions"
                    value={`${metrics.total_departments || 0} Departments`}
                    subtitle="Organizational functional units"
                    icon={Building2}
                    color="brand"
                />
                <StatCard
                    title="Designation Roles"
                    value={`${metrics.total_designations || 0} Titles`}
                    subtitle="Tiered hierarchy roles"
                    icon={Briefcase}
                    color="sky"
                />
                <StatCard
                    title="Total Assigned Staff"
                    value={`${metrics.total_workforce || 0} Employees`}
                    subtitle="Active personnel under hierarchy"
                    icon={Users}
                    color="emerald"
                />
            </div>

            {/* Department Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                    <Card key={dept.id} className="flex flex-col justify-between">
                        <CardHeader className="pb-3 border-b border-slate-100">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold text-slate-900">
                                            {dept.name}
                                        </CardTitle>
                                        <span className="text-[11px] text-slate-400 font-medium">
                                            {dept.employees_count} Employees Assigned
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setEditingDept({ ...dept })}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                                        title="Edit Department"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setDeptToDelete(dept)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                        title="Delete Department"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                            {dept.description && (
                                <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                    {dept.description}
                                </p>
                            )}
                        </CardHeader>

                        <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        Designations ({dept.designations ? dept.designations.length : 0})
                                    </span>
                                    <button
                                        onClick={() => {
                                            setTargetDeptForDesig(dept);
                                            setIsCreateDesigOpen(true);
                                        }}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 cursor-pointer"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>Add Role</span>
                                    </button>
                                </div>

                                <div className="space-y-1.5 min-h-[80px]">
                                    {!dept.designations || dept.designations.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic py-2">
                                            No designations defined yet.
                                        </p>
                                    ) : (
                                        dept.designations.map((desig) => (
                                            <div
                                                key={desig.id}
                                                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-slate-700 transition-colors group"
                                            >
                                                <span className="font-medium truncate">{desig.title}</span>
                                                <button
                                                    onClick={() => setDesigToDelete(desig)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                                                    title="Remove Designation"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                <span>Slug: <code className="font-mono text-slate-600">{dept.slug}</code></span>
                                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                    Active Unit
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Create Department Modal */}
            {isCreateDeptOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Create New Department</h3>
                            <button onClick={() => setIsCreateDeptOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDepartment} className="space-y-4 mt-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={deptForm.name}
                                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                                    placeholder="e.g. Quality Assurance, Logistics, Customer Care"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={deptForm.description}
                                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                                    placeholder="Describe functional purpose, objectives, and departmental jurisdiction..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <Button type="button" variant="secondary" onClick={() => setIsCreateDeptOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary">
                                    Create Department
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Department Modal */}
            {editingDept && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Edit Department</h3>
                            <button onClick={() => setEditingDept(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateDepartment} className="space-y-4 mt-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editingDept.name}
                                    onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={editingDept.description || ''}
                                    onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <Button type="button" variant="secondary" onClick={() => setEditingDept(null)}>
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

            {/* Add Designation Modal */}
            {isCreateDesigOpen && targetDeptForDesig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">
                                Add Designation to {targetDeptForDesig.name}
                            </h3>
                            <button onClick={() => setIsCreateDesigOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDesignation} className="space-y-4 mt-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Role / Designation Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={desigTitle}
                                    onChange={(e) => setDesigTitle(e.target.value)}
                                    placeholder="e.g. Senior QC Lead, Operations Coordinator"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500 font-semibold"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <Button type="button" variant="secondary" onClick={() => setIsCreateDesigOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary">
                                    Add Designation
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Department Confirmation */}
            {deptToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Delete Department</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Are you sure you want to remove <strong className="text-slate-800">{deptToDelete.name}</strong>? Ensure there are no active employees assigned before proceeding.
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="secondary" onClick={() => setDeptToDelete(null)}>Cancel</Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDeleteDepartment}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Designation Confirmation */}
            {desigToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Remove Designation</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Are you sure you want to delete role <strong className="text-slate-800">{desigToDelete.title}</strong>?
                        </p>
                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="secondary" onClick={() => setDesigToDelete(null)}>Cancel</Button>
                            <Button variant="danger" icon={Trash2} onClick={handleDeleteDesignation}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
