import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../data/firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../css/Login.css'; // Make sure your CSS file path is correct

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get the return URL from location state, or default to '/'
    const from = location.state?.from || '/';

    // Check if user is already logged in
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    // Check user role to decide where to redirect
                    const userDoc = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(userDoc);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();

                        // If returning from a protected page, navigate there
                        if (from !== '/login' && from !== '/') {
                            navigate(from);
                        } else if (userData.role === 'admin') {
                            navigate('/dctoradmin');
                        } else {
                            navigate('/');
                        }
                    } else {
                        // Default to home if user document doesn't exist
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Error checking user role:', error);
                    navigate('/');
                }
            }
        });

        return () => unsubscribe();
    }, [navigate, from]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check user role to determine redirect
            const userDoc = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDoc);

            if (docSnap.exists()) {
                const userData = docSnap.data();

                // If returning from a protected page, navigate there
                if (from !== '/login' && from !== '/') {
                    navigate(from);
                } else if (userData.role === 'admin') {
                    navigate('/dctoradmin');
                } else {
                    navigate('/');
                }
            } else {
                // Default to home if user document doesn't exist
                navigate('/');
            }

        } catch (error) {
            console.error('Error signing in:', error);

            // Set user-friendly error messages
            if (error.code === 'auth/invalid-credential') {
                setError('Invalid email or password. Please try again.');
            } else if (error.code === 'auth/user-not-found') {
                setError('No account found with this email.');
            } else if (error.code === 'auth/wrong-password') {
                setError('Incorrect password.');
            } else {
                setError('Failed to sign in. Please try again.');
            }

            setLoading(false);
        }
    }

    return (
        <div className="container_register d-flex justify-content-center align-items-center min-vh-100">
            <div className="w-50 style_conten">
                <div className="box_title">
                    <h2 className="">Login</h2>
                    <Link to='/'>
                        <i className='bx bx-x'></i>
                    </Link>
                </div>

                {/* Show error message if there's an error */}
                {error && <div className="error-message">{error}</div>}

                {/* If redirected from a protected route, show message */}
                {location.state?.from && from !== '/login' && from !== '/' && (
                    <div className="info-message">
                        Please log in to access the requested page.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className="login-footer link_to_register">
                    <p>
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;