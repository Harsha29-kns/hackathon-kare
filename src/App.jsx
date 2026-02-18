import { Route, Routes } from 'react-router';
import './App.css';
import Admin from './admin';
import Attd from './attendance';
import Teamdash from './Teamdash';
import Review from './Review';
import TeamMarks from './TeamMarks';
import AttendanceDetail from './AttendanceDetail';
import Instructions from "./Instructions";
import AdminControls from './AdminControls'
import Landing from './Landing';
import GameLeaderboard from './GameLeaderboard';
import JudgeLeaderboard from './JudgeLeaderboard';
import TeamLoginStatus from './TeamLoginStatus';
import QrScannerTeam from './components/QrScannerTeam';
import AdminRegistrations from './AdminRegistrations';
import Registration from './Registration';
import PaymentPortal from './PaymentPortal';
import ClosingRegister from './ClosingRegister';

function App() {
  return (
    <Routes >
      {/*<Route path='/' element={<Landing />} />*/}
      <Route path='/' element={<ClosingRegister />} />
      {/*<Route path='/' element={<Instructions/>}/>*/}
      <Route path='/home' element={<Landing />} />
      <Route path='/loginadmin' element={<Admin />} />
      <Route path='/qratt' element={<Attd />} />
      <Route path='/teamdash' element={<Teamdash />} />
      <Route path='/rreview' element={<Review />} />
      <Route path='/TTeamMarks' element={<TeamMarks />} />
      <Route path='/attendance-details' element={<AttendanceDetail />} />
      <Route path='/admin-controls' element={<AdminControls />} />
      <Route path='/game-leaderboard' element={<GameLeaderboard />} />
      <Route path='/jjudge-leaderboard' element={<JudgeLeaderboard />} />
      <Route path="/status" element={<TeamLoginStatus />} />
      <Route path="/team-qr-scanner" element={<QrScannerTeam />} />
      <Route path='/register' element={<Registration />} />
      <Route path='/admin-registrations' element={<AdminRegistrations />} />
      <Route path='/payment-portal' element={<PaymentPortal />} />
    </Routes>
  );
}

export default App