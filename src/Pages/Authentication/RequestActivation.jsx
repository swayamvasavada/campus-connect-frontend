import { useState } from "react";
import { Alert } from "@mui/material";
import "../../assets/styles/auth.css"; // Use the same stylesheet as login/signup

export default function RequestActivation() {
    const [hasError, setError] = useState(false);
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);

    async function resendActivationEmail() {
        setError(false);
        setIsResending(true);

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/resend-activation-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const result = await res.json();
            if (result.hasError) {
                setError(true);
            }

            setMessage(result.message);
        } catch (error) {
            setError(true);
            setMessage("Something went wrong! Please try again later.");
            console.error("Error resending activation email:", error);
        } finally {
            setIsResending(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <div className="auth-header">
                    <h1>Activate Your Account</h1>
                </div>

                <i className="fa-solid fa-envelope-circle-check" style={{ fontSize: '4rem', color: '#2dd4bf', marginBottom: '1.5rem' }}></i>

                {message &&
                    <Alert severity={hasError ? "error" : "success"} style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        {message}
                    </Alert>
                }

                <p style={{ color: '#a1a1aa', lineHeight: 1.6 }}>
                    If you don't see the email in your inbox, please check your spam folder.
                </p>

                <button
                    onClick={resendActivationEmail}
                    className="btn"
                    disabled={isResending}
                    style={{ marginTop: '1rem' }}
                >
                    {isResending ? 'Sending...' : 'Resend Activation Email'}
                </button>
            </div>
        </div>
    );
}