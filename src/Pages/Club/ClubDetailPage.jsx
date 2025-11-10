import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TaskList from '../Tasks/TaskList';
import TaskFormModal from '../Tasks/TaskFormModal';
import MembersModal from '../Groups/MembersModal';
import "../../assets/styles/group-detail.css";
import "../../assets/styles/task-board.css";
import { Alert } from '@mui/material';

export default function ClubDetailPage() {
    const { clubId } = useParams();
    const [club, setClub] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null); // Track task being edited

    const [hasError, setError] = useState(false);
    const [message, setMessage] = useState('');

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(function () {
        async function fetchTask() {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/task/fetch/${clubId}`, {
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
                    return;
                }

                setClub({
                    name: result.name,
                    description: result.description
                });

                setTasks(result.tasks || []);
            } catch (error) {
                setError(true);
                setMessage("Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        console.log(`Fetching data for club: ${clubId}`);
        fetchTask();
    }, [clubId]);

    async function handleTaskDelete(taskId) {
        console.log(`Deleting task ${taskId}`);
        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/task/delete-task/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const result = await res.json();
            if (result.hasError) {
                setMessage(result.message);
                setError(true);
                return;
            }
        } catch (error) {
            setMessage("Something went wrong");
            setError(true);
        }
        setTasks(currentTasks => currentTasks.filter(task => task._id !== taskId));
    }

    async function handleTaskStatusChange(taskId, newStatus) {
        // ... (Keep your existing status change logic here)
        console.log(`Updating status of ${taskId} to ${newStatus}`);
        const formData = { taskId, newStatus };

        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/task/update-status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(formData)
            });


            const result = await res.json();
            if (result.hasError) {
                setMessage(result.message);
                setError(true);
                return;
            }
        } catch (error) {
            console.log("Error: ", error);
            setMessage("Something went wrong");
            setError(true);
        }

        // Optimistic update
        setTasks(currentTasks =>
            currentTasks.map(task =>
                task._id === taskId ? { ...task, status: newStatus } : task
            )
        );
    }

    // Handlers for modal
    function handleOpenCreateModal() {
        setTaskToEdit(null);
        setIsModalOpen(true);
    }

    function handleOpenEditModal(task) {
        setTaskToEdit(task);
        setIsModalOpen(true);
    }

    function handleTaskSaved(savedTask) {
        console.log("Savedtask: ", savedTask);

        setTasks(currentTasks => {
            const taskIndex = currentTasks.findIndex(t => t._id === savedTask._id);
            if (taskIndex > -1) {
                const updatedTasks = [...currentTasks];
                updatedTasks[taskIndex] = savedTask;
                return updatedTasks;
            } else {
                return [...currentTasks, savedTask];
            }
        });

        setIsModalOpen(false);
        setTaskToEdit(null);
    }

    if (loading || !currentUser) {
        return <div className="group-detail-container"><p>Loading club details...</p></div>;
    }

    return (
        <div className="group-detail-container">
            <div className="group-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>{club?.name}</h1>
                    <p>{club?.description}</p>
                </div>
                <button className="view-members-btn" onClick={() => setIsMembersModalOpen(true)}>
                    <i className="fa-solid fa-users"></i> Members
                </button>
            </div>

            <div className="group-detail-header">
                <h2>Upcoming Events</h2>
                <p style={{ color: '#777', fontSize: '1rem' }}>Event functionality will be added here later.</p>
            </div>

            {hasError && <Alert severity='error' onClose={() => setError(false)}> {message} </Alert>}

            <TaskList
                tasks={tasks}
                currentUser={currentUser}
                onStatusChange={handleTaskStatusChange}
                onDeleteTask={handleTaskDelete}
                onCreateTask={handleOpenCreateModal}
                onEditTask={handleOpenEditModal}
            />

            {isModalOpen && (
                <TaskFormModal
                    onClose={() => setIsModalOpen(false)}
                    currentUser={currentUser}
                    groupId={clubId}
                    taskToEdit={taskToEdit}
                    onTaskSaved={handleTaskSaved}
                />
            )}

            {isMembersModalOpen && (
                <MembersModal
                    onClose={() => setIsMembersModalOpen(false)}
                    groupId={clubId}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}