import { Container, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../AdminComponents/AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState, useEffect } from 'react';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import '../AdminComponents/AdminTableList.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Header from '../components/Header';
import Alert from 'react-bootstrap/Alert';

const modalStyles = {
    modal: {
        maxWidth: '800px',
        margin: '1.75rem auto',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
    },
    fullWidth: {
        gridColumn: '1 / -1',
    },
    formSection: {
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
    },
    modalHeader: {
        background: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        padding: '1rem 1.5rem',
    },
    modalFooter: {
        background: '#f8f9fa',
        borderTop: '2px solid #dee2e6',
        padding: '1rem 1.5rem',
    },
    deleteModal: {
        textAlign: 'center',
        padding: '2rem',
    },
    deleteIcon: {
        fontSize: '3rem',
        color: '#dc3545',
        marginBottom: '1rem',
    }
};

const AdminCreateTeacherAccount = () => {
    const [show, setShow] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [advisorySections, setAdvisorySections] = useState([]);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: 'teacher',
        sections: [],
        subjects: [],
        semesters: [],
        advisorySection: '' // Add this field
    });
    
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);

        // First, modify your fetchData function to get available advisory sections
const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
        const [usersRes, sectionsRes, subjectsRes, semestersRes, advisorySectionsRes] = await Promise.all([
            fetch('/api/admin/users?role=teacher', { 
                headers: { Authorization: `Bearer ${token}` } 
            }),
            fetch('/api/admin/getSections', { 
                headers: { Authorization: `Bearer ${token}` } 
            }),
            fetch('/api/admin/getSubjects', { 
                headers: { Authorization: `Bearer ${token}` } 
            }),
            fetch('/api/admin/getSemesters', { 
                headers: { Authorization: `Bearer ${token}` } 
            }),
            // New fetch for advisory sections (sections without advisers)
            fetch('/api/admin/advisorySections', { 
                headers: { Authorization: `Bearer ${token}` } 
            })
        ]);

        const [users, sections, subjects, semesters, advisorySections] = await Promise.all([
            usersRes.json(),
            sectionsRes.json(),
            subjectsRes.json(),
            semestersRes.json(),
            advisorySectionsRes.json()
        ]);

        setUsers(users);
        setSections(sections);
        setSubjects(subjects);
        setSemesters(semesters);
        setAdvisorySections(advisorySections); // Set available advisory sections
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

    useEffect(() => {
        fetchData();
    }, []);

    const handleClose = () => {
        setShow(false);
        setSelectedUserId(null);
    };

    const handleShow = (userId) => {
        setSelectedUserId(userId);
        setShow(true);
    };

    const deleteHandler = async (userId) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        console.log("Deleting user with ID:", userId);
        try {
            const response = await fetch(`/api/admin/users/${userId}`, { // Corrected endpoint
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Ensure token is included
                }
            });
    
            console.log("Response status:", response.status);
            if (response.ok) {
                setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
                handleClose(); // Close the modal after deletion
            } else {
                const json = await response.json();
                console.error('Error response:', json);
                setError(json.message);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Failed to delete user');
        }
    };

    // Update handleAddUser to properly handle the advisory section
const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!newUser.username || !newUser.password || !newUser.sections.length || 
        !newUser.subjects.length || !newUser.semesters.length) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
    }

    const userData = {
        username: newUser.username.trim(),
        password: newUser.password,
        role: 'teacher',
        sections: newUser.sections.map(id => id.toString()),
        subjects: newUser.subjects.map(id => id.toString()),
        semesters: newUser.semesters.map(id => id.toString()),
        advisorySection: newUser.advisorySection || null // Make it explicitly null if not selected
    };

    console.log('Sending user data:', userData); // Debug log

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/addUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create teacher account');
        }

        setUsers(prevUsers => [...prevUsers, data.data]);
        setShowAddModal(false);
        resetForm();
        alert('Teacher account created successfully');
        
    } catch (error) {
        console.error('Error creating teacher:', error);
        setError(error.message || 'Failed to create teacher account');
    } finally {
        setLoading(false);
    }
};
    
    // Add a reset form function
    const resetForm = () => {
        setNewUser({
            username: '',
            password: '',
            role: 'teacher',
            sections: [],
            subjects: [],
            semesters: [],
            advisorySection: ''
        });
    };

    const handleEditShow = async (user) => {
        console.log('Editing user:', user); // Debug log
        
        // Set the initial values
        const initialEditUser = {
            id: user._id,
            sections: user.sections?.map(section => section._id) || [],
            subjects: user.subjects?.map(subject => subject._id) || [],
            semesters: user.semesters?.map(semester => semester._id) || [],
            advisorySection: user.advisorySection?._id || ''
        };
        
        setEditUser(initialEditUser);
        
        // Trigger subject filtering immediately
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/subjects/filter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    sections: initialEditUser.sections,
                    semesters: initialEditUser.semesters
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch filtered subjects');
            }
    
            const filteredSubjects = await response.json();
            setAvailableSubjects(filteredSubjects || []);
        } catch (error) {
            console.error('Error fetching filtered subjects:', error);
            setAvailableSubjects([]);
        }
        
        setEditModalShow(true);
    };

// Update the editUser state
const [editUser, setEditUser] = useState({
    id: '',
    sections: [],
    subjects: [],
    semesters: [],
    advisorySection: ''
});
    
    const handleEditClose = () => {
        setEditModalShow(false);
        setEditUser({
            id: '',
            sections: [],
            subjects: [],
            semesters: [] // Changed
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
            // Format the data to match what the backend expects
            const userData = {
                sections: editUser.sections,
                subjects: editUser.subjects,
                semesters: editUser.semesters,
                advisorySection: editUser.advisorySection
            };
    
            console.log('Sending update request:', userData);
    
            const response = await fetch(`/api/admin/users/${editUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(userData),
            });
    
            const data = await response.json();
            console.log('Response data:', data);
    
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update user');
            }
    
            // Show success message
            alert('Teacher updated successfully');
            
            handleEditClose();
            await fetchData(); // Refresh the data
        } catch (error) {
            setError(error.message);
            console.error('Update error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

// Update useEffect for filtering subjects
useEffect(() => {
    const filterSubjects = async () => {
        const activeUser = showAddModal ? newUser : editUser;
        
        // Check if both arrays exist and have length
        if (activeUser?.sections?.length > 0 && activeUser?.semesters?.length > 0) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/admin/subjects/filter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        sections: activeUser.sections,
                        semesters: activeUser.semesters
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch filtered subjects');
                }

                const filteredSubjects = await response.json();
                console.log('Filtered subjects:', filteredSubjects); // Debug log
                setAvailableSubjects(filteredSubjects || []); // Ensure it's always an array
            } catch (error) {
                console.error('Error filtering subjects:', error);
                setAvailableSubjects([]);
            }
        } else {
            setAvailableSubjects([]);
        }
    };

    filterSubjects();
}, [
    newUser.sections, 
    newUser.semesters,
    editUser.sections,
    editUser.semesters,
    showAddModal
]); // Add editUser dependencies

    return (
        <>
        <Header/>
            <AdminSidebar />
            <div className='d-flex'>
                <main className="main-content flex-grow-1">
                    <Container fluid>
                        <Card>
                            <Card.Body>
                                <Card.Title>Teacher Accounts</Card.Title>
                                
                                {/* Search and Add User controls */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <InputGroup style={{ width: "300px" }}>
                                        <InputGroup.Text>
                                            <FaSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                    <button 
        className='btn btn-outline-success mx-2 px-10'
        style={{ width: '150px' }} // Fixed width of 150 pixels
        size="sm" 
        onClick={() => setShowAddModal(true)}
    >
        Add Users
    </button>
                                </div>

                                {/* Teachers Table */}
                                <Table responsive hover className='custom-table text-center align-middle'>
    <thead>
        <tr>
            <th>Teacher ID</th>
            <th>Sections Handled</th>
            <th>Advisory Section</th>
            <th>Subjects</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {filteredUsers
            .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
            .map(user => (
                <tr key={user._id}>
                    <td>
                        <div className="d-flex align-items-center justify-content-center">
                            {user.username}
                        </div>
                    </td>
                    <td>
                        <div className="subjects-list">
                            {user.sections?.map((section) => (
                                <span key={section._id} className="subject-pill">
                                    {section.name}
                                </span>
                            )) || 'No Sections'}
                        </div>
                    </td>
                    <td>
                        <span className="text-muted">
                            {user.advisorySection?.name || 'Not Assigned'}
                        </span>
                    </td>
                    <td>
                        <div className="subjects-list">
                            {user.subjects?.map((subject) => (
                                <span key={subject._id} className="subject-pill">
                                    {subject.name}
                                </span>
                            )) || 'No Subjects'}
                        </div>
                    </td>
                    <td>
                        <div className="action-buttons">
                            <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="btn-action"
                                onClick={() => handleEditShow(user)}
                            >
                                <i className="bi bi-pencil-square me-1"></i>
                                Edit
                            </Button>
                            <Button 
                                variant="outline-danger" 
                                size="sm" 
                                className="btn-action"
                                onClick={() => handleShow(user._id)}
                            >
                                <i className="bi bi-trash me-1"></i>
                                Delete
                            </Button>
                        </div>
                    </td>
                </tr>
            ))}
    </tbody>
</Table>

                                {/* Pagination controls */}
                                <div className="d-flex justify-content-between mt-3">
                                    <Button
                                        variant="outline-primary" 
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange('prev')}
                                    >
                                        Previous
                                    </Button>
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange('next')}
                                    >
                                        Next
                                    </Button>
                                </div>

                                {/* Add Modal */}
<Modal 
    show={showAddModal} 
    onHide={() => setShowAddModal(false)}
    size="lg"
    centered
>
    <Modal.Header closeButton style={modalStyles.modalHeader}>
        <Modal.Title>
            <i className="bi bi-person-plus-fill me-2"></i>
            Add New Teacher Account
        </Modal.Title>
    </Modal.Header>
    <Modal.Body className="p-4">
        <Form onSubmit={handleAddUser}>
           {/* Basic Information Section */}
<div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
    <h6 className="mb-3">Basic Information</h6>
    <div style={modalStyles.formGrid}>
        <Form.Group>
            <Form.Label>Username*</Form.Label>
            <Form.Control
                type="text"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                required
                style={{ borderColor: '#ced4da' }} // Override default validation styling
            />
        </Form.Group>

        <Form.Group>
            <Form.Label>Password*</Form.Label>
            <Form.Control
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
                style={{ borderColor: '#ced4da' }} // Override default validation styling
            />
        </Form.Group>
    </div>
</div>

{/* Teaching Assignment Section */}
<div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
    <h6 className="mb-3">Teaching Assignment</h6>
    <div style={modalStyles.formGrid}>
        <Form.Group>
            <Form.Label>Sections*</Form.Label>
            <Form.Select
                multiple
                value={newUser.sections}
                onChange={(e) => setNewUser({
                    ...newUser, 
                    sections: Array.from(e.target.selectedOptions, option => option.value)
                })}
                required
                style={{ borderColor: '#ced4da' }} // Override default validation styling
            >
                {sections.map((section) => (
                    <option key={section._id} value={section._id}>
                        {section.name} - {section.yearLevel.name}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>

        <Form.Group>
            <Form.Label>Advisory Section</Form.Label>
            <Form.Select
                value={newUser.advisorySection}
                onChange={(e) => setNewUser({...newUser, advisorySection: e.target.value})}
                style={{ borderColor: '#ced4da' }} // Override default validation styling
            >
                <option value="">Select Advisory Section (Optional)</option>
                {advisorySections.map((section) => (
                    <option key={section._id} value={section._id}>
                        {section.name}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>

        <Form.Group>
            <Form.Label>Semesters*</Form.Label>
            <Form.Select
                multiple
                value={newUser.semesters}
                onChange={(e) => setNewUser({
                    ...newUser, 
                    semesters: Array.from(e.target.selectedOptions, option => option.value)
                })}
                required
                style={{ borderColor: '#ced4da' }} // Override default validation styling
            >
                {semesters.map((semester) => (
                    <option key={semester._id} value={semester._id}>
                        {semester.name} - {semester.strand.name} - {semester.yearLevel.name}
                    </option>
                ))}
            </Form.Select>
        </Form.Group>
    </div>
</div>

            {/* Subjects Section */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Subject Assignment</h6>
                <Form.Group>
                    <Form.Label>Subjects*</Form.Label>
                    {availableSubjects.length > 0 ? (
                        <Form.Select
                            multiple
                            value={newUser.subjects}
                            onChange={(e) => setNewUser({
                                ...newUser, 
                                subjects: Array.from(e.target.selectedOptions, option => option.value)
                            })}
                            required
                            isInvalid={!newUser.subjects.length}
                            disabled={!newUser.sections.length || !newUser.semesters.length}
                        >
                            {availableSubjects.map((subject) => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.name}
                                </option>
                            ))}
                        </Form.Select>
                    ) : (
                        <p className="text-muted">
                            Please select sections and semesters to view available subjects
                        </p>
                    )}
                    <Form.Control.Feedback type="invalid">
                        Please select at least one subject
                    </Form.Control.Feedback>
                </Form.Group>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </Form>
    </Modal.Body>
    <Modal.Footer style={modalStyles.modalFooter}>
        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            <i className="bi bi-x-circle me-2"></i>Cancel
        </Button>
        <Button 
            variant="primary" 
            onClick={handleAddUser}
            disabled={loading}
        >
            {loading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Adding...
                </>
            ) : (
                <>
                    <i className="bi bi-check-circle me-2"></i>
                    Add Teacher
                </>
            )}
        </Button>
    </Modal.Footer>
</Modal>

{/* Edit Modal */}
<Modal 
    show={editModalShow} 
    onHide={handleEditClose}
    size="lg"
    centered
>
    <Modal.Header closeButton style={modalStyles.modalHeader}>
        <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Edit Teacher Account
        </Modal.Title>
    </Modal.Header>
    <Modal.Body className="p-4">
        <Form onSubmit={handleEditSubmit}>
            {/* Teaching Assignment Section */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Teaching Assignment</h6>
                <div style={modalStyles.formGrid}>
                <Form.Group>
    <Form.Label>Sections*</Form.Label>
    <Form.Select
        multiple
        value={editUser.sections}
        onChange={(e) => setEditUser({
            ...editUser,
            sections: Array.from(e.target.selectedOptions, option => option.value)
        })}
        required
    >
        {sections.map((section) => (
            <option key={section._id} value={section._id}>
                {section.name} - {section.yearLevel.name || 'No Year Level'}
            </option>
        ))}
    </Form.Select>
</Form.Group>

                    <Form.Group>
                        <Form.Label>Advisory Section</Form.Label>
                        <Form.Select
                            value={editUser.advisorySection}
                            onChange={(e) => setEditUser({
                                ...editUser,
                                advisorySection: e.target.value
                            })}
                        >
                            <option value="">Select Advisory Section (Optional)</option>
                            {advisorySections.map((section) => (
                                <option key={section._id} value={section._id}>
                                    {section.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Semesters*</Form.Label>
                        <Form.Select
                            multiple
                            value={editUser.semesters}
                            onChange={(e) => setEditUser({
                                ...editUser,
                                semesters: Array.from(e.target.selectedOptions, option => option.value)
                            })}
                            required
                        >
                            {semesters.map((semester) => (
                                <option key={semester._id} value={semester._id}>
                                    {semester.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>

            {/* Subjects Section */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Subject Assignment</h6>
                <Form.Group>
                    <Form.Label>Subjects*</Form.Label>
                    {loading ? (
                        <p>Loading subjects...</p>
                    ) : availableSubjects.length > 0 ? (
                        <Form.Select
                            multiple
                            value={editUser.subjects}
                            onChange={(e) => setEditUser({
                                ...editUser,
                                subjects: Array.from(e.target.selectedOptions, option => option.value)
                            })}
                            required
                        >
                            {availableSubjects.map((subject) => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.name}
                                </option>
                            ))}
                        </Form.Select>
                    ) : (
                        <p className="text-muted">
                            {editUser.sections.length === 0 || editUser.semesters.length === 0 
                                ? "Please select sections and semesters to view available subjects"
                                : "No subjects available for the selected sections and semesters"}
                        </p>
                    )}
                </Form.Group>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </Form>
    </Modal.Body>
    <Modal.Footer style={modalStyles.modalFooter}>
        <Button variant="secondary" onClick={handleEditClose}>
            <i className="bi bi-x-circle me-2"></i>Cancel
        </Button>
        <Button 
            variant="primary" 
            onClick={handleEditSubmit}
            disabled={loading}
        >
            {loading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Updating...
                </>
            ) : (
                <>
                    <i className="bi bi-check-circle me-2"></i>
                    Update Teacher
                </>
            )}
        </Button>
    </Modal.Footer>
</Modal>

{/* Delete Modal */}
<Modal show={show} onHide={handleClose} centered>
    <Modal.Body style={modalStyles.deleteModal}>
        <div style={modalStyles.deleteIcon}>
            <i className="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h4 className="mb-3">Confirm Deletion</h4>
        <p className="text-muted">
            Are you sure you want to delete this teacher account? This action cannot be undone.
        </p>
    </Modal.Body>
    <Modal.Footer style={modalStyles.modalFooter} className="justify-content-center">
        <Button variant="secondary" onClick={handleClose}>
            <i className="bi bi-x-circle me-2"></i>Cancel
        </Button>
        <Button variant="danger" onClick={() => deleteHandler(selectedUserId)}>
            <i className="bi bi-trash me-2"></i>Delete
        </Button>
    </Modal.Footer>
</Modal>
                            </Card.Body>
                        </Card>
                    </Container>
                </main>
            </div>
        </>
    );
}

export default AdminCreateTeacherAccount;