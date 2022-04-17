import './App.css';
import { SteppedLineTo } from 'react-lineto';
import {useState, useEffect} from 'react';

import "./styles.css";

function App() {
  const [flowchart, setFlowchart] = useState([]);
  const [prerequisitesPath, setPrerequisitesPath] = useState([]);

  let matrix = new Array(11);
  for(let i=0; i<11; ++i) matrix[i] = new Array(11);
  for(let i=0; i<11; ++i) matrix[i].fill(0);
  const [subjectsState, setSubjectsState] = useState(matrix);
  const subjectBgColor = [
    "#F4F5FF",
    "#FFBABA",
    "#7D83FF"
  ];

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

  let romanNumbers = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X',
  }

  let statelessPrerequisites = [];

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

  useEffect(() => {
    console.log(prerequisitesPath);
  }, [prerequisitesPath]);

  function updatePrerequisitesPath(semesterIndex, subjectIndex) {
    getPreviousSubjects(semesterIndex, subjectIndex);
    getFutureSubjects(semesterIndex, subjectIndex);
    // console.log(semesterIndex, subjectIndex);
  }

  function updateSubjectsState(semesterIndex, subjectIndex){
    //O state update não tá funcionando adequadamente
    //o update ocorre apenas quando o mouse é tirado do btn D:
    let v = (subjectsState[semesterIndex][subjectIndex] + 1)%3;
    subjectsState[semesterIndex][subjectIndex] = v;
    setSubjectsState(subjectsState);
  }

  function getPreviousSubjects(semesterIndex, subjectIndex) {
    let done = true;
    
    const subject = flowchart[semesterIndex][subjectIndex];
    const localPrerequisitesPath = [];

    let previousSubjects = subject.prerequisites ? subject.prerequisites : [];

    if(subject.prerequisites) {
      for(let localSubject of subject.prerequisites) {
        if (!statelessPrerequisites.some(item => item.from === localSubject && item.to === subject.code)) {
          localPrerequisitesPath.push({from:localSubject, to:subject.code})
        }
      }
    }

    statelessPrerequisites = statelessPrerequisites.concat(localPrerequisitesPath);

    for(let i=semesterIndex; i>=0; i--) {
      for (let j=0; j<flowchart[i].length; j++) {
        if (previousSubjects.includes(flowchart[i][j].code)) {
          done = false;
          getPreviousSubjects(i,j);
        }
      }
    }

    if (done) {
      statelessPrerequisites = prerequisitesPath.concat(statelessPrerequisites);
      setPrerequisitesPath(statelessPrerequisites);
      return;
    }

    return;
  }

  function getFutureSubjects(semesterIndex, subjectIndex) {
    // console.log("CHAMA")
    let done = true;
    const subject = flowchart[semesterIndex][subjectIndex];

    for (let i = semesterIndex+1; i < flowchart.length; i++) {
      // console.log(i, flowchart.length)
      for (let j = 0; j < flowchart[i].length; j++) {
        // console.log("aqui =>", i, flowchart[i])
        const nextSubject = flowchart[i][j];

        if (nextSubject.prerequisites && 
            nextSubject.prerequisites.includes(subject.code) &&
            !statelessPrerequisites.some(item => item.from === subject.code && item.to === nextSubject.code)) {
          done = false;
          statelessPrerequisites.push({from: subject.code, to: nextSubject.code});
          getFutureSubjects(i, j);
        }
      }
    }

    if (done) {
      setPrerequisitesPath(statelessPrerequisites);
      console.log(statelessPrerequisites);
      return;
    }
  }

  return (
    <div className="App">
      <h1 className="pageTitle">Fluxograma TOP</h1>
      <div id="flowchart-container">
          {flowchart.map((semester, semesterIndex) => (
            <div className="semester-container" key={semesterIndex}>
              <h2 className="semester-title">{romanNumbers[semesterIndex+1]}</h2>
              {semester.map((subject, subjectIndex) => (
                  <div
                    key={subject.code}
                    className={`${subject.code} subject-container`}
                    onMouseEnter={() => updatePrerequisitesPath(semesterIndex, subjectIndex)}
                    onMouseLeave={() => setPrerequisitesPath([])}
                    onClick={() => updateSubjectsState(semesterIndex, subjectIndex)}
                    style={{
                      color:(subjectsState[semesterIndex][subjectIndex]===0?"#0D1321":"#FFFBFE"),
                      backgroundColor: subjectBgColor[subjectsState[semesterIndex][subjectIndex]]
                    }}
                  >
                    <p className="subject-code">{subject.code}</p>
                    <p className="subject-name">{subject.name}</p>
                    <p 
                      className="subject-code"
                      style={{
                        color: subjectBgColor[subjectsState[semesterIndex][subjectIndex]]
                      }}
                      >.</p>
                    {/* <span>{subjectsState[semesterIndex][subjectIndex]}</span> */}
                  </div>
              ))}
            </div>
          ))}
          {prerequisitesPath.map((prerequisite, prerequisiteIndex) => (
            <SteppedLineTo 
              key={prerequisiteIndex}
              from={prerequisite.from} 
              to={prerequisite.to} 
              fromAnchor="100% center"
              toAnchor="0% center"
              orientation="h"
              borderColor={colors[prerequisiteIndex]}
              borderWidth={2}
            />
          ))}
      </div>
    </div>
  );
}

export default App;
