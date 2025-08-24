// Legacy Laravel API service - not used in current Next.js implementation
// This file exists for compatibility but is not actively used

const LARAVEL_BASE_URL = 'http://127.0.0.1:8000';

export default {
    // === Auth Services ===
    login(credentials: { email: string, password: string }) {
        return fetch(`${LARAVEL_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });
    },
    register(userData: any) {
        return fetch(`${LARAVEL_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
    },
    logout() {
        return fetch(`${LARAVEL_BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    },
    getUser() {
        return fetch(`${LARAVEL_BASE_URL}/api/user`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    },

    // === Chat Services ===
    startChat() {
        return fetch(`${LARAVEL_BASE_URL}/api/chat/start`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
    },
    sendChatMessage(conversationId: number, message: string) {
        return fetch(`${LARAVEL_BASE_URL}/api/chat/send`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                conversation_id: conversationId,
                message: message,
            })
        });
    }
};

