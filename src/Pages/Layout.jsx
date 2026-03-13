import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import "../assets/styles/dashboard.css"; 

export default function Layout() {
    return (
        <div className="layout-wrapper">
            <Header />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    )
}