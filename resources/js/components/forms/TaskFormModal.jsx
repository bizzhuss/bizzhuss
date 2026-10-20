import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function TaskFormModal({ isOpen, onClose, employees = [], departments = [], postUrl = '/admin/tasks' }) {
    const { auth } = usePage().props;
    const userPerms = auth?.user?.permissions || [];
    const canCreateTask = 
        auth?.user?.role === 'super_admin' ||
        userPerms.includes('*') ||
        userPerms.includes('module.kanban') ||
        userPerms.includes('/admin/workforce/tasks');

    if (!canCreateTask) return null;
    const [form, setForm] = useState({
        title: '',
        description: '',
        department: departments[0] || 'Quality Assurance',
        priority: 'medium',
        status: 'todo',
        assigned_to: employees[0]?.id || '',
        due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        router.post(postUrl, form, {
            onSuccess: () => {
                setSubmitting(false);
                onClose();
            },
            onError: () => {
                setSubmitting(false);
            },
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delegate Operational Task"
            description="Assign workforce tasks across departments with priority ratings and deadlines."
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Task Title / Objective"
                    placeholder="e.g., Audit vendor customs documentation"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Department"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                    >
                        {departments.map((dep) => (
                            <option key={dep} value={dep}>
                                {dep}
                            </option>
                        ))}
                    </Select>

                    <Select
                        label="Priority Level"
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent 🔥</option>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label="Assign To Employee"
                        value={form.assigned_to}
                        onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                    >
                        <option value="">Unassigned</option>
                        {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.name} ({emp.department || 'Staff'})
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Due Date"
                        type="date"
                        value={form.due_date}
                        onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    />
                </div>

                <Textarea
                    label="Task Description & Acceptance Criteria"
                    placeholder="Detailed steps for operational execution..."
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" loading={submitting}>
                        Delegate Task
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
