import { IHttp } from '@rocket.chat/apps-engine/definition/accessors';
import { Language, t } from '../lib/Translation/translation';

export enum SecurityLevel {
    STRICT = 'strict',
    MODERATE = 'moderate',
    RELAXED = 'relaxed'
}

interface ValidationResult {
    isValid: boolean;
    error?: string;
}

interface ValidationContext {
    securityLevel: SecurityLevel;
    language?: string;
    userId?: string;
}

export class AISecurity {
    private securityLevel: SecurityLevel;
    private language: Language;

    constructor(securityLevel: SecurityLevel = SecurityLevel.STRICT, language: Language = 'en' as Language) {
        this.securityLevel = securityLevel;
        this.language = language;
    }

    private getSystemPrompt(): string {
        const basePrompt = `You are a helpful assistant integrated into a chat application. 
        Your responses must be professional, appropriate, and helpful.
        
        Rules for responses:
        1. Never provide instructions for illegal, harmful, or unethical activities
        2. Never generate explicit, offensive, or inappropriate content
        3. For sensitive topics, provide factual information and resources
        4. Keep responses concise and relevant to the user's query
        5. If a request is inappropriate, respond with a standardized rejection message
        
        Standardized rejection messages:
        - For illegal/harmful requests: "I'm sorry, I cannot assist with that request as it goes against our guidelines."
        - For inappropriate content: "Let's keep our conversation professional and appropriate."
        - For sensitive topics: "I recommend consulting with a qualified professional about this matter."
        
        Current security level: ${this.securityLevel}`;
        
        switch (this.securityLevel) {
            case SecurityLevel.STRICT:
                return `${basePrompt}
                Strict guidelines:
                - Reject any request that could be considered harmful or inappropriate
                - Provide minimal information on sensitive topics
                - Focus on professional and constructive responses`;
            case SecurityLevel.MODERATE:
                return `${basePrompt}
                Moderate guidelines:
                - Allow discussion of sensitive topics with appropriate context
                - Provide balanced information while maintaining professionalism
                - Use discretion when handling potentially controversial topics`;
            case SecurityLevel.RELAXED:
                return `${basePrompt}
                Relaxed guidelines:
                - Allow more open discussion while avoiding extreme content
                - Provide general guidance on most topics`;
            default:
                return basePrompt;
        }
    }

    private getRejectionMessage(type: 'illegal' | 'inappropriate' | 'sensitive'): string {
        const messages = {
            illegal: t('AI_Security_Rejection_Message', this.language),
            inappropriate: t('AI_Security_Respectful_Message', this.language),
            sensitive: t('AI_Security_Sensitive_Topic_Message', this.language)
        };
        return messages[type];
    }

    private validateContent(input: string): ValidationResult {
        // Enhanced pattern matching with categories
        const contentPatterns = {
            illegal: [
                /how\s+to\s+hack/i,
                /how\s+to\s+exploit/i,
                /unauthorized\s+access/i,
                /create\s+malware/i,
                /create\s+virus/i,
                /phishing\s+attack/i,
                /identity\s+theft/i,
                /cyber\s+attack/i,
                /ddos\s+attack/i,
                /sql\s+injection/i,
                /xss\s+attack/i,
                /csrf\s+attack/i,
            ],
            inappropriate: [
                /you're\s+stupid/i,
                /you're\s+useless/i,
                /you're\s+dumb/i,
                /you're\s+idiot/i,
                /hate\s+you/i,
                /fuck\s+you/i,
                /asshole/i,
                /bitch/i,
                /cunt/i,
                /nigger/i,
                /faggot/i,
            ],
            sensitive: [
                /credit\s+card\s+number/i,
                /social\s+security\s+number/i,
                /ssn/i,
                /password/i,
                /secret\s+key/i,
                /api\s+key/i,
            ]
        };

        // Check patterns in order of severity
        for (const [category, patterns] of Object.entries(contentPatterns)) {
            for (const pattern of patterns) {
                if (pattern.test(input)) {
                    console.log(`[AISecurity] Content validation failed: ${category} pattern matched`);
                    return {
                        isValid: false,
                        error: this.getRejectionMessage(category as 'illegal' | 'inappropriate' | 'sensitive')
                    };
                }
            }
        }

        console.log('[AISecurity] Content validation passed');
        return { isValid: true };
    }

    static async validateInput(request: string, context: ValidationContext): Promise<ValidationResult> {
        if (!request || request.trim().length === 0) {
            return {
                isValid: false,
                error: 'Empty request'
            };
        }

        const { securityLevel } = context;
        if (this.containsSensitiveData(request)) {
            return {
                isValid: false,
                error: 'Request contains sensitive data'
            };
        }

        switch (securityLevel) {
            case SecurityLevel.STRICT:
                if (this.containsProfanity(request) || this.containsInappropriateContent(request)) {
                    return {
                        isValid: false,
                        error: 'Request contains inappropriate content'
                    };
                }
                break;
            case SecurityLevel.MODERATE:
                if (this.containsProfanity(request)) {
                    return {
                        isValid: false,
                        error: 'Request contains profanity'
                    };
                }
                break;
            case SecurityLevel.RELAXED:
                break;
        }

        return { isValid: true };
    }

    private static containsSensitiveData(text: string): boolean {
        const sensitivePatterns = [
            /\b\d{16}\b/, 
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, 
            /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,
            /\b\d{3}[-]?\d{2}[-]?\d{4}\b/ 
        ];

        return sensitivePatterns.some(pattern => pattern.test(text));
    }

    private static containsProfanity(text: string): boolean {
        const profanityList = [
            'profanity1',
            'profanity2',
        ];

        return profanityList.some(word => 
            text.toLowerCase().includes(word.toLowerCase())
        );
    }

    private static containsInappropriateContent(text: string): boolean {
        const inappropriatePatterns = [
            /\b(hack|exploit|crack)\b/i,
        ];

        return inappropriatePatterns.some(pattern => pattern.test(text));
    }

    public validateInput(input: string): ValidationResult {
        if (!input || input.trim().length === 0) {
            console.log('[AISecurity] Empty input validation failed');
            return {
                isValid: false,
                error: t('AI_Security_Invalid_Input', this.language)
            };
        }

        // Use the content validation first
        const contentValidation = this.validateContent(input);
        if (!contentValidation.isValid) {
            return contentValidation;
        }

        // Then apply security level specific validation
        switch (this.securityLevel) {
            case SecurityLevel.STRICT:
                if (AISecurity.containsProfanity(input) || AISecurity.containsInappropriateContent(input)) {
                    console.log('[AISecurity] Strict validation failed');
                    return {
                        isValid: false,
                        error: this.getRejectionMessage('inappropriate')
                    };
                }
                break;
            case SecurityLevel.MODERATE:
                if (AISecurity.containsProfanity(input)) {
                    console.log('[AISecurity] Moderate validation failed');
                    return {
                        isValid: false,
                        error: this.getRejectionMessage('inappropriate')
                    };
                }
                break;
            case SecurityLevel.RELAXED:
                // Only check for illegal content
                if (AISecurity.containsInappropriateContent(input)) {
                    console.log('[AISecurity] Relaxed validation failed');
                    return {
                        isValid: false,
                        error: this.getRejectionMessage('illegal')
                    };
                }
                break;
        }

        // Check for sensitive data last
        if (AISecurity.containsSensitiveData(input)) {
            console.log('[AISecurity] Sensitive data validation failed');
            return {
                isValid: false,
                error: this.getRejectionMessage('sensitive')
            };
        }

        console.log('[AISecurity] All validations passed');
        return { isValid: true };
    }

    public validateResponse(response: string): ValidationResult {
        if (!response || response.trim().length === 0) {
            return {
                isValid: false,
                error: t('AI_Security_Invalid_Input', this.language)
            };
        }

        const contentValidation = this.validateContent(response);
        if (!contentValidation.isValid) {
            return contentValidation;
        }

        if (AISecurity.containsProfanity(response) || AISecurity.containsInappropriateContent(response)) {
            return {
                isValid: false,
                error: this.getRejectionMessage('inappropriate')
            };
        }

        if (AISecurity.containsSensitiveData(response)) {
            return {
                isValid: false,
                error: this.getRejectionMessage('sensitive')
            };
        }

        response = this.filterResponse(response);
        return { isValid: true };
    }

    private filterResponse(response: string): string {
        const filteredResponse = response.replace(
            /(?:^|\s)(?:fuck|shit|asshole|bitch|cunt|nigger|faggot)(?:\s|$)/gi,
            '****'
        );
        return filteredResponse;
    }

    public async secureAIRequest(
        input: string,
        http: IHttp,
        apiUrl: string,
        requestBody: any
    ): Promise<{ success: boolean; response?: string; error?: string }> {
        try {
            // 1. Validate input
            const validation = this.validateInput(input);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error
                };
            }

            // 2. Add enhanced security system prompt
            const systemPrompt = this.getSystemPrompt();
            
            // 3. Format the request body based on the API type
            let formattedRequestBody;
            if (apiUrl.includes('openai.com')) {
                formattedRequestBody = {
                    model: requestBody.model,
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: input
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                };
            } else if (apiUrl.includes('generativelanguage.googleapis.com')) {
                formattedRequestBody = {
                    contents: [
                        {
                            role: 'user',
                            parts: [
                                {
                                    text: systemPrompt
                                },
                                {
                                    text: input
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500
                    }
                };
            } else {
                // For self-hosted models
                formattedRequestBody = {
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: input
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                };
            }

            // 4. Make the API request with enhanced error handling
            const response = await http.post(apiUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                content: JSON.stringify(formattedRequestBody),
                timeout: 30000
            });

            if (!response) {
                return {
                    success: false,
                    error: t('AI_Something_Went_Wrong', this.language)
                };
            }

            // 5. Enhanced response handling
            if (response.statusCode !== 200) {
                const errorMessage = response.data?.error?.message || 'Unknown error';
                console.log(`[AISecurity] API Error: ${errorMessage}`);
                return {
                    success: false,
                    error: `API Error (${response.statusCode}): ${errorMessage}`
                };
            }

            // 6. Parse and validate response
            let aiResponse: string;
            try {
                if (response.data.choices?.[0]?.message?.content) {
                    aiResponse = response.data.choices[0].message.content;
                } else if (response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    aiResponse = response.data.candidates[0].content.parts[0].text;
                } else {
                    return {
                        success: false,
                        error: t('AI_Something_Went_Wrong', this.language)
                    };
                }

                // Validate the AI response
                const responseValidation = this.validateResponse(aiResponse);
                if (!responseValidation.isValid) {
                    return {
                        success: false,
                        error: responseValidation.error
                    };
                }
            } catch (parseError) {
                return {
                    success: false,
                    error: `Failed to parse AI response: ${parseError.message}`
                };
            }

            // 7. Filter and return response
            const filteredResponse = this.filterResponse(aiResponse);
            return {
                success: true,
                response: filteredResponse
            };
        } catch (error) {
            console.log(`[AISecurity] Request failed: ${error.message}`);
            return {
                success: false,
                error: `Request failed: ${error.message}`
            };
        }
    }

    public async processRequest(request: string, context: ValidationContext): Promise<{ success: boolean; response?: string; error?: string }> {
        const validation = await AISecurity.validateInput(request, context);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.error
            };
        }

        return {
            success: true,
            response: 'Processed successfully'
        };
    }
} 