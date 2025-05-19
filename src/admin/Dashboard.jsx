import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './css/Dashboard.css';
import { auth, db } from '../data/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import logo from '../assets/logo.png';
import { IoNewspaperOutline } from "react-icons/io5";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setUser({ ...docSnap.data(), email: currentUser.email });
        } else {
          console.log('No such document!');
          setUser({ email: currentUser.email });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Show logout confirmation popup
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  // Cancel logout
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Handle actual logout after confirmation
  const handleLogout = async () => {
    setError('');
    try {
      await signOut(auth);
      console.log('User logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
      setError('Failed to log out. Please try again.');
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  // Helper function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Get class for menu item based on active state
  const getMenuItemClass = (path) => {
    const baseClass = "d-flex align-items-center px-3 py-2 txt_style text-decoration-none";
    return isActive(path) ? `${baseClass} active` : `${baseClass} hover-bg-primary-dark`;
  };

  return (
    <>
      <div className="d-flex min-vh-100 bg-light box_content_menu_rigth">
        {/* Sidebar */}
        <aside
          className="bg-style txt_style vh-100 position-fixed d-md-block"
          style={{ width: '250px', transition: 'all 0.3s ease' }}
        >
          <div className="style_logo_admin">
            <img src={logo} alt="" />
          </div>
          <nav className="list_a">
            <Link
              to="/dctoradmin"
              className={getMenuItemClass('/dctoradmin')}
            >
              <div size={20} className="me-3 icon_list">
                <i className='bx bxs-user'></i>
              </div>
              Manage Doctor
            </Link>
            <Link
              to="/manageuser"
              className={getMenuItemClass('/manageuser')}
            >
              <div size={20} className="me-3 icon_list">
                <i className='bx bx-user'></i>
              </div>
              Manage User
            </Link>
            <Link
              to="/bookingadmin"
              className={getMenuItemClass('/bookingadmin')}
            >
              <div size={20} className="me-3 icon_list">
                <i className='bx bx-plus-medical'></i>
              </div>
              Booking
            </Link>
            <Link
              to="/blogAdmin"
              className={getMenuItemClass('/blogAdmin')}
            >
              <div size={20} className="me-3 icon_list">
                <IoNewspaperOutline />
              </div>
              Blogs
            </Link>
            <button
              onClick={confirmLogout}
              className="d-flex align-items-center px-3 py-2 txt_style text-decoration-none hover-bg-primary-dark bg-transparent border-0 w-100 text-start"
            >
              <div size={20} className="me-3 icon_list">
                <i className='bx bx-arrow-to-left'></i>
              </div>
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column box_content_menu_top" style={{ marginLeft: '250px' }}>
          {/* Header */}
          <header className="bg-style p-3 d-flex justify-content-between align-items-center ms-md-0 ms-0">
            <h2 className="h5 fw-semibold mb-0">
              {/* Display different header based on route */}
              {isActive('/dctoradmin') && 'Manage Doctor'}
              {isActive('/manageuser') && 'Manage User'}
              {isActive('/bookingadmin') && 'Booking'}
              {!isActive('/dctoradmin') && !isActive('/manageuser') && !isActive('/bookingadmin') && 'Dashboard'}
            </h2>
            <div className="d-flex align-items-center">
              <span className="text-muted">
                {user ? (
                  <div>
                    <p><strong>Account:</strong> {user.email}</p>
                  </div>
                ) : (
                  <p>Loading...</p>
                )}
              </span>
            </div>
          </header>
          {error && <div className="alert alert-danger m-3">{error}</div>}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal_header">
                <h5 className="modal_title">Confirm Logout</h5>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to logout?</p>
              </div>
              <div className="modal_footer">
                <button type="button" className="btn btn-secondary" onClick={cancelLogout}>
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleLogout}
                  disabled={loading}
                >
                  {loading ? 'Logging out...' : 'Yes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;