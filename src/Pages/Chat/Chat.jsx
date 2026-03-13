import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import '../../assets/styles/chat.css';
import '../../assets/styles/modal.css';

export default function Chat() {
    const { socket, setUnreadCount } = useSocket() || { socket: null, setUnreadCount: () => { } };
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // --- State ---
    const [recentChats, setRecentChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [loadingRecent, setLoadingRecent] = useState(true);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const messagesEndRef = useRef(null);

    // --- 1. Fetch Recent Chats ---
    const loadChats = useCallback(async () => {
        try {
            if (!currentUser?._id) return;
            const token = localStorage.getItem('authToken');
            const url = `${process.env.REACT_APP_SERVER_URL}/api/messages/recent-chats?userId=${currentUser._id}&page=1&limit=20`;

            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await res.json();

            if (!data.hasError && data.recentChats) {
                setRecentChats(data.recentChats);
            }
        } catch (error) {
            console.error("Failed to fetch recent chats", error);
        } finally {
            setLoadingRecent(false);
        }
    }, [currentUser?._id]);

    // Initial Load
    useEffect(() => {
        loadChats();
    }, [loadChats]);


    // --- 2. Real-time Socket Listeners ---
    useEffect(() => {
        if (!socket) return;

        const handleIncomingMessage = (msg) => {
            const isRelatedToCurrentChat = currentChat?.userDetails &&
                (msg.senderId === currentChat.userDetails._id || msg.receiverId === currentChat.userDetails._id);

            if (isRelatedToCurrentChat) {
                setMessages((prev) => {
                    const exists = prev.some(m => m._id === msg._id);
                    if (exists) return prev;
                    return [...prev, msg];
                });
            } else {
                if (msg.senderId !== currentUser._id) {
                    setUnreadCount(prev => prev + 1);
                }
            }

            setRecentChats((prevChats) => {
                const otherUserId = msg.senderId === currentUser._id ? msg.receiverId : msg.senderId;
                const existingChatIndex = prevChats.findIndex(c => c.userDetails?._id === otherUserId);

                if (existingChatIndex !== -1) {
                    // Chat exists: Update and move to top
                    let updatedChats = [...prevChats];
                    const chatToUpdate = { ...updatedChats[existingChatIndex] };
                    chatToUpdate.latestMessage = msg;

                    if (!isRelatedToCurrentChat && msg.senderId !== currentUser._id) {
                        chatToUpdate.unreadCount = (chatToUpdate.unreadCount || 0) + 1;
                    }

                    updatedChats.splice(existingChatIndex, 1);
                    updatedChats.unshift(chatToUpdate);
                    return updatedChats;
                } else {
                    // If chat doesn't exist, re-fetch list from API to get user details
                    loadChats();
                    return prevChats;
                }
            });
        };

        socket.on('message', handleIncomingMessage);
        return () => {
            socket.off('message', handleIncomingMessage);
        };
    }, [socket, currentChat, currentUser._id, setUnreadCount]);


    // --- 3. Fetch Messages for Active Chat ---
    useEffect(() => {
        if (!currentChat) return;
        setIsMessagesLoading(true);

        async function fetchMessages() {
            try {
                const token = localStorage.getItem('authToken');
                const targetUserId = currentChat.userDetails._id;
                const url = `${process.env.REACT_APP_SERVER_URL}/api/messages/fetch-messages?userId=${targetUserId}`;

                const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                const data = await res.json();

                if (!data.hasError) {
                    setMessages(data.messages || []);
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            } finally {
                setIsMessagesLoading(false);
            }
        }
        fetchMessages();
    }, [currentChat]);


    // --- 4. Auto-scroll ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isMessagesLoading]);


    // --- 5. Sending Messages ---
    const handleSendMessage = async (e) => {
        e.preventDefault();

        // Grab the ID safely
        const targetUserId = currentChat?.userDetails?._id || currentChat?.receiver?._id;

        if (newMessage.trim() === "" || !currentChat || !targetUserId) return;

        const messageId = crypto.randomUUID();

        const messagePayload = {
            _id: messageId,
            senderId: currentUser._id,
            receiverId: targetUserId,
            content: newMessage,
            createdAt: new Date().toISOString()
        };

        socket.emit('message', messagePayload);

        const optimisticMsg = {
            ...messagePayload,
            status: "Sent"
        };

        setMessages((prev) => [...prev, optimisticMsg]);

        setRecentChats((prev) => {
            // FIX: Safely check for the ID using optional chaining and the targetUserId
            const index = prev.findIndex(c => (c?.userDetails?._id || c?.receiver?._id) === targetUserId);

            if (index !== -1) {
                const updated = [...prev];
                updated[index].latestMessage = optimisticMsg;

                // Auto-upgrade old 'receiver' objects to 'userDetails' if needed
                if (!updated[index].userDetails && updated[index].receiver) {
                    updated[index].userDetails = updated[index].receiver;
                }

                const item = updated.splice(index, 1)[0];
                updated.unshift(item);
                return updated;
            } else {
                // If I am starting a new chat, add it to my list immediately
                const newChatEntry = {
                    userDetails: currentChat.userDetails || currentChat.receiver,
                    latestMessage: optimisticMsg,
                    unreadCount: 0
                };
                return [newChatEntry, ...prev];
            }
        });

        setNewMessage("");
    };

    const handleChatClick = (chat) => {
        setCurrentChat(chat);
        if (chat.unreadCount > 0) {
            setUnreadCount(prev => Math.max(0, prev - chat.unreadCount));
            setRecentChats(prev => prev.map(c =>
                // FIX: Added optional chaining (?.) here too
                (c?.userDetails?._id || c?.receiver?._id) === (chat?.userDetails?._id || chat?.receiver?._id)
                    ? { ...c, unreadCount: 0 }
                    : c
            ));
        }
    };

    // --- Search Helper ---
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);

        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/search?username=${searchQuery}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                const result = await res.json();
                if (!result.hasError) setSearchResults(result.result || []);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        return isToday
            ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString();
    };

    const handleStartNewChat = (user) => {
        const newChatObj = { userDetails: user, latestMessage: null };
        setCurrentChat(newChatObj);
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
    };

    if (loadingRecent) return <div className="chat-container"><p style={{ margin: 'auto' }}>Loading Chats...</p></div>;

    return (
        <div className="chat-container">
            {/* Sidebar */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h2>Chats</h2>
                    <button className="new-chat-pill-btn" onClick={() => setIsSearchOpen(true)}>
                        <i className="fa-solid fa-plus"></i> <span>New Chat</span>
                    </button>
                </div>
                <div className="sidebar-scroll-area">
                    {recentChats.map((chat) => (
                        <div
                            key={chat.userDetails._id}
                            className={`chat-room-item ${currentChat && currentChat.userDetails._id === chat.userDetails._id ? 'active' : ''}`}
                            onClick={() => handleChatClick(chat)}
                        >
                            <img src={chat.userDetails.profilePic || `https://ui-avatars.com/api/?name=${chat.userDetails.name}`} alt="Av" className="user-avatar" />
                            <div className="room-info">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h4>{chat.userDetails.name}</h4>
                                    <span style={{ fontSize: '0.7rem', color: '#666' }}>{formatTime(chat.latestMessage?.createdAt)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p className="last-message-preview">
                                        {chat.latestMessage ? chat.latestMessage.content : <i>No messages</i>}
                                    </p>
                                    {chat.unreadCount > 0 && (
                                        <span className="chat-unread-badge">
                                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            {currentChat ? (
                <div className="chat-window">
                    <div className="chat-header">
                        <img src={currentChat.userDetails.profilePic || `https://ui-avatars.com/api/?name=${currentChat.userDetails.name}`} alt="Av" className="user-avatar" style={{ width: '35px', height: '35px' }} />
                        <h3>{currentChat.userDetails.name}</h3>
                    </div>
                    <div className="messages-container">
                        {messages.map((msg, i) => {
                            const isMe = msg.senderId === currentUser._id;
                            return (
                                <div key={i} className={`message-bubble ${isMe ? "sent" : "received"}`}>
                                    <p>{msg.content}</p>
                                    <span className="message-time">{formatTime(msg.createdAt)}</span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input type="text" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                        <button type="submit" className="send-btn"><i className="fa-solid fa-paper-plane"></i></button>
                    </form>
                </div>
            ) : (
                /* --- UPDATED EMPTY STATE --- */
                <div className="no-chat-selected">
                    <img
                        src="/favicon.svg"
                        alt="Campus Connect Logo"
                        className="campus-logo-animated"
                    />
                    <h2>Welcome to Campus Connect</h2>
                    <p>Select a chat from the sidebar to start messaging your friends, project members, and club mates.</p>
                </div>
            )}

            {/* Search Modal */}
            {isSearchOpen && (
                <div className="modal-overlay" onClick={() => setIsSearchOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Start chatting with</h2>
                            <button className="close-btn" onClick={() => setIsSearchOpen(false)}>&times;</button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search for users..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            autoFocus
                            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #444', background: '#222', color: 'white' }}
                        />

                        <ul className="user-search-list">
                            {searchResults.map(user => (
                                <li key={user._id} className="user-search-item" onClick={() => handleStartNewChat(user)}>
                                    <img src={user.profilePic || `https://ui-avatars.com/api/?name=${user.name}`} alt="av" className="user-avatar" style={{ width: '32px', height: '32px' }} />
                                    <span>{user.name}</span>
                                </li>
                            ))}
                        </ul>

                        {isSearching && (
                            <p style={{ textAlign: 'center', color: '#777', padding: '10px' }}>Searching...</p>
                        )}
                        {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#777', padding: '10px' }}>No users found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}