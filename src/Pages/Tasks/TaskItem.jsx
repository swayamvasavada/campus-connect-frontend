import React, { useState } from 'react';
// Make sure this path is correct based on where you saved the ConfirmationDialog component
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

export default function TaskItem({ task, currentUser, onStatusChange, onDeleteTask, onEditTask }) {
    const isCreator = task.createdBy === currentUser._id;
    const isAssignee = task.assignee && task.assignee._id === currentUser._id;

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    function handleEdit() {
        onEditTask(task);
    }

    function handleDeleteClick() {
        setIsDeleteOpen(true);
    }

    function handleConfirmDelete() {
        onDeleteTask(task._id);
        setIsDeleteOpen(false);
    }

    function handleStatusChange(e) {
        const newStatus = e.target.value;
        onStatusChange(task._id, newStatus);
    }

    return (
        <>
            <div className="task-card">
                <h4>{task.title}</h4>
                <p className="task-description">{task.description}</p>
                
                <div className="task-meta">
                    <p><strong>Assigned to:</strong> {task.assignee ? task.assignee.name : 'Unassigned'}</p>
                    <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="task-footer">
                    {(isAssignee || isCreator) && (
                        <div className="status-changer">
                            <select value={task.status} onChange={handleStatusChange}>
                                <option value="Pending">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    )}

                    {isCreator && (
                        <div className="task-actions">
                            <button className="edit-btn" onClick={handleEdit}>
                                <i className="fa-solid fa-pen"></i> Edit
                            </button>
                            <button className="delete-btn" onClick={handleDeleteClick}>
                                <i className="fa-solid fa-trash"></i> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                open={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Task?"
                message={`Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`}
            />
        </>
    );
}