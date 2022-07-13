import {useState, useEffect} from 'react';
import {SteppedLineTo} from 'react-lineto';
import {MdLogout, MdShare} from 'react-icons/md';
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
import api from '../../../services/api';
import {deleteCredentials} from '../../../auth';

import {Windmill} from 'react-activity';
import 'react-activity/dist/library.css';

import './styles.css';
import './modal.css';

function Flowchart() {
  const [flowchart, setFlowchart] = useState([]);
  const [prerequisitesPath, setPrerequisitesPath] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState({});
  const [subjectTimeout, setSubjectTimeout] = useState(null);
  const {id} = useParams();
  const navigate = useNavigate();
  const [hasArchivedSubjects, setHasArchivedSubjects] = useState(true);

  const [studentId, setStudentId] = useState(0);
  const [flowchartName, setFlowchartName] = useState('');

  const [loading, setLoading] = useState(false);

  const colors = [
    '#F55',
    '#4bb',
    '#4bb543',
    '#800080',
    '#ff7700',
    '#FFF',
    '#FF6',
    '#777',
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
      }

      setLoading(false);
    }

    handleInit();
  }, []);

  useEffect(() => {
    if (!loading) {
      document
        .getElementById('loading-modal-container')
        .classList.toggle('hide');

      setTimeout(
        () => document.getElementById('loading-modal-container').remove(),
        1000
      );
    }
  }, [loading]);

  useEffect(() => {
    console.log(selectedSubject);
  }, [selectedSubject]);

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
    let done = true;

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

  function handleSubjectClicks(e, subject, semester, subjectIndex) {
    if (e.detail === 1) {
      setSubjectTimeout(
        setTimeout(() => {
          setSelectedSubject(subject);
          setShowModal((showModal) => !showModal);
          window.scrollTo(0, 0);
        }, 350)
      );
    } else if (e.detail === 2) {
      clearTimeout(subjectTimeout);
      updateSubjectsState(semester, subjectIndex);
    }
  }

  useEffect(() => {
    if (!showModal) setModalStep(3);
  }, [showModal]);

  const [modalStep, setModalStep] = useState(3);
  const [visibleInput, setVisibleInput] = useState(false);

  const Comment = (props) => {
    return (
      <div id="comment-container">
        <p>{props.text}</p>
        <p>{props.date_time}</p>
      </div>
    );
  };

  const SubjectModalContainer = () => {
    return (
      <div
        id="subject-modal-background"
        onClick={() => setShowModal(!showModal)}
      >
        <div id="subject-modal" onClick={(e) => e.stopPropagation()}>
          <div>
            {modalStep === 1 ? (
              <div id="modal-left-btn">
                <p>IV Semestre</p>
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
          <p>Inteligência Artificial</p>
          {modalStep > 1 && (
            <p>
              {modalStep === 2
                ? 'Programa da disciplina'
                : 'Suas anotações / Anotações de username'}
            </p>
          )}

          {/* Página 1: Informações Básicas da Disciplina */}
          {modalStep === 1 && (
            <>
              <div id="subject-info">
                <div>
                  <p>Código</p>
                  <p>Status</p>
                  <p>Professor</p>
                  <p>Tags</p>
                  <p>Carga Horária</p>
                </div>
                <div>
                  <p>CET094</p>
                  <div>
                    <div /> <p>Cursando</p>
                  </div>
                  <p>Clemildo Gonçalvos / Não informado</p>
                  <div>
                    <p>Tags here</p>
                  </div>
                  <p>Teórica: 60h / Prática: 15h</p>
                </div>
              </div>
              <hr />
              <div onClick={() => setModalStep(2)} className="btn">
                <BiBookContent size={20} color="#7d83ff" />
                <p>Programa da disciplina</p>
              </div>
              <div onClick={() => setModalStep(3)} className="btn">
                <BiNote size={20} color="#7d83ff" />
                <p>Suas anotações / Anotações de username</p>
              </div>
            </>
          )}
          {/* Página 2: Programa da Disciplina */}
          {modalStep === 2 && (
            <>
              <div id="subject-program">
                <>
                  <div>
                    <BiMenu color="#7D83FF" size={15} />
                    <p>Ementa</p>
                  </div>
                  <p>
                    Conceitos básicos de algoritmos. Construção de algoritmos:
                    estrutura de um programa, tipos de dados escalares e
                    estruturados , estruturas de controle. Prática em construção
                    de algoritmos: transcrição para uma linguagem de
                    programação, depuração e documentação.
                  </p>
                </>
                <hr />
                <>
                  <div>
                    <GiConvergenceTarget color="#7D83FF" size={15} />
                    <p>Objetivos</p>
                  </div>
                  <p>
                    Desenvolver o raciocínio lógico e a capacidade de abstração
                    de maneira intuitiva, tornando o aluno apto a propor
                    soluções algorítmicas.
                  </p>
                </>
                <hr />
                <>
                  <div>
                    <BiCube color="#7D83FF" size={15} />
                    <p>Metodologia</p>
                  </div>
                  <p>
                    Aulas teóricas e práticas, iniciando com portugol e
                    introduzindo paralelamente uma linguagem de programação.
                  </p>
                </>
                <hr />
                <>
                  <div>
                    <BiStar color="#7D83FF" size={17} />
                    <p>Avaliação</p>
                  </div>
                  <p>Avaliação escrita e trabalho computacional.</p>
                </>
              </div>
            </>
          )}
          {/* Página 3: Anotações do usuário */}
          {modalStep === 3 && (
            <>
              <div id="subject-comments">
                {[...Array(10)].map((e, i) => (
                  <div className="subject-comment" key={i}>
                    <p>12 de novembro, às 14:35</p>
                    <p>
                      Neque porro quisquam est qui dolorem ipsum quia dolor sit
                      amet, consectetur, adipisci velit...
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      id={'page-container' + (loading ? '-loading' : '')}
      class="flowchart-page-container"
    >
      <div id="loading-modal-container">
        <Windmill color="white" size={40} />
      </div>
      {showModal && <SubjectModalContainer />}
      <div id="page-header">
        <p></p>
        <button onClick={handleLogout} title="Sair">
          <MdLogout color="white" id="logout-icon" />
        </button>
        <h1 className="page-title">Fluxograma - {flowchartName}</h1>
        <button
          id="share-button"
          title="Compartilhar link do fluxograma"
          onClick={handleShareUrl}
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
                        onMouseEnter={() =>
                          updatePrerequisitesPath(semester, subjectIndex)
                        }
                        onMouseLeave={() => setPrerequisitesPath([])}
                        onBlur={() => setPrerequisitesPath([])}
                        onClick={(e) =>
                          handleSubjectClicks(
                            e,
                            subject,
                            semester,
                            subjectIndex
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
                        onMouseEnter={() =>
                          updatePrerequisitesPath(semester, subjectIndex)
                        }
                        onMouseLeave={() => setPrerequisitesPath([])}
                        onBlur={() => setPrerequisitesPath([])}
                        onClick={(e) =>
                          handleSubjectClicks(
                            e,
                            subject,
                            semester,
                            subjectIndex
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

export default Flowchart;
