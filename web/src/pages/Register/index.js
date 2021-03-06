import {useEffect, useState} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import './styles.css';
import {FaTimes} from 'react-icons/fa';
import {VscError} from 'react-icons/vsc';

import {Bounce} from 'react-activity';
import 'react-activity/dist/library.css';

import ErrorMessage from '../../components/ErrorMessage';

import api from '../../services/api';
import Banner from '../../components/Banner';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [recovery_email, setRecovery_email] = useState('');
  let [searchParams] = useSearchParams();
  const flowchartId = searchParams.get('flowchart');

  const [role, setRole] = useState('student');
  const [flowchartName, setFlowchartName] = useState('');
  const [step, setStep] = useState(1);
  const [flowcharts, setFlowcharts] = useState([]);
  const [selectedFlowcharts, setSelectedFlowcharts] = useState([]);

  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const linkStyle = {
    color: '#7D83FF',
    fontWeight: 'bold',
    textDecoration: 'none',
  };

  useEffect(() => {
    async function handleInit() {
      try {
        const response = await api.get('/flowcharts');

        if (response.status === 200) {
          setFlowcharts(response.data);

          for (let flowchart of response.data) {
            if (flowchart.id === parseInt(flowchartId)) {
              setSelectedFlowcharts([flowchart]);
              break;
            }
          }
        }
      } catch (error) {
        navigate('/');
      }
    }

    handleInit();
  }, []);

  useEffect(() => {
    setUsernameError('');
  }, [username]);

  useEffect(() => {
    setPasswordError('');
  }, [password]);

  useEffect(() => {
    setEmailError('');
  }, [recovery_email]);

  async function validateForm() {
    setLoading(true);
    try {
      await api.post('/form-validation', {username, password, recovery_email});
      setStep(2);
    } catch (error) {
      let fieldName = error.response.data.message.split('~')[0];

      console.log(fieldName);
      if (fieldName) {
        let message = error.response.data.message.split('~')[1];
        switch (fieldName) {
          case 'username':
            setUsernameError(message);
            break;
          case 'password':
            setPasswordError(message);
            break;
          case 'email':
            setEmailError(message);
            break;
          default:
            break;
        }
      } else {
        setShowError(true);
      }

      console.log(error);
    }

    setLoading(false);
  }

  function updateSelectedFlowcharts(id) {
    if (!selectedFlowcharts.some((flowchart) => flowchart.id == id)) {
      const flowchart = flowcharts.filter((item) => item.id == id)[0];

      if (!flowchart) return;

      setSelectedFlowcharts([...selectedFlowcharts, flowchart]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (step === 1) return;
    setLoading(true);

    try {
      if (role === 'student') {
        const result = await api.post('/student', {
          username,
          password,
          recovery_email: recovery_email,
          flowchart_ids: selectedFlowcharts.map((item) => item.id),
        });

        if (result.status === 201) {
          const loginResult = await api.post('/login', {
            username,
            password,
          });

          if (loginResult.status === 200) {
            localStorage.setItem('myFlowchart@token', loginResult.data.token);
            localStorage.setItem('myFlowchart@role', loginResult.data.role);

            navigate('/student/flowchart');
            return;
          }
        }
      } else {
        const result = await api.post('/coordinator', {
          username,
          password,
          recovery_email: recovery_email,
          flowchartName,
        });

        if (result.status === 201) {
          const loginResult = await api.post('/login', {
            username,
            password,
          });

          if (loginResult.status === 200) {
            localStorage.setItem('myFlowchart@token', loginResult.data.token);
            localStorage.setItem('myFlowchart@role', loginResult.data.role);

            navigate('/coordinator/dashboard');
            return;
          }
        }
      }
    } catch (error) {
      console.log(error.response);
      setShowError(true);
    }

    setLoading(false);
  }

  return (
    <div id="container">
      <div id="register-container">
        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <h1>Cadastro</h1>
              <div className="form-field-container">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usu??rio"
                />

                {usernameError && (
                  <div>
                    <VscError color="var(--text-red)" />
                    <p id="error-msg">{usernameError}</p>
                  </div>
                )}
              </div>

              <div className="form-field-container">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                />
                {passwordError && (
                  <div>
                    <VscError color="var(--text-red)" />
                    <p id="error-msg">{passwordError}</p>
                  </div>
                )}
              </div>
              <div className="form-field-container">
                <input
                  type="email"
                  value={recovery_email}
                  onChange={(e) => setRecovery_email(e.target.value)}
                  placeholder="E-mail de recupera????o"
                />
                {emailError && (
                  <div>
                    <VscError color="var(--text-red)" />
                    <p id="error-msg">{emailError}</p>
                  </div>
                )}
              </div>

              <label htmlFor="role">Sou um...</label>
              <div id="options-container">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={role === 'student' ? 'selected' : ''}
                >
                  Estudante
                </button>
                <button
                  type="button"
                  onClick={() => setRole('coordinator')}
                  className={role === 'coordinator' ? 'selected' : ''}
                >
                  Coordenador
                </button>
              </div>
              <button
                type="submit"
                onClick={validateForm}
                disabled={
                  !username ||
                  !password ||
                  !recovery_email ||
                  usernameError ||
                  passwordError ||
                  emailError
                }
              >
                {loading ? <Bounce /> : 'Continuar'}
              </button>
              <span>
                J?? registrado?{' '}
                <Link to="/" style={linkStyle}>
                  Efetuar login
                </Link>
              </span>
              {showError && <ErrorMessage />}
            </>
          )}
          {step === 2 && (
            <>
              {role === 'student' ? (
                <>
                  <h2>Escolha seus cursos</h2>
                  <select
                    onChange={(e) => {
                      updateSelectedFlowcharts(e.target.value);
                      console.log(e.target.value);
                    }}
                  >
                    <option value="">Selecione aqui</option>
                    {flowcharts
                      .filter((item) => !selectedFlowcharts.includes(item))
                      .map((flowchart) => (
                        <option value={flowchart.id}>{flowchart.name}</option>
                      ))}
                  </select>
                  <div style={{overflow: 'hidden'}}>
                    {selectedFlowcharts.map((selectedFlowchart) => (
                      <div className="student-subject-container">
                        <span>{selectedFlowchart.name}</span>
                        <button type="button">
                          <FaTimes
                            color="#FFF"
                            size={16}
                            onClick={() =>
                              setSelectedFlowcharts(
                                selectedFlowcharts.filter(
                                  (item) => item.id != selectedFlowchart.id
                                )
                              )
                            }
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={selectedFlowcharts.length === 0}
                  >
                    {loading ? <Bounce /> : 'Cadastrar'}
                  </button>
                </>
              ) : (
                <>
                  <h2>Nomeie seu curso</h2>
                  <input
                    type="text"
                    value={flowchartName}
                    onChange={(e) => setFlowchartName(e.target.value)}
                    placeholder="Informe o nome do seu curso"
                  />
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={!flowchartName}
                  >
                    {loading ? <Bounce /> : 'Cadastrar'}
                  </button>
                </>
              )}
              {showError && <ErrorMessage />}
            </>
          )}
        </form>
      </div>
      <Banner />
    </div>
  );
}
