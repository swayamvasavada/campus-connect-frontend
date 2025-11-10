import { useState, useEffect, useRef } from 'react';
import { Alert } from "@mui/material";
import "../../assets/styles/modal.css";
import "../../assets/styles/forms.css";

export default function TaskFormModal({ onClose, currentUser, groupId, taskToEdit = null, onTaskSaved }) {
    const isEditMode = !!taskToEdit;
    const [hasError, setError] = useState(false);
    const [message, setMessage] = useState('');

    const [assignees, setAssignees] = useState([]);
    const [isModerator, setIsModerator] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Initialize state based on whether we are editing or creating
    const [selectedAssignee, setSelectedAssignee] = useState(isEditMode ? taskToEdit.assignee : currentUser);
    const [formData, setFormData] = useState({
        title: isEditMode ? taskToEdit.title : '',
        description: isEditMode ? taskToEdit.description : '',
    });

    const dropdownRef = useRef(null);

    useEffect(function () {
        async function fetchMembers() {
            try {
                const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/task/members/${groupId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem("authToken")}`
                    }
                });

                const result = await res.json();
                if (result.hasError) {
                    setMessage(result.message);
                    setError(true);
                    return;
                }

                setIsModerator(result.isModerator);
                setAssignees(result.members);
            } catch (error) {
                setMessage("Something went wrong fetching members");
                setError(true);
            }
        }
        fetchMembers();
    }, [groupId, isEditMode]);

    useEffect(function () {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    function handleChange(e) {
        setFormData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }

    function handleSelectAssignee(assignee) {
        setSelectedAssignee(assignee);
        setIsDropdownOpen(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(false);
        setMessage("");

        const finalData = {
            ...formData,
            assignee: selectedAssignee ? selectedAssignee._id : null,
            groupId,
            status: isEditMode ? taskToEdit.status : 'Pending'
        };

        const url = isEditMode
            ? `${process.env.REACT_APP_SERVER_URL}/api/task/update-task/${taskToEdit._id}`
            : `${process.env.REACT_APP_SERVER_URL}/api/task/create-task`;
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(finalData)
            });

            const result = await res.json();
            if (result.hasError) {
                setMessage(result.message);
                setError(true);
                return;
            }

            if (onTaskSaved) {
                // If API returns the full task, use it. Otherwise, construct it manually.
                if (result.task && result.task._id) {
                    onTaskSaved(result.task);
                } else if (result.acknowledged || isEditMode) {
                    const optimisticTask = {
                        ...(isEditMode ? taskToEdit : {}),
                        ...finalData,
                        assignee: selectedAssignee,
                        _id: isEditMode ? taskToEdit._id : (result._id || Date.now().toString())
                    };
                    // Add missing fields for new tasks
                    if (!isEditMode) {
                        optimisticTask.createdAt = new Date().toISOString();
                        optimisticTask.createdBy = currentUser._id;
                    }
                    onTaskSaved(optimisticTask);
                }
            }
            onClose();
        } catch (error) {
            console.error("Error saving task:", error);
            setMessage("Something went wrong");
            setError(true);
        }
    }

    const filteredAssignees = assignees.filter(
        user => user.name?.toLowerCase().includes(searchQuery?.toLowerCase())
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditMode ? 'Edit Task' : 'Create a New Task'}</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                {hasError && <Alert severity="error" style={{ marginBottom: '1rem' }}>{message}</Alert>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Task Title</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Assign To</label>
                        <div className="custom-dropdown" ref={dropdownRef}>
                            <div
                                className={`dropdown-trigger ${!isModerator ? 'disabled' : ''}`}
                                onClick={() => isModerator && setIsDropdownOpen(!isDropdownOpen)}
                            >
                                {selectedAssignee ? selectedAssignee.name : <span className="placeholder">Unassigned</span>}
                                {isModerator && <i className={`fa-solid fa-chevron-${isDropdownOpen ? 'up' : 'down'}`}></i>}
                            </div>
                            {isDropdownOpen && isModerator && (
                                <div className="dropdown-panel">
                                    <div className="dropdown-search">
                                        <input
                                            type="text"
                                            placeholder="Search members..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <ul className="dropdown-list">
                                        <li className="dropdown-item" onClick={() => handleSelectAssignee(null)}>
                                            <em>Unassigned</em>
                                        </li>
                                        {filteredAssignees.map(member => (
                                            <li key={member._id} className="dropdown-item" onClick={() => handleSelectAssignee(member)}>
                                                {member.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <button type="submit" className="btn">{isEditMode ? 'Update Task' : 'Create Task'}</button>
                </form>
            </div>
        </div>
    );
}