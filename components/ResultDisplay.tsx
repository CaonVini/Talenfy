'use client';

import React, { memo, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Target,
    Zap,
    TrendingUp,
    BrainCircuit,
    Award,
    BookOpen,
    Briefcase,
    ChevronRight,
    AlertTriangle,
    Lightbulb,
    X,
    LayoutDashboard,
    Layers,
    ArrowRight
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { ResultCard } from '@/components/ui/ResultCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

// --- Types ---

interface AnalysisData {
    score: number;
    breakdown?: {
        technical: number;
        experience: number;
        cultural: number;
        ats: number;
    };
    verdict?: string;
    summaryInsight?: string;
    strongPoints?: any[];
    gaps?: any[];
    atsOptimization?: any[];
    immediateActions?: any[];
    marketInsight?: string;
    interviewPreparation?: any[];
    careerGuidance?: string;
    // Legacy support
    summary?: string;
    overview?: string;
    strengths?: string[];
    recommendations?: string[];
}

interface ResultDisplayProps {
    data: AnalysisData;
    onClose?: () => void;
}

// --- Constants & Config ---

const COLORS = {
    scoreLow: '#ef4444',
    scoreMid: '#f59e0b',
    scoreHigh: '#10b981',
    technical: '#3b82f6',
    experience: '#8b5cf6',
    cultural: '#10b981',
    ats: '#f97316',
};

const VERDICT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    STRONG_MATCH: { label: 'Compatibilidade Alta', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    GOOD_MATCH: { label: 'Boa Compatibilidade', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
    MODERATE_MATCH: { label: 'Compatibilidade Moderada', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    WEAK_MATCH: { label: 'Compatibilidade Baixa', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    POOR_MATCH: { label: 'Incompatível', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

// --- Sub-Components ---

const ScoreGauge = ({ score }: { score: number }) => {
    const clampedScore = Math.min(Math.max(0, score), 100);
    const data = [
        { name: 'Score', value: clampedScore },
        { name: 'Remaining', value: 100 - clampedScore },
    ];

    let color = COLORS.scoreLow;
    if (clampedScore >= 70) color = COLORS.scoreHigh;
    else if (clampedScore >= 50) color = COLORS.scoreMid;

    return (
        <div className="relative w-40 h-40 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        startAngle={180}
                        endAngle={0}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                    >
                        <Cell fill={color} />
                        <Cell fill="#f1f5f9" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-6">
                <span className="text-4xl font-bold text-slate-800">{clampedScore}</span>
                <span className="block text-[10px] uppercase text-slate-500 font-bold tracking-widest">Score</span>
            </div>
        </div>
    );
};

const SkillsRadar = ({ breakdown }: { breakdown: any }) => {
    if (!breakdown) return null;

    const normalizedData = [
        { subject: 'Técnico', value: Math.min(100, Math.round((breakdown.technical / 40) * 100)), fullMark: 100 },
        { subject: 'Experiência', value: Math.min(100, Math.round((breakdown.experience / 30) * 100)), fullMark: 100 },
        { subject: 'Cultural', value: Math.min(100, Math.round((breakdown.cultural / 15) * 100)), fullMark: 100 },
    ];

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={normalizedData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Percentual"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${value}%`, 'Aderência']}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

const MetricBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className="mb-5 last:mb-0">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600">{label}</span>
                <span className="text-sm font-bold text-slate-900">{value}/{max}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out relative group"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const ResultDisplay = memo(function ResultDisplay({ data, onClose }: ResultDisplayProps) {
    useEffect(() => {
        // Lock scrolling on body when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!data) return null;

    const score = typeof data.score === 'number' ? data.score : 0;
    const verdictKey = data.verdict && VERDICT_CONFIG[data.verdict] ? data.verdict : 'MODERATE_MATCH';
    const verdict = VERDICT_CONFIG[verdictKey];

    return (
        <div className="fixed inset-0 z-50 bg-slate-50/95 backdrop-blur-sm animate-in fade-in duration-300 overflow-hidden flex flex-col">

            {/* 1. Fixed Header */}
            <header className="flex-none bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white p-2 rounded-lg shadow-sm">
                        <BrainCircuit className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">Resultado da Análise</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mini Score for Header (Mobile/Tablet usually) */}
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                        <div className={cn("w-3 h-3 rounded-full",
                            score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                        )} />
                        <span className="text-sm font-bold text-slate-700">Score: {score}/100</span>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
                        aria-label="Feignar"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* 2. Scrollable Content Area */}
            <main className="flex-grow overflow-y-auto bg-slate-50/50">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">

                    <Tabs defaultValue="overview" className="w-full space-y-8">

                        {/* Tabs Navigation */}
                        <div className="flex justify-center sticky top-0 z-20 md:static">
                            <TabsList className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm p-1.5 h-auto flex-wrap justify-center gap-1 w-full md:w-auto rounded-xl">
                                <TabsTrigger value="overview" className="px-4 py-2.5 text-sm md:text-base data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg">
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Visão Geral
                                </TabsTrigger>
                                <TabsTrigger value="details" className="px-4 py-2.5 text-sm md:text-base data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg">
                                    <Layers className="w-4 h-4 mr-2" />
                                    Detalhes & Gaps
                                </TabsTrigger>
                                <TabsTrigger value="actions" className="px-4 py-2.5 text-sm md:text-base data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Plano de Ação
                                </TabsTrigger>
                                <TabsTrigger value="market" className="px-4 py-2.5 text-sm md:text-base data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Mercado
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* --- TAB: OVERVIEW --- */}
                        <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Score Card */}
                                <div className="md:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                    <h2 className="text-xl font-bold text-slate-800 mb-2">Match Score</h2>
                                    <ScoreGauge score={score} />
                                    <div className={cn("px-5 py-2 rounded-full text-sm font-bold border transform -translate-y-4", verdict.bg, verdict.color)}>
                                        {verdict.label}
                                    </div>
                                    <p className="text-slate-500 text-sm mt-4 max-w-xs mx-auto">
                                        Baseado na compatibilidade semântica entre seu currículo e a descrição da vaga.
                                    </p>
                                </div>

                                {/* Summary & Charts */}
                                <div className="md:col-span-8 grid grid-cols-1 gap-6">

                                    {/* AI Verdict */}
                                    <div className="bg-slate-900 rounded-2xl p-8 relative overflow-hidden shadow-lg text-white">
                                        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-4 text-blue-300 font-semibold tracking-wide uppercase text-xs">
                                                <Lightbulb className="w-4 h-4 SHAKE" />
                                                Insight Principal
                                            </div>
                                            <p className="text-xl md:text-2xl leading-relaxed font-light text-slate-100">
                                                "{data.summaryInsight || data.summary || "Análise concluída com sucesso."}"
                                            </p>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                                            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                                <Target className="w-5 h-5 text-blue-500" />
                                                Distribuição de Competências
                                            </h3>
                                            <div className="flex justify-center -mt-4">
                                                <SkillsRadar breakdown={data.breakdown} />
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-center">
                                            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                                <Layers className="w-5 h-5 text-purple-500" />
                                                Detalhamento por Área
                                            </h3>
                                            <div className="px-2">
                                                {data.breakdown && (
                                                    <>
                                                        <MetricBar label="Técnico" value={Math.min(data.breakdown.technical, 40)} max={40} color={COLORS.technical} />
                                                        <MetricBar label="Experiência" value={Math.min(data.breakdown.experience, 30)} max={30} color={COLORS.experience} />
                                                        <MetricBar label="Cultural" value={Math.min(data.breakdown.cultural, 15)} max={15} color={COLORS.cultural} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- TAB: DETAILS --- */}
                        <TabsContent value="details" className="animate-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Strong Points */}
                                <ResultCard
                                    title="Pontos Fortes"
                                    icon={CheckCircle}
                                    headerClassName="text-emerald-700 bg-emerald-50/50"
                                >
                                    <div className="space-y-4">
                                        {data.strongPoints?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex gap-4 p-4 hover:bg-emerald-50/30 rounded-lg transition-colors border border-transparent hover:border-emerald-100">
                                                <div className="mt-1 shrink-0">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-lg mb-1">{item.point}</p>
                                                    <p className="text-slate-600 text-sm leading-relaxed">{item.evidence}</p>
                                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wide">
                                                        <TrendingUp className="w-3 h-3" />
                                                        Impacto: {item.impact}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!data.strongPoints || data.strongPoints.length === 0) && (
                                            <p className="text-slate-500 italic p-4">Nenhum ponto forte específico identificado.</p>
                                        )}
                                    </div>
                                </ResultCard>

                                {/* Gaps */}
                                <ResultCard
                                    title="Pontos de Atenção & Gaps"
                                    icon={AlertTriangle}
                                    headerClassName="text-amber-700 bg-amber-50/50"
                                >
                                    <div className="space-y-4">
                                        {data.gaps?.map((item: any, idx: number) => (
                                            <div key={idx} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex gap-2">
                                                        <span className={cn(
                                                            "text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider",
                                                            item.severity === 'BLOCKER' ? 'bg-red-100 text-red-700' :
                                                                item.severity === 'SIGNIFICANT' ? 'bg-orange-100 text-orange-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                        )}>
                                                            {item.severity}
                                                        </span>
                                                        <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-slate-100 text-slate-600">
                                                            {item.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                <h4 className="font-bold text-slate-800 text-lg mb-2">{item.gap}</h4>
                                                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{item.impact}</p>

                                                <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100/50 flex items-start gap-3">
                                                    <div className="shrink-0 mt-0.5 bg-amber-100 rounded-full p-1">
                                                        <Lightbulb className="w-4 h-4 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-bold text-amber-700 uppercase block mb-0.5">Sugestão de Correção</span>
                                                        <span className="text-slate-700 text-sm">{item.solution}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ResultCard>
                            </div>
                        </TabsContent>

                        {/* --- TAB: ACTIONS --- */}
                        <TabsContent value="actions" className="animate-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Immediate Actions */}
                                <ResultCard title="Plano de Ação Imediato" icon={Zap} headerClassName="text-indigo-700 bg-indigo-50/50">
                                    <div className="relative border-l-2 border-indigo-100 ml-3 space-y-8 py-2">
                                        {data.immediateActions?.sort((a: any, b: any) => b.priority - a.priority).map((action: any, idx: number) => (
                                            <div key={idx} className="relative pl-8 group">
                                                <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-indigo-500 transition-transform group-hover:scale-110" />

                                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-indigo-200 transition-all overflow-hidden flex flex-col sm:flex-row">

                                                    {/* Main Content */}
                                                    <div className="p-5 flex-grow">
                                                        <h4 className="font-bold text-slate-800 text-lg mb-2">{action.action}</h4>
                                                        <p className="text-slate-600 mb-4 leading-relaxed text-sm">{action.rationale}</p>

                                                        <div className="flex items-center gap-4 text-xs font-medium border-t border-slate-50 pt-3">
                                                            <div className="flex flex-col gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg w-full">
                                                                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] opacity-80">
                                                                    <TrendingUp className="w-3 h-3" />
                                                                    Impacto Estimado
                                                                </div>
                                                                <span className="text-sm leading-snug">{action.impact}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Priority Column */}
                                                    <div className={cn(
                                                        "w-full sm:w-32 border-t sm:border-t-0 sm:border-l border-slate-100 flex flex-col items-center justify-center p-4 gap-1 shrink-0 bg-slate-50/50",
                                                        action.priority >= 8 ? "bg-red-50/30" :
                                                            action.priority >= 5 ? "bg-amber-50/30" :
                                                                "bg-blue-50/30"
                                                    )}>
                                                        <span className={cn(
                                                            "text-[10px] font-bold uppercase tracking-wider",
                                                            action.priority >= 8 ? "text-red-700" :
                                                                action.priority >= 5 ? "text-amber-700" :
                                                                    "text-blue-700"
                                                        )}>
                                                            Prioridade
                                                        </span>
                                                        <div className="flex items-baseline">
                                                            <span className={cn(
                                                                "text-3xl font-bold",
                                                                action.priority >= 8 ? "text-red-600" :
                                                                    action.priority >= 5 ? "text-amber-600" :
                                                                        "text-blue-600"
                                                            )}>
                                                                {action.priority}
                                                            </span>
                                                            <span className="text-xs text-slate-400 font-bold ml-0.5">/10</span>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ResultCard>

                                {/* ATS Optimization */}
                                <ResultCard title="Otimizações Técnicas (ATS)" icon={Target} headerClassName="text-blue-700 bg-blue-50/50">
                                    <div className="space-y-6">
                                        {data.atsOptimization?.map((item: any, idx: number) => (
                                            <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                                <div className="p-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-3 h-3 rounded-full shadow-sm", item.severity === 'CRITICAL' ? 'bg-red-500 animate-pulse' : 'bg-blue-500')} />
                                                        <h4 className="font-bold text-slate-800">{item.issue}</h4>
                                                    </div>
                                                    <span className="text-xs text-slate-400 font-mono bg-white px-2 py-1 rounded border border-slate-100">{item.location}</span>
                                                </div>
                                                <div className="p-5">
                                                    <div className="flex gap-3 mb-4">
                                                        <ArrowRight className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                        <p className="text-slate-700 text-sm font-medium">{item.fix}</p>
                                                    </div>
                                                    {item.example && (
                                                        <div className="bg-slate-900 rounded-lg p-4 relative overflow-hidden group">
                                                            <div className="absolute top-2 right-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold">Exemplo</div>
                                                            <code className="text-xs font-mono text-blue-200 block overflow-x-auto">
                                                                {item.example}
                                                            </code>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ResultCard>
                            </div>
                        </TabsContent>

                        {/* --- TAB: MARKET & INTERVIEW --- */}
                        <TabsContent value="market" className="animate-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-8">
                                {/* Insights Header */}
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                                    <div className="flex flex-col md:flex-row gap-10 relative z-10">
                                        <div className="flex-1">
                                            <h3 className="flex items-center gap-3 text-xl font-bold mb-4 text-blue-300">
                                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                                    <TrendingUp className="w-6 h-6" />
                                                </div>
                                                Mercado & Competitividade
                                            </h3>
                                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                                <p className="text-slate-200 leading-relaxed text-lg font-light">{data.marketInsight}</p>
                                            </div>
                                        </div>
                                        <div className="hidden md:block w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent" />
                                        <div className="flex-1">
                                            <h3 className="flex items-center gap-3 text-xl font-bold mb-4 text-purple-300">
                                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                                    <Briefcase className="w-6 h-6" />
                                                </div>
                                                Orientação de Carreira
                                            </h3>
                                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                                <p className="text-slate-200 leading-relaxed text-lg font-light">{data.careerGuidance}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Interview Prep */}
                                {data.interviewPreparation && data.interviewPreparation.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            Preparação para Entrevista
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {data.interviewPreparation.map((prep: any, idx: number) => (
                                                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-5 shadow-inner">
                                                        <Award className="w-6 h-6" />
                                                    </div>
                                                    <h4 className="font-bold text-slate-900 text-lg mb-3 leading-snug">{prep.topic}</h4>
                                                    <p className="text-sm text-slate-500 mb-6 flex-grow">{prep.reason}</p>

                                                    <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 border border-slate-100 relative mt-auto">
                                                        <div className="absolute -top-3 left-4 bg-slate-200 text-slate-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded">Dica Prática</div>
                                                        {prep.suggestion}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                    </Tabs>
                </div>
            </main>
        </div>
    );
});

export default ResultDisplay;
