// src/components/WhatChat.tsx  (READY TO USE)
// Works with backend via DataContext addChatMessage()
// Payload matches your controller: userId,userName,userRole,message,timestamp,file,department,isPrivate

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Send, Paperclip, Download, FileText, Image as ImageIcon, File, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

type UploadFile = {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
};

export function WhatChat() {
  const { user } = useAuth();
  const { chatMessages = [], addChatMessage } = useData();

  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const readFileAsDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const downloadFile = ({ name, dataUrl }: { name: string; dataUrl: string }) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = name || "file";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (type: string) => {
    if ((type || "").startsWith("image/")) return <ImageIcon size={20} className="text-blue-500" />;
    if ((type || "").includes("pdf")) return <FileText size={20} className="text-red-500" />;
    return <File size={20} className="text-gray-500" />;
  };

  const formatDateKey = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "Unknown";
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const groupedMessages = useMemo(() => {
    return (chatMessages || []).reduce((groups: Record<string, any[]>, msg: any) => {
      const ts = msg?.timestamp || msg?.createdAt || new Date().toISOString();
      const key = formatDateKey(ts);
      (groups[key] ||= []).push({ ...msg, _ts: ts });
      return groups;
    }, {});
  }, [chatMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(String(reader.result));
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ✅ IMPORTANT: no hooks inside this function
  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if ((!message.trim() && !selectedFile) || !user) return;

      let file: UploadFile | null = null;

      if (selectedFile) {
        const dataUrl = await readFileAsDataURL(selectedFile);
        file = {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          dataUrl,
        };
      }

      await addChatMessage({
        userId: user?._id || user?.id,   // ✅ FIX
        userName: user.name,
        userRole: user.role,
        message,
        timestamp: new Date().toISOString(),
        file,
      });


      setMessage("");
      handleRemoveFile();
    },
    [addChatMessage, message, selectedFile, user]
  );

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col max-h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <span className="text-teal-600 font-bold">W</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">WhatChat</h2>
            <p className="text-xs text-teal-100">Team Communication Hub</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: "#e5ddd5",
        }}
      >
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-600 bg-white/80 p-6 rounded-lg shadow-sm">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-teal-100 flex items-center justify-center">
                <Send size={32} className="text-teal-600" />
              </div>
              <p className="font-medium">No messages yet</p>
              <p className="text-sm mt-1">Start a conversation with your team!</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateKey, messages]) => (
            <div key={dateKey}>
              {/* Date Separator */}
              <div className="flex justify-center my-4">
                <span className="bg-white/90 text-gray-600 text-xs px-3 py-1 rounded-md shadow-sm">{dateKey}</span>
              </div>

              {(messages as any[]).map((msg, idx) => {
                const isMine = msg?.userId === user?._id || msg?.userName === user?.name;

                return (
                  <div key={safeKey(msg, idx)} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
                    <div
                      className={`max-w-[80%] rounded-lg shadow-sm ${isMine ? "bg-emerald-100" : "bg-white"
                        }`}
                    >
                      {/* Sender */}
                      {!isMine && (
                        <div className="px-3 pt-2">
                          <p className="text-xs font-semibold text-teal-700">{msg?.userName || "User"}</p>
                        </div>
                      )}

                      {/* File */}
                      {msg?.file?.dataUrl && (
                        <div className="px-3 pt-2">
                          {(msg.file.type || "").startsWith("image/") ? (
                            <div className="relative">
                              <img
                                src={msg.file.dataUrl}
                                alt={msg.file.name || "image"}
                                className="max-w-full rounded-lg cursor-pointer"
                                onClick={() => downloadFile({ name: msg.file.name || "image", dataUrl: msg.file.dataUrl })}
                              />
                              <button
                                type="button"
                                onClick={() => downloadFile({ name: msg.file.name || "image", dataUrl: msg.file.dataUrl })}
                                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                                title="Download"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`flex items-center gap-3 p-3 rounded-lg border ${isMine ? "bg-teal-50 border-teal-200" : "bg-gray-50 border-gray-200"
                                }`}
                            >
                              {getFileIcon(msg.file.type || "")}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{msg.file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(msg.file.size || 0)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => downloadFile({ name: msg.file.name, dataUrl: msg.file.dataUrl })}
                                className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-full transition-colors"
                                title="Download"
                              >
                                <Download size={18} className="text-gray-600" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Text */}
                      {!!msg?.message && (
                        <div className="px-3 py-1">
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      )}

                      {/* Time */}
                      <div className="px-3 pb-1 flex justify-end items-center gap-1">
                        <span className="text-xs text-gray-500">{formatTime(msg?._ts)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-12 h-12 object-cover rounded" />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded">
                {getFileIcon(selectedFile.type)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
            </div>

            <button type="button" onClick={handleRemoveFile} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-100 rounded-b-lg border-t border-gray-200">
        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-600 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
            title="Attach File"
          >
            <Paperclip size={22} />
          </button>

          <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 shadow-sm">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!message.trim() && !selectedFile}
            className="p-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0 shadow-md"
            title="Send"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

/** stable key helper */
function safeKey(msg: any, idx: number) {
  return msg?._id || msg?.id || `${msg?.timestamp || msg?.createdAt || "t"}-${idx}`;
}
