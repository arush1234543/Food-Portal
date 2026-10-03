import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import ProtectedRoute from './routes/protectedRoute.jsx'
import Register from './components/Register.jsx'
import Login from './components/Login.jsx'
import Verify from './components/Verify.jsx'
import GuestRoute from './routes/GuestRoute.jsx'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } />
        <Route path="/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        } />
        <Route path="/verify" element={
          <GuestRoute>
            <Verify />
          </GuestRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App