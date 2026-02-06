export interface AnalysisRequest {
    jobDescription: string;
    resume: string;
}

export interface AnalysisResult {
    score: number;
    [key: string]: unknown;
}

export interface RateLimitInfo {
    success: boolean;
    remaining: number;
    resetAt: number;
}

export interface GeminiResponse {
    candidates?: {
        content: {
            parts: {
                text: string;
            }[];
        };
    }[];
    error?: {
        code: number;
        message: string;
        status: string;
    };
}

export type ScoreColor = 'green' | 'orange' | 'red';
