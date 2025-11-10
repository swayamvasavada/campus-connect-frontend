import TaskItem from './TaskItem';

export default function TaskList({ tasks, currentUser, onStatusChange, onDeleteTask, onCreateTask, onEditTask }) {
    if (!tasks || tasks.length === 0) {
        return (
            <div className="tasks-section">
                <div className="tasks-header">
                    <i className="fa-solid fa-list-check"></i>
                    <h2>Tasks</h2>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <button className="create-task-btn" onClick={onCreateTask}>
                        <i className="fa-solid fa-plus"></i> Create Task
                    </button>
                </div>
                <div className="empty-state-message" style={{ border: '1px dashed #444' }}>
                    <p>No tasks have been created yet.</p>
                </div>
            </div>
        );
    }

    const columns = {
        'To Do': tasks.filter(task => task.status === 'Pending'),
        'In Progress': tasks.filter(task => task.status === 'In Progress'),
        'Done': tasks.filter(task => task.status === 'Done'),
    };

    return (
        <div className="tasks-section">
            <div className="tasks-header">
                <i className="fa-solid fa-list-check"></i>
                <h2>Tasks</h2>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <button className="create-task-btn" onClick={onCreateTask}>
                    <i className="fa-solid fa-plus"></i> Create Task
                </button>
            </div>

            <div className="task-board-container">
                {Object.entries(columns).map(([status, tasksInColumn]) => (
                    <div className="task-column" key={status}>
                        <h3 className="column-title">
                            {status}
                            <span className="task-count">{tasksInColumn.length}</span>
                        </h3>
                        <div className="task-list">
                            {tasksInColumn.map(task => (
                                <TaskItem
                                    key={task._id}
                                    task={task}
                                    currentUser={currentUser}
                                    onStatusChange={onStatusChange}
                                    onDeleteTask={onDeleteTask}
                                    onEditTask={onEditTask}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}