import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    const [isHovered, setIsHovered] = useState(false);

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            backgroundColor: '#1c1c1c',
            color: '#f1f1f1',
            minHeight: 'calc(100vh - 5rem)',
            padding: '2rem',
        },
        content: {
            maxWidth: '600px',
        },
        title: {
            fontSize: '8rem',
            fontWeight: 900,
            margin: 0,
            color: '#2dd4bf',
            lineHeight: 1,
        },
        subtitle: {
            fontSize: '2.5rem',
            fontWeight: 700,
            margin: '0 0 1rem 0',
        },
        text: {
            color: '#a1a1aa',
            fontSize: '1.1rem',
            lineHeight: 1.6,
            marginBottom: '2rem',
        },
        button: {
            display: 'inline-block',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: '6px',
            cursor: 'pointer',
            textDecoration: 'none',
            backgroundColor: '#ffffff',
            color: '#111827',
            transition: 'background-color 0.2s',
        },
        buttonHover: {
            backgroundColor: '#f0f0f0',
        }
    };

    const buttonStyle = {
        ...styles.button,
        ...(isHovered ? styles.buttonHover : null)
    };

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <h1 style={styles.title}>404</h1>
                <h2 style={styles.subtitle}>Page Not Found</h2>
                <p style={styles.text}>
                    Sorry, the page you are looking for does not exist. It might have been moved or deleted.
                </p>
                <Link
                    to="/"
                    style={buttonStyle}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    Go to Homepage
                </Link>
            </div>
        </div>
    );
}