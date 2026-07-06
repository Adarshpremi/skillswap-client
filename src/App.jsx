import Notifications from './pages/Notifications';
import ChatList  from './pages/ChatList';
import ChatWindow from './pages/ChatWindow';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar    from './components/Navbar';
import Home      from './pages/Home';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './components/Dashboard';
import Profile   from './components/Profile';
import './App.css';


function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        
        <Route path="/notifications" element={
          <PrivateRoute><Notifications /></PrivateRoute>
        } />

        <Route path="/chats" element={
          <PrivateRoute><ChatList /></PrivateRoute>
        }  />
        <Route path="/chat/:userId" element={
          <PrivateRoute><ChatWindow /></PrivateRoute>
        }  />

        <Route path="/login"    element={!user ? <Login />    : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/" element={
          <PrivateRoute><Home /></PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />
        <Route path="/profile/:name" element={
          <PrivateRoute><Profile /></PrivateRoute>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}