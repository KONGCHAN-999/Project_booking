import React, { useState, useEffect } from 'react';
import '../css/Form.css';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import { db, auth } from '../data/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

function Form() {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        doctor: '',
        date: '',
        time: '',
        case: '',
        description: '',
    });
    const [doctors, setDoctors] = useState([]);
    const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const navigate = useNavigate();

    // Time slots from 9 AM to 8 PM
    const allTimeSlots = [
        '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00', '19:00', '20:00'
    ];

    // Fetch doctors from Firestore
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
                const doctorsList = doctorsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    fullName: doc.data().fullName || doc.data().name, // Using fullName, fallback to name if not available
                }));
                setDoctors(doctorsList);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };
        fetchDoctors();
    }, []);

    // Update booked time slots when doctor or date changes
    useEffect(() => {
        if (form.doctor && form.date) {
            updateBookedTimeSlots();
        } else {
            setBookedTimeSlots([]);
        }
    }, [form.doctor, form.date]);

    // Handle closing success alert
    const handleCloseSuccessAlert = () => {
        setShowSuccessAlert(false);
    };

    // Convert time string (HH:mm) to minutes since midnight
    const timeToMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Update booked time slots based on doctor and date selection
    const updateBookedTimeSlots = async () => {
        try {
            // Get all bookings for the selected doctor and date
            const bookingsSnapshot = await getDocs(
                query(
                    collection(db, 'bookings'),
                    where('doctor', '==', form.doctor),
                    where('date', '==', form.date),
                    where('status', '==', 'active')
                )
            );

            // Extract booked time slots
            const bookedSlots = [];
            bookingsSnapshot.forEach((doc) => {
                bookedSlots.push(doc.data().time);
            });

            setBookedTimeSlots(bookedSlots);

            // Clear time selection if previously selected time is now booked or in the past
            if ((form.time && isTimeSlotBooked(form.time)) ||
                (form.time && isTimeSlotPassed(form.time))) {
                setForm(prev => ({ ...prev, time: '' }));
            }
        } catch (error) {
            console.error('Error updating time slots:', error);
        }
    };

    // Check if a time slot is booked
    const isTimeSlotBooked = (timeSlot) => {
        if (!bookedTimeSlots.length) return false;

        const slotStart = timeToMinutes(timeSlot);
        const slotEnd = slotStart + 60; // 60-minute duration

        // Check if this time slot overlaps with any booked slot
        for (const bookedSlot of bookedTimeSlots) {
            const bookedStart = timeToMinutes(bookedSlot);
            const bookedEnd = bookedStart + 60; // 60-minute duration

            // Check for any overlap
            if (
                (slotStart >= bookedStart && slotStart < bookedEnd) || // slot starts during booking
                (slotEnd > bookedStart && slotEnd <= bookedEnd) || // slot ends during booking
                (slotStart <= bookedStart && slotEnd >= bookedEnd) // slot contains booking
            ) {
                return true;
            }
        }
        return false;
    };

    // Check if a time slot is in the past for today
    const isTimeSlotPassed = (timeSlot) => {
        if (form.date) {
            const today = new Date();
            const selectedDate = new Date(form.date);

            // Only check for today's date
            if (
                selectedDate.getDate() === today.getDate() &&
                selectedDate.getMonth() === today.getMonth() &&
                selectedDate.getFullYear() === today.getFullYear()
            ) {
                const currentHour = today.getHours();
                const slotHour = parseInt(timeSlot.split(':')[0], 10);

                // If the time slot is before or equal to current hour, it's passed
                return slotHour <= currentHour;
            }
        }
        return false;
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true); // Start loading

        // Validate inputs
        if (!form.name || !form.phone || !form.doctor || !form.date || !form.time || !form.case) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        // Ensure user is logged in
        const user = auth.currentUser;
        if (!user) {
            setError('You must be logged in to make a booking.');
            setLoading(false);
            return;
        }

        try {
            // Add booking to Firestore
            await addDoc(collection(db, 'bookings'), {
                userId: user.uid,
                email: user.email,
                name: form.name,
                phone: form.phone,
                doctor: form.doctor,
                date: form.date,
                time: form.time,
                case: form.case,
                description: form.description,
                status: 'active',
                createdAt: new Date(),
            });

            setSuccess('Booking successfully created!');
            setShowSuccessAlert(true);
            
            // Reset form
            setForm({
                name: '',
                phone: '',
                doctor: '',
                date: '',
                time: '',
                case: '',
                description: '',
            });
            
            // Delay navigation to show success message
            setTimeout(() => {
                navigate('/booking');
            }, 1500);
            
        } catch (error) {
            setError('Error adding booking. Please try again.');
            console.error('Error adding booking:', error);
        } finally {
            setLoading(false); // Stop loading regardless of outcome
        }
    };

    // Get current date in YYYY-MM-DD format for min date attribute
    const getCurrentDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Added function
    const formatTimeDisplay = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return (
        <>
            <NavBar />
            <div className="container_group_home">
                <div className="form-container">
                    <h2>Booking Form</h2>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    {/* Success Snackbar Alert */}
                    <Snackbar 
                        open={showSuccessAlert} 
                        autoHideDuration={6000} 
                        onClose={handleCloseSuccessAlert}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <Alert 
                            onClose={handleCloseSuccessAlert} 
                            severity="success" 
                            sx={{ width: '100%' }}
                        >
                            {success}
                        </Alert>
                    </Snackbar>
                    
                    <form className="form-content" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="label-form">Full Name:</label>
                            <input
                                className="input-form"
                                type="text"
                                name="name"
                                placeholder="Enter your full name..."
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-form">Phone Number:</label>
                            <input
                                className="input-form"
                                type="text"
                                name="phone"
                                placeholder="Enter your phone..."
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-form">Doctor:</label>
                            <select
                                name="doctor"
                                className="select-doctor"
                                value={form.doctor}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select a doctor</option>
                                {doctors.map((doctor) => (
                                    <option key={doctor.id} value={doctor.fullName}>
                                        {doctor.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="label-form">Date:</label>
                            <input
                                className="input-form"
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                min={getCurrentDate()}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-form">Time:</label>
                            <select
                                name="time"
                                className="select-doctor"
                                value={form.time}
                                onChange={handleChange}
                                disabled={!form.doctor || !form.date}
                                required
                            >
                                <option value="">Select a time slot</option>
                                {allTimeSlots.map((timeSlot) => (
                                    <option
                                        key={timeSlot}
                                        value={timeSlot}
                                        disabled={isTimeSlotBooked(timeSlot) || isTimeSlotPassed(timeSlot)}
                                    >
                                        {formatTimeDisplay(timeSlot)}
                                        {isTimeSlotBooked(timeSlot) ? ' (Booked)' : ''}
                                        {!isTimeSlotBooked(timeSlot) && isTimeSlotPassed(timeSlot) ? ' (Passed)' : ''}
                                    </option>
                                ))}
                                {allTimeSlots.length > 0 && bookedTimeSlots.length === allTimeSlots.length && form.doctor && form.date && (
                                    <option value="" disabled>
                                        All time slots are booked for this doctor on this date
                                    </option>
                                )}
                            </select>
                            {!form.doctor && <p className="text-muted">Please select a doctor first</p>}
                            {!form.date && form.doctor && <p className="text-muted">Please select a date</p>}
                        </div>
                        <div className="form-group">
                            <label className="label-form">Case:</label>
                            <input
                                className="input-form"
                                type="text"
                                name="case"
                                placeholder="Enter case..."
                                value={form.case}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="label-form">Description:</label>
                            <textarea
                                className="input-form"
                                name="description"
                                placeholder="Description..."
                                value={form.description}
                                onChange={handleChange}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="submit_form" 
                            disabled={loading}
                        >
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CircularProgress size={24} style={{ color: 'white', marginRight: '10px' }} />
                                    Saving...
                                </div>
                            ) : 'Save'}
                        </button>
                    </form>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default Form;