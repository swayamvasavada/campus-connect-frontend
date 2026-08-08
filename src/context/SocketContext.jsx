import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const notificationAudio = new Audio('/notification-sound.mp3');
const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('authToken');
    const userId = currentUser ? currentUser._id : null;

    useEffect(() => {
        const unlockAudio = () => {
            notificationAudio.play().then(() => {
                notificationAudio.pause();
                notificationAudio.currentTime = 0;
            }).catch(err => {
                console.log("Audio unlock failed, waiting for next interaction...", err);
            });

            if ("Notification" in window && Notification.permission === "default") {
                Notification.requestPermission();
            }

            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };

        document.addEventListener('click', unlockAudio);
        document.addEventListener('touchstart', unlockAudio);
        document.addEventListener('keydown', unlockAudio);

        return () => {
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
        };
    }, []);

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
                if (currentUser && message.senderId !== currentUser._id) {
                    const isChatPage = window.location.pathname.includes('/chat');
                    const isAppVisible = document.visibilityState === 'visible';
                    const activeChatId = sessionStorage.getItem('activeChatId');

                    const isActivelyChattingWithSender = isChatPage && isAppVisible && activeChatId === message.senderId;

                    if (isActivelyChattingWithSender) {
                        notificationAudio.volume = 0.1; // 10% volume
                    } else {
                        notificationAudio.volume = 1.0; // 100% volume
                        setUnreadCount((prev) => prev + 1);

                        const shouldSendPushNotification = !isChatPage || !isAppVisible;

                        if (shouldSendPushNotification && "Notification" in window && Notification.permission === "granted") {
                            const senderName = message.senderName || "Someone";
                            const systemNotif = new Notification(`Message from ${senderName}`, {
                                body: message.content,
                                icon: '/favicon.svg',
                                silent: true
                            });

                            // Bring user back to the app if they click the notification
                            systemNotif.onclick = (e) => {
                                e.preventDefault();
                                window.focus();
                                navigate('/chat');
                                systemNotif.close();
                            };
                        }
                    }

                    notificationAudio.play().catch(err => console.log("Audio blocked: ", err));
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