import { Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import Home from './pages/Home';
import Login from './pages/Login';
import Join from './pages/Join';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import FindAndy from './pages/FindAndy';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/find" element={<FindAndy />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
