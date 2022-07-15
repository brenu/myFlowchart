import {useState, useEffect} from 'react';

import './styles.css';
import {useNavigate, useParams} from 'react-router-dom';
import api from '../../../services/api';
import {deleteCredentials} from '../../../auth';

function FlowchartSelection() {
  const [flowcharts, setFlowcharts] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function handleInit() {
      try {
        const response = await api.get('/student-flowcharts/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'myFlowchart@token'
            )}`,
          },
        });

        if (response.status === 200) {
          setFlowcharts(response.data);
        }
      } catch (error) {
        alert('Houve um erro em nosso servidor, tente novamente mais tarde!');
        deleteCredentials();
        navigate('/');
      }
    }

    handleInit();
  }, []);

  function handleNavigation(id) {
    navigate(`/student/flowchart/${id}`);
  }

  return (
    <div class="flowchart-selection-page-container">
      <h1>Qual curso deseja visualizar?</h1>

      <div id="flowcharts-container">
        {flowcharts.map((flowchart) => (
          <>
            <button onClick={() => handleNavigation(flowchart.id)}>
              {flowchart.name}
            </button>
          </>
        ))}
      </div>
    </div>
  );
}

export default FlowchartSelection;
