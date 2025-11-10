import { useState } from "react";
import { Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/auth.css"; // Use the new auth stylesheet

export default function Signup() {
    const navigate = useNavigate();
    const [hasError, setError] = useState(false);
    const [errorMessage, setMessage] = useState("");
    const [formData, setFormData] = useState({});
    const [isPasswordValid, setPasswordValidity] = useState(false);

    function validateSignupInput(data) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidName = data.name && data.name.length >= 3;
        const isValidEmail = data.email && emailRegex.test(data.email);
        return isValidName && isValidEmail && isPasswordValid && data.password === data["confirm-password"];
    }

    function validatePasswordInput(e) {
        const password = e.target.value.trim();
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        setPasswordValidity(strongPasswordRegex.test(password));
        handleChange(e);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    async function handleSignup(e) {
        e.preventDefault();
        setError(false);

        if (!validateSignupInput(formData)) {
            setError(true);
            setMessage("Please fill all details properly!");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/signup`, {
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
                    <h1>Create Your Account</h1>
                    <p>Join Campus Connect today!</p>
                </div>

                {hasError && <Alert severity="error" style={{ marginBottom: '1.5rem' }}>{errorMessage}</Alert>}

                <form onSubmit={handleSignup}>
                    <div className="input-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" name="name" id="name" onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" id="password" onChange={validatePasswordInput} />
                    </div>
                    {formData?.password?.length > 0 &&
                        <div className={`info-message ${isPasswordValid ? "valid" : "invalid"}`}>
                            {isPasswordValid ? "✓ Strong Password" : "Password must be 8+ characters with uppercase, lowercase, number & special character."}
                        </div>
                    }

                    <div className="input-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input type="password" name="confirm-password" id="confirm-password" onChange={handleChange} />
                    </div>
                    {formData["confirm-password"]?.length > 0 && formData.password !== formData["confirm-password"] &&
                        <div className="info-message invalid">
                            Passwords do not match.
                        </div>
                    }

                    <button className="btn">Sign Up</button>

                    <div className="auth-alt">
                        Already have an account? <a href="/login" className="btn-alt">Login</a>
                    </div>
                </form>
            </div>
        </div>
    );
}