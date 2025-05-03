"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPaperPlane, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const ChatRoom = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text, sender, isError = false) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    setMessages(prev => [...prev, { 
      text, 
      sender,
      timestamp: timeString,
      isError
    }]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      // 添加使用者訊息
      addMessage(inputMessage, 'user');
      const userMessage = inputMessage;
      setInputMessage('');
      setIsLoading(true);

      try {
        // 發送請求到後端
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '伺服器回應錯誤');
        }

        if (data.error) {
          throw new Error(data.error);
        }

        // 添加 AI 回應
        addMessage(data.response, 'ai');
      } catch (error) {
        console.error('Error:', error);
        addMessage(
          `錯誤：${error.message || '發生未知錯誤，請稍後再試'}`, 
          'ai', 
          true
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
          {/* Chat Header */}
          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg">
            <h3 className="text-white font-semibold">聊天室</h3>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-purple-500 text-white'
                      : message.isError
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.isError && (
                    <FontAwesomeIcon 
                      icon={faExclamationCircle} 
                      className="mr-2 text-red-500"
                    />
                  )}
                  {message.text}
                </div>
                <div className={`text-xs text-gray-400 mt-1 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {message.timestamp}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-800">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="輸入訊息..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-purple-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg transition-opacity ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 
                   shadow-lg hover:shadow-xl transition-all duration-300 
                   flex items-center justify-center"
      >
        <FontAwesomeIcon 
          icon={faRobot} 
          className="text-white text-lg"
        />
      </button>
    </div>
  );
};

export default ChatRoom; 