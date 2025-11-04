import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/header.css";
import Sidebar from "../Sidebar/Sidebar";

export default function Header() {
    const navigate = useNavigate();
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
                }
            } catch (error) {
                console.log("Error: ", error);
            }
        }

        fetchUserInfo();
    }, [navigate]);

    function toggleDropdown() {
        setDropdown(!isDropdownOpen);
        return;
    }

    function handleClose(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setDropdown(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("isAuth");
        localStorage.removeItem("authToken");
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
                <div className="menu-btn" onClick={toggleDrawer(true)}>
                    <i className="fa-solid fa-bars" title="Menu"></i>
                </div>

                <nav>
                    <div className="nav-item" onClick={toggleDropdown} ref={dropdownRef}>
                        {userInfo && (<img src={userInfo.profilePic} alt="Profile" className="header-profile-pic" />)}
                        {userInfo && <span>{userInfo.name}</span>}
                        <span><i className="fa-solid fa-angle-down" style={{ fontSize: "1rem", marginLeft: "8px" }}></i></span>
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                <a href="/update-profile"><div className="dropdown-item"><i className="fa-solid fa-user-pen"></i> Update Profile </div></a>
                                <a href="/change-password"><div className="dropdown-item"><i className="fa-solid fa-key"></i> Change Password </div></a>
                                <div className="dropdown-item" onClick={handleLogout}> <i className="fa-solid fa-right-from-bracket"></i> Logout </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-info">
                                    <p>Last login:</p>
                                    <p>{userInfo.previousLogin ? new Date(userInfo.previousLogin).toLocaleString('en-US', {
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