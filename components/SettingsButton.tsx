'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, X, Key, Globe, Eye, EyeOff, AlertCircle } from 'lucide-react';

export type Language = 'pt' | 'en';

interface SettingsConfig {
    apiKey: string;
    saveApiKey: boolean;
    language: Language;
}

interface SettingsButtonProps {
    onChange: (config: SettingsConfig) => void;
}

export default function SettingsButton({ onChange }: SettingsButtonProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [saveApiKey, setSaveApiKey] = useState(false);
    const [language, setLanguage] = useState<Language>('pt');
    const settingsRef = useRef<HTMLDivElement>(null);

    const isApiKeyValid = apiKey.startsWith('AIza') && apiKey.length >= 30;

    useEffect(() => {
        const savedApiKey = localStorage.getItem('talenfy_api_key');
        const savedLanguage = localStorage.getItem('talenfy_language') as Language;
        const savedSavePreference = localStorage.getItem('talenfy_save_key');

        if (savedApiKey) {
            setApiKey(savedApiKey);
            setSaveApiKey(true);
        }
        if (savedLanguage === 'pt' || savedLanguage === 'en') {
            setLanguage(savedLanguage);
        }
        if (savedSavePreference === 'true') {
            setSaveApiKey(true);
        }
    }, []);

    useEffect(() => {
        if (saveApiKey && apiKey) {
            localStorage.setItem('talenfy_api_key', apiKey);
            localStorage.setItem('talenfy_save_key', 'true');
        } else {
            localStorage.removeItem('talenfy_api_key');
            localStorage.removeItem('talenfy_save_key');
        }
    }, [saveApiKey, apiKey]);

    useEffect(() => {
        localStorage.setItem('talenfy_language', language);
    }, [language]);

    useEffect(() => {
        onChange({ apiKey, saveApiKey, language });
    }, [apiKey, saveApiKey, language, onChange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={settingsRef}>
            <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2.5 rounded-full transition-all ${showSettings ? 'bg-slate-200' : 'bg-white hover:bg-slate-100'} border border-slate-200 shadow-sm`}
                title="Configurações"
            >
                <Settings className="w-5 h-5 text-slate-600" />
            </button>

            {showSettings && (
                <div className="absolute top-14 right-0 z-50 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-4 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800">Configurações</h3>
                        <button
                            type="button"
                            onClick={() => setShowSettings(false)}
                            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-slate-500" />
                            <label htmlFor="apiKey" className="block text-sm font-semibold text-slate-700">
                                Chave de API Gemini
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                id="apiKey"
                                type={showApiKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="AIza..."
                                className={`
                                    w-full p-2.5 pr-10 text-sm bg-slate-50 border rounded-lg outline-none transition-all
                                    placeholder:text-slate-400 text-slate-800
                                    ${apiKey && !isApiKeyValid ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-slate-400'}
                                `}
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {apiKey && !isApiKeyValid && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Deve começar com &quot;AIza&quot; e ter 30+ caracteres
                            </p>
                        )}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="saveApiKey"
                                checked={saveApiKey}
                                onChange={(e) => setSaveApiKey(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                            />
                            <label htmlFor="saveApiKey" className="text-xs text-slate-600">
                                Salvar no navegador
                            </label>
                        </div>
                        <p className="text-xs text-slate-400">
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                Obter chave grátis →
                            </a>
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-500" />
                            <label className="block text-sm font-semibold text-slate-700">
                                Idioma da Resposta
                            </label>
                        </div>
                        <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setLanguage('pt')}
                                className={`flex-1 py-2 px-3 text-xs font-medium transition-colors ${language === 'pt'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                🇧🇷 Português
                            </button>
                            <button
                                type="button"
                                onClick={() => setLanguage('en')}
                                className={`flex-1 py-2 px-3 text-xs font-medium transition-colors ${language === 'en'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                🇺🇸 English
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
