import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/NavBar.css';
import logo from '../assets/logo.png';
import { auth, db } from '../data/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function NavBar() {
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handlePopupAccount = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        // Fetch user data from Firestore
        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setUser({ ...docSnap.data(), email: currentUser.email, uid: currentUser.uid });
        } else {
          console.log('No such document!');
          setUser({ email: currentUser.email, uid: currentUser.uid });
        }
      } else {
        setUser(null); // No user is logged in
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array since we only want to set up the listener once

  useEffect(() => {
    if (showPopup) {
      const handleClickOutside = (event) => {
        if (!event.target.closest('.popup_account_content')) {
          closePopup();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPopup]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully');
      setShowPopup(false);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-brand">
          <Link to="/" className="title-web">
            <img src={logo} alt="Logo" />
          </Link>
        </div>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/doctor" className="nav-link">Doctor</Link>

          {!loading && (
            <>
              {user ? (
                <>
                  <Link to="/booking" className="nav-link">My Booking</Link>
                  <div className="nav-link account-link" onClick={handlePopupAccount}>
                    <div className="box_loginAccount">
                      <p>Account</p>
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt="Profile"
                          className="profile-thumbnail"
                        />
                      ) : (
                        <span className="profile-initial">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to="/form" className="nav-link nav_login">Appointment</Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">Login</Link>
                  <Link to="/login" className="nav-link nav_login">Appointment</Link>
                </>
              )}
            </>
          )}
        </div>

        {showPopup && (
          <div className="popup_account">
            <div className="popup_account_content">
              {user && (
                <>
                  <div className="user-info">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="profile-image"
                      />
                    ) : (
                      <div className="profile-initial-large">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <p><strong>Email:</strong> {user.email}</p>
                    <Link to="/profile" className="logout-button" onClick={closePopup}>
                      Profile detail
                    </Link>
                  </div>
                  <div className="popup-links">
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;