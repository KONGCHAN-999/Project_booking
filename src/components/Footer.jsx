import React from 'react'
import '../css/footer.css'

function Footer() {
    return (
        <>
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-section clinic-info">
                        <h3>Clinic OMG</h3>
                        <p>123 Health Street, Wellness City, 12345</p>
                        <p>Phone: (123) 456-7890</p>
                        <p>Email: info@clinicname.com</p>
                    </div>

                    <div className="footer-section quick-links">
                        <h3>Quick Links</h3>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Services</a></li>
                            <li><a href="/doctors">Our Doctors</a></li>
                            <li><a href="/booking">my booking</a></li>
                            <li><a href="/form">Book Appointment</a></li>
                        </ul>
                    </div>

                    <div className="footer-section social-media">
                        <h3>Follow Us</h3>
                        <div className="social-icons">
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer">
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Clinic OMG. All Rights Reserved.</p>
                </div>
            </footer>
        </>
    )
}

export default Footer
