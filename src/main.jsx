import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/index.css'
import App from './App'
import Register from './pages/Register'
import Lobby from './pages/Lobby'
import NFCTag from './pages/NFCTag'
import Admin from './pages/Admin'
import Kill from './pages/Kill'
import Survey from './pages/Survey'
import SurveyAdmin from './pages/SurveyAdmin'

const router = createBrowserRouter([
  { path: '/', element: <App/>,
    children: [
      { index:true, element: <Survey/> },
      { path: 'register', element: <Register/> },
      { path: 'lobby', element: <Lobby/> },
      { path: 'nfc/:id', element: <NFCTag/> },
      { path: 'gm', element: <Admin/> },
      { path: 'kill', element: <Kill/> },
      { path: 'survey', element: <Survey/> },
      { path: 'survey-admin', element: <SurveyAdmin/> },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
