import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ResultCardProps {
    title: string;
    icon?: LucideIcon;
    children: React.ReactNode;
    className?: string;
    headerClassName?: string;
    action?: React.ReactNode;
}

export function ResultCard({
    title,
    icon: Icon,
    children,
    className,
    headerClassName,
    action,
}: ResultCardProps) {
    return (
        <div
            className={cn(
                'bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md',
                className
            )}
        >
            <div
                className={cn(
                    'px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white',
                    headerClassName
                )}
            >
                <div className="flex items-center gap-2.5">
                    {Icon && (
                        <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                            <Icon className="w-5 h-5" />
                        </div>
                    )}
                    <h3 className="font-semibold text-slate-800 text-lg tracking-tight">
                        {title}
                    </h3>
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}
