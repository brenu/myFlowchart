import {FiAlertTriangle} from 'react-icons/fi';

import './styles.css';

export default function ErrorMessage(props) {
  return (
    <div id="error-container">
      <FiAlertTriangle color="var(--text-red)" />
      <p id="error-msg">
        {props.message
          ? props.message
          : 'Ocorreu algum problema. Por favor, tente novamente.'}
      </p>
    </div>
  );
}
