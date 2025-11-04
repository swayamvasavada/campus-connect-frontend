import { useState } from "react";
import { Alert } from "@mui/material";
import "../../assets/styles/auth.css"; // Use the new auth stylesheet

export default function ResetPassword() {
    const [hasError, setError] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({});

    function validateEmail(data) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return data.email && emailRegex.test(data.email);
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    async function handleReset(e) {
        e.preventDefault();
        setError(false);
        setMessage("");

        if (!validateEmail(formData)) {
            setError(true);
            setMessage("Please enter a valid email!");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/request-reset`, {
                method: "POST",
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await res.json();
            if (result.hasError) {
                setError(true);
                setMessage(result.message);
            } else {
                setError(false);
                setMessage(result.message);
            }
        } catch (error) {
            setError(true);
            setMessage("Something went wrong!");
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Forgot Your Password?</h1>
                    <p>Enter your email and we'll send you a link to reset it.</p>
                </div>

                {message.length > 0 &&
                    <Alert severity={hasError ? "error" : "success"} style={{ marginBottom: '1.5rem' }}>
                        {message}
                    </Alert>
                }

                <form onSubmit={handleReset}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" onChange={handleChange} />
                    </div>
                    <button className="btn">Send Reset Link</button>
                </form>
            </div>
        </div>
    );
}