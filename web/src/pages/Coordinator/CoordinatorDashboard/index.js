import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "./styles.css";

function CoordinatorDashboard() {
    const [subjects, setSubjects] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        async function handleInit() {
            const response = await api.get("/coordinator/subject", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("myFlowchart@token")}`
                }
            });

            if (response.status === 200) {
                setSubjects(response.data);
            }
        }

        handleInit();
    }, []);

    function handleSubjectEditing(id) {
        navigate(`/coordinator/subject/${id}`);
    }

    function subjectFormNavigation() {
        navigate("/coordinator/subject");
    }

    return (
        <div id="page-container">
            <div id="admin-dashboard-content">
                <div id="page-header">
                    <div id="user-container">
                        <FaUserCircle size={26} />
                        <span>Espaço do Coordenador</span>
                    </div>
                    <button onClick={() => subjectFormNavigation()}>Criar</button>
                </div>
                <h1>Disciplinas</h1>
                {Object.keys(subjects).map((semester) => (
                    <div className="semester-container" key={semester}>
                        <h2>{semester}º Semestre</h2>
                        <div className="subjects-container">
                            {subjects[semester].map((subject, subjectIndex) => (
                                <div
                                    className="subject-container"
                                    onClick={() => handleSubjectEditing(subject.id)}
                                    key={subjectIndex}
                                >
                                    <span>{subject.code}</span>
                                    <span>{subject.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CoordinatorDashboard;