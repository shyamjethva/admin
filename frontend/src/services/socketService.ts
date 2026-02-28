import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
    if (!socket) {
        // Derive socket URL from the API base URL (strip /api suffix)
        const apiBase = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5001/api';
        const socketUrl = apiBase.replace(/\/api\/?$/, '');

        console.log('Creating new socket connection to:', socketUrl);
        socket = io(socketUrl, {
            auth: { token },
            transports: ['polling', 'websocket'], // start with polling, upgrade to ws
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
        });

        socket.on('connect', () => {
            console.log('Socket.IO connected with ID:', socket?.id);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket.IO disconnected:', reason);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('Socket.IO reconnected on attempt:', attemptNumber);
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Socket.IO attempting to reconnect:', attemptNumber);
        });

        socket.on('reconnect_failed', () => {
            console.log('Socket.IO reconnection failed');
        });
    }
    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Centralized event handling
export const setupSocketListeners = (socket: Socket, onNewMessage?: (data: any) => void, onChatNotification?: (data: any) => void, onOnlineUsersUpdate?: (data: any) => void) => {
    const handleLegacyBroadcast = (data: any) => {
        console.log('Received legacy chat_message_broadcast:', data);
        const mappedData = { ...data, type: 'new_message' };
        if (onNewMessage) onNewMessage(mappedData);
    };

    const handleChatNotification = (data: any) => {
        console.log('🔔 Received chat_notification:', data);
        if (onChatNotification) onChatNotification(data);
    };

    if (onNewMessage) {
        socket.on('new_message', onNewMessage);
    }

    if (onChatNotification) {
        socket.on('chat_notification', handleChatNotification);
    }

    if (onOnlineUsersUpdate) {
        socket.on('online_users_update', onOnlineUsersUpdate);
    }

    // Add legacy support for un-restarted backends
    socket.on('chat_message_broadcast', handleLegacyBroadcast);

    // Return cleanup function
    return () => {
        if (onNewMessage) socket.off('new_message', onNewMessage);
        if (onChatNotification) socket.off('chat_notification', handleChatNotification);
        if (onOnlineUsersUpdate) socket.off('online_users_update', onOnlineUsersUpdate);
        socket.off('chat_message_broadcast', handleLegacyBroadcast);
    };
};