import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RedirectIfAuthenticated = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                const role = decoded.role;

                // Redirect based on role
                if (role === 'admin' || role === 'librarian') {
                    navigate('/dashboard', { replace: true });
                } else if (role === 'student') {
                    navigate('/books', { replace: true });
                } else {
                    navigate('/unauthorized', { replace: true });
                }
            } catch (err) {
                console.error('Token decode failed:', err);
                localStorage.removeItem('token');
            }
        }
    }, [navigate]);

    return children;
};

export default RedirectIfAuthenticated;
