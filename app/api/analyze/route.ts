import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/ratelimit';
import { getClientIP } from '@/lib/getClientIP';
import { sanitizeInput } from '@/lib/sanitize';
import { createFullPrompt, extractJSON } from '@/utils/prompts';
import { getSystemPrompt, Language } from '@/utils/systemPrompt';
import { parsePDF } from '@/utils/pdf';
import { AnalysisResult } from '@/lib/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(req: NextRequest) {
    try {
        const ip = await getClientIP();
        const rateLimit = checkRateLimit(ip);

        const headers = new Headers();
        headers.set('X-RateLimit-Limit', '5');
        headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
        headers.set('X-RateLimit-Reset', rateLimit.resetAt.toString());

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers }
            );
        }

        const contentType = req.headers.get('content-type') || '';
        let jobDescription = '';
        let resume = '';
        let apiKey = '';
        let language: Language = 'pt';

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            jobDescription = formData.get('jobDescription') as string || '';
            apiKey = formData.get('apiKey') as string || '';
            const langValue = formData.get('language') as string;
            if (langValue === 'en' || langValue === 'pt') {
                language = langValue;
            }

            const resumeFile = formData.get('resumeFile') as File;
            const resumeText = formData.get('resumeText') as string;

            if (resumeFile && resumeFile.size > 0) {
                if (resumeFile.type === 'application/pdf') {
                    try {
                        const arrayBuffer = await resumeFile.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        resume = await parsePDF(buffer);
                    } catch {
                        return NextResponse.json({ error: 'Failed to read PDF file' }, { status: 400 });
                    }
                } else {
                    return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
                }
            } else {
                resume = resumeText || '';
            }

        } else if (contentType.includes('application/json')) {
            const body = await req.json();
            jobDescription = body.jobDescription;
            resume = body.resume;
            apiKey = body.apiKey || '';
            if (body.language === 'en' || body.language === 'pt') {
                language = body.language;
            }
        } else {
            return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 415 });
        }

        if (!jobDescription || !resume) {
            return NextResponse.json({ error: 'Description and Resume are required' }, { status: 400 });
        }

        if (jobDescription.length < 100 || jobDescription.length > 25000) {
            return NextResponse.json({ error: 'Job description must be between 100 and 25000 characters' }, { status: 400 });
        }

        if (resume.length < 50 || resume.length > 25000) {
            return NextResponse.json({ error: 'Resume content must be between 50 and 25000 characters' }, { status: 400 });
        }

        const sanitizedJob = sanitizeInput(jobDescription);
        const sanitizedResume = sanitizeInput(resume);

        if (!apiKey) {
            return NextResponse.json({ error: 'API key is required' }, { status: 400 });
        }

        if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
            return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 });
        }

        const geminiPayload = {
            contents: [
                {
                    role: 'user',
                    parts: [{ text: createFullPrompt({ jobDescription: sanitizedJob, resume: sanitizedResume }) }]
                }
            ],
            systemInstruction: {
                parts: [{ text: getSystemPrompt(language) }]
            },
            generationConfig: {
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(geminiPayload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error:', data);
            if (response.status === 429) {
                return NextResponse.json({ error: 'High analysis load. Please try again in a minute.' }, { status: 429 });
            }
            return NextResponse.json({ error: 'Failed to process analysis' }, { status: 500 });
        }

        let analysisResult;
        try {
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                if (data.promptFeedback && data.promptFeedback.blockReason) {
                    return NextResponse.json({ error: 'Analysis blocked by safety filters.' }, { status: 400 });
                }
                throw new Error('Invalid response structure from AI');
            }

            const rawText = data.candidates[0].content.parts[0].text;
            const extracted = extractJSON(rawText);

            analysisResult = extracted as AnalysisResult;

            if (typeof analysisResult.score !== 'number') {
                if (!analysisResult.score) analysisResult.score = 0;
            }

        } catch (e) {
            console.error('Parsing Error:', e);
            return NextResponse.json({ error: 'Failed to interpret analysis results' }, { status: 500 });
        }

        return NextResponse.json(analysisResult, { status: 200, headers });

    } catch (error) {
        console.error('Unhandled API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
