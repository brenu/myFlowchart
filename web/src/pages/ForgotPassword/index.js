import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MdArrowBackIos} from 'react-icons/md';
import api from '../../services/api';

import Banner from '../../components/Banner';

import {Bounce} from 'react-activity';
import 'react-activity/dist/library.css';

import ErrorMessage from '../../components/ErrorMessage';

import './styles.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [showError, setShowError] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handlePasswordRecovery(e) {
    setLoading(true);
    e.preventDefault();

    try {
      await api.post('/forgot', {username});
      setShowError(false);
      setStep(2);
    } catch (e) {
      setShowError(true);
      console.log(e);
    }

    setLoading(false);
  }

  useEffect(() => {
    setShowError(false);
  }, [username]);

  return (
    <div id="container">
      <div id="forgot-container">
        {step === 1 ? (
          <form>
            <div className="header">
              <h1>Esqueceu a senha?</h1>
              <p>
                Não tem problema, te enviaremos as instruções para recuperação.
              </p>
            </div>
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
              disabled={!username}
            >
              {loading ? <Bounce /> : 'Recuperar senha'}
            </button>
            {showError && <ErrorMessage />}
          </form>
        ) : (
          <>
            <div className="header">
              <h1>Confira seu email</h1>
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
      <Banner />
    </div>
  );
}
