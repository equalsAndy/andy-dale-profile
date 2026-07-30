import { Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import Home from './pages/Home';
import Login from './pages/Login';
import Join from './pages/Join';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';
import Inbox from './pages/Inbox';
import FindAndy from './pages/FindAndy';
import Roster from './pages/Roster';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/find" element={<FindAndy />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
