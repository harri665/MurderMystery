import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { messageAPI } from '../utils/api';
import socketService from '../utils/socket';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Connect to socket
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for new messages
    socketService.onNewMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    // Load existing messages
    loadMessages();

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  const loadMessages = async () => {
    try {
      const messages = await messageAPI.getAll();
      setMessages(messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() && username.trim()) {
      socketService.sendMessage(username.trim(), newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">My App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Contact
              </Link>
              <Link 
                to="/chat" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Chat
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {/* Chat Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Real-time Chat</h1>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

          {/* Username Input */}
          {!username && (
            <div className="p-4 bg-yellow-50 border-b">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your username to start chatting:
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                />
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={message._id || index} className="flex flex-col">
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.username === username 
                    ? 'bg-blue-600 text-white self-end' 
                    : 'bg-gray-200 text-gray-900 self-start'
                }`}>
                  <div className="text-xs opacity-75 mb-1">
                    {message.username} • {formatTime(message.timestamp)}
                  </div>
                  <div className="break-words">{message.message}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {username && (
            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={!isConnected}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !newMessage.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chat;