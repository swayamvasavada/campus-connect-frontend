import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Alert } from "@mui/material";
import "../../assets/styles/auth.css";

export default function AccountActivation() {
    const { ACTIVATION_TOKEN } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState('activating'); // 'activating', 'success', 'error'
    const [message, setMessage] = useState('Activating your account, please wait...');

    useEffect(function () {
        async function activateAccount() {
            try {
                const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/activate/${ACTIVATION_TOKEN}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const result = await res.json();

                if (result.hasError) {
                    setStatus('error');
                    setMessage(result.message || 'Activation link is invalid or has expired.');
                } else {
                    setStatus('success');
                    setMessage(result.message || 'Your account has been successfully activated!');
                    setTimeout(() => navigate('/login'), 4000); // Redirect to login after a delay
                }
            } catch (error) {
                setStatus('error');
                setMessage('Something went wrong. Please try again later.');
                console.error("Activation Error:", error);
            }
        }

        activateAccount();
    }, [ACTIVATION_TOKEN, navigate]);

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                {status === 'activating' && (
                    <>
                        <div className="auth-header"><h1>Activating...</h1></div>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#2dd4bf', margin: '2rem 0' }}></i>
                        <p style={{ color: '#a1a1aa' }}>{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="auth-header"><h1>Success!</h1></div>
                        <i className="fa-solid fa-circle-check" style={{ fontSize: '3rem', color: '#22c55e', margin: '2rem 0' }}></i>
                        <Alert severity="success">{message}</Alert>
                        <p style={{ color: '#a1a1aa', marginTop: '1rem' }}>Redirecting you to the login page...</p>
                    </>
                )}

                {status === 'error' && (
                     <>
                        <div className="auth-header"><h1>Activation Failed</h1></div>
                        <i className="fa-solid fa-circle-xmark" style={{ fontSize: '3rem', color: '#ef4444', margin: '2rem 0' }}></i>
                        <Alert severity="error">{message}</Alert>
                        <Link to="/login" className="btn" style={{marginTop: '2rem'}}>Back to Login</Link>
                    </>
                )}
            </div>
        </div>
    );
}