import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import "../../assets/styles/sidebar.css";

export default function Sidebar({ open, toggleDrawer }) {
    const navigate = useNavigate();
    const { unreadCount } = useSocket() || { unreadCount: 0 }; 

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className={`sidebar ${open ? 'open' : ''}`}>
            {/* 1. Header Area */}
            <div className="sidebar-header">
                <span onClick={toggleDrawer(false)} className="close-btn">&times;</span>
                <h2 className="brand-name">Campus Connect</h2>
            </div>

            {/* 2. Scrollable Menu Area */}
            <nav className="sidebar-nav">
                <ul className="sidebar-menu">
                    <li>
                        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={toggleDrawer(false)}>
                            <i className="fa-solid fa-home"></i> 
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/community" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={toggleDrawer(false)}>
                            <i className="fa-solid fa-users-rectangle"></i>
                            <span>Join/Create</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/projects" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={toggleDrawer(false)}>
                            <i className="fa-solid fa-briefcase"></i>
                            <span>Projects</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/clubs" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={toggleDrawer(false)}>
                            <i className="fa-solid fa-users"></i>
                            <span>Clubs</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/events" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={toggleDrawer(false)}>
                            <i className="fa-solid fa-calendar"></i>
                            <span>Events</span>
                        </NavLink>
                    </li>
                    
                    {/* Chat Link with Inline Badge */}
                    <li>
                        <NavLink to="/chat" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} onClick={toggleDrawer(false)}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <div>
                                    <i className="fa-solid fa-comments"></i>
                                    <span>Chat</span>
                                    <span className="beta-badge" style={{ marginLeft: '8px' }}>BETA</span>
                                </div>
                                {unreadCount > 0 && (
                                    <span className="sidebar-badge">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {/* 3. Bottom Footer Area */}
            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}