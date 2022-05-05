import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";


import Login from "./pages/Login";
import Flowchart from "./pages/Student/Flowchart";
import CoordinatorDashboard from "./pages/Coordinator/CoordinatorDashboard";

import { getAuthLevel, isAuthenticated } from './auth';

const PrivateRoute = ({ component: Component, role}) => {
    if (isAuthenticated() && getAuthLevel() === role) {
        return <Component />
    }

    return <Navigate to="/" replace/>;
}

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />}  exact/>
                
                {/* Student Routes */}
                <Route path="/student/flowchart" element={
                    <PrivateRoute component={Flowchart} role="Student" />
                }/>

                
                {/* Coordinator Routes */}
                <Route path="/coordinator/dashboard" element={
                    <PrivateRoute component={CoordinatorDashboard} role="Coordinator" />
                }/>
            </Routes>
        </Router>
    );
}