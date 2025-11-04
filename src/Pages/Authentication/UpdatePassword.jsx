import { useState } from "react";
import { Alert } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/styles/auth.css"; // Use the new auth stylesheet

export default function UpdatePassword() {
    const { RESET_TOKEN } = useParams();
    const navigate = useNavigate();
    const [hasError, setError] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({});

    function validatePassword(data) {
        return data.password && data.password.length >= 8 && data.password === data['confirm-password'];
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    async function handleReset(e) {
        e.preventDefault();
        setError(false);
        setMessage("");

        if (!validatePassword(formData)) {
            setError(true);
            setMessage("Please enter a valid password and ensure it matches the confirmation.");
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/auth/reset-password/${RESET_TOKEN}`, {
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
                setTimeout(() => navigate('/login'), 3000);
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
                    <h1>Set a New Password</h1>
                    <p>Enter and confirm your new password below.</p>
                </div>

                {message.length > 0 &&
                    <Alert severity={hasError ? "error" : "success"} style={{ marginBottom: '1.5rem' }}>
                        {message}
                    </Alert>
                }

                <form onSubmit={handleReset}>
                    <div className="input-group">
                        <label htmlFor="password">New Password</label>
                        <input type="password" name="password" id="password" onChange={handleChange} />
                    </div>

                    <div className="input-group">
                        <label htmlFor="confirm-password">Confirm New Password</label>
                        <input type="password" name="confirm-password" id="confirm-password" onChange={handleChange} />
                    </div>
                    {formData["confirm-password"]?.length > 0 && formData.password !== formData["confirm-password"] &&
                        <div className="info-message invalid">
                            Passwords do not match.
                        </div>
                    }
                    <button className="btn">Update Password</button>
                </form>
            </div>
        </div>
    );
}