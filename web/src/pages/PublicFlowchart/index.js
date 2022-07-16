import {useState, useEffect, useRef} from 'react';
import {SteppedLineTo} from 'react-lineto';
import {
  BiArrowBack,
  BiBookContent,
  BiMenu,
  BiNote,
  BiCube,
  BiStar,
} from 'react-icons/bi';

import {GiConvergenceTarget} from 'react-icons/gi';
import {IoMdClose} from 'react-icons/io';

import {useNavigate, useParams} from 'react-router-dom';
import './styles.css';
import api from '../../services/api';

import {Dots} from 'react-activity';
import 'react-activity/dist/library.css';

import './styles.css';
import './modal.css';

export default function PublicFlowchart() {
  const [flowchart, setFlowchart] = useState([]);
  const [prerequisitesPath, setPrerequisitesPath] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState({});
  const [subjectTimeouts, setSubjectTimeouts] = useState(null);
  const {studentId, flowchartId} = useParams();
  const navigate = useNavigate();
  const [hasArchivedSubjects, setHasArchivedSubjects] = useState(true);
  const [flowchartName, setFlowchartName] = useState('');
  const [username, setUsername] = useState('');
  const [commentMessage, setCommentMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [privacySettings, setPrivacySettings] = useState({});
  const [areSettingsBeingUpdated, setAreSettingsBeingUpdated] = useState(false);

  const commentsBeginningRef = useRef(null);
  const [fullOpacitySubjects, setFullOpacitySubjects] = useState([]);
  const [hideSubjects, setHideSubjects] = useState(false);

  const [blockTimeout, setBlocktimeout] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [wasBlockAlreadyActivated, setWasBlockAlreadyActivated] = useState(
    false
  );

  const colors = [
    '#FF5555',
    '#44bbbb',
    '#64b6ac',
    '#3777FF',
    '#01295F',
    '#B09E99',
    '#D138BF',
    '#503D3F',
    '#4bb543',
    '#447604',
    '#392F5A',
    '#1E1E24',
    '#800080',
    '#A42CD6',
    '#ff7700',
    '#FFFF66',
  ];

  function romanize(num) {
    if (isNaN(num)) return NaN;
    var digits = String(+num).split(''),
      key = [
        '',
        'C',
        'CC',
        'CCC',
        'CD',
        'D',
        'DC',
        'DCC',
        'DCCC',
        'CM',
        '',
        'X',
        'XX',
        'XXX',
        'XL',
        'L',
        'LX',
        'LXX',
        'LXXX',
        'XC',
        '',
        'I',
        'II',
        'III',
        'IV',
        'V',
        'VI',
        'VII',
        'VIII',
        'IX',
      ],
      roman = '',
      i = 3;
    while (i--) roman = (key[+digits.pop() + i * 10] || '') + roman;
    return Array(+digits.join('') + 1).join('M') + roman;
  }

  const statuses = {
    todo: 'A fazer',
    doing: 'Fazendo',
    done: 'Completa',
  };

  let statelessPrerequisites = [];

  useEffect(() => {
    async function handleInit() {
      setLoading(true);

      try {
        const response = await api.get(
          `/flowchart/${studentId}/${flowchartId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                'myFlowchart@token'
              )}`,
            },
          }
        );

        if (response.status === 200) {
          setFlowchart(response.data.subjects);
          setFlowchartName(response.data.flowchart_name);
          setUsername(response.data.username);
        }

        setLoading(false);
      } catch (error) {
        navigate('/');
      }
    }

    handleInit();
  }, []);

  useEffect(() => {
    if (!loading) {
      const loadingModalContainer = document.getElementById(
        'loading-modal-container'
      );

      if (loadingModalContainer) {
        loadingModalContainer.classList.toggle('hide');
      }

      setTimeout(() => {
        const loadingModalContainer = document.getElementById(
          'loading-modal-container'
        );

        if (loadingModalContainer) {
          loadingModalContainer.remove();
        }
      }, 1000);
    }
  }, [loading]);

  useEffect(() => {
    if (!showModal) {
      setModalStep(1);
      setCommentMessage('');
    }
  }, [showModal]);

  const scrollToTop = () => {
    commentsBeginningRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    scrollToTop();
  }, [selectedSubject]);
  useEffect(() => {
    const includedSubjects = [];

    for (const item of prerequisitesPath) {
      if (!includedSubjects.includes(item.from)) {
        includedSubjects.push(item.from);
      }

      if (!includedSubjects.includes(item.to)) {
        includedSubjects.push(item.to);
      }
    }

    setFullOpacitySubjects(includedSubjects);
  }, [prerequisitesPath]);

  useEffect(() => {
    if (fullOpacitySubjects.length) {
      setHideSubjects(true);
    }
  }, [fullOpacitySubjects]);

  function updatePrerequisitesPath(semesterIndex, subjectIndex) {
    statelessPrerequisites = [];
    getPreviousSubjects(semesterIndex, subjectIndex);
    getFutureSubjects(semesterIndex, subjectIndex);
  }

  function getPreviousSubjects(semester, subjectIndex) {
    const subject = flowchart[semester][subjectIndex];
    const localPrerequisitesPath = [];

    let previousSubjects = subject.prerequisites ? subject.prerequisites : [];

    if (subject.prerequisites) {
      for (let localSubject of subject.prerequisites) {
        if (
          !statelessPrerequisites.some(
            (item) => item.from === localSubject && item.to === subject.code
          )
        ) {
          localPrerequisitesPath.push({from: localSubject, to: subject.code});
        }
      }
    }

    statelessPrerequisites = statelessPrerequisites.concat(
      localPrerequisitesPath
    );

    const semesterKeys = Object.keys(flowchart);

    for (let i = semester; i >= parseInt(semesterKeys[0]); i--) {
      if (semesterKeys.includes(i.toString())) {
        for (let j = 0; j < flowchart[i].length; j++) {
          if (previousSubjects.includes(flowchart[i][j].code)) {
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
      if (semesterKeys.includes(i.toString())) {
        for (let j = 0; j < flowchart[i].length; j++) {
          const nextSubject = flowchart[i][j];

          if (
            nextSubject.prerequisites &&
            nextSubject.prerequisites.includes(subject.code) &&
            !statelessPrerequisites.some(
              (item) =>
                item.from === subject.code && item.to === nextSubject.code
            )
          ) {
            done = false;
            statelessPrerequisites.push({
              from: subject.code,
              to: nextSubject.code,
            });
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

  function handleSubjectClicks(
    e,
    subject,
    semester,
    subjectIndex,
    isArchived = false
  ) {
    if (isBlocked && !wasBlockAlreadyActivated) {
      setWasBlockAlreadyActivated(true);
      return;
    }

    setIsBlocked(false);
    setWasBlockAlreadyActivated(false);

    if (e.detail === 1) {
      setSubjectTimeouts(
        setTimeout(() => {
          setSelectedSubject({...subject, semester: semester});
          setShowModal((showModal) => !showModal);
          window.scrollTo(0, 0);
        }, 350)
      );
    }
  }

  function handlePointerDown() {
    setBlocktimeout(
      setTimeout(() => {
        setIsBlocked(true);
      }, 250)
    );
  }

  function handlePointerUp() {
    clearTimeout(blockTimeout);
    setBlocktimeout(null);
  }

  const [modalStep, setModalStep] = useState(3);

  return (
    <div
      id={'page-container' + (loading ? '-loading' : '')}
      className="student-flowchart-page-container"
    >
      <div id="loading-modal-container">
        <Dots color="white" size={40} />
      </div>

      {/* Modal da disciplina */}
      {showModal && (
        <div
          id="subject-modal-background"
          onClick={() => setShowModal(!showModal)}
        >
          <div id="subject-modal" onClick={(e) => e.stopPropagation()}>
            <div>
              {modalStep === 1 ? (
                <div id="modal-left-btn">
                  <p>Semestre {romanize(selectedSubject.semester)}</p>
                </div>
              ) : (
                <BiArrowBack
                  color="#aaabcb"
                  onClick={() => setModalStep(1)}
                  id="close-modal-btn"
                />
              )}

              <IoMdClose
                color="#aaabcb"
                onClick={() => setShowModal(!showModal)}
                id="close-modal-btn"
              />
            </div>
            <p>{selectedSubject.name}</p>
            {modalStep > 1 && (
              <p>
                {modalStep === 2
                  ? 'Programa da disciplina'
                  : `Anotações de ${username}`}
              </p>
            )}

            {/* Página 1: Informações Básicas da Disciplina */}
            {modalStep === 1 && (
              <>
                <div id="subject-info">
                  <table>
                    <tr>
                      <td>Código</td>
                      <td>{selectedSubject.code}</td>
                    </tr>
                    <tr>
                      <td>Status</td>
                      <td>{statuses[selectedSubject.status]}</td>
                    </tr>
                    <tr>
                      <td>Professor</td>
                      <td>
                        {' '}
                        {selectedSubject.professor
                          ? selectedSubject.professor
                          : 'Não informado'}
                      </td>
                    </tr>
                    <tr>
                      <td>Carga horária</td>
                      <td>
                        Teórica: {selectedSubject.theoretical_load}h / Prática:{' '}
                        {selectedSubject.practical_load}h
                      </td>
                    </tr>
                  </table>
                </div>
                <hr />
                <div onClick={() => setModalStep(2)} className="btn">
                  <BiBookContent size={20} color="#7d83ff" />
                  <p id="subject-btn">Programa da disciplina</p>
                </div>
                <div onClick={() => setModalStep(3)} className="btn">
                  <BiNote size={20} color="#7d83ff" />
                  <p>Anotações de {username}</p>
                </div>
              </>
            )}
            {/* Página 2: Programa da Disciplina */}
            {modalStep === 2 && (
              <>
                <div id="subject-program">
                  <>
                    <div>
                      <BiMenu color="#7D83FF" size={22} />
                      <p>Ementa</p>
                    </div>
                    <p>{selectedSubject.summary}</p>
                  </>
                  <hr />
                  <>
                    <div>
                      <GiConvergenceTarget color="#7D83FF" size={22} />
                      <p>Objetivos</p>
                    </div>
                    <p>{selectedSubject.objective}</p>
                  </>
                  <hr />
                  <>
                    <div>
                      <BiCube color="#7D83FF" size={22} />
                      <p>Metodologia</p>
                    </div>
                    <p>{selectedSubject.methodology}</p>
                  </>
                  <hr />
                  <>
                    <div>
                      <BiStar color="#7D83FF" size={17} />
                      <p>Avaliação</p>
                    </div>
                    <p>{selectedSubject.assessment}</p>
                  </>
                </div>
              </>
            )}
            {/* Página 3: Anotações do usuário */}
            {modalStep === 3 && (
              <>
                <div id="subject-comments">
                  <div ref={commentsBeginningRef} />
                  {selectedSubject.comments
                    .slice(0)
                    .reverse()
                    .map((comment, index) => {
                      const date = new Date(comment.created_at);

                      const day = date.getDate();
                      const month = date.toLocaleString('pt-BR', {
                        month: 'long',
                      });
                      const year = date.getFullYear();
                      const time = date.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div className="subject-comment" key={index}>
                          <p>
                            {day} de {month} de {year}, às {time}
                          </p>
                          <p>{comment.content}</p>
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div id="page-header">
        <h1 className="page-title" onClick={() => navigate('/')}>
          Fluxograma - {flowchartName}
        </h1>
      </div>
      <div id="semesters-container" className="semesters-container">
        {Object.keys(flowchart).map((semester) => {
          let notArchivedCounter = 0;

          for (let subject of semester) {
            if (!subject.is_archived) {
              notArchivedCounter += 1;
            }
          }

          if (notArchivedCounter > 0) {
            return (
              <div className="semester-container" key={semester}>
                <h2 className="semester-title">{romanize(semester)}</h2>
                {flowchart[semester].map((subject, subjectIndex) => (
                  <>
                    {!subject.is_archived && (
                      <div
                        key={subject.code}
                        className={`${subject.code} subject-container`}
                        onMouseEnter={() => {
                          if (!isBlocked) {
                            updatePrerequisitesPath(semester, subjectIndex);
                          }
                        }}
                        onMouseLeave={() => {
                          if (!isBlocked) {
                            setHideSubjects(false);
                            setPrerequisitesPath([]);
                          }
                        }}
                        onBlur={() => {
                          setHideSubjects(false);
                          setPrerequisitesPath([]);
                        }}
                        onClick={(e) =>
                          handleSubjectClicks(
                            e,
                            subject,
                            semester,
                            subjectIndex
                          )
                        }
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        style={{
                          backgroundColor:
                            subject.status === 'todo'
                              ? '#F4F5FF'
                              : subject.status === 'doing'
                              ? '#FFBABA'
                              : '#7D83FF',
                          opacity:
                            hideSubjects &&
                            !fullOpacitySubjects.includes(subject.code)
                              ? '0.25'
                              : '1.0',
                          zIndex:
                            hideSubjects &&
                            !fullOpacitySubjects.includes(subject.code)
                              ? 0
                              : 3,
                        }}
                      >
                        <p
                          className="subject-code"
                          style={{
                            color:
                              subject.status === 'todo' ? '#0D1321' : '#FFFBFE',
                          }}
                        >
                          {subject.code}
                        </p>
                        <p
                          className="subject-name"
                          style={{
                            color:
                              subject.status === 'todo' ? '#0D1321' : '#FFFBFE',
                          }}
                        >
                          {subject.name}
                        </p>
                        <p className="subject-code hidden">.</p>
                      </div>
                    )}
                  </>
                ))}
              </div>
            );
          }
        })}
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
            className="prerequisite-line"
            zIndex={2}
            borderStyle="dashed"
            within="semesters-container"
          />
        ))}
      </div>
      {hasArchivedSubjects && (
        <div id="archived-subjects-container">
          <h2>Disciplinas Arquivadas</h2>
          <div id="subjects-list">
            {Object.keys(flowchart).map((semester) => (
              <>
                {flowchart[semester].map((subject, subjectIndex) => (
                  <>
                    {subject.is_archived && (
                      <div
                        key={subject.code}
                        className={`${subject.code} subject-container`}
                        onClick={(e) =>
                          handleSubjectClicks(
                            e,
                            subject,
                            semester,
                            subjectIndex,
                            true
                          )
                        }
                        style={{
                          color:
                            subject.status === 'todo' ? '#0D1321' : '#FFFBFE',
                          backgroundColor:
                            subject.status === 'todo'
                              ? '#F4F5FF'
                              : subject.status === 'doing'
                              ? '#FFBABA'
                              : '#7D83FF',
                        }}
                      >
                        <p className="subject-code">{subject.code}</p>
                        <p className="subject-name">{subject.name}</p>
                        <p className="subject-code hidden">.</p>
                      </div>
                    )}
                  </>
                ))}
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
