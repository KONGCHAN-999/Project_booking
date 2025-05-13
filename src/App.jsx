
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, ROUTE_TYPES } from './components/ProtectedRoute';

// Import your components
import Home from './pages/Home';
import Login from './login/Login';
import Signup from './login/Register';

import Doctor from './pages/Doctor';
import Booking from './pages/Booking';
import Form from './pages/Form';
import Profile from './pages/Profile';
import Blog from './pages/Blog';

import DoctorAdmin from './admin/Doctor';
import ManageUser from './admin/ManageUser';
import BookingAdmin from './admin/Booking';
import BlogAdmin from './admin/Blogs';
import BlogDetail from './pages/BlogDetail';
// Add any other components you need

function App() {
  return (
    <Routes>
      {/* Public routes - accessible to everyone */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/doctor" element={<Doctor />} />

      {/* Protected routes for normal users */}
      <Route element={<ProtectedRoute routeType={ROUTE_TYPES.USER} />}>
        <Route path="/booking" element={<Booking />} />
        <Route path="/form" element={<Form />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:blogId" element={<BlogDetail />} />
      </Route>

      {/* Protected routes for admins only */}
      <Route element={<ProtectedRoute routeType={ROUTE_TYPES.ADMIN} />}>
        <Route path="/dctoradmin" element={<DoctorAdmin />} />
        <Route path="/manageuser" element={<ManageUser />} />
        <Route path="/bookingadmin" element={<BookingAdmin />} />
        <Route path="/blogAdmin" element={<BlogAdmin />} />
      </Route>

      {/* Fallback route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;