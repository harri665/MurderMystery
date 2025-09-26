# React Ro- 🗄️ **JSON Database** - Simple file-based storage for local developmentter + Tailwind CSS App with MongoDB & Real-time Chat

A modern full-stack React application built with Vite, featuring React Router for navigation, Tailwind CSS for styling, MongoDB for data storage, and Socket.IO for real-time features.

## Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 18** - Latest React with hooks and concurrent features
- 🚀 **React Router** - Declarative routing for React applications
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- �️ **MongoDB** - NoSQL database for data persistence
- ⚡ **Socket.IO** - Real-time bidirectional communication
- �📱 **Responsive Design** - Mobile-first approach with Tailwind
- 🔄 **Hot Module Replacement** - Instant updates during development
- 💬 **Real-time Chat** - Live messaging with Socket.IO
- 📧 **Contact Form** - Persistent contact submissions

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Socket.IO
- **Database**: JSON files for local development (easily upgradable to MongoDB)
- **Real-time**: Socket.IO for live updates
- **Deployment**: Docker Compose for easy container deployment

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation & Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start both frontend and backend:
   ```bash
   npm start
   ```

   Or run them separately:
   ```bash
   # Terminal 1 - Backend server
   npm run server

   # Terminal 2 - Frontend dev server
   npm run dev
   ```

3. **Access the application**:
   - Frontend: `http://localhost:5173/`
   - Backend API: `http://localhost:3001/api`

4. **Data Storage**:
   - Contact forms and chat messages are stored in `./data/` folder as JSON files
   - Data persists between server restarts

### Build

Create a production build:
```bash
npm run build
```

### Preview

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
src/
├── pages/          # Page components
│   ├── Home.jsx    # Home page
│   ├── About.jsx   # About page
│   ├── Contact.jsx # Contact page with form
│   └── Chat.jsx    # Real-time chat page
├── utils/          # Utility functions
│   ├── api.js      # API client functions
│   └── socket.js   # Socket.IO client
├── App.jsx         # Main app component with routing
├── index.css       # Tailwind CSS imports
└── main.jsx        # App entry point
server/
└── index.js        # Express server with Socket.IO
data/               # JSON database files (auto-created)
├── contacts.json   # Contact form submissions
└── messages.json   # Chat messages
```

## Available Routes

- `/` - Home page with feature overview
- `/about` - About page with technology information  
- `/contact` - Contact page with persistent form and real-time submissions
- `/chat` - Real-time chat room with Socket.IO

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/contacts` - Get all contact submissions
- `POST /api/contacts` - Submit new contact form
- `GET /api/messages` - Get chat messages

## Real-time Events

- `newContact` - Emitted when a new contact form is submitted
- `newMessage` - Emitted when a new chat message is sent
- `sendMessage` - Send a new chat message

## Technologies Used

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **JSON File Storage** - Simple local database for development
- **Socket.IO** - Real-time WebSocket communication
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker Compose** - Container orchestration
- **Mongo Express** - MongoDB web admin interface

## Scripts

- `npm start` - Start both frontend and backend servers
- `npm run dev` - Start frontend development server only
- `npm run server` - Start backend server only
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
DATABASE_TYPE=json
```

## Customization

### Adding New Pages

1. Create a new component in the `src/pages/` directory
2. Import and add a new route in `src/App.jsx`
3. Update navigation links in your components

### Styling

The project uses Tailwind CSS. You can:
- Modify `tailwind.config.js` to customize the design system
- Add custom CSS classes in `src/index.css`
- Use Tailwind utility classes directly in your components

## License

This project is open source and available under the [MIT License](LICENSE).
