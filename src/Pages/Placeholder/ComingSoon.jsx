import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../assets/styles/coming-soon.css';

// Helper function to capitalize the module name from the path
function getModuleName(path) {
    if (!path) return "Feature";
    const moduleName = path.replace('/', '');
    return moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
}

export default function ComingSoon() {
    const location = useLocation();
    const moduleName = getModuleName(location.pathname);

    // Select an icon based on the module
    const getIcon = () => {
        switch (moduleName.toLowerCase()) {
            case 'chat':
                return "fa-solid fa-comments";
            default:
                return "fa-solid fa-rocket";
        }
    }

    return (
        <div className="coming-soon-container">
            <i className={`coming-soon-icon ${getIcon()}`}></i>
            <h1 className="coming-soon-title">{moduleName} Coming Soon!</h1>
            <p className="coming-soon-text">
                We're working hard to bring you this feature. It's under construction
                and will be available in a future update. Stay tuned!
            </p>
        </div>
    );
}