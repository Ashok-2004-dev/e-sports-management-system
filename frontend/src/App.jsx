import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import { PlayerLayout, AdminLayout } from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Games from './pages/Games';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import Teams from './pages/Teams';
import TeamDetail from './pages/TeamDetail';
import Matches from './pages/Matches';
import LiveGames from './pages/LiveGames';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';
import SetupAdmin from './pages/SetupAdmin';
import AdminLogin from './pages/AdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import AdminGames from './pages/admin/AdminGames';
import PlayerOverview from './pages/player/PlayerOverview';
import PlayerProfile from './pages/player/PlayerProfile';
import PlayerRegistrations from './pages/player/PlayerRegistrations';
import PlayerTeam from './pages/player/PlayerTeam';
import AdminOverview from './pages/admin/AdminOverview';
import AdminPlayers from './pages/admin/AdminPlayers';
import AdminTeams from './pages/admin/AdminTeams';
import AdminTournaments from './pages/admin/AdminTournaments';
import AdminRegistrations from './pages/admin/AdminRegistrations';
import AdminMatches from './pages/admin/AdminMatches';
import Notifications from './pages/Notifications';
import GameBackdrop from './components/GameBackdrop';
import ArenaBootScreen from './components/ArenaBootScreen';

export default function App() {
  return (
    <>
    <ArenaBootScreen />
    <GameBackdrop />
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/games" element={<Games />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/tournaments/:id" element={<TournamentDetail />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id" element={<TeamDetail />} />
        <Route path="/matches" element={<Matches />} />
        {/* LIVE GAMES (new): /live = live list + player, /live/:id = a specific match (shareable link) */}
        <Route path="/live" element={<LiveGames />} />
        <Route path="/live/:id" element={<LiveGames />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/setup-admin" element={<SetupAdmin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword scope="player" />} />
        <Route path="/admin-forgot-password" element={<ForgotPassword scope="admin" />} />
      </Route>

      <Route path="/player" element={<ProtectedRoute role="player"><PlayerLayout /></ProtectedRoute>}>
        <Route index element={<PlayerOverview />} />
        <Route path="profile" element={<PlayerProfile />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="tournaments/:id" element={<TournamentDetail />} />
        <Route path="registrations" element={<PlayerRegistrations />} />
        <Route path="team" element={<PlayerTeam />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:id" element={<TeamDetail />} />
        <Route path="matches" element={<Matches />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="games" element={<Games />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="players" element={<AdminPlayers />} />
        <Route path="games" element={<AdminGames />} />
        <Route path="teams" element={<AdminTeams />} />
        <Route path="tournaments" element={<AdminTournaments />} />
        <Route path="registrations" element={<AdminRegistrations />} />
        <Route path="matches" element={<AdminMatches />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
