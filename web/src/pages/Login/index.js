import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";

import PageBanner from "../../assets/login_page_banner.png";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();

        navigate("/student/flowchart");
    }

    return (
        <div id="page-container">
            <div id="login-page-content">
                <div id="login-container">
                    <form onSubmit={handleSubmit}>
                        <h2>Login</h2>
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec dolor risus. </p>
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
                        <span>Esqueceu a senha?</span>
                        <button type="submit">Entrar</button>
                        <span>Ainda não registrado? <Link to="/student/flowchart">Criar conta</Link></span>
                    </form>
                </div>
                <div id="banner-container">
                    <h1>Bem-vindo ao <span>MyFlowchart</span></h1>
                    <img src={PageBanner} alt="" srcset=""/>
                </div>
            </div>
        </div>
    );
}

export default Login;