import {useState, useEffect, useRef} from 'react';
import {SteppedLineTo} from 'react-lineto';
import {
  MdLogout,
  MdOutlinePublicOff,
  MdShare,
  MdOutlinePublic,
} from 'react-icons/md';
import {
  BiArrowBack,
  BiBookContent,
  BiComment,
  BiCommentAdd,
  BiMenu,
  BiNote,
  BiCube,
  BiStar,
} from 'react-icons/bi';

import {GiConvergenceTarget} from 'react-icons/gi';
import {IoMdClose} from 'react-icons/io';

import {useNavigate, useParams} from 'react-router-dom';
import './styles.css';
import api from '../../../services/api';
import {deleteCredentials} from '../../../auth';

import {Dots} from 'react-activity';
import 'react-activity/dist/library.css';

import './styles.css';
import './modal.css';
import {FaPaperPlane} from 'react-icons/fa';

export default function Flowchart() {
  const [flowchart, setFlowchart] = useState([]);
  const [prerequisitesPath, setPrerequisitesPath] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState({});
  const [subjectTimeouts, setSubjectTimeouts] = useState(null);
  const {id} = useParams();
  const navigate = useNavigate();
  const [hasArchivedSubjects, setHasArchivedSubjects] = useState(true);

  const [studentId, setStudentId] = useState(0);
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
  const [wasBlockAlreadyActivated, setWasBlockAlreadyActivated] =
    useState(false);

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
    11: 'XI',
    12: 'XII',
    13: 'XIII',
    14: 'XIV',
    15: 'XV',
  };

  const statuses = {
    todo: 'A fazer',
    doing: 'Fazendo',
    done: 'Completa',
  };

  let statelessPrerequisites = [];

  useEffect(() => {
    async function handleInit() {
      setLoading(true);

      const response = await api.get(`/student/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('myFlowchart@token')}`,
        },
      });

      if (response.status === 200) {
        setFlowchart(response.data.subjects);
        setStudentId(response.data.student_id);
        setFlowchartName(response.data.flowchart_name);
        setUsername(response.data.username);
      }

      setLoading(false);
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
    if (areSettingsBeingUpdated) {
      handlePrivacySettingsUpdate();
    }
  }, [areSettingsBeingUpdated]);

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

  function openPrivacyModal() {
    setShowPrivacyModal(true);
    setModalLoading(true);
    getPrivacySettings();
  }

  async function getPrivacySettings() {
    try {
      const response = await api.get(`/student/privacy/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('myFlowchart@token')}`,
        },
      });

      if (response.status === 200) {
        setPrivacySettings(response.data);
        setModalLoading(false);
      }
    } catch (error) {
      alert('Ocorreu um erro, tente novamente mais tarde!');
      setShowPrivacyModal(false);
    }
  }

  async function handlePrivacySettingsUpdate() {
    if (!privacySettings.is_public) {
      navigator.clipboard.writeText('');
    }

    try {
      await api.put(`/student/privacy/${id}`, privacySettings, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('myFlowchart@token')}`,
        },
      });

      setAreSettingsBeingUpdated(false);
    } catch (error) {
      alert('Ocorreu um erro, tente novamente mais tarde!');
    }
  }

  function handleShareUrl() {
    navigator.clipboard
      .writeText(`${window.origin}/flowchart/${studentId}/${id}`)
      .then(
        function () {
          alert(
            'A URL foi copiada para a área de transferência e pode ser compartilhada com seus alunos!'
          );
        },
        function () {
          alert('Ocorreu um erro, tente novamente mais tarde!');
        }
      );
  }

  function handleLogout() {
    deleteCredentials();
    navigate('/');
  }

  function updatePrerequisitesPath(semesterIndex, subjectIndex) {
    statelessPrerequisites = [];
    getPreviousSubjects(semesterIndex, subjectIndex);
    getFutureSubjects(semesterIndex, subjectIndex);
  }

  async function updateSubjectsState(semester, subjectIndex) {
    const newFlowchart = {...flowchart};
    const subject = newFlowchart[semester][subjectIndex];

    if (subject.status === 'todo') {
      subject.status = 'doing';
    } else if (subject.status === 'doing') {
      subject.status = 'done';
    } else {
      subject.status = 'todo';
    }

    const response = await api.put(
      `/student-subject/${subject.id}`,
      {
        status: subject.status,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('myFlowchart@token')}`,
        },
      }
    );

    if (response.status === 200) {
      setFlowchart(newFlowchart);
    }
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
            console.log('oi');
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
    } else if (e.detail === 2) {
      clearTimeout(subjectTimeouts);
      if (!isArchived) {
        updateSubjectsState(semester, subjectIndex);
      }
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
  const [visibleInput, setVisibleInput] = useState(false);

  async function handleComment(e) {
    e.preventDefault();

    if (!commentMessage) return;

    try {
      const response = await api.post(
        '/comments',
        {
          subject_id: selectedSubject.id,
          content: commentMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'myFlowchart@token'
            )}`,
          },
        }
      );

      if (response.status === 201) {
        let updatedFlowchart = [];
        let updatedSubject = {
          ...selectedSubject,
          comments: [
            ...selectedSubject.comments,
            {
              content: commentMessage,
              created_at: new Date().toISOString(),
            },
          ],
        };
        updatedSubject.comments.sort(function (a, b) {
          return new Date(a.created_at) - new Date(b.created_at);
        });

        Object.keys(flowchart).map((semester) => {
          let updatedSemester = [];

          if (semester === selectedSubject.semester) {
            flowchart[semester].map((subject) => {
              if (subject.id === selectedSubject.id) {
                updatedSemester.push(updatedSubject);
              } else {
                updatedSemester.push(subject);
              }
              return null;
            });
            updatedFlowchart[semester] = updatedSemester;
          } else {
            updatedFlowchart[semester] = flowchart[semester];
          }
          return null;
        });

        setSelectedSubject(updatedSubject);
        setFlowchart(updatedFlowchart);
        setCommentMessage('');
      }
    } catch (error) {
      alert('Ocorreu um erro, tente novamente!');
    }
  }

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
                  <p>Semestre {romanNumbers[selectedSubject.semester]}</p>
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
                {modalStep === 2 ? 'Programa da disciplina' : `Suas anotações`}
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
                  <p>Suas anotações</p>
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
                <form id="comment-form" onSubmit={handleComment}>
                  <input
                    type="text"
                    value={commentMessage}
                    onChange={(e) => setCommentMessage(e.target.value)}
                    placeholder="Anotação aqui..."
                  />
                  <button type="submit">
                    <FaPaperPlane />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de compartilhamento/privacidade */}
      {showPrivacyModal && (
        <div
          id="privacy-modal-container"
          onClick={() => setShowPrivacyModal(!showPrivacyModal)}
        >
          <div id="privacy-modal" onClick={(e) => e.stopPropagation()}>
            {modalLoading ? (
              <div id="loading-container">
                <Dots color="#7D83FF" size={32} />
              </div>
            ) : (
              <>
                <div>
                  <p> </p>
                  <IoMdClose
                    color="#aaabcb"
                    onClick={() => setShowPrivacyModal(!showPrivacyModal)}
                    id="close-modal-btn"
                  />
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                  <label htmlFor="is_public">Privacidade do Fluxograma</label>
                  <select
                    name="is_public"
                    onChange={(e) => {
                      setPrivacySettings({
                        ...privacySettings,
                        is_public: e.target.value === 'true',
                      });
                      setAreSettingsBeingUpdated(true);
                    }}
                    value={privacySettings.is_public}
                  >
                    <option value={true}>Público</option>
                    <option value={false}> Privado</option>
                  </select>

                  {privacySettings.is_public && (
                    <>
                      <div id="comments-privacy">
                        <input
                          type="checkbox"
                          id=""
                          name="has_public_comments"
                          onChange={(e) => {
                            setPrivacySettings({
                              ...privacySettings,
                              has_public_comments: e.target.checked,
                            });
                            setAreSettingsBeingUpdated(true);
                          }}
                          value={privacySettings.has_public_comments}
                          checked={privacySettings.has_public_comments}
                        />
                        <p>Tornar anotações públicas</p>
                      </div>
                      <button type="button" onClick={handleShareUrl}>
                        Compartilhar Link
                      </button>
                    </>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      )}
      <div id="page-header">
        <button onClick={handleLogout} title="Sair">
          <MdLogout color="white" id="logout-icon" />
        </button>
        <h1
          className="page-title"
          onClick={() => navigate('/student/flowchart')}
        >
          Fluxograma - {flowchartName}
        </h1>
        <button
          id="share-button"
          title="Compartilhar link do fluxograma"
          onClick={openPrivacyModal}
        >
          <MdShare color="white" />
        </button>
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
                <h2 className="semester-title">{romanNumbers[semester]}</h2>
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
