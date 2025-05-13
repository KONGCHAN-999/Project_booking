import React, { useState, useEffect } from 'react';
import '../css/doctor.css';
import NavBar from '../components/NavBar';
import { db } from '../data/firebase';
import { collection, getDocs } from 'firebase/firestore';
import profile01 from '../../public/images/profile01.avif';
import Footer from '../components/Footer';

function Doctor() {
    const [getDataDoctor, setGetDataDoctor] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const doctorData = collection(db, 'doctors');

    // Fetch doctors from Firestore
    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const query = await getDocs(doctorData);
                const newDoctorData = query.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setGetDataDoctor(newDoctorData);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            }
        };
        fetchDoctorData();
    }, []);

    // Open popup with doctor details
    const openPopup = (doctor) => {
        setSelectedDoctor(doctor);
    };

    // Close popup
    const closePopup = () => {
        setSelectedDoctor(null);
    };

    return (
        <>
            <NavBar />
            <div className="container_box_ourDoctor">
                <div className="doctors-badge">Our Doctors</div>

                <div className="section-header">
                    <h2 className="section-title">Get Service From Our Quality Doctors</h2>
                </div>

                <div className="doctors-grid">
                    {getDataDoctor.length > 0 ? (
                        getDataDoctor.map((doctor) => (
                            <div key={doctor.id} className="doctor-card">
                                <img
                                    src={doctor.imageUrl || profile01}
                                    alt={doctor.fullName}
                                    className="doctor-image"
                                />
                                <div className="doctor-info">
                                    <div className="doctor-specialty">{doctor.specialty || 'Specialty'}</div>
                                    <h3 className="doctor-name">{doctor.fullName || 'Unknown'}</h3>
                                    <div className="doctor-actions">
                                        <a href="/form" className="book-btn">
                                            Book Appointment
                                            <span className="arrow-icon">→</span>
                                        </a>
                                        <button
                                            className="details-btn"
                                            onClick={() => openPopup(doctor)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No doctors available.</p>
                    )}
                </div>

                {/* Popup for Doctor Details */}
                {selectedDoctor && (
                    <div className="doctor-popup">
                        <div className="popup-content">
                            <button className="close-btn" onClick={closePopup}>
                                ×
                            </button>
                            <img
                                src={selectedDoctor.imageUrl || profile01}
                                alt={selectedDoctor.fullName}
                                className="popup-doctor-image"
                            />
                            <h2>{selectedDoctor.fullName}</h2>
                            <p><strong>Specialty:</strong> {selectedDoctor.specialty || 'N/A'}</p>
                            <p><strong>Experience:</strong> {selectedDoctor.experience || 'N/A'}</p>
                            <p><strong>Education:</strong> {selectedDoctor.education || 'N/A'}</p>
                            <p><strong>Email:</strong> {selectedDoctor.email || 'N/A'}</p>
                            <a href="/form" className="book-btn popup-book-btn">
                                Book Appointment
                                <span className="arrow-icon">→</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}

export default Doctor;