import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../assets/styles/forms.css";
import { Alert } from '@mui/material';

export default function CreateProject() {
    const navigate = useNavigate();
    const [hasError, setError] = useState(false);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        console.log("Creating project with data:", { ...formData, type: 'project' });

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/groups/create-group`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ ...formData, type: 'Project' })
            });

            const result = await res.json();
            if (result.hasError) {
                // Handle error (e.g., show a message to the user)
                setError(true);
                setMessage(result.message || 'An error occurred while creating the project.');
                return;
            }

            navigate(`/`);
        } catch (error) {
            setError(true);
            setMessage('Something went wrong');
        }
    };

    return (
        <div className="form-page-container">
            <div className="form-card">
                <h2>Create a New Project</h2>
                {hasError && <Alert severity="error" onClose={() => setError(false)}>{message}</Alert>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Project Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn">Create Project</button>
                </form>
            </div>
        </div>
    );
}