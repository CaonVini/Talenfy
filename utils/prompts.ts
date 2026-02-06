import { AnalysisRequest } from '@/lib/types';

export function createFullPrompt({ jobDescription, resume }: AnalysisRequest): string {
    return `
JOB DESCRIPTION:
${jobDescription}

RESUME:
${resume}
`;
}

export function extractJSON(text: string): unknown {
    if (!text) {
        throw new Error('Empty response from AI');
    }

    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
            try {
                return JSON.parse(match[1]);
            } catch {
                throw new Error('Failed to parse JSON from code block');
            }
        }

        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');

        if (start !== -1 && end !== -1) {
            const jsonStr = text.substring(start, end + 1);
            try {
                return JSON.parse(jsonStr);
            } catch {
                throw new Error('Failed to extract valid JSON object');
            }
        }

        throw new Error('No valid JSON found in response');
    }
}
