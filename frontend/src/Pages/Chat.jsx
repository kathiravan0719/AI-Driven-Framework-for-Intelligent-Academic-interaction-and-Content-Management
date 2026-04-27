import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send, Search, ArrowLeft, MessageCircle, Users,
  Check, CheckCheck, Smile, MoreVertical, User as UserIcon
} from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

function Chat() {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const { currentUser, users, socket } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserList, setShowUserList] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Load conversations
  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !currentUser) return;

    // Listen for incoming messages
    const handleMessage = (msg) => {
      // Add to messages if from/to current selected user
      if (selectedUser) {
        const otherId = selectedUser._id || selectedUser.id;
        if (msg.sender === otherId || msg.receiver === otherId) {
          setMessages(prev => [...prev, msg]);
          // Mark as read
          if (msg.sender === otherId) {
            api.put(`/chat/read/${otherId}`).catch(() => {});
          }
        }
      }
      // Refresh conversations
      loadConversations();
    };

    const handleOnlineUsers = (userIds) => {
      setOnlineUsers(userIds);
    };

    const handleTyping = ({ userId }) => {
      setTypingUsers(prev => ({ ...prev, [userId]: true }));
    };

    const handleStopTyping = ({ userId }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    socket.on('chat-message', handleMessage);
    socket.on('online-users', handleOnlineUsers);
    socket.on('user-typing', handleTyping);
    socket.on('user-stop-typing', handleStopTyping);

    return () => {
      socket.off('chat-message', handleMessage);
      socket.off('online-users', handleOnlineUsers);
      socket.off('user-typing', handleTyping);
      socket.off('user-stop-typing', handleStopTyping);
    };
  }, [socket, currentUser, selectedUser]);

  // Auto-select user from URL param
  useEffect(() => {
    if (paramUserId && users.length > 0) {
      const user = users.find(u => (u._id || u.id) === paramUserId);
      if (user) {
        handleSelectUser(user);
      }
    }
  }, [paramUserId, users]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      setConversations(res.data);
    } catch (err) {
      console.log('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMessagesLoading(true);
    setShowUserList(false);

    try {
      const userId = user._id || user.id;
      const res = await api.get(`/chat/messages/${userId}`);
      setMessages(res.data);
      // Mark messages as read
      await api.put(`/chat/read/${userId}`);
      loadConversations(); // refresh unread counts
    } catch (err) {
      console.log('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const receiverId = selectedUser._id || selectedUser.id;
    const tempMessage = {
      _id: Date.now().toString(),
      sender: currentUser.id,
      receiver: receiverId,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    // Stop typing
    if (socket) {
      socket.emit('stop-typing', { senderId: currentUser.id, receiverId });
    }

    try {
      await api.post('/chat/send', { receiverId, content: tempMessage.content });
      loadConversations();
    } catch (err) {
      console.log('Send failed');
    }
  };

  const handleTyping = () => {
    if (!socket || !selectedUser) return;
    const receiverId = selectedUser._id || selectedUser.id;
    socket.emit('typing', { senderId: currentUser.id, receiverId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { senderId: currentUser.id, receiverId });
    }, 2000);
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter users for new chat
  const availableUsers = users.filter(u => {
    const uid = u._id || u.id;
    if (uid === currentUser?.id) return false;
    if (searchQuery) {
      return u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-primary-blue/10">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-bg-card dark:bg-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden border border-border-color" style={{ height: 'calc(100vh - 140px)' }}>
          <div className="flex h-full">

            {/* Left Sidebar — Conversations */}
            <div className="w-80 border-r border-border-color flex flex-col bg-bg-tertiary dark:bg-slate-900/30">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border-color bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-black text-text-primary flex items-center gap-2 uppercase tracking-tight">
                    <MessageCircle className="w-5 h-5 text-primary-blue" />
                    Messages
                  </h2>
                  <button
                    onClick={() => setShowUserList(!showUserList)}
                    className="w-8 h-8 bg-primary-blue/5 text-primary-blue rounded-lg flex items-center justify-center hover:bg-primary-blue/10 transition shadow-sm"
                    title="New Chat"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -tranblue-y-1/2 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-bg-tertiary dark:bg-slate-900 rounded-xl text-sm focus:ring-2 focus:ring-primary-blue/20 focus:bg-white border border-border-color transition shadow-inner"
                  />
                </div>
              </div>

              {/* User list for new chat */}
              {showUserList && (
                <div className="border-b border-border-color bg-primary-blue/5 max-h-48 overflow-y-auto chat-scroll">
                  <div className="px-3 py-2 text-[10px] font-black text-primary-blue uppercase tracking-[0.2em]">
                    Start New Chat
                  </div>
                  {availableUsers.map(user => {
                    const uid = user._id || user.id;
                    return (
                      <button
                        key={uid}
                        onClick={() => handleSelectUser(user)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white transition text-left"
                      >
                        <div className="relative">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-navy to-primary-blue rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          {isOnline(uid) && (
                            <div className="absolute -bottom-0.5 -right-0.5 online-dot shadow-sm" style={{ width: 8, height: 8, border: '1.5px solid white' }} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-text-primary truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto chat-scroll">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full shrink-0 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 bg-blue-100 rounded animate-pulse" />
                          <div className="h-3 w-1/2 bg-blue-100 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-12 text-text-secondary">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-bold text-sm uppercase tracking-widest">No conversations</p>
                    <p className="text-[10px] mt-1">Click the <Users className="w-3 h-3 inline" /> icon to start</p>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const uid = conv.user._id || conv.user.id;
                    const isSelected = selectedUser && (selectedUser._id || selectedUser.id) === uid;
                    return (
                      <button
                        key={uid}
                        onClick={() => handleSelectUser(conv.user)}
                        className={`w-full flex items-center gap-3 px-4 py-4 transition text-left border-b border-blue-50 ${
                          isSelected ? 'bg-primary-blue/5 border-l-4 border-l-primary-blue' : 'hover:bg-white'
                        }`}
                      >
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-navy to-primary-blue rounded-2xl flex items-center justify-center text-white font-black shadow-lg">
                            {conv.user.name?.charAt(0).toUpperCase()}
                          </div>
                          {isOnline(uid) ? (
                            <div className="absolute -bottom-1 -right-1 online-dot shadow-sm" style={{ border: '2px solid white' }} />
                          ) : (
                            <div className="absolute -bottom-1 -right-1 offline-dot shadow-sm" style={{ border: '2px solid white' }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-text-primary text-sm truncate">
                              {conv.user.name}
                            </span>
                            <span className="text-[10px] font-black text-text-secondary shrink-0 ml-2 uppercase tracking-tighter">
                              {conv.lastMessage && formatTime(conv.lastMessage.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-500 truncate pr-2 font-medium">
                              {typingUsers[uid] ? (
                                <span className="text-primary-blue italic animate-pulse">typing...</span>
                              ) : (
                                conv.lastMessage?.content || 'Start a conversation'
                              )}
                            </p>
                            {conv.unreadCount > 0 && (
                              <span className="shrink-0 w-5 h-5 bg-primary-blue text-white rounded-full text-[10px] flex items-center justify-center font-black shadow-lg shadow-primary-blue/20">
                                {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel — Chat Messages */}
            <div className="flex-1 flex flex-col bg-white">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="px-6 py-4 border-b border-border-color bg-white flex items-center justify-between shadow-sm relative z-10">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelectedUser(null)} className="md:hidden p-1 hover:bg-bg-tertiary dark:bg-slate-900 rounded-lg text-slate-500">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-navy to-primary-blue rounded-xl flex items-center justify-center text-white font-black shadow-lg">
                          {selectedUser.name?.charAt(0).toUpperCase()}
                        </div>
                        {isOnline(selectedUser._id || selectedUser.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 online-dot shadow-sm" style={{ width: 8, height: 8, border: '1.5px solid white' }} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-text-primary tracking-tight">{selectedUser.name}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                          {isOnline(selectedUser._id || selectedUser.id) ? (
                            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Online</>
                          ) : (
                            <><span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span> Offline</>
                          )}
                          {typingUsers[selectedUser._id || selectedUser.id] && (
                            <span className="text-primary-blue ml-2">• typing...</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/profile/${selectedUser._id || selectedUser.id}`)}
                      className="p-2 hover:bg-bg-tertiary dark:bg-slate-900 rounded-xl transition text-text-secondary hover:text-primary-blue border border-transparent hover:border-border-color shadow-sm"
                      title="View Profile"
                    >
                      <UserIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 chat-scroll bg-bg-primary/30">
                    {messagesLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 bg-primary-blue/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                          <MessageCircle className="w-10 h-10 text-primary-blue/40" />
                        </div>
                        <p className="text-text-primary font-black uppercase tracking-widest text-sm">Initialize Sequence</p>
                        <p className="text-[10px] text-text-secondary mt-2 font-black uppercase tracking-[0.2em]">Break the silence with a new stream</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isMine = msg.sender === currentUser.id;
                        const showTime = idx === 0 || 
                          new Date(msg.createdAt).getTime() - new Date(messages[idx - 1]?.createdAt).getTime() > 300000;

                        return (
                          <div key={msg._id || idx}>
                            {showTime && (
                              <div className="text-center my-6 relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-color"></div></div>
                                <span className="relative z-10 text-[9px] font-black text-text-secondary bg-bg-primary px-3 py-1 rounded-full uppercase tracking-widest">
                                  {formatTime(msg.createdAt)}
                                </span>
                              </div>
                            )}
                            <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-sm ${
                                isMine 
                                ? 'bg-gradient-to-r from-primary-navy to-primary-blue text-white rounded-tr-none' 
                                : 'bg-white text-text-primary border border-border-color rounded-tl-none shadow-xl'
                              }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                                <div className={`flex items-center gap-1.5 mt-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                  <span className={`text-[9px] font-black uppercase tracking-tighter ${isMine ? 'text-primary-blue/30' : 'text-text-secondary'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {isMine && (
                                    msg.read ? (
                                      <CheckCheck className={`w-3 h-3 text-white/40`} />
                                    ) : (
                                      <Check className={`w-3 h-3 text-white/40`} />
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Typing indicator */}
                    {typingUsers[selectedUser._id || selectedUser.id] && (
                      <div className="flex justify-start">
                        <div className="bg-bg-card dark:bg-slate-800 border border-border-color px-5 py-3 rounded-2xl rounded-tl-none shadow-xl">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-primary-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 bg-primary-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-primary-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="px-6 py-4 border-t border-border-color bg-white relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 relative">
                         <input
                           type="text"
                           value={newMessage}
                           onChange={(e) => {
                             setNewMessage(e.target.value);
                             handleTyping();
                           }}
                           onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                           placeholder="Type a message..."
                           className="w-full px-5 py-3.5 bg-bg-tertiary dark:bg-slate-900 rounded-2xl text-sm focus:ring-4 focus:ring-primary-blue/10 focus:bg-white border border-border-color transition shadow-inner font-medium pr-12"
                         />
                         <div className="absolute right-4 top-1/2 -tranblue-y-1/2 text-text-secondary">
                           <Smile className="w-5 h-5 cursor-pointer hover:text-primary-blue transition-colors" />
                         </div>
                      </div>
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="w-12 h-12 bg-gradient-to-br from-primary-navy to-primary-blue text-white rounded-2xl flex items-center justify-center hover:shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100 shadow-xl"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* No user selected */
                <div className="flex-1 flex items-center justify-center bg-bg-primary/50 relative overflow-hidden">
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary-blue/10 rounded-full blur-[120px] animate-blob"></div>
                  </div>
                  <div className="text-center relative z-10">
                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-border-color">
                      <MessageCircle className="w-12 h-12 text-primary-blue" />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-2 tracking-tight uppercase">Intelligence Terminal</h3>
                    <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] max-w-xs mx-auto">
                      Select a conversation or initialize a new sequence to start synchronization
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
