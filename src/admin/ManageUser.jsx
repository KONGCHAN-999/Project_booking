import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/ManageUser.css';
import Dashboard from './Dashboard';
import { db } from '../data/firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

function ManageUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersCollection = collection(db, 'users');
            const userSnapshot = await getDocs(usersCollection);
            const userList = userSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
            setError(null);
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to load users. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (userId) => {
        setUserToDelete(userId);
        setShowConfirmDialog(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        try {
            await deleteDoc(doc(db, 'users', userToDelete));
            setUsers(users.filter(user => user.id !== userToDelete));
            setShowConfirmDialog(false);
            setUserToDelete(null);
        } catch (err) {
            console.error("Error deleting user:", err);
            setError("Failed to delete user. Please try again.");
        }
    };

    const cancelDelete = () => {
        setShowConfirmDialog(false);
        setUserToDelete(null);
    };

    return (
        <div>
            <Dashboard />
            <div className="container_admin">
                <div className="box-list-users">
                    <div className="user-list-header">
                        <h1>User Management</h1>
                        <Link to="/add-user" className="add-user-button">
                            <i className="bx bx-plus"></i>
                            Add User
                        </Link>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    {loading ? (
                        <div className="loading">Loading users...</div>
                    ) : (
                        <table className="user-list-table">
                            <thead>
                                <tr>
                                    <th>Full Name</th>
                                    <th>Age</th>
                                    <th>Gender</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-users">No users found</td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id}>
                                            <td>{user.fullName || 'N/A'}</td>
                                            <td>{user.age || 'N/A'}</td>
                                            <td>{user.gender || 'N/A'}</td>
                                            <td>{user.phone || 'N/A'}</td>
                                            <td>{user.email || 'N/A'}</td>
                                            <td>{user.address || 'N/A'}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="delete-button"
                                                        onClick={() => handleDeleteClick(user.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showConfirmDialog && (
                <div className="confirmation-dialog">
                    <div className="confirmation-content">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this user?</p>
                        <div className="confirmation-buttons">
                            <button onClick={cancelDelete} className="cancel-button">Cancel</button>
                            <button onClick={confirmDelete} className="confirm-button">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUser;