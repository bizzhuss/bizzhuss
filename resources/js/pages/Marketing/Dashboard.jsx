import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import { 
    Sparkles, 
    Flame, 
    Image as ImageIcon, 
    Calendar, 
    Tag, 
    TrendingUp, 
    Clock, 
    ArrowRight, 
    Layers, 
    Store, 
    Gem, 
    BadgeDollarSign, 
    CheckCircle2,
    Eye,
    Plus
} from 'lucide-react';
import { getProductImage } from '@/lib/productImage';

export default function MarketingDashboard({
    metrics = {
        active_campaigns: 0,
        active_banners: 0,
        curated_products: 0,
        total_products: 0,
        total_vendors: 0,
        tier_counts: {
            flagship_featured: 0,
            special_flash_sale: 0,
            smart_value_budget: 0,
            enterprise_heavy_duty: 0,
        }
    },
    currentCampaign = null,
    recentBanners = [],
    curatedProducts = []
}) {
    // Live countdown timer for the active promotional campaign
    const calculateTimeLeft = () => {
        if (!currentCampaign?.end_time) return { hours: 12, minutes: 0, seconds: 0 };
        const diff = new Date(currentCampaign.end_time).getTime() - Date.now();
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
    }, [currentCampaign]);

    const tierCards = [
        {
            key: 'flagship_featured',
            title: 'Flagship Featured Showcase',
            description: 'Top-priority products showcased prominently on the main landing row.',
            count: metrics.tier_counts?.flagship_featured || 0,
            icon: Sparkles,
            color: 'border-brand-500/30 bg-brand-50/50 text-brand-700',
            badgeBg: 'bg-brand-500 text-white',
            href: '/marketing/curation?tier=flagship_featured',
        },
        {
            key: 'special_flash_sale',
            title: 'Special Flash Sale Tier',
            description: 'High-urgency promotional deals tied directly to active countdown timers.',
            count: metrics.tier_counts?.special_flash_sale || 0,
            icon: Flame,
            color: 'border-rose-500/30 bg-rose-50/50 text-rose-700',
            badgeBg: 'bg-rose-600 text-white',
            href: '/marketing/curation?tier=special_flash_sale',
        },
        {
            key: 'smart_value_budget',
            title: 'Smart Value & Budget Picks',
            description: 'Cost-effective supplies, starter kits, and accessories.',
            count: metrics.tier_counts?.smart_value_budget || 0,
            icon: BadgeDollarSign,
            color: 'border-amber-500/30 bg-amber-50/50 text-amber-800',
            badgeBg: 'bg-amber-600 text-white',
            href: '/marketing/curation?tier=smart_value_budget',
        },
        {
            key: 'enterprise_heavy_duty',
            title: 'Enterprise & Heavy Duty Tier',
            description: 'Heavy machinery, high-spec telemetry units, and commercial tooling.',
            count: metrics.tier_counts?.enterprise_heavy_duty || 0,
            icon: Gem,
            color: 'border-indigo-500/30 bg-indigo-50/50 text-indigo-700',
            badgeBg: 'bg-slate-900 text-white',
            href: '/marketing/curation?tier=enterprise_heavy_duty',
        },
    ];

    return (
        <MainLayout>
            <Head title="Marketing & Merchandising Executive Dashboard - Bizzhuss" />

            {/* Header with Sub-Navigation */}
            <MarketingHeader
                title="Marketing Command Center"
                subtitle="Curate storefront product tiers, schedule flash events, and manage high-conversion promotional banners."
                actions={
                    <div className="flex items-center gap-2">
                        <Link href="/marketing/banners">
                            <Button variant="primary" icon={Plus} size="sm">
                                New Banner
                            </Button>
                        </Link>
                        <Link href="/marketing/campaigns">
                            <Button variant="secondary" icon={Calendar} size="sm">
                                New Campaign
                            </Button>
                        </Link>
                    </div>
                }
            />

            {/* High-Altitude Marketing Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    title="Active Campaigns"
                    value={metrics.active_campaigns}
                    description="Scheduled live flash deals"
                    icon={Calendar}
                    trend="up"
                    trendValue="Active"
                />
                <StatCard
                    title="Promotional Banners"
                    value={metrics.active_banners}
                    description="Live Hero sliders & posters"
                    icon={ImageIcon}
                    trend="up"
                    trendValue="Published"
                />
                <StatCard
                    title="Curated Products"
                    value={metrics.curated_products}
                    description={`Across ${metrics.total_products} total catalog items`}
                    icon={Sparkles}
                    trend="up"
                    trendValue="Curated"
                />
                <StatCard
                    title="Approved Suppliers"
                    value={metrics.total_vendors}
                    description="Eligible for global curation"
                    icon={Store}
                    trend="neutral"
                    trendValue="Verified"
                />
            </div>

            {/* Active Campaign Live Ticking Banner */}
            {currentCampaign ? (
                <div className="mb-8 rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 text-white p-6 sm:p-8 border border-purple-800/40 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-purple-500/20 to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-xl">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-black uppercase tracking-wider border border-rose-500/30">
                                    <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                                    <span>{currentCampaign.badge_label || 'Live Flash Campaign'}</span>
                                </span>
                                {currentCampaign.discount_percentage && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                                        Up to {Math.round(currentCampaign.discount_percentage)}% OFF
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                {currentCampaign.name}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                {currentCampaign.description || 'Global merchandising campaign driving storewide flash promotions and curated customer discounts.'}
                            </p>
                        </div>

                        {/* Live Countdown Display */}
                        <div className="bg-slate-900/90 border border-slate-700/80 p-5 rounded-2xl flex flex-col items-center gap-2 shrink-0 shadow-lg">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                                <Clock className="w-4 h-4" />
                                <span>Storefront Countdown Ends In:</span>
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
                            <Link href="/marketing/campaigns" className="mt-2 text-xs text-purple-300 hover:text-white flex items-center gap-1 font-semibold">
                                <span>Adjust Schedule</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-6 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-base">No Active Campaign Running</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Schedule a limited-time flash discount event to activate the customer storefront countdown timer.</p>
                    </div>
                    <Link href="/marketing/campaigns">
                        <Button variant="primary" icon={Plus} size="sm">
                            Schedule Campaign
                        </Button>
                    </Link>
                </div>
            )}

            {/* 4 Curation Tiers Overview */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Landing Page Curation Tiers</h2>
                        <p className="text-xs text-slate-500">Assign multi-vendor catalog items to specific storefront showcases.</p>
                    </div>
                    <Link href="/marketing/curation" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                        <span>Open Curation Hub</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tierCards.map((tier) => {
                        const Icon = tier.icon;
                        return (
                            <div 
                                key={tier.key} 
                                className={`rounded-2xl border p-5 transition-all hover:shadow-md flex flex-col justify-between ${tier.color}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-xl bg-white shadow-xs flex items-center justify-center">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs ${tier.badgeBg}`}>
                                            {tier.count} Items
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-900">{tier.title}</h3>
                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tier.description}</p>
                                </div>
                                <div className="mt-4 pt-3 border-t border-slate-200/60">
                                    <Link 
                                        href={tier.href} 
                                        className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
                                    >
                                        <span>Curate Tier</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Live Banners & Curated Showcase Strip */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Active Hero Banners Preview */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base font-bold">Storefront Hero Sliders</CardTitle>
                            <CardDescription className="text-xs">Live carousel slides displayed at the top of the homepage</CardDescription>
                        </div>
                        <Link href="/marketing/banners" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                            <span>Manage Banners</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentBanners.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center">No banners uploaded yet.</p>
                        ) : (
                            recentBanners.map((banner) => (
                                <div key={banner.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-white hover:border-purple-300 transition-colors">
                                    <img 
                                        src={banner.image_url || banner.image_path} 
                                        alt={banner.title} 
                                        className="w-16 h-12 object-cover rounded-lg shrink-0 border border-slate-200"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300';
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-xs text-slate-900 truncate">{banner.title}</span>
                                            {banner.badge_text && (
                                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                                    {banner.badge_text}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{banner.subtitle || banner.target_url}</p>
                                    </div>
                                    <Badge variant={banner.is_active ? 'success' : 'neutral'} size="sm">
                                        {banner.is_active ? 'Live' : 'Draft'}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Recently Curated Showcase Items */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle className="text-base font-bold">Featured Catalog Items</CardTitle>
                            <CardDescription className="text-xs">Products currently actively merchandised on the storefront</CardDescription>
                        </div>
                        <Link href="/marketing/curation" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                            <span>Open Hub</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {curatedProducts.length === 0 ? (
                            <p className="text-xs text-slate-400 py-4 text-center">No products curated yet.</p>
                        ) : (
                            curatedProducts.map((p) => {
                                return (
                                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 bg-white hover:border-purple-300 transition-colors">
                                        <img 
                                            src={getProductImage(p)} 
                                            alt={p.title} 
                                            className="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-200"
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-product.svg';
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-xs text-slate-900 truncate">{p.title}</p>
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                                <span>{p.vendor?.shop_name || 'Vendor'}</span>
                                                <span>•</span>
                                                <span className="font-bold text-slate-800">{formatCurrency(p.price)}</span>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 shrink-0">
                                            {p.sale_badge_label || p.curation_tier?.replace('_', ' ') || 'Curated'}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
