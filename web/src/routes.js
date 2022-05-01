import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Flowchart from "./pages/Student/Flowchart";

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route element={<Login />} path="/" exact/>
                <Route element={<Flowchart />} path="/student/flowchart" exact/>
            </Routes>
        </Router>
    );
}