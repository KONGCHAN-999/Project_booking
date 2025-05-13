import React, { useState, useEffect } from 'react';
import { db } from '../data/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Dashboard from './Dashboard';
import './css/Blogs.css';

function Blogs() {
    const [blogs, setBlogs] = useState({
        title: '',
        author: '',
        category: '',
        publishDate: '',
        content: '',
        tags: '',
        isPublished: false,
        imageUrl: ''
    });
    const [getBlogData, setGetBlogData] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedBlogId, setSelectedBlogId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showDetailPopup, setShowDetailPopup] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const blogData = collection(db, 'blogs');

    // Format date to YYYY-MM-DD for input fields
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Format date for display
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'Not provided';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Fetch blog data from Firestore
    useEffect(() => {
        const fetchBlogData = async () => {
            setIsLoading(true);
            try {
                const querySnapshot = await getDocs(blogData);
                const newBlogData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setGetBlogData(newBlogData);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlogData();
    }, [blogData]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
        setBlogs({
            title: '',
            author: '',
            category: '',
            publishDate: '',
            content: '',
            tags: '',
            isPublished: false,
            imageUrl: ''
        }); // Clear form
        setEditId(null); // Reset edit mode
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!blogs.title || !blogs.author) {
            alert('Title and author are required!');
            return;
        }

        try {
            const blogToSave = {
                ...blogs,
                publishDate: blogs.publishDate || new Date().toISOString().split('T')[0],
                tags: blogs.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            };

            if (editId) {
                // Update existing blog
                const blogRef = doc(db, 'blogs', editId);
                await updateDoc(blogRef, blogToSave);
                alert('Blog updated successfully!');
                setGetBlogData((prev) =>
                    prev.map((blog) =>
                        blog.id === editId ? { id: editId, ...blogToSave } : blog
                    )
                );
            } else {
                // Add new blog
                const newDoc = await addDoc(blogData, blogToSave);
                alert('Blog added successfully!');
                setGetBlogData((prev) => [
                    ...prev,
                    { id: newDoc.id, ...blogToSave },
                ]);
            }
            toggleSidebar();
        } catch (error) {
            console.error('Error saving blog:', error);
            alert('Error saving blog: ' + error.message);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setBlogs((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const openPopup = (id) => {
        setSelectedBlogId(id);
        setShowPopup(true);
    };

    const closePopup = () => {
        setSelectedBlogId(null);
        setShowPopup(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteDoc(doc(db, 'blogs', id));
            setGetBlogData((prev) => prev.filter((blog) => blog.id !== id));
            alert('Blog deleted successfully!');
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Error deleting blog: ' + error.message);
        }
    };

    const confirmDelete = () => {
        if (selectedBlogId) {
            handleDelete(selectedBlogId);
        }
        closePopup();
    };

    const handleUpdate = (blog) => {
        setEditId(blog.id);
        setBlogs({
            title: blog.title || '',
            author: blog.author || '',
            category: blog.category || '',
            publishDate: formatDateForInput(blog.publishDate) || '',
            content: blog.content || '',
            tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : '',
            isPublished: blog.isPublished || false,
            imageUrl: blog.imageUrl || ''
        });
        setIsSidebarOpen(true);
    };

    const handleDetail = (blog) => {
        setSelectedBlog(blog);
        setShowDetailPopup(true);
    };

    const closeDetailPopup = () => {
        setSelectedBlog(null);
        setShowDetailPopup(false);
    };

    // Truncate text for table display
    const truncateText = (text, maxLength = 30) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div>
            <Dashboard />
            <div className="container_admin">
                <div className="box-list-blogs">
                    <div className="blog-list-header">
                        <h1>Blog Management</h1>
                        <button className="add-blog-button" onClick={toggleSidebar}>
                            <i className="bx bx-plus"></i>
                            Add Blog
                        </button>
                    </div>

                    <table className="blog-list-table">
                        <thead>
                            <tr>
                                <th scope="col">Title</th>
                                <th scope="col">Author</th>
                                <th scope="col">Category</th>
                                <th scope="col">Date</th>
                                <th scope="col">Status</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getBlogData.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-blogs-message">No blogs found. Add your first blog!</td>
                                </tr>
                            ) : (
                                getBlogData.map((blog) => (
                                    <tr key={blog.id}>
                                        <td>{truncateText(blog.title)}</td>
                                        <td>{blog.author}</td>
                                        <td>{blog.category || 'Uncategorized'}</td>
                                        <td>{formatDateForDisplay(blog.publishDate)}</td>
                                        <td>
                                            <span className={`status-badge ${blog.isPublished ? 'published' : 'draft'}`}>
                                                {blog.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="edit-button"
                                                    onClick={() => handleUpdate(blog)}
                                                    aria-label={`Edit ${blog.title}`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() => openPopup(blog.id)}
                                                    aria-label={`Delete ${blog.title}`}
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    className="view-button"
                                                    onClick={() => handleDetail(blog)}
                                                    aria-label={`View ${blog.title}`}
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Delete Confirmation Popup */}
                {showPopup && (
                    <div className="popup_delete">
                        <div className="popup_delete_content">
                            <h3>Are you sure you want to delete this blog post?</h3>
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

                {/* Blog Detail Popup */}
                {showDetailPopup && selectedBlog && (
                    <div className="popup_detail">
                        <div className="popup_detail_content">
                            <div className="detail_header">
                                <h2>Blog Details</h2>
                                <button className="button_close" onClick={closeDetailPopup}>
                                    <i className="bx bx-x"></i>
                                </button>
                            </div>
                            <div className="detail_body">
                                {selectedBlog.imageUrl && (
                                    <div className="detail_item blog-image">
                                        <img src={selectedBlog.imageUrl} alt={selectedBlog.title} />
                                    </div>
                                )}
                                <div className="detail_item blog-title">
                                    <h3>Title</h3>
                                    <p>{selectedBlog.title || 'Untitled'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Author</h3>
                                    <p>{selectedBlog.author || 'Anonymous'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Category</h3>
                                    <p>{selectedBlog.category || 'Uncategorized'}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Publish Date</h3>
                                    <p>{formatDateForDisplay(selectedBlog.publishDate)}</p>
                                </div>
                                <div className="detail_item">
                                    <h3>Status</h3>
                                    <p>
                                        <span className={`status-badge ${selectedBlog.isPublished ? 'published' : 'draft'}`}>
                                            {selectedBlog.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </p>
                                </div>
                                <div className="detail_item">
                                    <h3>Tags</h3>
                                    <div className="blog-tags">
                                        {Array.isArray(selectedBlog.tags) && selectedBlog.tags.length > 0 ? (
                                            selectedBlog.tags.map((tag, index) => (
                                                <span key={index} className="tag-badge">{tag}</span>
                                            ))
                                        ) : (
                                            <p>No tags</p>
                                        )}
                                    </div>
                                </div>
                                <div className="detail_item full-width">
                                    <h3>Content</h3>
                                    <div className="blog-content">
                                        {selectedBlog.content || 'No content available'}
                                    </div>
                                </div>
                            </div>
                            <div className="detail_footer">
                                <button className="btn_edit" onClick={() => {
                                    closeDetailPopup();
                                    handleUpdate(selectedBlog);
                                }}>
                                    Edit this blog
                                </button>
                                <button className="btn_close" onClick={closeDetailPopup}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add/Edit Blog Sidebar */}
                {isSidebarOpen && (
                    <div className="box_form_addBlog">
                        <div className="box_group_title">
                            <div></div>
                            <h1>{editId ? 'Edit Blog' : 'Add New Blog'}</h1>
                            <button className="button_close" onClick={toggleSidebar}>
                                <i className="bx bx-x"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="form_addBlog">
                            <div className="form-group">
                                <label htmlFor="title">Title:</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={blogs.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="author">Author:</label>
                                <input
                                    type="text"
                                    id="author"
                                    name="author"
                                    value={blogs.author}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">Category:</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={blogs.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a category</option>
                                    <option value="Health">Health</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Wellness">Wellness</option>
                                    <option value="Nutrition">Nutrition</option>
                                    <option value="Fitness">Fitness</option>
                                    <option value="Mental Health">Mental Health</option>
                                    <option value="News">News</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="publishDate">Publish Date:</label>
                                <input
                                    type="date"
                                    id="publishDate"
                                    name="publishDate"
                                    value={blogs.publishDate}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="imageUrl">Image URL:</label>
                                <input
                                    type="url"
                                    id="imageUrl"
                                    name="imageUrl"
                                    value={blogs.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="tags">Tags (comma separated):</label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    value={blogs.tags}
                                    onChange={handleChange}
                                    placeholder="health, wellness, medicine"
                                />
                            </div>
                            <div className="form-group checkbox-group">
                                <label htmlFor="isPublished">
                                    <input
                                        type="checkbox"
                                        id="isPublished"
                                        name="isPublished"
                                        checked={blogs.isPublished}
                                        onChange={handleChange}
                                    />
                                    Publish immediately
                                </label>
                            </div>
                            <div className="form-group">
                                <label htmlFor="content">Content:</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={blogs.content}
                                    onChange={handleChange}
                                    rows="10"
                                    required
                                ></textarea>
                            </div>
                            <button className="btn_submit_blog" type="submit">
                                {editId ? 'Update Blog' : 'Add Blog'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Blogs;