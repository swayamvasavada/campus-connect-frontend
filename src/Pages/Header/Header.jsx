import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext"; 
import "../../assets/styles/header.css";
import Sidebar from "../Sidebar/Sidebar";

export default function Header() {
    const navigate = useNavigate();
    const { unreadCount, setUnreadCount } = useSocket() || { unreadCount: 0, setUnreadCount: () => {} };

    const [isDropdownOpen, setDropdown] = useState(false);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [userInfo, setInfo] = useState(null);

    useEffect(function () {
        async function fetchUserInfo() {
            try {
                const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/user/user-info`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });

                const result = await res.json();
                
                if (result.hasError && result.requiresActivation) {
                    navigate('/activate-account');
                }

                if (!result.hasError) {
                    setInfo(result.user);
                    if (result.unreadCount !== undefined) {
                        setUnreadCount(result.unreadCount);
                    }
                }
            } catch (error) {
                console.log("Error: ", error);
            }
        }
        fetchUserInfo();
    }, [navigate, setUnreadCount]);

    function toggleDropdown() {
        setDropdown(!isDropdownOpen);
    }

    function handleClose(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdown(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        return navigate("/login");
    }

    function toggleDrawer(newOpen) {
        return function () {
            setOpen(newOpen);
        };
    }

    useEffect(function () {
        document.addEventListener('mousedown', handleClose);
        return function () {
            document.removeEventListener('mousedown', handleClose);
        }
    }, []);

    return (
        <>
            <Sidebar open={open} toggleDrawer={toggleDrawer} />

            <header>
                {/* HAMBURGER MENU */}
                <div className="menu-btn" onClick={toggleDrawer(true)} style={{ cursor: 'pointer' }}>
                    {/* Wrapper Span ensures badge is relative to the ICON, not the padding box */}
                    <span style={{ position: 'relative', display: 'inline-block' }}>
                        <i className="fa-solid fa-bars" title="Menu"></i>
                        
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontSize: '0.6rem',
                                padding: '0',
                                borderRadius: '50%',
                                width: '16px',
                                height: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                border: '2px solid #111', // Matches header bg
                                zIndex: 10
                            }}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </span>
                </div>

                <nav>
                    <div className="nav-item" onClick={toggleDropdown} ref={dropdownRef}>
                        {userInfo && (<img src={userInfo.profilePic} alt="Profile" className="header-profile-pic" />)}
                        {userInfo && <span className="header-username">{userInfo.name}</span>}
                        <span><i className="fa-solid fa-angle-down" style={{ fontSize: "1rem", marginLeft: "8px" }}></i></span>
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <a href="/update-profile"><div className="dropdown-item"><i className="fa-solid fa-user-pen"></i> Update Profile </div></a>
                                <a href="/change-password"><div className="dropdown-item"><i className="fa-solid fa-key"></i> Change Password </div></a>
                                <div className="dropdown-item" onClick={handleLogout}> <i className="fa-solid fa-right-from-bracket"></i> Logout </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-info">
                                    <p>Last login:</p>
                                    <p>{userInfo?.previousLogin ? new Date(userInfo.previousLogin).toLocaleString('en-US', {
                                        day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'
                                    }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>
            </header>
        </>
    );
}