'use client';

import React, { useState, useCallback } from 'react';
import AnalysisForm from '@/components/AnalysisForm';
import ResultDisplay from '@/components/ResultDisplay';
import SettingsButton, { Language } from '@/components/SettingsButton';
import { AnalysisResult } from '@/lib/types';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface SettingsConfig {
  apiKey: string;
  saveApiKey: boolean;
  language: Language;
}

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [settings, setSettings] = useState<SettingsConfig>({ apiKey: '', saveApiKey: false, language: 'pt' });

  const handleSettingsChange = useCallback((config: SettingsConfig) => {
    setSettings(config);
  }, []);

  const handleStart = useCallback(() => {
    setError(null);
    setHasAnalyzed(false);
    setResult(null);
    setShowModal(false);
  }, []);

  const handleComplete = useCallback((data: AnalysisResult) => {
    setResult(data);
    setHasAnalyzed(true);
  }, []);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setHasAnalyzed(false);
  }, []);

  const handleCloseResults = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <main className="min-h-screen pb-20 bg-slate-50/50">

      <div className="pt-8 md:pt-12"></div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-10 flex items-center justify-between animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Verifique o Match da Vaga
          </h1>
          <SettingsButton onChange={handleSettingsChange} />
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 flex items-start gap-3 animate-fade-in rounded-r-md">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800">Erro na análise</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          <div className="lg:col-span-12 xl:col-span-12">
            <div className={`transition-all duration-500 ease-in-out ${hasAnalyzed ? 'opacity-50 pointer-events-none grayscale-[0.5]' : 'opacity-100'}`}>
              <div className="bg-white p-6 md:p-8 border border-slate-200 shadow-sm rounded-xl">
                <AnalysisForm
                  onAnalysisStart={handleStart}
                  onAnalysisComplete={handleComplete}
                  onError={handleError}
                  apiKey={settings.apiKey}
                  language={settings.language}
                />
              </div>
            </div>

            {hasAnalyzed && result && !showModal && (
              <div className="fixed bottom-0 left-0 right-0 p-4 md:static md:p-0 md:mt-6 z-40 animate-slide-up bg-gradient-to-t from-white via-white to-transparent md:bg-none">
                <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto border border-slate-700/50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 animate-bounce-short">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Análise Pronta!</h3>
                      <p className="text-slate-400">A IA processou o currículo e a vaga com sucesso.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full md:w-auto px-8 py-3 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-2 group"
                  >
                    Ver Resultado Completo
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {showModal && result && (
        <ResultDisplay data={result} onClose={handleCloseResults} />
      )}
    </main>
  );
}
