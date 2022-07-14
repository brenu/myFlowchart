import PageBanner from '../../assets/login_page_banner.png';

import './styles.css';

export default function Banner() {
  return (
    <div id="banner-container">
      <h1>
        Bem-vindo ao <span>MyFlowchart</span>
      </h1>
      <img src={PageBanner} alt="Banner da tela inicial" />
    </div>
  );
}
