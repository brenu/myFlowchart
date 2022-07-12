import { useEffect, useState } from "react";
import { FaShare, FaShareAlt, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { deleteCredentials } from "../../../auth";
import api from "../../../services/api";
import "./styles.css";

function CoordinatorDashboard() {
    const [subjects, setSubjects] = useState([]);
    const [flowchartId, setFlowchartId] = useState(0);
    const [flowchartName, setFlowchartName] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        async function handleInit() {
            const response = await api.get("/coordinator/subject", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("myFlowchart@token")}`
                }
            });

            if (response.status === 200) {
                setSubjects(response.data.subjects);
                setFlowchartId(response.data.flowchart_id);
                setFlowchartName(response.data.flowchart_name);
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

    function handleLogout() {
        deleteCredentials();
        navigate("/");
    }

    function handleShareUrl() {
        navigator.clipboard.writeText(`${window.origin}/register?flowchart=${flowchartId}`).then(function () {
            alert("A URL foi copiada para a área de transferência e pode ser compartilhada com seus alunos!");
        }, function () {
            alert("Ocorreu um erro, tente novamente mais tarde!");
        });
    }

    return (
        <div id="page-container">
            <div id="admin-dashboard-content">
                <div id="page-header">
                    <div id="user-container">
                        <FaUserCircle size={26} />
                        <span>Espaço do Coordenador</span>
                    </div>
                    <div id="logout-container">
                        <button onClick={handleLogout}>
                            Sair
                        </button>
                    </div>
                    <button
                        id="share-button" title="Compartilhar link de cadastro do curso"
                        onClick={handleShareUrl}
                    >
                        <FaShareAlt color="#7d83ff" />
                    </button>
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