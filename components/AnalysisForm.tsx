'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, ArrowRight, FileText, UploadCloud } from 'lucide-react';
import { AnalysisResult } from '@/lib/types';

type Language = 'pt' | 'en';

interface AnalysisFormProps {
    onAnalysisStart: () => void;
    onAnalysisComplete: (result: AnalysisResult) => void;
    onError: (msg: string) => void;
    apiKey: string;
    language: Language;
}

const MAX_CHARS = 25000;
const MIN_CHARS = 100;

type ResumeMode = 'text' | 'file';

export default function AnalysisForm({ onAnalysisStart, onAnalysisComplete, onError, apiKey, language }: AnalysisFormProps) {
    const [jobDescription, setJobDescription] = useState('');
    const [resumeMode, setResumeMode] = useState<ResumeMode>('text');
    const [resumeText, setResumeText] = useState('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const [jdCount, setJdCount] = useState(0);
    const [resumeCount, setResumeCount] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setJdCount(jobDescription.length), 300);
        return () => clearTimeout(timer);
    }, [jobDescription]);

    useEffect(() => {
        const timer = setTimeout(() => setResumeCount(resumeText.length), 300);
        return () => clearTimeout(timer);
    }, [resumeText]);

    const isJdValid = jdCount >= MIN_CHARS && jdCount <= MAX_CHARS;
    const isResumeValid = resumeMode === 'text'
        ? (resumeCount >= 50 && resumeCount <= MAX_CHARS)
        : (resumeFile !== null && resumeFile.size < 5 * 1024 * 1024);
    const isApiKeyValid = apiKey.startsWith('AIza') && apiKey.length >= 30;

    const isValid = isJdValid && isResumeValid && isApiKeyValid;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                onError(language === 'pt' ? 'Apenas arquivos PDF são permitidos.' : 'Only PDF files are allowed.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                onError(language === 'pt' ? 'O arquivo não pode exceder 5MB.' : 'File cannot exceed 5MB.');
                return;
            }
            setResumeFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid || loading) return;

        setLoading(true);
        onAnalysisStart();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 25000);

            const formData = new FormData();
            formData.append('jobDescription', jobDescription);
            formData.append('apiKey', apiKey);
            formData.append('language', language);

            if (resumeMode === 'file' && resumeFile) {
                formData.append('resumeFile', resumeFile);
            } else {
                formData.append('resumeText', resumeText);
            }

            const res = await fetch('/api/analyze', {
                method: 'POST',
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    const resetTime = res.headers.get('X-RateLimit-Reset');
                    const waitSeconds = resetTime ? Math.ceil((parseInt(resetTime) - Date.now()) / 1000) : 60;
                    throw new Error(language === 'pt'
                        ? `Muitas tentativas. Aguarde ${waitSeconds} segundos.`
                        : `Too many attempts. Wait ${waitSeconds} seconds.`);
                }
                throw new Error(data.error || (language === 'pt' ? 'Erro ao processar análise.' : 'Error processing analysis.'));
            }

            onAnalysisComplete(data);
        } catch (err) {
            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    onError(language === 'pt' ? 'A análise demorou muito. Tente novamente.' : 'Analysis took too long. Try again.');
                } else {
                    onError(err.message || (language === 'pt' ? 'Ocorreu um erro inesperado.' : 'An unexpected error occurred.'));
                }
            } else {
                onError(language === 'pt' ? 'Ocorreu um erro inesperado.' : 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const CharCounter = ({ count }: { count: number }) => {
        const isError = count > MAX_CHARS;
        const isWarning = count > MAX_CHARS * 0.9;

        let colorClass = "text-gray-400";
        if (isError) colorClass = "text-red-500 font-bold";
        else if (isWarning) colorClass = "text-orange-500";

        return (
            <span className={`text-xs transition-colors duration-200 ${colorClass}`}>
                {count}/{MAX_CHARS}
            </span>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label htmlFor="jd" className="block text-sm font-semibold text-gray-700">
                        {language === 'pt' ? 'Descrição da Vaga' : 'Job Description'}
                    </label>
                    <CharCounter count={jdCount} />
                </div>
                <textarea
                    id="jd"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder={language === 'pt' ? 'Cole aqui a descrição completa da vaga...' : 'Paste the full job description here...'}
                    className={`
                        w-full h-48 p-4 text-sm bg-gray-50 border sharp-border outline-none transition-all
                        placeholder:text-gray-400 text-gray-800
                        ${jdCount > MAX_CHARS ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gray-400 focus:ring-0'}
                        resize-none
                    `}
                    disabled={loading}
                />
                {jdCount > 0 && jdCount < MIN_CHARS && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {language === 'pt' ? `Mínimo de ${MIN_CHARS} caracteres` : `Minimum ${MIN_CHARS} characters`}
                    </p>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-semibold text-gray-700">
                        {language === 'pt' ? 'Seu Currículo' : 'Your Resume'}
                    </label>
                    {resumeMode === 'text' && <CharCounter count={resumeCount} />}
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        type="button"
                        onClick={() => setResumeMode('text')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${resumeMode === 'text' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {language === 'pt' ? 'Colar Texto' : 'Paste Text'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setResumeMode('file')}
                        className={`pb-2 px-4 text-sm font-medium transition-colors ${resumeMode === 'file' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {language === 'pt' ? 'Upload PDF' : 'Upload PDF'}
                    </button>
                </div>

                {resumeMode === 'text' ? (
                    <div className="space-y-2">
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder={language === 'pt' ? 'Cole o conteúdo do seu currículo aqui...' : 'Paste your resume content here...'}
                            className={`
                                w-full h-64 p-4 text-sm bg-gray-50 border sharp-border outline-none transition-all
                                placeholder:text-gray-400 text-gray-800
                                ${resumeCount > MAX_CHARS ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gray-400 focus:ring-0'}
                                resize-none
                            `}
                            disabled={loading}
                        />
                        {resumeCount > 0 && resumeCount < 50 && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {language === 'pt' ? 'Mínimo de 50 caracteres' : 'Minimum 50 characters'}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="h-64 border-2 border-dashed border-gray-200 rounded-sm bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center transition-all hover:bg-gray-50 hover:border-gray-300">
                        {resumeFile ? (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-500">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <p className="font-medium text-gray-900 text-sm mb-1">{resumeFile.name}</p>
                                <p className="text-xs text-gray-500 mb-4">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                                <button
                                    type="button"
                                    onClick={() => setResumeFile(null)}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium underline"
                                >
                                    {language === 'pt' ? 'Remover arquivo' : 'Remove file'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-400">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                    {language === 'pt' ? 'Clique para selecionar ou arraste o PDF' : 'Click to select or drag the PDF'}
                                </p>
                                <p className="text-xs text-gray-400 mb-4">
                                    {language === 'pt' ? 'Máximo 5MB (processado em memória)' : 'Maximum 5MB (processed in memory)'}
                                </p>
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="resume-upload"
                                />
                                <label
                                    htmlFor="resume-upload"
                                    className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm rounded-[2px]"
                                >
                                    {language === 'pt' ? 'Selecionar PDF' : 'Select PDF'}
                                </label>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={!isValid || loading}
                    className={`
                        w-full py-4 px-6 flex items-center justify-center gap-2
                        text-white font-medium text-sm tracking-wide uppercase sharp-border
                        transition-all duration-200
                        ${!isValid || loading
                            ? 'bg-gray-300 cursor-not-allowed opacity-70'
                            : 'bg-gray-900 hover:bg-black hover:shadow-md active:transform active:scale-[0.99]'}
                    `}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {language === 'pt' ? 'Analisando Compatibilidade...' : 'Analyzing Compatibility...'}
                        </>
                    ) : (
                        <>
                            {language === 'pt' ? 'Analisar Match' : 'Analyze Match'}
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                        </>
                    )}
                </button>
                <p className="mt-3 text-center text-xs text-gray-400">
                    Powered by Gemini 2.0 Flash • Zero data retention
                </p>
            </div>
        </form>
    );
}
