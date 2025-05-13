import './css/Booking.css';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../data/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import Dashboard from './Dashboard';

function Booking() {
    const [bookings, setBookings] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupFinish, setShowPopupFinish] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    // Fetch user role and bookings
    useEffect(() => {
        const fetchData = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                // Fetch user role from Firestore
                const userDoc = await getDocs(
                    query(collection(db, 'users'), where('__name__', '==', user.uid))
                );
                const role = userDoc.empty ? 'user' : userDoc.docs[0].data().role || 'user';
                setUserRole(role);

                // Fetch bookings based on role
                let bookingsQuery;
                if (role === 'admin') {
                    // Admins see all bookings
                    bookingsQuery = collection(db, 'bookings');
                } else {
                    // Regular users see only their bookings
                    bookingsQuery = query(
                        collection(db, 'bookings'),
                        where('userId', '==', user.uid)
                    );
                }

                const querySnapshot = await getDocs(bookingsQuery);
                const bookingsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setBookings(bookingsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    // Delete a booking
    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'bookings', id));
            setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== id));
        } catch (error) {
            console.error('Error deleting booking:', error);
        }
    };

    // Mark a booking as completed
    const handleFinish = async (id) => {
        try {
            const bookingRef = doc(db, 'bookings', id);
            await updateDoc(bookingRef, { status: 'completed' });
            setBookings((prevBookings) =>
                prevBookings.map((booking) =>
                    booking.id === id ? { ...booking, status: 'completed' } : booking
                )
            );
        } catch (error) {
            console.error('Error finishing booking:', error);
        }
    };

    // Open delete confirmation popup
    const openDeletePopup = (id) => {
        setSelectedBookingId(id);
        setShowPopup(true);
    };

    // Open finish confirmation popup
    const openFinishPopup = (id) => {
        setSelectedBookingId(id);
        setShowPopupFinish(true);
    };

    // Close any popup
    const closePopup = () => {
        setSelectedBookingId(null);
        setShowPopup(false);
        setShowPopupFinish(false);
    };

    // Confirm delete action
    const confirmDelete = () => {
        if (selectedBookingId) {
            handleDelete(selectedBookingId);
        }
        closePopup();
    };

    // Confirm finish action
    const confirmFinish = () => {
        if (selectedBookingId) {
            handleFinish(selectedBookingId);
        }
        closePopup();
    };

    return (
        <>
            <Dashboard />
            <div className="container_admin">
                <div className="box_result_list_admin">
                    <h3 className="box_result_list_h3">
                        {userRole === 'admin' ? 'All Bookings' : 'My Bookings'}
                    </h3>
                    {bookings.length === 0 && (
                        <p>No bookings found.</p>
                    )}
                    <ul className="box-list-result">
                        {bookings.map((booking) => (
                            <li key={booking.id}>
                                <p><strong>Name:</strong> {booking.name}</p>
                                <p><strong>Phone:</strong> {booking.phone}</p>
                                <p><strong>Doctor:</strong> {booking.doctor}</p>
                                <p><strong>Date:</strong> {booking.date}</p>
                                <p><strong>Time:</strong> {booking.time}</p>
                                <p><strong>Case:</strong> {booking.case}</p>
                                <p><strong>Description:</strong> {booking.description}</p>
                                <p><strong>Status:</strong> {booking.status}</p>
                                {userRole === 'admin' && (
                                    <>
                                        <button
                                            className="delete_booking"
                                            onClick={() => openDeletePopup(booking.id)}
                                        >
                                            <i className="bx bxs-trash-alt"></i>
                                        </button>
                                        {booking.status !== 'completed' && (
                                            <button
                                                className="btn-finished"
                                                onClick={() => openFinishPopup(booking.id)}
                                            >
                                                Finished
                                            </button>
                                        )}
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>

                    {showPopup && userRole === 'admin' && (
                        <div className="popup_delete">
                            <div className="popup_delete_content">
                                <h3>Are you sure you want to delete this booking?</h3>
                                <div className="popup_buttons">
                                    <button className="button btn_delete" onClick={confirmDelete}>
                                        Yes
                                    </button>
                                    <button className="button btn_cancel" onClick={closePopup}>
                                        No
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showPopupFinish && userRole === 'admin' && (
                        <div className="popup_finish">
                            <div className="popup_finish_content">
                                <h3>Are you sure you want to mark this booking as finished?</h3>
                                <div className="popup_buttons">
                                    <button className="button btn_finish" onClick={confirmFinish}>
                                        Yes
                                    </button>
                                    <button className="button btn_cancel" onClick={closePopup}>
                                        No
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Booking;