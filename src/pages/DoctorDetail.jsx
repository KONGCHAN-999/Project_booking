import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../data/firebase';
import { doc, getDoc } from 'firebase/firestore';
import NavBar from '../components/NavBar';
import '../css/doctorDetail.css';
import profile01 from '../../public/images/profile01.avif';

function DoctorDetail() {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');

    useEffect(() => {
        const fetchDoctorDetail = async () => {
            try {
                const docRef = doc(db, 'doctors', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setDoctor({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log('No such doctor!');
                }
            } catch (error) {
                console.error('Error fetching doctor details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorDetail();
    }, [id]);

    if (loading) {
        return (
            <>
                <NavBar />
                <div className="doctor-detail-container">
                    <div className="loading-spinner">Loading...</div>
                </div>
            </>
        );
    }

    if (!doctor) {
        return (
            <>
                <NavBar />
                <div className="doctor-detail-container">
                    <div className="doctor-not-found">
                        <h2>Doctor not found</h2>
                        <Link to="/doctor" className="back-to-doctors">
                            Back to Doctors List
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    // Sample education data - in a real app, this would come from the database
    const education = [
        { degree: "MD", institution: "Harvard Medical School", year: "2010-2014" },
        { degree: "Residency", institution: "Johns Hopkins Hospital", year: "2014-2018" },
        { degree: "Fellowship", institution: "Mayo Clinic", year: "2018-2020" }
    ];

    // Sample experience data
    const experience = [
        { position: "Senior Specialist", hospital: "Memorial Hospital", duration: "2020-Present" },
        { position: "Attending Physician", hospital: "City Medical Center", duration: "2018-2020" }
    ];

    // Sample schedule data
    const schedule = {
        monday: { morning: "09:00 - 12:00", evening: "16:00 - 19:00" },
        tuesday: { morning: "09:00 - 12:00", evening: "16:00 - 19:00" },
        wednesday: { morning: "09:00 - 12:00", evening: "16:00 - 19:00" },
        thursday: { morning: "09:00 - 12:00", evening: "16:00 - 19:00" },
        friday: { morning: "09:00 - 12:00", evening: "No Session" },
        saturday: { morning: "10:00 - 13:00", evening: "No Session" },
        sunday: { morning: "No Session", evening: "No Session" }
    };

    return (
        <>
            <NavBar />
            <div className="doctor-detail-container">
                <div className="doctor-detail-header">
                    <Link to="/doctor" className="back-button">
                        ← Back to Doctors
                    </Link>
                    <h1>Doctor Profile</h1>
                </div>

                <div className="doctor-detail-content">
                    <div className="doctor-detail-sidebar">
                        <div className="doctor-profile-card">
                            <img
                                src={doctor.profileImage || profile01}
                                alt={doctor.name || "Doctor Profile"}
                                className="doctor-detail-image"
                            />
                            <h2 className="doctor-detail-name">{doctor.name || "Dr. David Martin"}</h2>
                            <p className="doctor-detail-specialty">{doctor.specialty || "Ophthalmologist"}</p>

                            <div className="doctor-detail-rating">
                                <span className="star-icon">★</span>
                                <span className="rating-score">{doctor.rating || "4.8"}</span>
                                <span className="rating-count">({doctor.reviewCount || "112"} Reviews)</span>
                            </div>

                            <div className="doctor-contact-info">
                                <div className="contact-item">
                                    <span className="contact-label">Email:</span>
                                    <span className="contact-value">{doctor.email || "doctor@example.com"}</span>
                                </div>
                                <div className="contact-item">
                                    <span className="contact-label">Phone:</span>
                                    <span className="contact-value">{doctor.phone || "(123) 456-7890"}</span>
                                </div>
                            </div>

                            <Link to={`/form?doctorId=${doctor.id}`} className="book-appointment-btn">
                                Book Appointment
                            </Link>
                        </div>
                    </div>

                    <div className="doctor-detail-main">
                        <div className="doctor-tabs">
                            <button
                                className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
                                onClick={() => setActiveTab('about')}
                            >
                                About Doctor
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'education' ? 'active' : ''}`}
                                onClick={() => setActiveTab('education')}
                            >
                                Education
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'experience' ? 'active' : ''}`}
                                onClick={() => setActiveTab('experience')}
                            >
                                Experience
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
                                onClick={() => setActiveTab('schedule')}
                            >
                                Schedule
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                                onClick={() => setActiveTab('reviews')}
                            >
                                Reviews
                            </button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'about' && (
                                <div className="about-tab">
                                    <h3>About Dr. {doctor.name?.split(' ')[1] || "Martin"}</h3>
                                    <p>{doctor.about || "Dr. David Martin is a highly skilled ophthalmologist with over 10 years of experience in treating various eye conditions. He specializes in cataract surgery, glaucoma management, and refractive surgery. Dr. Martin is known for his patient-centered approach and dedication to providing the highest quality of care."}</p>

                                    <div className="specializations">
                                        <h4>Specializations</h4>
                                        <ul>
                                            {doctor.specializations ?
                                                doctor.specializations.map((spec, index) => (
                                                    <li key={index}>{spec}</li>
                                                )) :
                                                ["Cataract Surgery", "Glaucoma Management", "Refractive Surgery", "Corneal Disease Treatment"].map((spec, index) => (
                                                    <li key={index}>{spec}</li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'education' && (
                                <div className="education-tab">
                                    <h3>Education & Qualifications</h3>
                                    <div className="education-timeline">
                                        {(doctor.education || education).map((edu, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <h4>{edu.degree}</h4>
                                                    <p className="timeline-institution">{edu.institution}</p>
                                                    <p className="timeline-year">{edu.year}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'experience' && (
                                <div className="experience-tab">
                                    <h3>Work Experience</h3>
                                    <div className="experience-timeline">
                                        {(doctor.experience || experience).map((exp, index) => (
                                            <div key={index} className="timeline-item">
                                                <div className="timeline-marker"></div>
                                                <div className="timeline-content">
                                                    <h4>{exp.position}</h4>
                                                    <p className="timeline-institution">{exp.hospital}</p>
                                                    <p className="timeline-year">{exp.duration}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'schedule' && (
                                <div className="schedule-tab">
                                    <h3>Weekly Schedule</h3>
                                    <div className="schedule-table">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Day</th>
                                                    <th>Morning Session</th>
                                                    <th>Evening Session</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(doctor.schedule || schedule).map(([day, sessions]) => (
                                                    <tr key={day}>
                                                        <td className="day-column">{day.charAt(0).toUpperCase() + day.slice(1)}</td>
                                                        <td>{sessions.morning}</td>
                                                        <td>{sessions.evening}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="schedule-note">
                                        <p>Note: Appointments must be booked in advance. Please arrive 15 minutes before your scheduled appointment time.</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="reviews-tab">
                                    <h3>Patient Reviews</h3>
                                    <div className="reviews-summary">
                                        <div className="average-rating">
                                            <div className="rating-number">{doctor.rating || "4.8"}</div>
                                            <div className="rating-stars">★★★★★</div>
                                            <div className="rating-count">Based on {doctor.reviewCount || "112"} reviews</div>
                                        </div>
                                    </div>

                                    <div className="reviews-list">
                                        {(doctor.reviews || [
                                            {
                                                name: "John D.",
                                                rating: 5,
                                                date: "April 15, 2025",
                                                comment: "Dr. Martin is extremely knowledgeable and took the time to explain my condition thoroughly. Highly recommend!"
                                            },
                                            {
                                                name: "Sarah P.",
                                                rating: 4,
                                                date: "March 22, 2025",
                                                comment: "Very good experience. The doctor was professional and the staff was friendly. Wait time was reasonable."
                                            },
                                            {
                                                name: "Michael T.",
                                                rating: 5,
                                                date: "February 10, 2025",
                                                comment: "I've been seeing Dr. Martin for years. He's always attentive and provides excellent care. The new facility is also very nice."
                                            }
                                        ]).map((review, index) => (
                                            <div key={index} className="review-item">
                                                <div className="review-header">
                                                    <div className="reviewer-name">{review.name}</div>
                                                    <div className="review-date">{review.date}</div>
                                                </div>
                                                <div className="review-rating">
                                                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                                                </div>
                                                <div className="review-comment">{review.comment}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default DoctorDetail;