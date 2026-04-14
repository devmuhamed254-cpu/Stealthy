const PROVIDERS = {
    openrouter: {
        name: 'OpenRouter',
        baseURL: 'https://openrouter.ai/api/v1',
        models: [
            // OpenAI
            'openai/gpt-4o-mini',
            'openai/gpt-4o',
            'openai/gpt-4-turbo',
            'openai/gpt-3.5-turbo',
            // Anthropic
            'anthropic/claude-3.5-sonnet',
            'anthropic/claude-3-opus',
            'anthropic/claude-3-haiku',
            // Google
            'google/gemini-2.0-flash',
            'google/gemini-2.0-flash-exp',
            'google/gemini-1.5-pro',
            'google/gemini-1.5-flash',
            // Meta
            'meta/llama-3.1-70b-instruct',
            'meta/llama-3.1-8b-instruct',
            'meta/llama-3.3-70b-instruct',
            // Mistral
            'mistralai/mistral-7b-instruct',
            'mistralai/mixtral-8x7b-instruct',
            // DeepSeek
            'deepseek/deepseek-chat',
            // Qwen
            'qwen/qwen-2-72b-instruct',
            // Command R
            'cohere/command-r-plus',
            'cohere/command-r',
        ],
    },
    groq: {
        name: 'Groq',
        baseURL: 'https://api.groq.com/openai/v1',
        models: [
            'llama-3.1-70b-versatile',
            'llama-3.1-8b-instant',
            'llama-3.3-70b-versatile',
            'mixtral-8x7b-32768',
            'gemma-7b-it',
        ],
    },
    openai: {
        name: 'OpenAI',
        baseURL: 'https://api.openai.com/v1',
        models: [
            'gpt-4o',
            'gpt-4o-mini',
            'gpt-4-turbo',
            'gpt-4',
            'gpt-3.5-turbo',
            'o1-preview',
            'o1-mini',
            'o3-mini',
        ],
    },
};

class AIService {
    constructor() {
        this.clients = {};
        this.currentProvider = 'openrouter';
        this.currentModel = 'openai/gpt-4o-mini';
    }

    initialize(config) {
        if (config.openai) {
            this.clients.openai = new OpenAI({
                apiKey: config.openai.apiKey,
                dangerouslyAllowBrowser: true,
            });
        }

        if (config.groq) {
            this.clients.groq = new OpenAI({
                apiKey: config.groq.apiKey,
                baseURL: 'https://api.groq.com/openai/v1',
                dangerouslyAllowBrowser: true,
            });
        }

        if (config.openrouter) {
            this.clients.openrouter = new OpenAI({
                apiKey: config.openrouter.apiKey,
                baseURL: 'https://openrouter.ai/api/v1',
                dangerouslyAllowBrowser: true,
            });
        }

        console.log('[AI] Clients initialized:', Object.keys(this.clients));
    }

    setProvider(provider) {
        if (PROVIDERS[provider]) {
            this.currentProvider = provider;
        }
    }

    setModel(model) {
        this.currentModel = model;
    }

    async generateResponse(transcript, options = {}, knowledgeBase = null) {
        const provider = options.provider || this.currentProvider;
        const model = options.model || this.currentModel;

        if (!this.clients[provider]) {
            throw new Error(`Provider ${provider} not initialized. Add an API key in settings.`);
        }

        const recentTranscript = transcript.slice(-20).map(t => 
            `${t.speaker === 'me' ? 'User' : 'Interviewer'}: ${t.text}`
        ).join('\n');

        const lastQuestion = transcript.length > 0 ? transcript[transcript.length - 1] : null;
        const questionContext = lastQuestion && lastQuestion.speaker === 'them' 
            ? `\n\nThe interviewer just asked: "${lastQuestion.text}"`
            : '';

        let systemPrompt = `You are an AI interview assistant helping during a job interview. 
Based on the conversation transcript, provide a direct and helpful answer to the interviewer's question.

Current transcript:
${recentTranscript}${questionContext}

Provide a concise, professional response that directly answers the question.`;

        if (knowledgeBase?.resume) {
            systemPrompt += `\n\nUser's Resume:\n${knowledgeBase.resume}`;
        }

        if (knowledgeBase?.customQA?.length > 0) {
            const qaContext = knowledgeBase.customQA.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n');
            systemPrompt += `\n\nCustom Q&A:\n${qaContext}`;
        }

        try {
            const response = await this.clients[provider].chat.completions.create({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: 'Provide your answer now.' }
                ],
                temperature: 0.7,
                max_tokens: 1000,
            });

            return {
                answer: response.choices[0].message.content,
                question: lastQuestion?.text || 'General',
                model: model,
                provider: provider,
            };
        } catch (error) {
            console.error('[AI] Error:', error);
            throw error;
        }
    }

    getAvailableProviders() {
        return Object.entries(PROVIDERS).map(([key, value]) => ({
            id: key,
            name: value.name,
            models: value.models,
            isConfigured: !!this.clients[key],
        }));
    }
}

export default new AIService();
export { PROVIDERS };