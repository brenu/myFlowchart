import {useEffect, useState} from 'react';

import api from '../../services/api';
import {deleteCredentials} from '../../auth';
import {useNavigate} from 'react-router-dom';

import {Dots} from 'react-activity';
import 'react-activity/dist/library.css';

//Icons
import {IoMdClose} from 'react-icons/io';
import {GoCloudUpload} from 'react-icons/go';
import {FaPlus} from 'react-icons/fa';
import {BsShareFill} from 'react-icons/bs';
import {MdLogout} from 'react-icons/md';
import {BiArrowBack, BiRightArrowAlt} from 'react-icons/bi';
import {RiDeleteBin2Line} from 'react-icons/ri';

//Styles
import './styles.css';
import './modal.css';

import {ReactComponent as Updated} from '../../assets/updated.svg';
import {ReactComponent as Created} from '../../assets/created.svg';
import {ReactComponent as Deleted} from '../../assets/deleted.svg';

function min(a, b) {
  if (a < b) return a;
  return b;
}

function removeInvalidCharacters(str) {
  let cleanStr = '';

  let validChars = 'áàâãéêèíîìóôõúùç';

  for (let i = 0; i < str.length; ++i) {
    if (
      (str[i] >= 'a' && str[i] <= 'z') ||
      (str[i] >= 'A' && str[i] <= 'Z') ||
      validChars.includes(str[i]) ||
      validChars.toUpperCase().includes(str[i]) ||
      str[i] === ' '
    ) {
      cleanStr += str[i];
    }
  }

  return cleanStr;
}

function CoordinatorDashboard() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [flowchartId, setFlowchartId] = useState(0);
  const [flowchartName, setFlowchartName] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState(3);

  const [isCreateOperation, setIsCreateOperation] = useState(false);
  const [loading, setLoading] = useState(false);

  const [subjectData, setSubjectData] = useState({
    name: '',
    code: '',
    summary: '',
    semester: -1,
    theoretical_load: -1,
    practical_load: -1,
    professor: '',
    objective: '',
    methodology: '',
    assessment: '',
    prerequisites: [],
  });

  async function fetchSubjectsData() {
    try {
      const response = await api.get('/coordinator/subject', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('myFlowchart@token')}`,
        },
      });

      console.log(response.data.subjects);
      if (response.status === 200) {
        setSubjects(response.data.subjects);
        setFlowchartId(response.data.flowchart_id);
        setFlowchartName(response.data.flowchart_name);
      }
    } catch (error) {
      alert('Houve um erro em nosso servidor, tente novamente mais tarde!');
      deleteCredentials();
      navigate('/');
    }
  }

  useEffect(() => {
    fetchSubjectsData();
  }, []);

  useEffect(() => {
    console.log('UPDATE');
    console.log(subjects);
  }, [subjects]);

  async function handleCreation() {
    setLoading(true);
    console.log(subjectData);

    try {
      const response = await api.post('/coordinator/subject', subjectData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('myFlowchart@token')}`,
        },
      });

      if (response.status === 201) {
        setModalStep(4);
        fetchSubjectsData();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message);
      }
    }
    setLoading(false);
  }

  async function handleEditing() {
    setLoading(true);
    console.log(subjectData);
    try {
      const response = await api.put(
        `/coordinator/subject/${subjectData.id}`,
        subjectData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'myFlowchart@token'
            )}`,
          },
        }
      );

      if (response.status === 200) {
        setModalStep(4);
        fetchSubjectsData();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message);
      }
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    try {
      const response = await api.delete(
        `/coordinator/subject/${subjectData.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'myFlowchart@token'
            )}`,
          },
        }
      );

      if (response.status === 204) {
        setModalStep(5);
        fetchSubjectsData();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message);
      }
    }
    setLoading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (isCreateOperation) {
      handleCreation();
    } else {
      handleEditing();
    }
  }

  function handleSubjectEditing(subject) {
    setSubjectData(subject);
    setShowModal(true);
  }

  function handleShowSubjects(semesterIndex) {
    const newSubjects = {...subjects};
    newSubjects[semesterIndex].show = !newSubjects[semesterIndex].show;

    setSubjects(newSubjects);
  }

  function handleNewPrerequisites(e, subjectCode) {
    for (let subject of prerequisites) {
      if (subject === subjectCode) {
        setPrerequisites(prerequisites.filter((item) => item !== subjectCode));
        return;
      }
    }

    setPrerequisites([...prerequisites, subjectCode]);
  }

  function handleShareUrl() {
    navigator.clipboard
      .writeText(`${window.origin}/register?flowchart=${flowchartId}`)
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

  useEffect(() => {
    setErrorMessage('');
  }, [modalStep, showModal, subjectData]);

  const [prerequisites, setPrerequisites] = useState([]);

  function clearSubjectForm() {
    setModalStep(1);
    setIsCreateOperation(false);
    setSubjectData({
      name: '',
      code: '',
      summary: '',
      semester: '',
      theoretical_load: '',
      practical_load: '',
      professor: '',
      objective: '',
      methodology: '',
      assessment: '',
      prerequisites: [],
    });
  }

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!showModal) clearSubjectForm();
  }, [showModal]);

  return (
    <div id="page-container">
      {/* Modal da disciplina */}
      {showModal && (
        <div
          id="subject-form-modal-background"
          onClick={() =>
            setShowModal(!window.confirm('Deseja fechar o formulário?'))
          }
        >
          <div id="subject-form-modal" onClick={(e) => e.stopPropagation()}>
            <div id="subject-form-header">
              <BiArrowBack
                color="#aaabcb"
                onClick={() => setModalStep(1)}
                className={
                  'close-modal-btn ' +
                  (modalStep === 1 || modalStep >= 4 ? 'invisible' : '')
                }
              />

              <div>
                <p>
                  {isCreateOperation
                    ? 'Nova disciplina'
                    : 'Atualizar disciplina'}
                </p>
                <div
                  className={
                    'progress-element ' + (modalStep === 4 ? 'invisible' : '')
                  }
                >
                  <div className={'filled f' + modalStep}></div>
                </div>
              </div>

              <IoMdClose
                color="#aaabcb"
                onClick={() =>
                  setShowModal(!window.confirm('Deseja fechar o formulário?'))
                }
                className="close-modal-btn"
              />
            </div>

            <div>
              {/* Página 1: Informações Básicas da Disciplina */}
              {modalStep === 1 && (
                <>
                  <div id="subject-form-info">
                    <div>
                      <p id="field-title">Nome *</p>
                      <input
                        type="text"
                        placeholder="e.g. 'Inteligência Artificial'"
                        autoCapitalize="words"
                        value={subjectData.name}
                        maxLength={55}
                        onChange={(e) => {
                          setSubjectData((subjectData) => ({
                            ...subjectData,
                            name: removeInvalidCharacters(e.target.value),
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <p id="field-title">Código</p>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. 'CET-098'"
                        value={subjectData.code}
                        onChange={(e) => {
                          setSubjectData((subjectData) => ({
                            ...subjectData,
                            code: e.target.value.toUpperCase(),
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <p id="field-title">Semestre</p>

                      <input
                        type="number"
                        max="200"
                        min="0"
                        required
                        value={subjectData.semester}
                        onChange={(e) => {
                          setSubjectData((subjectData) => ({
                            ...subjectData,
                            semester: min(15, e.target.value),
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <p id="field-title">Carga horária</p>
                      <hr />
                    </div>

                    <div>
                      <p id="field-title">Teórica</p>
                      <input
                        type="number"
                        max="200"
                        min="0"
                        required
                        value={subjectData.theoretical_load}
                        onChange={(e) => {
                          setSubjectData((subjectData) => ({
                            ...subjectData,
                            theoretical_load: min(e.target.value, 100),
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <p id="field-title">Prática</p>

                      <input
                        type="number"
                        max="200"
                        min="0"
                        required
                        value={subjectData.practical_load}
                        onChange={(e) => {
                          setSubjectData((subjectData) => ({
                            ...subjectData,
                            practical_load: min(e.target.value, 100),
                          }));
                        }}
                      />
                    </div>

                    <div>
                      <p id="field-title">Professor</p>
                      <input
                        type={'text'}
                        placeholder="Nome do professor (opcional)"
                        value={subjectData.professor}
                        maxLength={50}
                        onChange={(e) => {
                          setSubjectData((subjectData) => ({
                            ...subjectData,
                            professor: removeInvalidCharacters(e.target.value),
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setModalStep(2);
                    }}
                    type="submit"
                    disabled={
                      !(
                        subjectData.name &&
                        subjectData.code &&
                        subjectData.theoretical_load &&
                        subjectData.practical_load &&
                        subjectData.semester
                      )
                    }
                    id="next-btn"
                  >
                    <p>Próximo</p>
                    <BiRightArrowAlt color="white" />
                  </button>
                  {!isCreateOperation && (
                    <>
                      <button
                        onClick={() => {
                          window.confirm(
                            'Tem certeza que deseja\n excluir a disciplina?'
                          ) && handleDelete();
                        }}
                        id="delete-btn"
                      >
                        {loading ? (
                          <Dots color="var(--text-red)" />
                        ) : (
                          <>
                            <p>Excluir disciplina</p>
                            <RiDeleteBin2Line color="var(--text-red)" />
                          </>
                        )}
                      </button>
                      <p id="fail">{errorMessage}</p>
                    </>
                  )}
                </>
              )}
              {/* Página 2: Programa da disciplina*/}
              {modalStep === 2 && (
                <>
                  <div id="subject-form-program">
                    <p id="field-title">Ementa *</p>
                    <textarea
                      type="text"
                      value={subjectData.summary}
                      placeholder="e.g. 'Visão Geral de Inteligência Artificial. Espaço de Problemas. Buscas Cega e Heurística...'"
                      onChange={(e) => {
                        setSubjectData((subjectData) => ({
                          ...subjectData,
                          summary: e.target.value,
                        }));
                      }}
                    />
                    <p id="field-title">Objetivos *</p>
                    <textarea
                      type="text"
                      placeholder="e.g. 'Aulas expositivas, seminários ministrados pelos alunos e listas de exercíci...'"
                      value={subjectData.objective}
                      onChange={(e) => {
                        setSubjectData((subjectData) => ({
                          ...subjectData,
                          objective: e.target.value,
                        }));
                      }}
                    />
                    <p id="field-title">Metodologia *</p>
                    <textarea
                      type="text"
                      placeholder="e.g. 'Apresentação dos fundamentos, métodos e aplicações de Inteligência Artificial, b...'"
                      value={subjectData.methodology}
                      onChange={(e) => {
                        setSubjectData((subjectData) => ({
                          ...subjectData,
                          methodology: e.target.value,
                        }));
                      }}
                    />
                    <p id="field-title">Avaliação *</p>
                    <textarea
                      type="text"
                      placeholder="e.g. 'Duas provas escritas (dois créditos). Um seminário (um crédito). Listas de exercício (um crédito)...'"
                      value={subjectData.assessment}
                      onChange={(e) => {
                        setSubjectData((subjectData) => ({
                          ...subjectData,
                          assessment: e.target.value,
                        }));
                      }}
                    />
                    <button
                      onClick={() => {
                        setModalStep(3);
                      }}
                      type="submit"
                      disabled={
                        !(
                          subjectData.summary &&
                          subjectData.objective &&
                          subjectData.methodology &&
                          subjectData.assessment
                        )
                      }
                      id="next-btn"
                    >
                      <p>Próximo</p>
                      <BiRightArrowAlt color="white" />
                    </button>
                  </div>
                </>
              )}

              {/* Página 3: Programa da disciplina*/}
              {modalStep === 3 && (
                <>
                  <div id="subject-form-prerequisites">
                    <p id="field-title">Pré-requisitos</p>

                    {Object.keys(subjects).map((formSemester) => {
                      if (formSemester < subjectData.semester) {
                        return (
                          <div
                            key={formSemester}
                            className="prerequisites-container"
                          >
                            <div
                              className="semester-button"
                              onClick={() => handleShowSubjects(formSemester)}
                            >
                              <span>{formSemester}º Semestre</span>
                            </div>
                            {subjects[formSemester].show && (
                              <div className="semester-subjects">
                                {subjects[formSemester].map(
                                  (subject, subjectIndex) => (
                                    <div
                                      key={subject.code}
                                      className="subject-radio-container"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={prerequisites.includes(
                                          subject.code
                                        )}
                                        id={subject.code}
                                        name={subject.code}
                                        onChange={(e) =>
                                          handleNewPrerequisites(
                                            e,
                                            subject.code
                                          )
                                        }
                                      />
                                      <p>
                                        {subject.code} - {subject.name}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        );
                      } else return <></>;
                    })}
                    <button onClick={handleSubmit} type="submit" id="next-btn">
                      {loading ? (
                        <Dots />
                      ) : (
                        <>
                          <p>
                            {isCreateOperation
                              ? 'Adicinar disciplina'
                              : 'Salvar alterações'}
                          </p>
                          <GoCloudUpload color="white" />
                        </>
                      )}
                    </button>
                    <p id="fail">{errorMessage}</p>
                  </div>
                </>
              )}

              {/* Página 4: Success*/}
              {modalStep === 4 && (
                <>
                  <div id="subject-form-success">
                    {isCreateOperation ? (
                      <Created width="200" height="200" />
                    ) : (
                      <Updated width="200" height="200" />
                    )}
                    <p>
                      {isCreateOperation
                        ? 'Disciplina adicionada\ncom sucesso.'
                        : 'Suas alterações foram salvas.'}
                    </p>

                    <button onClick={() => setShowModal(false)} id="next-btn">
                      <p>Sair</p>
                    </button>
                  </div>
                </>
              )}

              {/* Página 4: Success*/}
              {modalStep === 5 && (
                <>
                  <div id="subject-form-success">
                    <Deleted width="200" height="200" />
                    <p>A disciplina foi removida</p>

                    <button onClick={() => setShowModal(false)} id="next-btn">
                      <p>Sair</p>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <div id="admin-dashboard-content">
        <div id="page-header">
          <button onClick={handleLogout} className="header-btn">
            <MdLogout id="logout-icon" />
            <p>Logout</p>
          </button>
          <div>
            <h1>{flowchartName}</h1>
            <p>Painel de gerenciamento</p>
          </div>
          <button onClick={handleShareUrl} className="header-btn">
            <p>Logout</p>
            <BsShareFill color="var(--bg-secondary)" />
          </button>
        </div>

        <div id="page-body">
          <div>
            <div id="mob-logout-btn">
              <button onClick={handleLogout} className="header-btn">
                <MdLogout id="logout-icon" />
                <p>Logout</p>
              </button>
            </div>
            <button onClick={handleShareUrl}>
              <BsShareFill />
              <p>Compartilhar fluxograma</p>
            </button>
            <button
              onClick={() => {
                setShowModal(true);
                setIsCreateOperation(true);
              }}
            >
              <FaPlus /> <p>Adicionar disciplina</p>
            </button>
          </div>

          {Object.keys(subjects).map((semester) => (
            <div className="semester-container" key={semester}>
              <h2>{semester}º Semestre</h2>
              <div className="subjects-container">
                {subjects[semester].map((subject, subjectIndex) => (
                  <div
                    className="subject-container"
                    onClick={() => handleSubjectEditing(subject)}
                    key={subjectIndex}
                  >
                    <span>{subject.code}</span>
                    <span id="subject-code">{subject.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CoordinatorDashboard;
