import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function CoordinatorDashboard() {
    const [subjects, setSubjects] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        async function handleInit() {
          const localFlowchart = JSON.parse(localStorage.getItem("myFlowchart@flowchart"));
    
          setSubjects(localFlowchart);
        }
    
        handleInit();
      }, []);

    function handleSubjectEditing(code) {
        navigate(`/coordinator/subject/${code}`);
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
                        <span>Coordinator</span>
                    </div>
                    <button onClick={() => subjectFormNavigation()}>Criar</button>
                </div>
                <h1>Disciplinas</h1>
                {subjects.map((semester, semesterIndex) => (
                    <div className="semester-container" key={semesterIndex}>
                        <h2>{semesterIndex+1}º Semestre</h2>
                        <div className="subjects-container">
                            {semester.map((subject, subjectIndex) => (
                                <div 
                                    className="subject-container" 
                                    onClick={() => handleSubjectEditing(subject.code)}
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