import { useState, useEffect } from 'react';
import { SteppedLineTo } from 'react-lineto';
import { FaUserCircle } from "react-icons/fa";

import "./styles.css";

function Flowchart() {
  const [flowchart, setFlowchart] = useState([]);
  const [prerequisitesPath, setPrerequisitesPath] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState({});
  const [subjectTimeout, setSubjectTimeout] = useState(null);

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
      ]);
    }

    handleInit();
  }, []);

  function updatePrerequisitesPath(semesterIndex, subjectIndex) {
    statelessPrerequisites = [];
    getPreviousSubjects(semesterIndex, subjectIndex);
    getFutureSubjects(semesterIndex, subjectIndex);
  }

  function updateSubjectsState(semesterIndex, subjectIndex){
    const newSubjects = [...subjectsState];

    let v = (subjectsState[semesterIndex][subjectIndex] + 1)%3;
    newSubjects[semesterIndex][subjectIndex] = v;
    setSubjectsState(newSubjects);
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

    return;
  }

  function getFutureSubjects(semesterIndex, subjectIndex) {
    let done = true;
    const subject = flowchart[semesterIndex][subjectIndex];

    for (let i = semesterIndex+1; i < flowchart.length; i++) {
      for (let j = 0; j < flowchart[i].length; j++) {
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
      return;
    }
  }

  function handleSubjectClicks(e, subject, semesterIndex, subjectIndex) {
    if (e.detail === 1){
      setSubjectTimeout(setTimeout(() => {
        setSelectedSubject(subject);
        setShowModal(showModal => !showModal);
      }, 350));
    } else if (e.detail === 2) {
      clearTimeout(subjectTimeout);
      updateSubjectsState(semesterIndex, subjectIndex);
    }
  }

  return (
    <div id="page-container">
      {showModal && (
        <div id="subject-modal-container" onClick={() => setShowModal(!showModal)}>
          <div id="subject-modal" onClick={e => e.stopPropagation()}>
            <span>{selectedSubject.code}</span>
            <h3>{selectedSubject.name}</h3>
            <p>{selectedSubject.summary}</p>
          </div>
        </div>
      )}
      <div id="page-header">
        <div id="user-container">
          <FaUserCircle size={26} />
          <span>Cool User</span>
        </div>
        <h1 className="page-title">Fluxograma - Ciência da Computação</h1>
        <div></div>
      </div>
      <div id="semesters-container" className="semesters-container">
        {flowchart.map((semester, semesterIndex) => (
          <div className="semester-container" key={semesterIndex}>
            <h2 className="semester-title">{romanNumbers[semesterIndex+1]}</h2>
            {semester.map((subject, subjectIndex) => (
                <div
                  key={subject.code}
                  className={`${subject.code} subject-container`}
                  onMouseEnter={() => updatePrerequisitesPath(semesterIndex, subjectIndex)}
                  onMouseLeave={() => setPrerequisitesPath([])}
                  onBlur={() => setPrerequisitesPath([])}
                  onClick={(e) => handleSubjectClicks(e, subject, semesterIndex, subjectIndex)}
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
                </div>
            ))}
          </div>
        ))}
        {/* Whaht about mixing solid and dashed borders, huh? */}
        {prerequisitesPath.map((prerequisite, prerequisiteIndex) => (
          <SteppedLineTo 
            key={prerequisiteIndex}
            from={prerequisite.from} 
            to={prerequisite.to} 
            fromAnchor="right"
            toAnchor="left"
            orientation="h"
            borderColor={colors[prerequisiteIndex]}
            borderWidth={8}
            zIndex={2}
            borderStyle="dashed"
            within="semesters-container"
          />
        ))}
      </div>
    </div>
  );
}

export default Flowchart;
