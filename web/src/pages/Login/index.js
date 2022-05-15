import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";
import PageBanner from "../../assets/login_page_banner.png";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [fieldFocus, setFieldFocus] = useState([false, false]);
    const [loginValidation, setLoginValidation] = useState(true);
    const navigate = useNavigate();

    const linkStyle = {
        color: '#7D83FF',
        fontWeight: 'bold',
        textDecoration: 'none'
    }

    function validateLogin(username, password){
        setLoginValidation(username==="student");
    }

    function handleSubmit(e) {
        e.preventDefault();

        localStorage.setItem("myFlowchart@auth", username.charAt(0).toUpperCase() + username.slice(1));

        if(username === "student"){
            navigate("/student/flowchart");
        }else if (username === "coordinator"){
            navigate("/coordinator/dashboard");
        }
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
                            onFocus={() => setFieldFocus([true, false])}
                            onBlur={() => setFieldFocus([false, false])}
                            className={fieldFocus[0]?"focused-field":""}
                            placeholder="Usuário"
                        />
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFieldFocus([false, true])}
                            onBlur={() => setFieldFocus([false, false])}
                            className={fieldFocus[1]?"focused-field":""}
                            placeholder="Senha"
                        />
                        <span>Esqueceu a senha?</span>
                        <button type="submit" onClick={()=>validateLogin(username, password)}>Entrar</button>
                        <span>Ainda não registrado? <Link to="/student/flowchart" style={linkStyle}>Criar conta</Link></span>
                        <div id={!loginValidation?"invalid-login-msg":"fade-out"}>
                            <p>Usuário ou senha inválidos.</p>
                        </div>
                    </form>
                </div>
                <div id="banner-container">
                    <h1>Bem-vindo ao <span>MyFlowchart</span></h1>
                    <img src={PageBanner}/>
                </div>
            </div>
        </div>
    );
}

export default Login;