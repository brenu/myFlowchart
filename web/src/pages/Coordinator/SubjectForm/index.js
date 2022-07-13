import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { deleteCredentials } from "../../../auth";
import api from "../../../services/api";

import "./styles.css";

function SubjectForm() {
    const navigate = useNavigate();
    const params = useParams();

    const [subjects, setSubjects] = useState([]);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [summary, setSummary] = useState("");
    const [prerequisites, setPrerequisites] = useState([]);
    const [semester, setSemester] = useState(1);

    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function handleInit() {
            try {
                const response = await api.get("/coordinator/subject", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("myFlowchart@token")}`
                    }
                });

                if (response.status === 200) {
                    const localSubjects = {};

                    for (let [semester, value] of Object.entries(response.data.subjects)) {
                        value.show = false;
                        localSubjects[semester] = value;
                    }

                    setSubjects(localSubjects);
                }

                if (!params.id) {
                    return;
                }

                for (let [index, semester] of Object.entries(response.data.subjects)) {
                    const searchResults = semester.filter((subject) => subject.id === parseInt(params.id));
                    if (searchResults.length) {
                        setCode(searchResults[0].code);
                        setName(searchResults[0].name);
                        setSummary(searchResults[0].summary);
                        setPrerequisites(searchResults[0].prerequisites ? searchResults[0].prerequisites : []);
                        setSemester(index);
                        return;
                    }
                }
            } catch (error) {
                alert("Houve um erro em nosso servidor, tente novamente mais tarde!");
            }
            navigate("/coordinator/dashboard");
        }

        handleInit();
    }, []);

    function handleSubmit(e) {
        e.preventDefault();

        if (!params.id) {
            handleCreation();
        } else {
            handleEditing();
        }
    }

    async function handleCreation() {
        try {
            const response = await api.post("/coordinator/subject", {
                name,
                code,
                summary,
                semester,
                prerequisites
            },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("myFlowchart@token")}`
                    }
                });

            if (response.status === 201) {
                alert("Submissão feita com sucesso!");
                navigate("/coordinator/dashboard");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message);
            }
        }
    }

    async function handleEditing() {
        try {
            const response = await api.put(`/coordinator/subject/${params.id}`, {
                name,
                code,
                summary,
                semester,
                prerequisites
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("myFlowchart@token")}`
                }
            });

            if (response.status === 200) {
                alert("Submissão feita com sucesso!")
                navigate("/coordinator/dashboard");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message);
            }
        }
    }

    function handleShowSubjects(semesterIndex) {
        const newSubjects = { ...subjects };
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

    async function handleDeleting() {
        if (window.confirm("Tem certeza?")) {
            try {
                const response = await api.delete(`/coordinator/subject/${params.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("myFlowchart@token")}`
                    }
                });

                if (response.status === 204) {
                    alert("Disciplina removida com sucesso!");
                }
            } catch (error) {
                alert("Houve um erro em nosso servidor, tente novamente mais tarde!");
            }
            navigate("/coordinator/dashboard");
        }
    }

    return (
        <div id="page-container">
            <div id="subject-form-container">
                <div id="page-header">
                    <button onClick={() => navigate("/coordinator/dashboard")}>
                        <FaTimes />
                    </button>
                    {params.id && (
                        <button onClick={() => handleDeleting()}>
                            Deletar
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit}>

                    <label htmlFor="code">Código</label>
                    <input
                        disabled={params.id ? true : false}
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
                        min="1"
                        max="20"
                        value={semester}
                        onChange={e => setSemester(e.target.value)}
                    />

                    <label htmlFor="prerequisites">Pré-requisitos</label>
                    {Object.keys(subjects).map(formSemester => {
                        if (formSemester < semester) {
                            return (
                                <div key={formSemester} className="prerequisites-container">
                                    <button
                                        type="button"
                                        className="semester-button"
                                        onClick={() => handleShowSubjects(formSemester)}
                                    >
                                        <span>{formSemester}º Semestre</span>
                                    </button>
                                    {subjects[formSemester].show && (
                                        <div className="semester-subjects">
                                            {subjects[formSemester].map((subject, subjectIndex) => (
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
                    {errorMessage && <span>{errorMessage}</span>}
                </form>
            </div>
        </div>
    );
}

export default SubjectForm;