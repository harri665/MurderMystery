import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
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
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About Us</h1>
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-4">
              This is a sample React application built with modern web technologies.
            </p>
            <p className="text-gray-600 mb-4">
              We're using React 18 for the user interface, React Router for client-side routing, 
              and Tailwind CSS for utility-first styling. The build process is powered by Vite 
              for fast development and optimized production builds.
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Technology Stack</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>React 18 - Modern React with hooks and concurrent features</li>
              <li>Vite - Fast build tool and development server</li>
              <li>React Router - Declarative routing for React applications</li>
              <li>Tailwind CSS - Utility-first CSS framework</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;