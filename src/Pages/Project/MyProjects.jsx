import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import "../../assets/styles/group-view.css";
import { Alert } from '@mui/material';

export default function MyProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setError] = useState(false);
    const [message, setMessage] = useState('');

    async function fetchProjectData() {
        setLoading(true);
        setError(false);

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/my-groups?type=Project`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const result = await res.json();
            if (result.hasError) {
                setError(true);
                setMessage(result.message);
                setLoading(false);
                return;
            }

            setProjects(result.groups);
            setLoading(false);
        } catch (error) {
            setError(true);
            setMessage("Something went wrong!");
            setLoading(false);
        }
    }

    useEffect(function () {
        fetchProjectData();
    }, []);

    if (loading) {
        return <div className="group-page-container"><p>Loading your projects...</p></div>;
    }

    return (
        <div className="group-page-container">
            <div className="group-page-header">
                <h1>My Projects</h1>
            </div>

            {hasError && <Alert severity='error'>{message}</Alert>}
            
            {projects.length > 0 ? (
                <div className="group-list">
                    {projects.map(project => (
                        <Link to={`/projects/${project._id}`} key={project._id} className="group-card-item">
                            <h3>{project.name}</h3>
                            <p>{project.description}</p>
                            <span className="card-button">View Details</span>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="empty-state-message">
                    <p>You haven't joined any projects yet.</p>
                    <p>Go to the <Link to="/community" className="btn-alt">Join/Create</Link> page to find one!</p>
                </div>
            )}
        </div>
    );
}