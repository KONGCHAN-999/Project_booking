import '../css/Booking.css';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../data/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import NavBar from '../components/NavBar';

function Booking() {
  const [bookings, setBookings] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setError('');
    });
    return () => unsubscribe();
  }, []);

  // Fetch user-specific bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return; // Skip if user is not logged in

      try {
        setLoading(true);
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(bookingsQuery);
        const bookingsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Delete a booking
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
      setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== id));
    } catch (error) {
      console.error('Error deleting booking:', error);
      setError('Failed to delete booking. Please try again.');
    }
  };

  // Open delete confirmation popup
  const openDeletePopup = (e, id) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedBookingId(id);
    setShowDeletePopup(true);
  };

  // Open booking detail popup
  const openDetailPopup = (booking) => {
    setSelectedBooking(booking);
    setShowDetailPopup(true);
  };

  // Close popups
  const closePopups = () => {
    setShowDeletePopup(false);
    setShowDetailPopup(false);
    setSelectedBooking(null);
    setSelectedBookingId(null);
  };

  // Confirm delete action
  const confirmDelete = () => {
    if (selectedBookingId) {
      handleDelete(selectedBookingId);
    }
    closePopups();
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setError('Please log in to view your bookings.');
    }
  }, [loading, user]);

  // Helper function to get status class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <>
      <NavBar />
      <div className="box_result_list">
        <h3 className="box_result_list_h3">My Booking</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="loading-indicator">Loading bookings...</div>
        ) : (
          <>
            {!user ? (
              <div className="not-logged-in">
                <p>Please log in to view your bookings.</p>
              </div>
            ) : (
              <>
                {bookings.length === 0 ? (
                  <p>No bookings found.</p>
                ) : (
                  <ul className="box-list-result">
                    {bookings.map((booking) => (
                      <li key={booking.id} onClick={() => openDetailPopup(booking)}>
                        <p><strong>Name:</strong> {booking.name}</p>
                        <p><strong>Phone:</strong> {booking.phone}</p>
                        <p><strong>Date:</strong> {booking.date}</p>
                        <p><strong>Status:</strong> <span className={getStatusClass(booking.status)}>{booking.status}</span></p>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </>
        )}

        {showDeletePopup && (
          <div className="popup_delete">
            <div className="popup_delete_content">
              <h3>Are you sure you want to delete this booking?</h3>
              <div className="popup_buttons">
                <button className="button btn_delete" onClick={confirmDelete}>
                  Yes
                </button>
                <button className="button btn_cancel" onClick={closePopups}>
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetailPopup && selectedBooking && (
          <div className="popup_details">
            <div className="popup_details_content">
              <div className="popup_details_header">
                <h3>Booking Details</h3>
                <button className="popup_close" onClick={closePopups}>
                  <i className="bx bx-x"></i>
                </button>
              </div>

              <div className="booking_detail_item">
                <div className="booking_detail_label">Name:</div>
                <div className="booking_detail_value">{selectedBooking.name}</div>
              </div>

              <div className="booking_detail_item">
                <div className="booking_detail_label">Phone:</div>
                <div className="booking_detail_value">{selectedBooking.phone}</div>
              </div>

              <div className="booking_detail_item">
                <div className="booking_detail_label">Doctor:</div>
                <div className="booking_detail_value">{selectedBooking.doctor}</div>
              </div>

              <div className="booking_detail_item">
                <div className="booking_detail_label">Date:</div>
                <div className="booking_detail_value">{selectedBooking.date}</div>
              </div>

              <div className="booking_detail_item">
                <div className="booking_detail_label">Time:</div>
                <div className="booking_detail_value">{selectedBooking.time}</div>
              </div>

              <div className="booking_detail_item">
                <div className="booking_detail_label">Case:</div>
                <div className="booking_detail_value">{selectedBooking.case}</div>
              </div>

              <div className="booking_detail_item">
                <div className="booking_detail_label">Description:</div>
                <div className="booking_detail_value">{selectedBooking.description}</div>
              </div>

              <div className="booking_detail_item">
                <div className="booking_detail_label">Status:</div>
                <div className="booking_detail_value">
                  <span className={`booking_status ${getStatusClass(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
              <div className="booking_actions">
                {bookings.map((booking) => (
                  <div className="booking_delete_item" key={booking.id}>
                    <button className="button delete_booking" onClick={(e) => openDeletePopup(e, booking.id)}>
                      <i className="bx bxs-trash-alt"></i>
                      Delete booking
                    </button>
                  </div>
                ))}
                <button className="button btn_cancel" onClick={closePopups}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Booking;