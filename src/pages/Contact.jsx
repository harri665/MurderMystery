import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contactAPI } from '../utils/api';
import socketService from '../utils/socket';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [recentContacts, setRecentContacts] = useState([]);

  useEffect(() => {
    // Connect to socket
    socketService.connect();

    // Listen for new contacts
    socketService.onNewContact((newContact) => {
      setRecentContacts(prev => [newContact, ...prev.slice(0, 4)]);
    });

    // Load recent contacts
    loadRecentContacts();

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  const loadRecentContacts = async () => {
    try {
      const contacts = await contactAPI.getAll();
      setRecentContacts(contacts.slice(0, 5));
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await contactAPI.create(formData);
      setSubmitStatus({ type: 'success', message: 'Message sent successfully! Thanks for contacting us.' });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
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
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
            
            {submitStatus && (
              <div className={`p-4 rounded-md mb-6 ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {submitStatus.message}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                ></textarea>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Contacts - Real-time */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Messages</h2>
            {recentContacts.length > 0 ? (
              <div className="space-y-4">
                {recentContacts.map((contact, index) => (
                  <div key={contact._id || index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      <span className="text-xs text-gray-500">
                        {new Date(contact.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{contact.email}</p>
                    <p className="text-gray-700">{contact.message.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No messages yet. Be the first to send one!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;