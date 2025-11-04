import { useState } from "react";
import { Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/auth.css"; // Use the new auth stylesheet

export default function Login() {
    const navigate = useNavigate();
    const [hasError, setError] = useState(false);
    const [errorMessage, setMessage] = useState("");
    const [formData, setFormData] = useState({});

    function validateLoginInput(data) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = data.email && emailRegex.test(data.email);
        const isValidPassword = data.password && data.password.length >= 8;
        return isValidEmail && isValidPassword;
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    async function handleLogin(e) {
        e.preventDefault();
        setError(false);

        if (!validateLoginInput(formData)) {
            setError(true);
            setMessage("Please fill all details properly!");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/login`, {
                method: "POST",
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await res.json();
            if (result.hasError) {
                setError(true);
                setMessage(result.message);
                return;
            }

            localStorage.setItem("isAuth", true);
            localStorage.setItem("authToken", result.token);
            localStorage.setItem("user", JSON.stringify(result.user));
            navigate('/');
        } catch (error) {
            setError(true);
            setMessage("Something went wrong!");
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome Back!</h1>
                    <p>Log in to connect with your campus.</p>
                </div>

                {hasError && <Alert severity="error" style={{ marginBottom: '1.5rem' }}>{errorMessage}</Alert>}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" id="password" onChange={handleChange} />
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.9rem' }}>
                        <a className="btn-alt" href="/reset-password">Forgot Password?</a>
                    </div>

                    <button className="btn">Login</button>

                    <div className="auth-alt">
                        Don't have an account? <a href="/signup" className="btn-alt">Sign up</a>
                    </div>
                </form>
            </div>
        </div>
    );
}