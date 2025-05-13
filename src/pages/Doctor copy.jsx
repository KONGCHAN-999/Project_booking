import React, { useState, useEffect } from 'react';
import '../css/doctor.css';
import NavBar from '../components/NavBar';
import { db } from '../data/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import profile01 from '../../public/images/profile01.avif'

function Doctor() {

    const [getDataDoctor, setGetDataDoctor] = useState([]);
    const doctorData = collection(db, 'doctors');

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

    return (
        <>
            <NavBar />
            <div>
                <div className="doctor_container">
                    <h3 className="doctor-title">Our Doctors</h3>
                    <div className="doctor-list">
                        {getDataDoctor.map(doctor => (
                            <div className="doctor-card" key={doctor.id}>
                                <img src={profile01} alt="loading..." />
                                <div className="doctor-info">
                                    <h2 className="doctor-name">{doctor.name}</h2>
                                    <p className="doctor-specialty">{doctor.specialty}</p>
                                    <p className="doctor-contact">
                                        Phone: {doctor.contact}
                                        <br />
                                        Email: {doctor.email}
                                    </p>
                                    <Link to="/home" className="doctor-button">Book Appointment</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Doctor;
