import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        console.error(error);
        return true; // treat invalid token as expired
    }
}

const AuthGuard = ({ children, allowedRoles = [] }) => {
    const token = localStorage.getItem('token');

    if (!token || isTokenExpired(token)) {
        return <Navigate to="/auth/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const userRole = decoded.role;

        if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            return <Navigate to="/unauthorized" replace />;
        }

        return children;
    } catch (error) {
        console.error(error);
        return <Navigate to="/auth/login" replace />;
    }
};

export default AuthGuard;
