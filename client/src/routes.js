import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import AddAndy from './AddAndy';
import AndyList from './components/AndyList';
import ContactAdmin from './components/ContactAdmin';
import UserProfile from './components/UserProfile';

// Ensure all components are correctly exported from their respective files

const AppRoutes = ({ user, setUser }) => {
 // console.log('AppRoutes - Current user:', user);
  return (
    <Routes>
      <Route path="/" element={<Home user={user} />} />
      <Route path="/add-andy" element={<AddAndy />} />
      <Route path="/andy-list" element={<AndyList user={user} setUser={setUser} />} />
      <Route path="/contact-admin" element={<ContactAdmin />} />
      <Route path="/profile" element={<UserProfile user={user}  />} />

    </Routes>
  );
};

export default AppRoutes;