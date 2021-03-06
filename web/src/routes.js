import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Login from './pages/Login';
import Flowchart from './pages/Student/Flowchart';
import CoordinatorDashboard from './pages/CoordinatorDashboard';

import {getAuthLevel, isAuthenticated} from './auth';
import Register from './pages/Register';
import FlowchartSelection from './pages/Student/FlowchartSelection';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PublicFlowchart from './pages/PublicFlowchart';

const PrivateRoute = ({component: Component, role}) => {
  console.log(role);
  if (isAuthenticated() && getAuthLevel() === role) {
    return <Component />;
  }

  return <Navigate to="/" replace />;
};

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword/:token" element={<ResetPassword />} />

        <Route
          path="/flowchart/:studentId/:flowchartId"
          element={<PublicFlowchart />}
        />

        {/* Student Routes */}
        <Route
          path="/student/flowchart"
          element={
            <PrivateRoute component={FlowchartSelection} role="student" />
          }
        />
        <Route
          path="/student/flowchart/:id"
          element={<PrivateRoute component={Flowchart} role="student" />}
        />

        {/* Coordinator Routes */}
        <Route
          path="/coordinator/dashboard"
          element={
            <PrivateRoute component={CoordinatorDashboard} role="coordinator" />
          }
        />
      </Routes>
    </Router>
  );
}
