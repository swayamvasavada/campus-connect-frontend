import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MembersModal from '../Groups/MembersModal';
import TaskList from '../Tasks/TaskList';
import TaskFormModal from '../Tasks/TaskFormModal';
import "../../assets/styles/group-detail.css";
import "../../assets/styles/task-board.css";
import { Alert } from '@mui/material';

export default function ProjectDetailPage() {
    const { projectId } = useParams();
    const [project, setProject] = useState(null);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setError] = useState(false);
    const [message, setMessage] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(function () {
        async function fetchTask() {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/task/fetch/${projectId}`, {
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

                setProject(result);
                setTasks(result.tasks || []); // Ensure tasks is at least an empty array
            } catch (error) {
                setError(true);
                setMessage("Something went wrong");
            } finally {
                setLoading(false);
            }
        }

        console.log(`Fetching data for project: ${projectId}`);
        fetchTask();
    }, [projectId]);

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

    // New handlers for opening the modal
    function handleOpenCreateModal() {
        setTaskToEdit(null);
        setIsModalOpen(true);
    }

    function handleOpenEditModal(task) {
        setTaskToEdit(task);
        setIsModalOpen(true);
    }

    function handleTaskSaved(savedTask) {
        setTasks(currentTasks => {
            // Check if the task already exists in the list
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
        return <div className="group-detail-container"><p>Loading project details...</p></div>;
    }

    return (
        <div className="group-detail-container">
            <div className="group-detail-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>{project?.name}</h1>
                    <p>{project?.description}</p>
                </div>
                <button className="view-members-btn" onClick={() => setIsMembersModalOpen(true)}>
                    <i className="fa-solid fa-users"></i> Members
                </button>
            </div>

            {hasError && <Alert severity='error' style={{ marginBottom: '1rem' }}> {message} </Alert>}

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
                    groupId={projectId}
                    taskToEdit={taskToEdit}
                    onTaskSaved={handleTaskSaved}
                />
            )}

            {isMembersModalOpen && (
                <MembersModal
                    onClose={() => setIsMembersModalOpen(false)}
                    groupId={projectId}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}