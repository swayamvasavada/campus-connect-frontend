import "../../assets/styles/sidebar.css";

export default function Sidebar({ open, toggleDrawer }) {
    return (
        <div className={`sidebar ${open ? 'open' : ''}`}>
            <div className="sidebar-header">
                <span onClick={toggleDrawer(false)} className="close-btn">&times;</span>
                <h2>Campus Connect</h2>
            </div>
            <ul className="sidebar-menu">
                <li><a href="/"><i className="fa-solid fa-home"></i> Dashboard</a></li>
                <li><a href="/community"><i className="fa-solid fa-plus"></i> Join/Create</a></li>
                <li><a href="/projects"><i className="fa-solid fa-briefcase"></i> Projects</a></li>
                <li><a href="/clubs"><i className="fa-solid fa-users"></i> Clubs</a></li>
                <li><a href="/events"><i className="fa-solid fa-calendar"></i> Events</a></li>
                <li><a href="/chat"><i className="fa-solid fa-comments"></i> Chat</a></li>
            </ul>
        </div>
    );
}