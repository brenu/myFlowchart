import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {MdArrowBackIos} from 'react-icons/md';
import api from '../../services/api';

import Banner from '../../components/Banner';

import {Bounce} from 'react-activity';
import 'react-activity/dist/library.css';

import ErrorMessage from '../../components/ErrorMessage';

import './styles.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const {token} = useParams();

  async function handlePasswordRecovery(e) {
    setLoading(true);
    e.preventDefault();

    try {
      await api.put(`/reset/${token}`, {password});
      setShowError(false);
      setStep(2);
    } catch (e) {
      setErrorMessage(e.response.data.message);
      setShowError(true);
      console.log(e);
    }
    setLoading(false);
  }

  useEffect(() => {
    setShowError(false);
  }, [password]);

  return (
    <div id="container">
      <div id="forgot-container">
        {step === 1 ? (
          <form>
            <div className="header">
              <h2>Redefinir senha</h2>
              <p>Defina sua nova senha!</p>
            </div>
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
              disabled={!password}
            >
              {loading ? <Bounce /> : 'Alterar senha'}
            </button>
            {showError && <ErrorMessage message={errorMessage} />}
          </form>
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
      <Banner />
    </div>
  );
}
