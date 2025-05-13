import './css/Booking.css';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../data/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, where, addDoc } from 'firebase/firestore';
import Dashboard from './Dashboard';

function Booking() {
    const [bookings, setBookings] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showPopupFinish, setShowPopupFinish] = useState(false);
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        name: '',
        phone: '',
        doctor: '',
        date: '',
        time: '',
        case: '',
        description: '',
    });
    const [formError, setFormError] = useState('');

    // List of available doctors (example)
    const doctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Lee'];

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
                    bookingsQuery = collection(db, 'bookings');
                } else {
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

    // Handle form input changes
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setBookingForm((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const { name, phone, doctor, date, time, case: caseValue } = bookingForm;

        // Basic validation
        if (!name || !phone || !doctor || !date || !time || !caseValue) {
            setFormError('Please fill in all required fields.');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                setFormError('You must be logged in to create a booking.');
                return;
            }

            // Create new booking
            const newBooking = {
                ...bookingForm,
                status: 'pending',
                userId: user.uid,
                createdAt: new Date().toISOString(),
            };

            const docRef = await addDoc(collection(db, 'bookings'), newBooking);
            setBookings((prev) => [
                ...prev,
                { id: docRef.id, ...newBooking },
            ]);

            // Reset form and close
            setBookingForm({
                name: '',
                phone: '',
                doctor: '',
                date: '',
                time: '',
                case: '',
                description: '',
            });
            setShowBookingForm(false);
            setFormError('');
        } catch (error) {
            console.error('Error creating booking:', error);
            setFormError('Failed to create booking. Please try again.');
        }
    };

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

    // Open booking detail popup
    const openDetailPopup = (booking) => {
        setSelectedBooking(booking);
        setShowDetailPopup(true);
    };

    // Close any popup
    const closePopup = () => {
        setSelectedBookingId(null);
        setSelectedBooking(null);
        setShowPopup(false);
        setShowPopupFinish(false);
        setShowDetailPopup(false);
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

    // Helper function to get status class
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'status-confirmed';
            case 'pending':
                return 'status-pending';
            case 'completed':
                return 'status-completed';
            default:
                return '';
        }
    };
    return (
        <>
            <Dashboard />
            <div className="container_admin">
                <div className="box-list-bookings">
                    <div className="booking-list-header">
                        <h1>
                            {userRole === 'admin' ? 'All Bookings' : 'My Bookings'}
                        </h1>
                        {userRole !== 'admin' && (
                            <button
                                className="add-booking-button"
                                onClick={() => setShowBookingForm(!showBookingForm)}
                                aria-label={showBookingForm ? 'Close booking form' : 'Open booking form'}
                            >
                                <i className="bx bx-plus"></i>
                                {showBookingForm ? 'Cancel' : 'Create Booking'}
                            </button>
                        )}
                    </div>

                    {showBookingForm && userRole !== 'admin' && (
                        <form className="booking_form" onSubmit={handleFormSubmit}>
                            {formError && (
                                <div className="alert alert-danger">
                                    {formError}
                                    <button
                                        type="button"
                                        className="dismiss_error"
                                        onClick={() => setFormError('')}
                                        aria-label="Dismiss error"
                                    >
                                        <i className="bx bx-x"></i>
                                    </button>
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="name">Name:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={bookingForm.name}
                                    onChange={(e) => {
                                        handleFormChange(e);
                                        setFormError('');
                                    }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Phone:</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={bookingForm.phone}
                                    onChange={(e) => {
                                        handleFormChange(e);
                                        setFormError('');
                                    }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="doctor">Doctor:</label>
                                <select
                                    id="doctor"
                                    name="doctor"
                                    value={bookingForm.doctor}
                                    onChange={(e) => {
                                        handleFormChange(e);
                                        setFormError('');
                                    }}
                                    required
                                >
                                    <option value="">Select a doctor</option>
                                    {doctors.map((doc) => (
                                        <option key={doc} value={doc}>{doc}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="date">Date:</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={bookingForm.date}
                                    onChange={(e) => {
                                        handleFormChange(e);
                                        setFormError('');
                                    }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="time">Time:</label>
                                <input
                                    type="time"
                                    id="time"
                                    name="time"
                                    value={bookingForm.time}
                                    onChange={(e) => {
                                        handleFormChange(e);
                                        setFormError('');
                                    }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="case">Case:</label>
                                <input
                                    type="text"
                                    id="case"
                                    name="case"
                                    value={bookingForm.case}
                                    onChange={(e) => {
                                        handleFormChange(e);
                                        setFormError('');
                                    }}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description:</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={bookingForm.description}
                                    onChange={(e) => {
                                        handleFormChange(e);
                                        setFormError('');
                                    }}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn_submit_booking">
                                    Submit Booking
                                </button>
                                <button
                                    type="button"
                                    className="btn_cancel"
                                    onClick={() => setShowBookingForm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {bookings.length === 0 && !showBookingForm ? (
                        <p className="no-bookings-message">No bookings found.</p>
                    ) : (
                        <table className="booking-list-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Doctor</th>
                                    <th>Date & Time</th>
                                    <th>Case</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.id}>
                                        <td>{booking.name}</td>
                                        <td>{booking.doctor}</td>
                                        <td>{booking.date} at {booking.time}</td>
                                        <td>{booking.case}</td>
                                        <td>
                                            <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="view-button"
                                                    onClick={() => openDetailPopup(booking)}
                                                    aria-label="View booking details"
                                                >
                                                    <i className="bx bx-show"></i> View
                                                </button>

                                                {userRole === 'admin' && booking.status !== 'completed' && (
                                                    <button
                                                        className="complete-button"
                                                        onClick={() => openFinishPopup(booking.id)}
                                                        aria-label="Mark booking as finished"
                                                    >
                                                        <i className="bx bx-check"></i> Complete
                                                    </button>
                                                )}

                                                {userRole === 'admin' && (
                                                    <button
                                                        className="delete-button"
                                                        onClick={() => openDeletePopup(booking.id)}
                                                        aria-label="Delete booking"
                                                    >
                                                        <i className="bx bx-trash"></i> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {showPopup && userRole === 'admin' && (
                        <div className="popup_delete">
                            <div className="popup_delete_content">
                                <h3>Are you sure you want to delete this booking?</h3>
                                <div className="popup_buttons">
                                    <button
                                        className="btn_delete"
                                        onClick={confirmDelete}
                                        aria-label="Confirm delete booking"
                                    >
                                        Yes, Delete
                                    </button>
                                    <button
                                        className="btn_cancel"
                                        onClick={closePopup}
                                        aria-label="Cancel delete booking"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showPopupFinish && userRole === 'admin' && (
                        <div className="popup_delete">
                            <div className="popup_delete_content">
                                <h3>Are you sure you want to mark this booking as completed?</h3>
                                <div className="popup_buttons">
                                    <button
                                        className="btn_finish"
                                        onClick={confirmFinish}
                                        aria-label="Confirm finish booking"
                                    >
                                        Yes, Complete
                                    </button>
                                    <button
                                        className="btn_cancel"
                                        onClick={closePopup}
                                        aria-label="Cancel finish booking"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showDetailPopup && selectedBooking && (
                        <div className="popup_detail">
                            <div className="popup_detail_content">
                                <div className="detail_header">
                                    <h2>Booking Details</h2>
                                    <button
                                        className="button_close"
                                        onClick={closePopup}
                                        aria-label="Close details popup"
                                    >
                                        &times;
                                    </button>
                                </div>

                                <div className="detail_body">
                                    <div className="detail_item">
                                        <h3>Name</h3>
                                        <p>{selectedBooking.name}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Phone</h3>
                                        <p>{selectedBooking.phone}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Doctor</h3>
                                        <p>{selectedBooking.doctor}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Date</h3>
                                        <p>{selectedBooking.date}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Time</h3>
                                        <p>{selectedBooking.time}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Case</h3>
                                        <p>{selectedBooking.case}</p>
                                    </div>

                                    <div className="detail_item full-width">
                                        <h3>Description</h3>
                                        <p className="booking-description">{selectedBooking.description}</p>
                                    </div>

                                    <div className="detail_item">
                                        <h3>Status</h3>
                                        <p>
                                            <span className={`status-badge ${selectedBooking.status.toLowerCase()}`}>
                                                {selectedBooking.status}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="detail_footer">
                                    {userRole === 'admin' && selectedBooking.status !== 'completed' && (
                                        <button
                                            className="btn_finish"
                                            onClick={() => {
                                                closePopup();
                                                openFinishPopup(selectedBooking.id);
                                            }}
                                            aria-label="Mark booking as finished"
                                        >
                                            Complete Booking
                                        </button>
                                    )}

                                    {userRole === 'admin' && (
                                        <button
                                            className="btn_delete"
                                            onClick={() => {
                                                closePopup();
                                                openDeletePopup(selectedBooking.id);
                                            }}
                                            aria-label="Delete booking"
                                        >
                                            Delete Booking
                                        </button>
                                    )}

                                    <button
                                        className="btn_close"
                                        onClick={closePopup}
                                        aria-label="Close booking details"
                                    >
                                        Close
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