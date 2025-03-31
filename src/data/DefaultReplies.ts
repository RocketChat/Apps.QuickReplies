import { IReply } from '../definition/reply/IReply';

/**
 * Collection of pre-built default quick replies that will be added for new users
 */
export const getDefaultReplies = (userId: string): IReply[] => {
    return [
        {
            name: 'Greeting',
            body: 'Hello! How may I assist you today?',
            id: `${userId}-${(Date.now() - 10).toString(36)}`,
        },
        {
            name: 'Acknowledgment',
            body: 'Thank you for reaching out. I will get back to you shortly.',
            id: `${userId}-${(Date.now() - 5).toString(36)}`,
        },
        {
            name: 'Follow-up',
            body: 'I wanted to follow up on our previous discussion. Please let me know how you\'d like to proceed.',
            id: `${userId}-${Date.now().toString(36)}`,
        },
        {
            name: 'Apology',
            body: 'I sincerely apologize for any inconvenience. We are looking into this and will resolve it as soon as possible.',
            id: `${userId}-${(Date.now() + 5).toString(36)}`,
        },
        {
            name: 'Closing',
            body: 'It was a pleasure assisting you. Please feel free to reach out for any further queries.',
            id: `${userId}-${(Date.now() + 10).toString(36)}`,
        },
    ];
};
