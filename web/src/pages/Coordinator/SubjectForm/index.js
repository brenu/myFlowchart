import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

import "./styles.css";

function SubjectForm() {
    const navigate = useNavigate();
    const params = useParams();

    const [subjects, setSubjects] = useState([]);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [summary, setSummary] = useState("");
    const [prerequisites, setPrerequisites] = useState([]);
    const [semester, setSemester] = useState(0);

    useEffect(() => {
        function handleInit() {
            const data = JSON.parse(localStorage.getItem("myFlowchart@flowchart"));
            if (data) {
                const localSubjects = [];

                for (let semester of data) {
                    semester.show = false;
                    localSubjects.push(semester);
                }

                setSubjects(localSubjects);
            }

            if (!params.id) {
                return;
            }

            for (let [index, semester] of data.entries()) {
                const searchResults = semester.filter((subject) => subject.code === params.id);

                if (searchResults.length) {
                    setCode(searchResults[0].code);
                    setName(searchResults[0].name);
                    setSummary(searchResults[0].summary);
                    setPrerequisites(searchResults[0].prerequisites ? searchResults[0].prerequisites : []);
                    setSemester(index);
                    return;
                }
            }

            navigate("/coordinator/dashboard");
        }

        handleInit();
    }, []);

    function handleSubmit(e) {
        e.preventDefault();

        if (!params.id) {
            handleCreation();
        }else{
            handleEditing();
        }

        alert("Submissão feita com sucesso!")
        navigate("/coordinator/dashboard");
    }

    function handleCreation() {
        const localFlowchart = [...subjects];

        if (!localFlowchart[semester]) {
            localFlowchart[semester] = [];
        }

        localFlowchart[semester].push({
            code,
            name,
            summary,
            prerequisites
        });

        localStorage.setItem("myFlowchart@flowchart", JSON.stringify(localFlowchart));
    }

    function handleEditing() {
        let semesterIndex = 0;

        let parsedSubjects = subjects.map((semester, index) => {
            return semester.map(subject => {
                if (subject.code === code) {
                    semesterIndex = index;

                    const realPrerequisites = [];

                    for (let [i, v] of subjects.entries()) {
                        for (let j of v) {
                            if (prerequisites.includes(j.code) && i < semester) {
                                realPrerequisites.push(j.code)
                            }
                        }
                    }

                    return {
                        code,
                        name,
                        summary,
                        prerequisites: realPrerequisites
                    };
                }

                return subject;
            })
        });

        
        if (semesterIndex !== semester) {
            parsedSubjects[semesterIndex] = parsedSubjects[semesterIndex]
                .filter(item => item.code !== code);

            if (!parsedSubjects[semester]) {
                parsedSubjects[semester] = [];
            }

            const realPrerequisites = [];

            for (let [i, v] of subjects.entries()) {
                for (let j of v) {
                    if (prerequisites.includes(j.code) && i < semester) {
                        realPrerequisites.push(j.code)
                    }
                }
            }

            parsedSubjects[semester].push({
                code,
                name,
                summary,
                prerequisites: realPrerequisites
            });
        }


        localStorage.setItem("myFlowchart@flowchart", JSON.stringify(parsedSubjects));
    }

    function handleShowSubjects(semesterIndex) {
        const newSubjects = [...subjects];
        newSubjects[semesterIndex].show = !newSubjects[semesterIndex].show;

        setSubjects(newSubjects)
    }

    function handleNewPrerequisites(e, subjectCode) {
        for (let subject of prerequisites) {
            if (subject === subjectCode) {
                setPrerequisites(prerequisites.filter(item => item !== subjectCode));
                return;
            }
        }


        setPrerequisites([...prerequisites, subjectCode]);
    }

    return (
        <div id="page-container">
            <div id="subject-form-container">
                <div id="page-header">
                    <button onClick={() => navigate("/coordinator/dashboard")}>
                        <FaTimes />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    
                    <label htmlFor="code">Código</label>
                    <input 
                        type="text"
                        name="code"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        placeholder="Código da disciplina, e.g. CET-123"
                    />

                    <label htmlFor="name">Nome</label>
                    <input 
                        type="text"
                        name="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Nome legal aqui..."
                    />

                    <label htmlFor="semester">Semestre</label>
                    <input 
                        type="number"
                        name="semester"
                        value={semester+1}
                        onChange={e => setSemester(e.target.value - 1)}
                    />

                    <label htmlFor="prerequisites">Pré-requisitos</label>
                    {subjects.map((formSemester, semesterIndex) => {
                        if (semesterIndex < semester) {
                            return (
                                <div key={semesterIndex} className="prerequisites-container">
                                    <button 
                                        type="button"
                                        className="semester-button" 
                                        onClick={() => handleShowSubjects(semesterIndex)}
                                    >
                                        <span>{semesterIndex+1}º Semestre</span>
                                    </button>
                                    {formSemester.show && (
                                        <div className="semester-subjects">
                                            {formSemester.map((subject, subjectIndex) => (
                                            <div key={subject.code} className="subject-radio-container">
                                                <input
                                                    type="checkbox"
                                                    checked={prerequisites.includes(subject.code)}
                                                    id={subject.code}
                                                    name={subject.code}
                                                    onChange={e => handleNewPrerequisites(e, subject.code)}
                                                />
                                                <label htmlFor={subject.code}>{subject.code} - {subject.name}</label>
                                            </div>  
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    })}
                    

                    <label htmlFor="code">Ementa</label>
                    <textarea 
                        type="text"
                        name="summary"
                        value={summary}
                        onChange={e => setSummary(e.target.value)}
                        placeholder="Ementa da disciplina..."
                    ></textarea>

                    <button type="submit">Submeter</button>
                </form>
            </div>
        </div>
    );
}

export default SubjectForm;