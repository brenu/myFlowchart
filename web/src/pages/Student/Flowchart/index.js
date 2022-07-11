import { useState, useEffect } from 'react';
import { SteppedLineTo } from 'react-lineto';
import { FaUserCircle } from "react-icons/fa";

import "./styles.css";
import { useParams } from 'react-router-dom';
import api from '../../../services/api';

function Flowchart() {
  const [flowchart, setFlowchart] = useState([]);
  const [prerequisitesPath, setPrerequisitesPath] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState({});
  const [subjectTimeout, setSubjectTimeout] = useState(null);
  const { id } = useParams();
  let matrix = new Array(11);
  for (let i = 0; i < 11; ++i) matrix[i] = new Array(11);
  for (let i = 0; i < 11; ++i) matrix[i].fill(0);

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

      const response = await api.get(`/student/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("myFlowchart@token")}`
        }
      });

      if (response.status === 200) {
        setFlowchart(response.data);
      }
    }

    handleInit();
  }, []);

  function updatePrerequisitesPath(semesterIndex, subjectIndex) {
    statelessPrerequisites = [];
    getPreviousSubjects(semesterIndex, subjectIndex);
    getFutureSubjects(semesterIndex, subjectIndex);
  }

  async function updateSubjectsState(semester, subjectIndex) {
    const newFlowchart = { ...flowchart };
    const subject = newFlowchart[semester][subjectIndex];

    if (subject.status === "todo") {
      subject.status = "doing"
    } else if (subject.status === "doing") {
      subject.status = "done"
    } else {
      subject.status = "todo"
    }

    const response = await api.put(`/student-subject/${subject.id}`, {
      status: subject.status
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("myFlowchart@token")}`
      }
    });

    if (response.status === 200) {
      setFlowchart(newFlowchart);
    }
  }

  function getPreviousSubjects(semester, subjectIndex) {
    let done = true;

    const subject = flowchart[semester][subjectIndex];
    const localPrerequisitesPath = [];

    let previousSubjects = subject.prerequisites ? subject.prerequisites : [];

    if (subject.prerequisites) {
      for (let localSubject of subject.prerequisites) {
        if (!statelessPrerequisites.some(item => item.from === localSubject && item.to === subject.code)) {
          localPrerequisitesPath.push({ from: localSubject, to: subject.code })
        }
      }
    }

    statelessPrerequisites = statelessPrerequisites.concat(localPrerequisitesPath);

    const semesterKeys = Object.keys(flowchart);

    for (let i = semester; i >= semesterKeys[0]; i--) {
      if (semesterKeys.includes(i)) {
        for (let j = 0; j < flowchart[i].length; j++) {
          if (previousSubjects.includes(flowchart[i][j].code)) {
            done = false;
            getPreviousSubjects(i, j);
          }
        }
      }
    }

    return;
  }

  function getFutureSubjects(semester, subjectIndex) {
    let done = true;
    const subject = flowchart[semester][subjectIndex];

    const semesterKeys = Object.keys(flowchart);

    for (let i = semester; i < semesterKeys[semesterKeys.length - 1]; i++) {
      if (semesterKeys.includes(i)) {
        for (let j = 0; j < flowchart[i].length; j++) {
          const nextSubject = flowchart[i][j];

          if (nextSubject.prerequisites &&
            nextSubject.prerequisites.includes(subject.code) &&
            !statelessPrerequisites.some(item => item.from === subject.code && item.to === nextSubject.code)) {
            done = false;
            statelessPrerequisites.push({ from: subject.code, to: nextSubject.code });
            getFutureSubjects(i, j);
          }
        }
      }
    }

    if (done) {
      setPrerequisitesPath(statelessPrerequisites);
      return;
    }
  }

  function handleSubjectClicks(e, subject, semester, subjectIndex) {
    if (e.detail === 1) {
      setSubjectTimeout(setTimeout(() => {
        setSelectedSubject(subject);
        setShowModal(showModal => !showModal);
      }, 350));
    } else if (e.detail === 2) {
      clearTimeout(subjectTimeout);
      updateSubjectsState(semester, subjectIndex);
    }
  }

  return (
    <div id="page-container" class="flowchart-page-container">
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
        {Object.keys(flowchart).map((semester) => (
          <div className="semester-container" key={semester}>
            <h2 className="semester-title">{romanNumbers[semester]}</h2>
            {flowchart[semester].map((subject, subjectIndex) => (
              <div
                key={subject.code}
                className={`${subject.code} subject-container`}
                onMouseEnter={() => updatePrerequisitesPath(semester, subjectIndex)}
                onMouseLeave={() => setPrerequisitesPath([])}
                onBlur={() => setPrerequisitesPath([])}
                onClick={(e) => handleSubjectClicks(e, subject, semester, subjectIndex)}
                style={{
                  color: (subject.status === "todo" ? "#0D1321" : "#FFFBFE"),
                  backgroundColor: subject.status === "todo" ? "#F4F5FF" :
                    subject.status === "doing" ? "#FFBABA" : "#7D83FF"
                }}
              >
                <p className="subject-code">{subject.code}</p>
                <p className="subject-name">{subject.name}</p>
                <p className="subject-code hidden">.</p>
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
