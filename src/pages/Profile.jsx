import React, { useState, useEffect } from 'react';
import '../css/profile.css';
import { auth, db } from '../data/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import NavBar from '../components/NavBar';

function Profile() {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Fetch user data from Firestore
                const userDoc = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(userDoc);
                if (docSnap.exists()) {
                    const userData = { ...docSnap.data(), email: currentUser.email, uid: currentUser.uid };
                    setUser(userData);
                    setFormData(userData);
                } else {
                    console.log('No such document!');
                    setUser({ email: currentUser.email, uid: currentUser.uid });
                    setFormData({ email: currentUser.email, uid: currentUser.uid });
                }
            } else {
                setUser(null); // No user is logged in
                setFormData({});
            }
        });

        return () => unsubscribe();
    }, []);

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel edit, reset form data to original user data
            setFormData(user);
        }
        setIsEditing(!isEditing);
        setMessage({ text: '', type: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update user document in Firestore
            const userRef = doc(db, 'users', user.uid);

            // Only update fields that exist in formData (excluding email and uid)
            const updateData = { ...formData };
            delete updateData.email; // Cannot edit email here
            delete updateData.uid; // Don't update UID

            await updateDoc(userRef, updateData);

            // Update local user state
            setUser({ ...formData });
            setIsEditing(false);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });

            // Clear message after 3 seconds
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ text: 'Error updating profile. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <NavBar />

            <div className='box_container_profile'>
                {user && (
                    <div className="box_content_profile">
                        <div className="box_title_profile">
                            <h4>Account</h4>
                            <div
                                className={`edit_profile ${isEditing ? 'editing' : ''}`}
                                onClick={handleEditToggle}
                            >
                                <i className={`bx ${isEditing ? 'bx-x' : 'bx-pencil'}`}></i>
                                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                            </div>
                        </div>

                        <div className="image_profile">
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
                            </div>
                        </div>

                        {message.text && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="edit_form_profile">
                                <div className="form_group">
                                    <label>Full name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="form_group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter your age"
                                    />
                                </div>

                                <div className="form_group">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>

                                <div className="form_group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter your phone number"
                                    />
                                </div>

                                <div className="form_group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="disabled"
                                    />
                                    <small>Email cannot be changed</small>
                                </div>

                                <div className="form_group">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter your address"
                                    ></textarea>
                                </div>

                                <div className="form_actions">
                                    <button
                                        type="button"
                                        className="cancel_btn"
                                        onClick={handleEditToggle}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="save_btn"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="content_profile">
                                <p><strong>Full name:</strong> {user.fullName || 'Not set'}</p>
                                <p><strong>Age:</strong> {user.age || 'Not set'}</p>
                                <p><strong>Gender:</strong> {user.gender || 'Not set'}</p>
                                <p><strong>Phone:</strong> {user.phone || 'Not set'}</p>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Address:</strong> {user.address || 'Not set'}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;