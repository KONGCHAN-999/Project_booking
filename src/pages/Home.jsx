import React, { useState, useEffect, useRef } from 'react';
import '../css/Home.css';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import about from '../../public/images/about-img.jpg'
import d3 from '../../public/images/d3.jpg'
import profile01 from '../../public/images/profile01.avif'
import doctor_doing from '../../public/images/doctor_doing.webp'

import { db } from '../data/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../css/ServicesSection.css';

function Home() {

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

    const carouselRef = useRef(null);

    useEffect(() => {
        // Ensure initial position is set
        if (carouselRef.current) {
            carouselRef.current.style.transform = 'translateX(0)';
        }
    }, []);

    const scrollCarousel = (direction) => {
        const carousel = carouselRef.current;
        const cardWidth = carousel.querySelector('.card_services').offsetWidth + 10; // Card width + margin
        const visibleCards = 3; // Number of cards visible at a time
        const scrollAmount = cardWidth * visibleCards; // Scroll by the width of 3 cards
        const totalCards = carousel.children.length;
        const maxScroll = -(carousel.scrollWidth - carousel.parentElement.offsetWidth);

        let currentScroll = parseFloat(carousel.style.transform?.replace('translateX(', '').replace('px)', '') || 0);

        if (direction === 'left') {
            currentScroll += scrollAmount;
            // Loop to the end if at the start
            if (currentScroll > 0) {
                currentScroll = maxScroll;
            }
        } else if (direction === 'right') {
            currentScroll -= scrollAmount;
            // Loop to the start if at the end
            if (currentScroll < maxScroll) {
                currentScroll = 0;
            }
        }

        carousel.style.transform = `translateX(${currentScroll}px)`;
    };

    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const blogsCollection = collection(db, 'blogs');
                const blogSnapshot = await getDocs(blogsCollection);
                const blogList = blogSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setBlogs(blogList);
            } catch (err) {
                console.error("Error fetching blogs:", err);
                setError("Failed to load blogs. Please try again later.");
            }
        };

        fetchBlogs();
    }, []);

    if (error) {
        return (
            <div className="container_box_blog">
                <section className="blogs-section">
                    <div className="blogs-badge">Blogs</div>
                    <h3 className="section-subtitle">Error</h3>
                    <p className="text-red-500">{error}</p>
                </section>
            </div>
        );
    }

    return (
        <>
            <NavBar />
            <div className="container_group_home">
                <div className="font-sans">
                    <section className="box_section_container">
                        <div className="box_content_left">
                            <h1 className="title_head">
                                Best Health Care <span className='serviceStyle'>Services</span> Available
                            </h1>
                            <p className="txt_description">
                                Experience top-tier healthcare and tailored treatment for your well-being. Trust in our expertise to keep you healthy and vibrant.
                            </p>
                            <Link to='/form' className="btn_head__booking">
                                <span>Book Appointment</span>
                                <i className='bx bx-chevron-right'></i>
                            </Link>

                        </div>

                        <div className="box_content_rigth">
                            <div className="rigth_image">
                                <img src="https://cdn.prod.website-files.com/65c992c37023d69385565acc/65cb03c7c409125210deb105_banner-dr-img.png" alt="" />
                            </div>
                            <div className="absolute_more_doctor animate-bounce">
                                <img src={d3} alt="Doctor" className="w-10 h-10 rounded-full" />
                                <span>200+
                                    <br /><span className='bast_doctor'> Best Doctor</span></span>
                            </div>
                        </div>

                        <div className="bg_style"></div>
                        <div className="bg_style2">
                            <img src="https://cdn.prod.website-files.com/65c992c37023d69385565acc/65cb0b22d5c6859bd68e4761_hero-one-rectangle.png" alt="" />
                        </div>
                        <div className="bg_style3">
                            <img src="https://cdn.prod.website-files.com/65c992c37023d69385565acc/65cb0bea9128b2ae1a18b940_hero-oneround-shape.svg" alt="" />
                        </div>
                    </section>

                    <div className="services_content_box">
                        <div className="title_services">Services</div>
                        <h1>The Best Quality Service You Can Get</h1>

                        <div className="carousel_container">
                            <div className="card_services_box" ref={carouselRef}>
                                <div className="card_services">
                                    <div className="card_icon">
                                        <img
                                            src="https://cdn.prod.website-files.com/65cb4d1ed2f90340ed5047d9/65cb4ff286477ad7e0776295_gynecology.png"
                                            alt="Gynecology Icon"
                                        />
                                    </div>
                                    <h4>Gynecology</h4>
                                    <p>Women's health experts, annual exams, family planning, and gynecological care, prioritizing your well-being.</p>
                                    
                                </div>
                                <div className="card_services">
                                    <div className="card_icon">
                                        <img
                                            src="https://cdn.prod.website-files.com/65cb4d1ed2f90340ed5047d9/65cb4f91c4f9e33c53b0c65a_pediatrics.png"
                                            alt="Pediatrics Icon"
                                        />
                                    </div>
                                    <h4>Pediatrics</h4>
                                    <p>Complete care for children, from check-ups to treatments, delivered with compassion and expertise.</p>
                                    
                                </div>
                                <div className="card_services">
                                    <div className="card_icon">
                                        <img
                                            src="https://cdn.prod.website-files.com/65cb4d1ed2f90340ed5047d9/65cb4f26838d762de834b7ab_ophthalmology.png"
                                            alt="Ophthalmology Icon"
                                        />
                                    </div>
                                    <h4>Ophthalmology</h4>
                                    <p>In order to keep your vision healthy, our ophthalmologists provide eye exams and surgeries.</p>
                                    
                                </div>
                                <div className="card_services">
                                    <div className="card_icon">
                                        <img
                                            src="https://cdn.prod.website-files.com/65cb4d1ed2f90340ed5047d9/65cb4ed491d92075f406ae9b_neurology.png"
                                            alt="Neurology Icon"
                                        />
                                    </div>
                                    <h4>Neurology</h4>
                                    <p>Specialized care for brain and nerve disorders, ensuring expert diagnosis and compassionate treatment.</p>
                                    
                                </div>
                            </div>
                            <div className="carousel_controls">
                                <button className="carousel_arrow right_arrow" onClick={() => scrollCarousel('left')}>
                                    →
                                </button>
                                <button className="carousel_arrow left_arrow" onClick={() => scrollCarousel('right')}>
                                    ←
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ABOUT US CONTENT */}
                    <div className="container_aboutUs_box">
                        <div className="shape-pink"></div>
                        <div className="shape-blue"></div>

                        <div className="about-badge">About Us</div>

                        <div className="hero-section">
                            <div className="hero-content">
                                <h1>Stay Healthy With 100% Treatment</h1>
                                <p className="description">
                                    At MedCare, our unwavering commitment to health excellence drives our mission. With a dedicated team of medical experts, cutting-edge research, and a passion for compassionate care.
                                </p>

                                <div className="stats-section">
                                    <div className="stat-card">
                                        <div className="stat-number">120K+</div>
                                        <div className="stat-label">Recover Patient</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-number">05+</div>
                                        <div className="stat-label">Years Experience</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-number">105K+</div>
                                        <div className="stat-label">Customer</div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-number">24/7</div>
                                        <div className="stat-label">Service Provided</div>
                                    </div>
                                </div>

                                <a href="#" className="learn-more">Learn More</a>
                            </div>

                            <div className="hero-image">
                                <img src={d3} alt="Medical professional in white coat with stethoscope" className="doctor-main" />
                                <img src={about} alt="Medical team consulting" className="doctor-team" />
                            </div>
                        </div>
                    </div>

                    {/* OUR DOCTOR CONTENT */}

                    <div className="container_box_ourDoctor_a">
                        <div className="doctors-badge">Our Doctors</div>

                        <div className="section-header">
                            <h2 className="section-title">Get Service From Our Quality Doctors</h2>
                            <Link to="/doctor" className="view-all">View All Doctors</Link>
                        </div>

                        <div className="doctors-grid">
                            {getDataDoctor.map((doctor) => (
                                <div className="doctor-card" key={doctor.id}>
                                    <img src={profile01} alt="Dr. David Martin" className="doctor-image" />
                                    <div className="doctor-info" >
                                        <div className="doctor-specialty">{doctor.specialty}</div>
                                        <h3 className="doctor-name">{doctor.fullName}</h3>
                                        <p>{doctor.contact}</p>
                                        <a href="#" className="book-btn">
                                            Book Appointment
                                            <span className="arrow-icon">→</span>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BLOG CONTENT */}
                    <div className="container_box_blog">
                        <section className="blogs-section">
                            <div className="blogs-badge">Blogs</div>

                            <h3 className="section-subtitle">
                                Why Should You Choose Us?
                                <br />
                                Read Our Health Tips
                            </h3>

                            <div className="blogs-grid">
                                {blogs.length > 0 ? (
                                    blogs.slice(0, 3).map((blog) => (
                                        <div className="blog-card" key={blog.id}>
                                            <img
                                                src={doctor_doing}
                                                alt={blog.title}
                                                className="blog-image"
                                            />
                                            <div className="blog-info">
                                                <div className="blog-meta">
                                                    <div className="blog-date">
                                                        <span className="date-icon">📅</span>
                                                        {new Date(blog.date?.toDate?.() || blog.date || Date.now()).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="blog-author">
                                                        <span className="profile-initial">
                                                            {blog.author.charAt(0).toUpperCase()}
                                                        </span>
                                                        {blog.author}
                                                    </div>
                                                </div>
                                                <h3 className="blog-title">{blog.title}</h3>
                                                <a href={`/blog/${blog.id}`} className="learn-more">
                                                    Learn More
                                                    <span className="arrow-icon">→</span>
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center w-full">No blogs available at the moment.</p>
                                )}
                            </div>

                            <a href="/blog" className="view-all">View All Blogs</a>
                        </section>
                    </div>

                </div>
                <a href="#"><div className="scroll-top"></div></a>
                <Footer />
            </div>
        </>
    );
}

export default Home;