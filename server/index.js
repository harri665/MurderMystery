import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Simple JSON file database for development
const dataDir = path.join(process.cwd(), 'data');
const contactsFile = path.join(dataDir, 'contacts.json');
const messagesFile = path.join(dataDir, 'messages.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize JSON files if they don't exist
if (!fs.existsSync(contactsFile)) {
  fs.writeFileSync(contactsFile, JSON.stringify([], null, 2));
}

if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, JSON.stringify([], null, 2));
}

// Helper functions for JSON database
const readContacts = () => {
  try {
    const data = fs.readFileSync(contactsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeContacts = (contacts) => {
  fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));
};

const readMessages = () => {
  try {
    const data = fs.readFileSync(messagesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeMessages = (messages) => {
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
};

// Generate unique ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

console.log('Using local JSON file database for development');

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!', database: 'JSON Files' });
});

// Contact form endpoint
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const contact = {
      _id: generateId(),
      name,
      email,
      message,
      createdAt: new Date().toISOString()
    };

    const contacts = readContacts();
    contacts.unshift(contact); // Add to beginning
    writeContacts(contacts);
    
    // Emit to all connected clients
    io.emit('newContact', contact);
    
    res.status(201).json({ message: 'Contact saved successfully', contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = readContacts();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = readMessages();
    res.json(messages.slice(-50)); // Return last 50 messages
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle new chat messages
  socket.on('sendMessage', async (data) => {
    try {
      const message = {
        _id: generateId(),
        username: data.username,
        message: data.message,
        timestamp: new Date().toISOString()
      };

      const messages = readMessages();
      messages.push(message);
      writeMessages(messages);
      
      // Broadcast to all connected clients
      io.emit('newMessage', message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Data stored in: ${dataDir}`);
});