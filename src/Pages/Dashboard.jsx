import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../assets/styles/dashboard.css";

export default function Dashboard() {
    const navigate = useNavigate();
    const [myTasks, setMyTasks] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [taskView, setTaskView] = useState('active');
    const currentUser = JSON.parse(localStorage.getItem('user'));

    async function fetchDashboardData() {
        try {
            const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/dashboard-data`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await res.json();
            if (!result.hasError) {
                setMyTasks(result.tasks);
                setMyGroups(result.groups);
                setLoading(false);
            }
        } catch (error) {
            console.log("Error: ", error);
        }
    }

    useEffect(function () {
        fetchDashboardData();
    }, []);

    function getGroupLink(group) {
        if (group.type === 'Club') return `/clubs/${group._id}`;
        if (group.type === 'Project') return `/projects/${group._id}`;
        return '#';
    }

    const filteredTasks = myTasks.filter(task => {
        if (taskView === 'active') return task.status === 'Pending' || task.status === 'In Progress';
        return task.status === 'Done';
    });

    const myProjects = myGroups.filter(g => g.type === 'Project');
    const myClubs = myGroups.filter(g => g.type === 'Club');

    if (loading) {
        return <div className="dashboard-container"><p>Loading dashboard...</p></div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Welcome back, {currentUser?.name}!</h1>
                <p>Here’s what’s on your plate for today.</p>
            </div>

            <div className="dashboard-main-grid">
                {/* --- Left Column: My Tasks --- */}
                <div className="dashboard-card tasks-card">
                    <div className="dashboard-card-header">
                        <i className="fa-solid fa-list-check"></i>
                        <h2>My Tasks</h2>
                    </div>
                    <div className="task-tabs">
                        <button
                            className={`tab-btn ${taskView === 'active' ? 'active' : ''}`}
                            onClick={() => setTaskView('active')}
                        >
                            Active ({myTasks.filter(t => t.status !== 'Done').length})
                        </button>
                        <button
                            className={`tab-btn ${taskView === 'completed' ? 'active' : ''}`}
                            onClick={() => setTaskView('completed')}
                        >
                            Completed ({myTasks.filter(t => t.status === 'Done').length})
                        </button>
                    </div>
                    <div className="task-list">
                        {filteredTasks.length > 0 ? filteredTasks.map(task => (
                            <Link to={getGroupLink(task.group)} key={task._id} className="task-list-item">
                                <div className="task-item-details">
                                    <h4>{task.title}</h4>
                                    {/* --- UPDATED THIS LINE --- */}
                                    <p className={`task-item-origin ${task.group.type === 'Club' ? 'club-tag' : 'project-tag'}`}>
                                        {task.group.type === 'Club' ? <i className="fa-solid fa-users"></i> : <i className="fa-solid fa-briefcase"></i>}
                                        {task.group.name}
                                    </p>
                                </div>
                                <span className="task-item-status">{task.status}</span>
                            </Link>
                        )) : (
                            <p className="no-tasks-msg">You have no {taskView} tasks!</p>
                        )}
                    </div>
                </div>

                {/* --- Right Column: Groups & Actions --- */}
                <div className="dashboard-sidebar">
                    <div className="dashboard-card quick-action-card">
                        <h3>Start Something New</h3>
                        <p>Join an existing group or create your own to start collaborating.</p>
                        <button className="btn-join" onClick={() => navigate('/community')}>
                            <i className="fa-solid fa-plus"></i>
                            Join or Create a Group
                        </button>
                    </div>

                    <div className="dashboard-card group-list-card">
                        <div className="dashboard-card-header">
                            <i className="fa-solid fa-briefcase"></i>
                            <h3>My Projects ({myProjects.length})</h3>
                        </div>
                        <ul className="dashboard-group-list">
                            {myProjects.length > 0 ? myProjects.map(group => (
                                // --- UPDATED THIS LINE ---
                                <li key={group._id} className="dashboard-group-list-item project-link">
                                    <Link to={getGroupLink(group)}>{group.name}</Link>
                                </li>
                            )) : <p>No projects joined.</p>}
                        </ul>
                    </div>

                    <div className="dashboard-card group-list-card">
                        <div className="dashboard-card-header">
                            <i className="fa-solid fa-users"></i>
                            <h3>My Clubs ({myClubs.length})</h3>
                        </div>
                        <ul className="dashboard-group-list">
                            {myClubs.length > 0 ? myClubs.map(group => (
                                // --- UPDATED THIS LINE ---
                                <li key={group._id} className="dashboard-group-list-item club-link">
                                    <Link to={getGroupLink(group)}>{group.name}</Link>
                                </li>
                            )) : <p>No clubs joined.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};