import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import './styles.css';
import PageBanner from '../../assets/login_page_banner.png';
import {FaTimes} from 'react-icons/fa';

import api from '../../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [flowchartName, setFlowchartName] = useState('');
  const [loginValidation, setLoginValidation] = useState(true);
  const [step, setStep] = useState(1);
  const [flowcharts, setFlowcharts] = useState([]);
  const [selectedFlowcharts, setSelectedFlowcharts] = useState([]);
  const navigate = useNavigate();

  const linkStyle = {
    color: '#7D83FF',
    fontWeight: 'bold',
    textDecoration: 'none',
  };

  useEffect(() => {
    async function handleInit() {
      const response = await api.get('/flowcharts');

      if (response.status === 200) {
        setFlowcharts(response.data);
      }
    }

    handleInit();
  }, []);

  function updateSelectedFlowcharts(id) {
    if (!selectedFlowcharts.some((flowchart) => flowchart.id == id)) {
      const flowchart = flowcharts.filter((item) => item.id == id)[0];

      if (!flowchart) return;

      setSelectedFlowcharts([...selectedFlowcharts, flowchart]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
      return;
    }

    try {
      if (role === 'student') {
        const result = await api.post('/student', {
          username,
          password,
          recovery_email: recoveryEmail,
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
          recovery_email: recoveryEmail,
          flowchartName,
        });

        if (result.status === 201) {
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
      }
    } catch (error) {
      console.log(error.response);
    }
  }

  return (
    <div id="page-container">
      <div id="register-page-content">
        <div id="register-container">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <>
                <h2>Cadastro</h2>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuário"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                />
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="E-mail de recuperação (opcional)"
                />
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
                <button type="submit" onClick={handleSubmit}>
                  Continuar
                </button>
                <span>
                  Já registrado?{' '}
                  <Link to="/" style={linkStyle}>
                    Efetuar login
                  </Link>
                </span>
                <div id={!loginValidation ? 'invalid-login-msg' : 'fade-out'}>
                  <p>Usuário ou senha inválidos.</p>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                {role === 'student' ? (
                  <>
                    <h2>Escolha seus cursos</h2>
                    <select
                      onChange={(e) => updateSelectedFlowcharts(e.target.value)}
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
                  </>
                )}
                <button type="submit" onClick={handleSubmit}>
                  Cadastrar
                </button>
              </>
            )}
          </form>
        </div>
        <div id="banner-container">
          <h1>
            Bem-vindo ao <span>MyFlowchart</span>
          </h1>
          <img src={PageBanner} />
        </div>
      </div>
    </div>
  );
}

export default Register;
