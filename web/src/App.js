import './App.css';
import { SteppedLineTo } from 'react-lineto';
import { useState } from 'react';
import { useEffect } from 'react';

import "./styles.css";

function App() {
  const [flowchart, setFlowchart] = useState([]);
  const [prerequisitesPath, setPrerequisitesPath] = useState([]);

  const colors = [
    "#F55",
    "#4bb",
    "#4bb543",
    "#800080",
    "#ff7700",
    "#FFF",
    "#FF6",
    "#777"
  ];

  useEffect(() => {
    async function handleInit() {
      setTimeout(() => 
      setFlowchart([
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
      ])
      , 400);
    }

    handleInit();
  }, []);

  function updatePrerequisitesPath(semesterIndex, subjectIndex) {
    const subject = flowchart[semesterIndex][subjectIndex];
    const localPrerequisitesPath = [];
    
    const previousSubjects = [];
    const futureSubjects = [];

    previousSubjects.concat(subject.prerequisites);

    if(subject.prerequisites) {
      for(let localSubject of subject.prerequisites) {
        localPrerequisitesPath.push({from:localSubject, to:subject.code})
      }
    }

    for(let i=semesterIndex; i>=0; i--) {
      for (let j=0; j>flowchart[i].length; j++) {
        if (previousSubjects.includes(flowchart[i][j].code)) {
          // localPrerequisitesPath.push({from:, to:})
        }
      }
    }

    for(let i=semesterIndex; i<flowchart.length; i++) {
      for (let j=0; j>flowchart[i].length; j++) {

      }
    }
  }

  return (
    <div className="App">
      <h1>Fluxograma TOP</h1>
      <div id="flowchart-container">
          {flowchart.map((semester, semesterIndex) => (
            <div className="semester-container">
              <h2>{semesterIndex+1}º Semestre TOP</h2>
              {semester.map((subject, subjectIndex) => (
                <>
                  <div
                    className={`${subject.code} subject-container`}
                    onMouseEnter={() => updatePrerequisitesPath(semesterIndex, subjectIndex)}
                    onMouseLeave={() => setPrerequisitesPath([])}
                  >
                    <span>{subject.name}</span>
                  </div>
                  {subject.prerequisites && (
                    <>
                      {subject.prerequisites.map(prerequisite => (
                        <SteppedLineTo 
                        from={prerequisite} 
                        to={subject.code} 
                        fromAnchor="100% center"
                        toAnchor="0% center"
                        orientation="h"
                        borderColor={colors[subjectIndex]}
                        borderWidth={2}
                        />
                      ))}
                    </>
                  )}
                </>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
