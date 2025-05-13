import React, { useState, useEffect } from 'react';
import { db } from '../data/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Dashboard from './Dashboard';
import './css/Doctor.css';
import profile01 from '../../public/images/profile01.avif'

function Doctor() {
    const [doctors, setDoctors] = useState({
        fullName: '',
        age: '',
        specialty: '',
        contact: '',
        email: '',
        education: '',
        experience: '',
        certifications: ''
    });
    const [getDataDoctor, setGetDataDoctor] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const doctorData = collection(db, 'doctors');

    // Fetch doctor data from Firestore
    useEffect(() => {
        const fetchDoctorData = async () => {
            setIsLoading(true);
            try {
                const querySnapshot = await getDocs(doctorData);
                const newDoctorData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setGetDataDoctor(newDoctorData);
            } catch (error) {
                console.error('Error fetching doctors:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDoctorData();
    }, [doctorData]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        setDoctors({
            fullName: '',
            age: '',
            specialty: '',
            contact: '',
            email: '',
            education: '',
            experience: '',
            certifications: ''
        }); // Clear form
        setEditId(null); // Reset edit mode
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!doctors.fullName || !doctors.email) {
            alert('Full name and email are required!');
            return;
        }

        try {
            if (editId) {
                // Update existing doctor
                const doctorRef = doc(db, 'doctors', editId);
                await updateDoc(doctorRef, {
                    fullName: doctors.fullName,
                    age: doctors.age,
                    specialty: doctors.specialty,
                    contact: doctors.contact,
                    email: doctors.email,
                    education: doctors.education,
                    experience: doctors.experience,
                    certifications: doctors.certifications
                });
                alert('Doctor updated successfully!');
                setGetDataDoctor((prev) =>
                    prev.map((doc) =>
                        doc.id === editId ? { id: editId, ...doctors } : doc
                    )
                );
            } else {
                // Add new doctor
                const newDoc = await addDoc(doctorData, { ...doctors });
                alert('Doctor added successfully!');
                setGetDataDoctor((prev) => [
                    ...prev,
                    { id: newDoc.id, ...doctors },
                ]);
            }
            toggleSidebar();
        } catch (error) {
            console.error('Error saving doctor:', error);
            alert('Error saving doctor: ' + error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctors((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const openPopup = (id) => {
        setSelectedDoctorId(id);
        setShowPopup(true);
    };

    const closePopup = () => {
        setSelectedDoctorId(null);
        setShowPopup(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'doctors', id));
            setGetDataDoctor((prev) => prev.filter((doctor) => doctor.id !== id));
            alert('Doctor deleted successfully!');
        } catch (error) {
            console.error('Error deleting doctor:', error);
            alert('Error deleting doctor: ' + error.message);
        }
    };

    const confirmDelete = () => {
        if (selectedDoctorId) {
            handleDelete(selectedDoctorId);
        }
        closePopup();
    };

    const handleUpdate = (doctor) => {
        setEditId(doctor.id);
        setDoctors({
            fullName: doctor.fullName || '',
            age: doctor.age || '',
            specialty: doctor.specialty || '',
            contact: doctor.contact || '',
            email: doctor.email || '',
            education: doctor.education || '',
            experience: doctor.experience || '',
            certifications: doctor.certifications || ''
        });
        setIsSidebarOpen(true);
    };

    const handleDetail = (doctor) => {
        setSelectedDoctor(doctor);
        setShowDetailPopup(true);
    };

    const closeDetailPopup = () => {
        setSelectedDoctor(null);
        setShowDetailPopup(false);
    };

    return (
        <div>
            <Dashboard />
            <div className="container_admin">
                <div className="box-list-users">
                    <div className="user-list-header">
                        <h1>Doctor Management</h1>
                        <button className="add-user-button" onClick={toggleSidebar}>
                            <i className="bx bx-plus"></i>
                            Add Doctor
                        </button>
                    </div>

                    <table className="user-list-table">
                        <thead>
                            <tr>
                                <th scope="col">Full Name</th>
                                <th scope="col">Age</th>
                                <th scope="col">Specialty</th>
                                <th scope="col">Contact</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                getDataDoctor.map((doctor) => (
                                    <tr key={doctor.id}>
                                        <td>{doctor.fullName}</td>
                                        <td>{doctor.age}</td>
                                        <td>{doctor.specialty}</td>
                                        <td>{doctor.contact}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleUpdate(doctor)}
                                                    aria-label={`Edit ${doctor.fullName}`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => openPopup(doctor.id)}
                                                    aria-label={`Delete ${doctor.fullName}`}
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    className="edit-view"
                                                    onClick={() => handleDetail(doctor)}
                                                    aria-label={`View ${doctor.fullName}`}
                                                >
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Delete Confirmation Popup */}
                {showPopup && (
                    <div className="popup_delete">
                        <div className="popup_delete_content">
                            <h3>Are you sure you want to delete this Doctor?</h3>
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

                {/* Doctor Detail Popup */}
                {showDetailPopup && selectedDoctor && (
                    <div className="popup_detail">
                        <div className="popup_detail_content">
                            <div className="detail_header">
                                <h2>Doctor Details</h2>
                                <button className="button_close" onClick={closeDetailPopup}>
                                    <i className="bx bx-x"></i>
                                </button>
                            </div>
                            <div className="detail_body">
                                <div className="detail_item">
                                    <h3>Profile</h3>
                                    <img src={profile01} alt="Not provided" />
                                </div>
                                <div className="detail_item">
                                    <h3>Full Name</h3>
                                    <p>{selectedDoctor.fullName || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Age</h3>
                                    <p>{selectedDoctor.age || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Specialty</h3>
                                    <p>{selectedDoctor.specialty || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Contact</h3>
                                    <p>{selectedDoctor.contact || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Email</h3>
                                    <p>{selectedDoctor.email || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Education</h3>
                                    <p className="detail_text">{selectedDoctor.education || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Experience</h3>
                                    <p className="detail_text">{selectedDoctor.experience || 'Not provided'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Certifications</h3>
                                    <p className="detail_text">{selectedDoctor.certifications || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add/Edit Doctor Sidebar */}
                {isSidebarOpen && (
                    <div className="box_form_addDoctor">
                        <div className="box_group_title">
                            <div></div>
                            <h1>{editId ? 'Edit Doctor' : 'Add New Doctor'}</h1>
                            <button className="button_close" onClick={toggleSidebar}>
                                <i className="bx bx-x"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="form_addDoctor">
                            <div className="form-group">
                                <label htmlFor="fullName">Full Name:</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={doctors.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="age">Age:</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={doctors.age}
                                    onChange={handleChange}
                                    min="18"
                                    max="100"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="specialty">Specialty:</label>
                                <input
                                    type="text"
                                    id="specialty"
                                    name="specialty"
                                    value={doctors.specialty}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="contact">Contact:</label>
                                <input
                                    type="text"
                                    id="contact"
                                    name="contact"
                                    value={doctors.contact}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={doctors.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="education">Education:</label>
                                <textarea
                                    id="education"
                                    name="education"
                                    value={doctors.education}
                                    onChange={handleChange}
                                    rows="5"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="experience">Experience:</label>
                                <textarea
                                    id="experience"
                                    name="experience"
                                    value={doctors.experience}
                                    onChange={handleChange}
                                    rows="5"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label htmlFor="certifications">Certifications:</label>
                                <textarea
                                    id="certifications"
                                    name="certifications"
                                    value={doctors.certifications}
                                    onChange={handleChange}
                                    rows="5"
                                ></textarea>
                            </div>
                            <button className="btn_submit_doctor" type="submit">
                                {editId ? 'Update Doctor' : 'Add Doctor'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Doctor;