import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";
import PageBanner from "../../assets/login_page_banner.png";
import api from "../../services/api";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginValidation, setLoginValidation] = useState(true);
    const navigate = useNavigate();

    const linkStyle = {
        color: '#7D83FF',
        fontWeight: 'bold',
        textDecoration: 'none'
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const response = await api.post("/login", {
            username,
            password
        });

        if (response.status === 200) {
            const role = response.data.role;

            localStorage.setItem("myFlowchart@token", response.data.token);
            localStorage.setItem("myFlowchart@role", role);

            if (role === "student") {
                navigate('/student/flowchart');
            } else {
                navigate('/coordinator/dashboard');
            }
        }
    }

    return (
        <div id="page-container">
            <div id="login-page-content">
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
                        <span>Esqueceu a senha?</span>
                        <button type="submit">Entrar</button>
                        <span>Ainda não registrado? <Link to="/register" style={linkStyle}>Criar conta</Link></span>
                        <div id={!loginValidation ? "invalid-login-msg" : "fade-out"}>
                            <p>Usuário ou senha inválidos.</p>
                        </div>
                    </form>
                </div>
                <div id="banner-container">
                    <h1>Bem-vindo ao <span>MyFlowchart</span></h1>
                    <img src={PageBanner} />
                </div>
            </div>
        </div>
    );
}

export default Login;