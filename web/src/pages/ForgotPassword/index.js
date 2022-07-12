import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import PageBanner from '../../assets/login_page_banner.png';
import {FiAlertTriangle} from 'react-icons/fi';
import {MdArrowBackIos} from 'react-icons/md';
import api from '../../services/api';

import './styles.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [showError, setShowError] = useState(false);
  const [viewNumber, setViewNumber] = useState(1);

  async function handlePasswordRecovery(e) {
    e.preventDefault();

    try {
      await api.post('/forgot', {username});
      setShowError(false);
      setViewNumber(2);
    } catch (e) {
      setShowError(true);
      console.log(e);
    }
  }

  return (
    <div id="page-container">
      <div id="forgot-page-content">
        <div id="forgot-container">
          {viewNumber === 1 ? (
            <>
              <div className="header">
                <h2>Esqueceu a senha?</h2>
                <p>
                  Não tem problema, te enviaremos as instruções para
                  recuperação.
                </p>
              </div>

              <form>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={255}
                  placeholder="Usuário"
                />
                <button
                  type="submit"
                  onClick={handlePasswordRecovery}
                  title="Recuperar senha"
                >
                  Recuperar senha
                </button>
              </form>
              {showError ? (
                <div id="error-container">
                  <FiAlertTriangle color="red" />
                  <p id="error-msg">
                    Ocorreu algum problema. Por favor, tente novamente.
                  </p>
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <>
              <div className="header">
                <h2>Confira seu email</h2>
                <p>
                  Se há algum cadastro desse usuário,
                  <br />
                  você receberá as instruções para redefinir sua senha.
                </p>
                <div id="back-btn" onClick={() => navigate('/')}>
                  <MdArrowBackIos color="#7D83FF" id="ico" />
                  <p>Voltar para Login</p>
                </div>
              </div>
            </>
          )}
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

export function ResetPassword() {
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);
  const [viewNumber, setViewNumber] = useState(1);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {token} = useParams();

  async function handlePasswordRecovery(e) {
    e.preventDefault();

    try {
      await api.put(`/reset/${token}`, {password});
      setShowError(false);
      setViewNumber(2);
    } catch (e) {
      setErrorMessage(e.response.data.message);
      setShowError(true);
      console.log(e);
    }
  }

  return (
    <div id="page-container">
      <div id="forgot-page-content">
        <div id="forgot-container">
          {viewNumber === 1 ? (
            <>
              <div className="header">
                <h2>Redefinir senha</h2>
                <p>Por favor, insira sua nova senha abaixo:</p>
              </div>

              <form>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={255}
                  placeholder="Nova senha"
                />
                <button
                  type="submit"
                  onClick={handlePasswordRecovery}
                  title="Alterar senha"
                >
                  Alterar senha
                </button>
              </form>
              {showError ? (
                <div id="error-container">
                  <FiAlertTriangle color="red" />
                  <p id="error-msg">{errorMessage}</p>
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <>
              <div className="header">
                <h2>
                  Senha alterada
                  <br />
                  com sucesso!
                </h2>
                <div id="back-btn" onClick={() => navigate('/')}>
                  <MdArrowBackIos color="#7D83FF" id="ico" />
                  <p>Ir para Login</p>
                </div>
              </div>
            </>
          )}
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
