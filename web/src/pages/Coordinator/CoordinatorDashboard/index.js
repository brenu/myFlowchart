import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import "./styles.css";

function CoordinatorDashboard() {
    const [subjects, setSubjects] = useState([
        [
          {code: "CET-635", name: "Linguagem de Programação I", summary: "NÃO TE INTERESSA"},
          {code: "FCH-310", name: "Metodologia da Pesquisa Científica", summary: "NÃO TE INTERESSA"},
          {code: "CET-633", name: "Física para Ciência da Computação", summary: "NÃO TE INTERESSA"},
          {code: "CET-634", name: "Introdução à Ciência da Computação", summary: "NÃO TE INTERESSA"},
          {code: "CET-636", name: "Lógica para Computação", summary: "NÃO TE INTERESSA"},
          {code: "CET-632", name: "Cálculo Aplicado I", summary: "NÃO TE INTERESSA"},
          {code: "LTA-322", name: "Inglês Instrumental", summary: "NÃO TE INTERESSA"}
        ],
        [
          {code: "CET-641", name: "Linguagem de Programação II", summary: "NÃO TE INTERESSA", prerequisites: ["CET-635"]},
          {code: "CET-638", name: "Álgebra e Geometria Analítica", summary: "NÃO TE INTERESSA"},
          {code: "CET-637", name: "Eletrônica", summary: "NÃO TE INTERESSA", prerequisites: ["CET-633","CET-634"]},
          {code: "CET-642", name: "Lógica Digital I", summary: "NÃO TE INTERESSA", prerequisites: ["CET-636"]},
          {code: "CET-640", name: "Fund. Matemáticos para Computação", summary: "NÃO TE INTERESSA", prerequisites: ["CET-636"]},
          {code: "CET-639", name: "Cálculo Aplicado II", summary: "NÃO TE INTERESSA", prerequisites: ["CET-632"]},
        ],
        [
          {code: "CET-078", name: "Linguagem de Programação III", summary: "NÃO TE INTERESSA", prerequisites: ["CET-641"]},
          {code: "CET-077", name: "Estrutura de Dados", summary: "NÃO TE INTERESSA", prerequisites: ["CET-641"]},
          {code: "CET-074", name: "Álgebra Abstrata", summary: "NÃO TE INTERESSA", prerequisites: ["CET-638"]},
          {code: "CET-065", name: "Lógica Digital II", summary: "NÃO TE INTERESSA", prerequisites: ["CET-637","CET-642"]},
          {code: "CAE-015", name: "Fundamentos de Economia", summary: "NÃO TE INTERESSA"},
          {code: "CET-075", name: "Cálculo Aplicado III", summary: "NÃO TE INTERESSA", prerequisites: ["CET-639"]},
        ],
      ]);

    return (
        <div id="page-container">
            <div id="admin-dashboard-content">
                <div id="page-header">
                    <div id="user-container">
                        <FaUserCircle size={26} />
                        <span>Coordinator</span>
                    </div>
                    <button>Criar</button>
                </div>
                <h1>Disciplinas</h1>
                {subjects.map((semester, semesterIndex) => (
                    <div className="semester-container">
                        <h2>{semesterIndex+1}º Semestre</h2>
                        <div className="subjects-container">
                            {semester.map((subject, subjectIndex) => (
                                <div className="subject-container">
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