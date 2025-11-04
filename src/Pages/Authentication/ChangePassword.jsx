import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from "@mui/material";
import "../../assets/styles/auth.css";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [hasError, setError] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({});

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(false);
        setMessage("");

        if (formData.password !== formData.confirmPassword) {
            setError(true);
            setMessage("New password and confirmation do not match.");
            return;
        }

        // You would add your API call here to change the password
        console.log("Changing password with data:", formData);

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/update-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(formData)
            });

            const result = await res.json();
            
            setError(result.hasError);
            setMessage(result.message);
            if (!result.hasError) setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            setError(true);
            setMessage("Something went wrong!");
        }
    }

    return (
        <div className="form-page-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Change Your Password</h1>
                </div>

                {message &&
                    <Alert severity={hasError ? "error" : "success"} style={{ marginBottom: '1.5rem' }}>
                        {message}
                    </Alert>
                }

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn">Update Password</button>
                </form>
            </div>
        </div>
    );
}