import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/index.css'
import App from './App'
import Register from './pages/Register'
import Lobby from './pages/Lobby'
import NFCTag from './pages/NFCTag'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Kill from './pages/Kill'
import Survey from './pages/Survey'
import SurveyAdmin from './pages/SurveyAdmin'
import Profile from './pages/Profile'
import Invite from './pages/Invite'
import Notifications from './pages/Notifications'
import Map from './pages/Map'
import Tag from './pages/Tag'
import AuthWrapper from './components/AuthWrapper'

const router = createBrowserRouter([
  { 
    path: '/', 
    element: (
      <AuthWrapper>
        {({ player, signOut }) => <App signOut={signOut} />}
      </AuthWrapper>
    ),
    children: [
      { index: true, element: <Home/> },
      { path: 'register', element: <Register/> },
      { path: 'profile', element: <Profile/> },
      { path: 'invite', element: <Invite/> },
      { path: 'lobby', element: <Lobby/> },
      { path: 'nfc/:id', element: <NFCTag/> },
      { path: 'gm', element: <Admin/> },
      { path: 'kill', element: <Kill/> },
      { path: 'survey', element: <Survey/> },
      { path: 'survey-admin', element: <SurveyAdmin/> },
      { path: 'notifications', element: <Notifications/> },
      { path: 'map', element: <Map/> },
      { path: 'tag', element: <Tag/> },
    ]
  },
  {
    path: '/:name',
    element: (
      <AuthWrapper>
        {({ player, signOut }) => <App signOut={signOut} />}
      </AuthWrapper>
    ),
    children: [
      { index: true, element: <Home/> },
      { path: 'register', element: <Register/> },
      { path: 'profile', element: <Profile/> },
      { path: 'invite', element: <Invite/> },
      { path: 'lobby', element: <Lobby/> },
      { path: 'nfc/:id', element: <NFCTag/> },
      { path: 'gm', element: <Admin/> },
      { path: 'kill', element: <Kill/> },
      { path: 'survey', element: <Survey/> },
      { path: 'survey-admin', element: <SurveyAdmin/> },
      { path: 'notifications', element: <Notifications/> },
      { path: 'map', element: <Map/> },
      { path: 'tag', element: <Tag/> },
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
