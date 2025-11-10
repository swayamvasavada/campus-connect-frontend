import { Alert } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GroupCard({ type, icon, description }) {
    const navigate = useNavigate();
    const [hasError, setError] = useState(false);
    const [message, setMessage] = useState('');
    const [results, setResults] = useState([]);
    let timeout = null;

    function handleCreate() {
        if (type === 'Project') navigate('/create-project');
        else navigate('/create-club');
    }

    function handleSearch(event) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fetchResults(event.target.value), 1000);
    }

    async function fetchResults(query) {
        setError(false);
        setMessage('');

        if (query.trim() === '') {
            setResults([]);
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/search?groupName=${query}&type=${type.toLowerCase()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const resData = await res.json();

            if (resData.hasError) {
                setError(true);
                setMessage(resData.message || `An error occurred while searching for ${type}.`);
                setResults([]);
                return;
            }

            setResults(resData.result);
        } catch (error) {
            setError(true);
            setMessage('Something went wrong');
            setResults([]);
            console.log("Error: ", error);
        }
    }

    async function joinGroup(e) {
        const groupId = e.target.dataset.id;
        setError(false);

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/join-group/${groupId}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const result = await res.json();

            setError(result.hasError);
            setMessage(result.message);
            if (!result.hasError) setTimeout(() => navigate(`/${type}s`), 2000);
        } catch (error) {
            setError(true);
            setMessage("Something went wrong!");
        }
    }

    return (
        <div className="community-card">
            <div className="community-header">
                <i className={`fa-solid ${icon}`}></i>
                <h2>{type}s</h2>
            </div>
            {message.length > 0 && <Alert severity={hasError ? "error" : "success"} onClose={() => setMessage('')}>{message}</Alert>}

            <p>{description}</p>
            <button className="btn create-btn" onClick={handleCreate}>Create New {type}</button>
            <div className="divider">OR</div>
            <div className="search-section">
                <input type="text" placeholder={`Search for a ${type.toLowerCase()}...`} onChange={handleSearch} />
                <div className="results-container">
                    {results.map(item => (
                        <div key={item._id} className="result-item">
                            <div className="result-info">
                                <p className="result-name">{item.name}</p>
                                <p className="result-creator">Created by: {item.createdBy.name}</p>
                                <p className="result-description">{item.description}</p>
                            </div>
                            <button className="btn join-btn" onClick={joinGroup} data-id={item._id}>Join</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}