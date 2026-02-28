// src/components/WhatChat.tsx  (READY TO USE)
// Works with backend via DataContext addChatMessage()
// Payload matches your controller: userId,userName,userRole,message,timestamp,file,department,isPrivate

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Send, Paperclip, Download, FileText, Image as ImageIcon, File, X, MessageSquare, Mic, Smile } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useNotifications } from "../context/NotificationContext";
import { initializeSocket, setupSocketListeners } from '../services/socketService';
import { toast } from 'sonner'; // Add toast for popup notifications

type UploadFile = {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
};

export function WhatChat() {
  const { user } = useAuth();
  const { chatMessages = [], addChatMessage } = useData();
  const { addNotification, unreadCount } = useNotifications();

  // Debug log to see chat messages
  console.log('Chat messages:', chatMessages);
  console.log('Unread count:', unreadCount);

  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showOnlineUsersList, setShowOnlineUsersList] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Initialize socket connection
  useEffect(() => {
    if (user && user.id) {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Initializing socket connection for user:', user.id);
        const socket = initializeSocket(token);

        // Debug connection
        socket.on('connect', () => {
          console.log('Socket connected:', socket.id);
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        // Setup centralized listeners
        const cleanup = setupSocketListeners(
          socket,
          (data) => {
            // Handle new messages
            console.log('WhatChat received new_message:', data);

            // Show notification for received messages
            if (data.senderId) {
              const msgPreview = data.message || "Sent an attachment";
              console.log('Creating notification for:', user?.name, 'Message:', msgPreview);

              // Check if this message is from the current user
              const isFromSelf = String(data.senderId) === String(user?.id);

              // Show popup notification (for others' messages)
              if (!isFromSelf) {
                toast.info(`💬 ${data.senderName || 'Someone'} sent: ${msgPreview}`, {
                  duration: 5000,
                  position: 'top-right',
                });
              }

              // Add to notification system for ALL messages (including own messages)
              // Generate a truly unique ID for each notification to prevent duplicates
              const uniqueNotificationId = `chat_${data.conversationId || 'general'}_${data.senderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

              addNotification({
                type: 'message',
                title: `${isFromSelf ? 'You sent' : `New message from ${data.senderName || 'User'}`}`,
                message: msgPreview,
                priority: 'medium',
                relatedId: uniqueNotificationId,
                actionUrl: 'group-chat'
              });

              console.log('Notification created successfully');
            }
          },
          (data) => {
            // Handle chat notifications (from socket)
            console.log('🔔 WhatChat received chat_notification:', data);

            // Check if this notification is for the current user
            if (data.senderId && String(data.senderId) !== String(user?.id)) {
              const msgPreview = data.message || "Sent an attachment";
              console.log('🔔 Creating notification from chat_notification:', msgPreview);

              // Generate a unique ID for this notification
              const uniqueNotificationId = `chat_${data.conversationId || 'general'}_${data.senderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

              addNotification({
                type: 'message',
                title: `New message from ${data.senderName || 'User'}`,
                message: msgPreview,
                priority: 'medium',
                relatedId: uniqueNotificationId,
                actionUrl: 'group-chat'
              });

              // Show toast notification
              toast.info(`💬 ${data.senderName || 'Someone'} sent: ${msgPreview}`, {
                duration: 5000,
                position: 'top-right',
              });

              console.log('🔔 Chat notification added successfully');
            }
          },
          (users) => {
            // Handle online users updates
            console.log('Online users updated:', users);
            setOnlineUsers(users || []);
          }
        );

        return () => {
          cleanup();
          socket.off('connect');
          socket.off('connect_error');
        };
      }
    }
  }, [user, addNotification]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    if ((!message.trim() && !selectedFile) || !user) return;

    try {
      const payload: any = {
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        message: message.trim(),
        timestamp: new Date().toISOString(),
      };

      console.log('Sending message:', payload);

      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          payload.file = {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            dataUrl: base64
          };

          await addChatMessage(payload);
          setMessage("");
          removeFile();
        };
        reader.readAsDataURL(selectedFile);
      } else {
        await addChatMessage(payload);
        setMessage("");
      }

      console.log('Message sent successfully');
      setShowEmojiPicker(false); // Close emoji picker after sending
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    chatMessages.forEach(msg => {
      const date = new Date(msg.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  }, [chatMessages]);

  // Get unique users for online count - keeping this for fallback if needed
  const uniqueUsers = useMemo(() => {
    if (!chatMessages.length) return [];
    return Array.from(new Set(chatMessages.map(m => m.userName)));
  }, [chatMessages]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: '#1f2937', // gray-800
      color: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid #374151' // gray-700
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: '#3730a3', // indigo-800
        color: 'white',
        borderRadius: '0.5rem 0.5rem 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Team Connect</h2>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>Real-time messaging</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#4ade80', borderRadius: '50%' }}></div>
          <span style={{ fontSize: '0.875rem', color: 'white' }}>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: '#111827', // gray-900
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {Object.entries(groupedMessages).map(([date, messages]) => (
          <div key={date}>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.25rem 1rem',
                backgroundColor: '#6366f1', // indigo-500
                color: 'white',
                fontSize: '0.875rem',
                borderRadius: '9999px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                {new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            {messages.map((msg: any) => (
              <div
                key={msg.id || msg._id}
                style={{
                  display: 'flex',
                  justifyContent: msg.userId === user?.id ? 'flex-end' : 'flex-start',
                  marginBottom: '1rem' // Added space between messages
                }}
              >
                <div
                  style={{
                    maxWidth: '20rem',
                    padding: '0.75rem',
                    borderRadius: '0.75rem 0.75rem 0.75rem 0.25rem',
                    backgroundColor: msg.userId === user?.id ? '#4f46e5' : '#374151', // indigo-600 or gray-600
                    color: 'white',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                >
                  {msg.userId !== user?.id && (
                    <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '0.25rem', fontWeight: '500' }}>{msg.userName}</div>
                  )}
                  {msg.file && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      {msg.file.type.startsWith('image/') ? (
                        <img
                          src={msg.file.dataUrl}
                          alt={msg.file.name}
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            borderRadius: '0.5rem',
                            border: '1px solid #4b5563' // gray-600
                          }}
                        />
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          backgroundColor: '#1f2937', // gray-800
                          borderRadius: '0.5rem',
                          border: '1px solid #4b5563' // gray-600
                        }}>
                          <FileText size={20} color="#a5b4fc" />
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>{msg.file.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                              {(msg.file.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                          <a
                            href={msg.file.dataUrl}
                            download={msg.file.name}
                            style={{
                              marginLeft: 'auto',
                              padding: '0.25rem',
                              borderRadius: '0.25rem',
                              backgroundColor: '#4b5563', // gray-600
                              color: '#a5b4fc',
                              textDecoration: 'none'
                            }}
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.message && (
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>{msg.message}</div>
                  )}
                  <div
                    style={{
                      fontSize: '0.75rem',
                      marginTop: '0.25rem',
                      color: msg.userId === user?.id ? '#c7d2fe' : '#9ca3af' // indigo-200 or gray-400
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#1f2937',
          borderTop: '1px solid #374151',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          {['😀', '😂', '😍', '👍', '👏', '🎉', '🔥', '💯', '❤️', '🙏'].map(emoji => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              style={{
                fontSize: '1.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '0.25rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* File Preview */}
      {previewUrl && (
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #374151',
          backgroundColor: '#111827' // gray-900
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#1f2937', // gray-800
            borderRadius: '0.5rem',
            border: '1px solid #4b5563' // gray-600
          }}>
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: '4rem',
                height: '4rem',
                objectFit: 'cover',
                borderRadius: '0.25rem'
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'white' }}>{selectedFile?.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                {(selectedFile?.size || 0 / 1024).toFixed(1)} KB
              </div>
            </div>
            <button
              onClick={removeFile}
              style={{
                padding: '0.25rem',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #374151',
        backgroundColor: '#1f2937' // gray-800
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.5rem',
              color: '#a5b4fc', // indigo-300
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Paperclip size={20} />
          </button>
          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #4b5563',
                borderRadius: '0.75rem',
                backgroundColor: '#111827', // gray-900
                color: 'white',
                resize: 'none',
                maxHeight: '8rem',
                fontSize: '0.875rem'
              }}
              rows={1}
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                position: 'absolute',
                right: '0.5rem',
                bottom: '0.5rem',
                padding: '0.25rem',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Smile size={16} />
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim() && !selectedFile}
            style={{
              padding: '0.75rem',
              backgroundColor: '#6366f1', // indigo-500
              color: 'white',
              borderRadius: '9999px',
              border: 'none',
              cursor: !message.trim() && !selectedFile ? 'not-allowed' : 'pointer',
              opacity: !message.trim() && !selectedFile ? 0.5 : 1,
              transition: 'all 0.2s',
              transform: 'hover:scale-105'
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

