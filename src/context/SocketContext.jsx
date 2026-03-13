import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('authToken');
    const userId = currentUser ? currentUser._id : null;

    // 1. Initialize Socket
    useEffect(() => {
        if (token) {
            const newSocket = io(process.env.REACT_APP_SERVER_URL, {
                extraHeaders: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setSocket(newSocket);
            
            // Listen for global messages to update badge
            const handleNewMessage = (message) => {
                 // If message is not from me, increment badge
                 if (currentUser && message.senderId !== currentUser._id) {
                     setUnreadCount((prev) => prev + 1);
                 }
            };
            newSocket.on('message', handleNewMessage);

            return () => {
                newSocket.off('message', handleNewMessage);
                newSocket.close();
            };
        }
    }, [token, userId]);

    // Value MUST be an object containing all these properties
    return (
        <SocketContext.Provider value={{ socket, unreadCount, setUnreadCount }}>
            {children}
        </SocketContext.Provider>
    );
};