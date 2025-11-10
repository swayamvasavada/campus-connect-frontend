import { Navigate, Outlet } from 'react-router-dom';

function useAuth() {
    const isAuthenticated = localStorage.getItem('isAuth') === 'true';
    const token = localStorage.getItem('authToken');
    return isAuthenticated && token;
}

export default function ProtectedRoute() {
    const isAuth = useAuth();
    return isAuth ? <Outlet /> : <Navigate to="/login" />;
}