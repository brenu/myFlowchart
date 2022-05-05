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
      const localFlowchart = JSON.parse(localStorage.getItem("myFlowchart@flowchart"));

      setFlowchart(localFlowchart);
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
