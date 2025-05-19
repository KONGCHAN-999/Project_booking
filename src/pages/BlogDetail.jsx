import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { db } from '../data/firebase';
import '../css/Blog.css'
import doctor_doing from '../../public/images/doctor_doing.webp'
import NavBar from '../components/NavBar';

export default function BlogDetail() {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // This extracts the blogId parameter from the URL
    const { blogId } = useParams();

    useEffect(() => {
        // Function to fetch the specific blog from Firebase
        const fetchBlog = async () => {
            try {
                const blogRef = doc(db, 'blogs', blogId);
                const blogSnap = await getDoc(blogRef);

                if (blogSnap.exists()) {
                    setBlog({
                        id: blogSnap.id,
                        ...blogSnap.data()
                    });
                } else {
                    setError("Blog post not found");
                }
            } catch (err) {
                console.error("Error fetching blog:", err);
                setError("Failed to load blog. Please try again later.");
            }
        };

        fetchBlog();
    }, [blogId]);

    // if (loading) {
    //     return (
    //         <div className="blog-detail-container">
    //             <div className="loading-indicator">
    //                 <div className="spinner"></div>
    //                 <p>Loading blog post...</p>
    //             </div>
    //         </div>
    //     );
    // }

    if (error) {
        return (
            <div className="blog-detail-container">
                <div className="error-message">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <Link to="/blogs" className="back-button">Back to Blogs</Link>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="blog-detail-container">
                <div className="not-found">
                    <h2>Blog Not Found</h2>
                    <p>The blog post you're looking for doesn't exist or has been removed.</p>
                    <Link to="/blogs" className="back-button">Back to Blogs</Link>
                </div>
            </div>
        );
    }

    // Format the date
    const formattedDate = blog.date?.toDate ?
        new Date(blog.date.toDate()).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        }) :
        new Date(blog.date || Date.now()).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

    return (
        <>
            <NavBar />
            <div className="blog-detail-container">
                <Link to="/blogs" className="back-button">
                    <span className="back-arrow">←</span> Back to Blogs
                </Link>

                <article className="blog-detail">
                    <div className="blog-header">
                        <h1 className="blog-title">{blog.title}</h1>

                        <div className="blog-meta">
                            <div className="blog-author">
                                <span className="profile-initial">
                                    {blog.author.charAt(0).toUpperCase()}
                                </span>
                                <span>{blog.author}</span>
                            </div>
                            <div className="blog-date">
                                <span className="date-icon">📅</span>
                                {formattedDate}
                            </div>
                            {blog.category && (
                                <div className="blog-category">
                                    <span className="category-badge">{blog.category}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="blog-image-container">
                        <img
                            src={doctor_doing}
                            alt={blog.title}
                            className="blog-detail-image"
                        />
                    </div>

                    <div className="blog-content">
                        {/* If blog content is HTML */}
                        {blog.contentHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: blog.contentHtml }} />
                        ) : (
                            /* If blog content is plain text */
                            <div>
                                {blog.content?.split('\n').map((paragraph, idx) => (
                                    <p key={idx}>{paragraph}</p>
                                ))}
                            </div>
                        )}
                    </div>

                    {blog.tags && blog.tags.length > 0 && (
                        <div className="blog-tags">
                            {blog.tags.map((tag, index) => (
                                <span key={index} className="tag">{tag}</span>
                            ))}
                        </div>
                    )}

                    <div className="share-section">
                        <h3>Share this article</h3>
                        <div className="social-share">
                            <button className="share-button facebook">Share on Facebook</button>
                            <button className="share-button twitter">Share on Twitter</button>
                            <button className="share-button linkedin">Share on LinkedIn</button>
                        </div>
                    </div>

                    <div className="related-posts">
                        <h3>Related Articles</h3>
                        <p>Coming soon</p>
                    </div>
                </article>
            </div>
        </>
    );
}