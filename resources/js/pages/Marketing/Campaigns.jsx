import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import {
    Calendar,
    Plus,
    Clock,
    Flame,
    Check,
    X,
    Trash2,
    Edit2,
    Play,
    Pause,
    ArrowRight,
    Sparkles,
    Tag,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function MarketingCampaigns({ campaigns = [], activeCampaign = null }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);

    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [badgeLabel, setBadgeLabel] = useState('Special Flash Offer');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isActive, setIsActive] = useState(true);

    // Live countdown timer for active campaign
    const calculateTimeLeft = () => {
        if (!activeCampaign?.end_time) return { hours: 0, minutes: 0, seconds: 0 };
        const diff = new Date(activeCampaign.end_time).getTime() - Date.now();
        if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [activeCampaign]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setBadgeLabel('Special Flash Offer');
        setDiscountPercentage('');
        // Default to now and +24 hours
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        setStartTime(now.toISOString().substring(0, 16));
        setEndTime(tomorrow.toISOString().substring(0, 16));
        setIsActive(true);
        setEditingCampaign(null);
    };

    const handleOpenCreateModal = () => {
        resetForm();
        setIsCreateModalOpen(true);
    };

    const handleOpenEditModal = (campaign) => {
        setEditingCampaign(campaign);
        setName(campaign.name);
        setDescription(campaign.description || '');
        setBadgeLabel(campaign.badge_label || 'Special Flash Offer');
        setDiscountPercentage(campaign.discount_percentage || '');
        setStartTime(campaign.start_time ? campaign.start_time.substring(0, 16) : '');
        setEndTime(campaign.end_time ? campaign.end_time.substring(0, 16) : '');
        setIsActive(campaign.is_active);
        setIsCreateModalOpen(true);
    };

    const handleSubmitCampaign = (e) => {
        e.preventDefault();

        const data = {
            name,
            description: description || null,
            badge_label: badgeLabel || 'Special Offer',
            discount_percentage: discountPercentage ? parseFloat(discountPercentage) : null,
            start_time: startTime,
            end_time: endTime,
            is_active: isActive,
        };

        if (editingCampaign) {
            router.put(`/marketing/campaigns/${editingCampaign.id}`, data, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    resetForm();
                },
            });
        } else {
            router.post('/marketing/campaigns', data, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    resetForm();
                },
            });
        }
    };

    const handleToggleCampaign = (campaign) => {
        router.patch(`/marketing/campaigns/${campaign.id}/toggle`, {}, { preserveScroll: true });
    };

    const handleDeleteCampaign = (campaign) => {
        if (confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)) {
            router.delete(`/marketing/campaigns/${campaign.id}`, { preserveScroll: true });
        }
    };

    const getCampaignStatus = (campaign) => {
        const now = new Date();
        const start = campaign.start_time ? new Date(campaign.start_time) : null;
        const end = campaign.end_time ? new Date(campaign.end_time) : null;

        if (!campaign.is_active) {
            return { label: 'Paused', variant: 'neutral' };
        }
        if (end && end < now) {
            return { label: 'Expired', variant: 'neutral' };
        }
        if (start && start > now) {
            return { label: 'Scheduled', variant: 'warning' };
        }
        return { label: 'Live Now', variant: 'success' };
    };

    return (
        <MainLayout>
            <Head title="Campaign Scheduler - Marketing Portal" />

            <MarketingHeader
                title="Flash Campaign Scheduler"
                subtitle="Configure sitewide flash events and synchronize customer storefront countdown clocks."
                actions={
                    <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateModal}>
                        Schedule Campaign
                    </Button>
                }
            />

            {/* Currently Active Campaign Spotlight */}
            {activeCampaign ? (
                <div className="mb-8 rounded-3xl bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white p-6 sm:p-8 border border-purple-800/40 shadow-xl relative overflow-hidden">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-xl">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-500/30">
                                    <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                                    <span>{activeCampaign.badge_label || 'Active Flash Sale'}</span>
                                </span>
                                {activeCampaign.discount_percentage && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                                        Up to {Math.round(activeCampaign.discount_percentage)}% OFF
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white">
                                {activeCampaign.name}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300">
                                {activeCampaign.description || 'Live customer storefront countdown clock is currently synchronized to this campaign.'}
                            </p>
                        </div>

                        {/* Live Ticking Timer Clock */}
                        <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl flex flex-col items-center gap-2 shadow-lg shrink-0">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                                <Clock className="w-4 h-4" />
                                <span>Storefront Live Clock:</span>
                            </div>
                            <div className="flex items-center gap-2 font-mono font-black text-xl text-white">
                                <div className="flex flex-col items-center">
                                    <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-amber-400 text-2xl">
                                        {String(timeLeft.hours).padStart(2, '0')}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-sans mt-0.5">Hours</span>
                                </div>
                                <span className="text-xl text-slate-500">:</span>
                                <div className="flex flex-col items-center">
                                    <span className="bg-slate-800 px-3 py-1.5 rounded-lg text-amber-400 text-2xl">
                                        {String(timeLeft.minutes).padStart(2, '0')}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-sans mt-0.5">Minutes</span>
                                </div>
                                <span className="text-xl text-slate-500">:</span>
                                <div className="flex flex-col items-center">
                                    <span className="bg-rose-600 px-3 py-1.5 rounded-lg text-white text-2xl">
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-sans mt-0.5">Seconds</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleOpenEditModal(activeCampaign)}
                                className="mt-2 text-xs text-purple-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit Campaign Details</span>
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-6 rounded-3xl bg-slate-900 text-white flex items-center justify-between border border-slate-800">
                    <div>
                        <h3 className="font-bold text-base">No Active Live Flash Campaign</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Schedule a campaign to drive high-urgency buyer conversions on the homepage.</p>
                    </div>
                    <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateModal}>
                        Schedule Flash Event
                    </Button>
                </div>
            )}

            {/* Campaigns Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-sm text-slate-900">Campaign History & Schedules</h3>
                        <p className="text-xs text-slate-500">Upcoming, active, and past promotional event windows.</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold">
                                <th className="p-3">Campaign Name</th>
                                <th className="p-3">Promotional Badge</th>
                                <th className="p-3">Discount Cap</th>
                                <th className="p-3">Start Window</th>
                                <th className="p-3">End Window</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400">
                                        No promotional campaigns created yet.
                                    </td>
                                </tr>
                            ) : (
                                campaigns.map((campaign) => {
                                    const status = getCampaignStatus(campaign);
                                    return (
                                        <tr key={campaign.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-3">
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{campaign.name}</span>
                                                    {campaign.description && (
                                                        <span className="text-[11px] text-slate-400 truncate max-w-xs block mt-0.5">
                                                            {campaign.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-3">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold text-[11px] bg-rose-100 text-rose-800">
                                                    <Flame className="w-3 h-3 text-rose-600" />
                                                    <span>{campaign.badge_label || 'Flash Offer'}</span>
                                                </span>
                                            </td>

                                            <td className="p-3">
                                                {campaign.discount_percentage ? (
                                                    <span className="font-black text-slate-900 bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                                                        {Math.round(campaign.discount_percentage)}% OFF
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Varies</span>
                                                )}
                                            </td>

                                            <td className="p-3 text-slate-600 font-mono text-[11px]">
                                                {campaign.start_time ? new Date(campaign.start_time).toLocaleString() : 'Immediate'}
                                            </td>

                                            <td className="p-3 text-slate-600 font-mono text-[11px]">
                                                {campaign.end_time ? new Date(campaign.end_time).toLocaleString() : 'No expiry'}
                                            </td>

                                            <td className="p-3">
                                                <Badge variant={status.variant} size="sm">
                                                    {status.label}
                                                </Badge>
                                            </td>

                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleCampaign(campaign)}
                                                        title={campaign.is_active ? 'Pause Campaign' : 'Activate Campaign'}
                                                    >
                                                        {campaign.is_active ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        icon={Edit2}
                                                        onClick={() => handleOpenEditModal(campaign)}
                                                    />

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-rose-600 hover:bg-rose-50"
                                                        icon={Trash2}
                                                        onClick={() => handleDeleteCampaign(campaign)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Schedule / Edit Campaign */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 animate-scale-up border border-slate-100">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    {editingCampaign ? 'Edit Campaign Window' : 'Schedule Promotional Campaign'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Synchronize customer storefront deals and countdown clocks.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCampaign} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Campaign Event Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Q4 Industrial Flash Sale Mega Event"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Description / Event Copy
                                </label>
                                <textarea
                                    rows="2"
                                    placeholder="Deep manufacturer subsidies and limited-time discounts across top vendors..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Badge Label
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Special Flash Offer"
                                        value={badgeLabel}
                                        onChange={(e) => setBadgeLabel(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Discount Cap (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="99"
                                        placeholder="e.g. 25"
                                        value={discountPercentage}
                                        onChange={(e) => setDiscountPercentage(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Start Date & Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        End Date & Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="campaign_active"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                                />
                                <label htmlFor="campaign_active" className="text-xs font-bold text-slate-800 cursor-pointer">
                                    Set as active campaign (drives storefront countdown)
                                </label>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="sm" icon={Check}>
                                    {editingCampaign ? 'Save Schedule' : 'Launch Campaign'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
