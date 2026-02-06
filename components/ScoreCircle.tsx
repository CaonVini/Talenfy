'use client';

import React, { useEffect, useState } from 'react';

interface ScoreCircleProps {
    score: number;
}

export default function ScoreCircle({ score }: ScoreCircleProps) {
    const [displayScore, setDisplayScore] = useState(0);
    const [strokeDashoffset, setStrokeDashoffset] = useState(283);

    const radius = 45;
    const circumference = 2 * Math.PI * radius;

    const getColor = (s: number) => {
        if (s >= 70) return 'text-score-green';
        if (s >= 40) return 'text-score-orange';
        return 'text-score-red';
    };

    useEffect(() => {
        const duration = 1000;
        const steps = 60;
        const intervalTime = duration / steps;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                current = score;
                clearInterval(timer);
            }
            setDisplayScore(Math.round(current));
        }, intervalTime);

        const offset = circumference - (score / 100) * circumference;
        setTimeout(() => {
            setStrokeDashoffset(offset);
        }, 100);

        return () => clearInterval(timer);
    }, [score, circumference]);

    const colorClass = getColor(score);

    return (
        <div className="flex flex-col items-center justify-center p-6">
            <div className="relative w-[120px] h-[120px]">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                    />
                    <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className={`${colorClass} transition-all duration-1000 ease-out`}
                    />
                </svg>

                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <span className={`text-3xl font-bold ${colorClass}`}>
                        {displayScore}
                    </span>
                </div>
            </div>
            <span className="mt-4 text-sm font-medium text-gray-500 uppercase tracking-wide">
                Compatibilidade
            </span>
        </div>
    );
}
