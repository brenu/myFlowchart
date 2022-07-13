import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import './styles.css';
import api from '../../services/api';

import {Bounce} from 'react-activity';
import 'react-activity/dist/library.css';

import ErrorMessage from '../../components/ErrorMessage';
import Banner from '../../components/Banner';
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  const linkStyle = {
    color: '#7D83FF',
    fontWeight: 'bold',
    textDecoration: 'none',
  };

  async function handleSubmit(e) {
    if (loading) return;

    setLoading(true);
    e.preventDefault();

    try {
      const response = await api.post('/login', {
        username,
        password,
      });

      const role = response.data.role;

      localStorage.setItem('myFlowchart@token', response.data.token);
      localStorage.setItem('myFlowchart@role', role);

      if (role === 'student') {
        navigate('/student/flowchart');
      } else {
        navigate('/coordinator/dashboard');
      }
    } catch (error) {
      setShowError(true);
      console.log('In Login/HandlSubmit()', error.response);
    }

    setLoading(false);
  }

  useEffect(() => {
    setShowError(false);
  }, [username, password]);

  return (
    <div id="container">
      <div id="login-container">
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
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
          <Link to="/forgotPassword" id="forgot-password-btn">
            Esqueceu a senha?
          </Link>
          <button type="submit" disabled={!username || !password}>
            {loading ? <Bounce color="white" /> : 'Entrar'}
          </button>
          <span>
            Ainda não registrado?{' '}
            <Link to="/register" style={linkStyle}>
              Criar conta
            </Link>
          </span>
          {showError && <ErrorMessage message="Usuário ou senha inválidos." />}
        </form>
      </div>
      <Banner />
    </div>
  );
}

export default Login;
