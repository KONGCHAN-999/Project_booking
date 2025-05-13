import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../data/firebase';

// Types of protected routes
const ROUTE_TYPES = {
    ADMIN: 'admin',
    USER: 'user',
};

function ProtectedRoute({ routeType = ROUTE_TYPES.USER }) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAuthorization = async (user) => {
            if (!user) {
                setAuthorized(false);
                setLoading(false);
                return;
            }

            try {
                // Get user document to check role
                const userDoc = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userDoc);

                if (!userSnap.exists()) {
                    console.log('No user document found!');
                    setAuthorized(false);
                    setLoading(false);
                    return;
                }

                const userData = userSnap.data();
                const userRole = userData.role; // Default to 'user' if no role is specified

                // Check if user is authorized based on route type
                switch (routeType) {
                    case ROUTE_TYPES.ADMIN:
                        setAuthorized(userRole === 'admin');
                        break;
                    case ROUTE_TYPES.USER:
                        setAuthorized(true); // All authenticated users can access user routes
                        break;
                    default:
                        setAuthorized(false);
                }
            } catch (error) {
                console.error('Error checking user authorization:', error);
                setAuthorized(false);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            checkAuthorization(user);
        });

        // Clean up subscription
        return () => unsubscribe();
    }, [routeType]);

    if (loading) {
        // You can replace this with a loading spinner component
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!authorized) {
        // Redirect to login with the return URL
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    // If user is authorized, render the child routes
    return <Outlet />;
}

export { ProtectedRoute, ROUTE_TYPES };