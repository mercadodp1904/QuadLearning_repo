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

    const [editUser, setEditUser] = useState({
        id: '',
        sections: [],
        subjects: [],
        semester: ''
    });

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

    const handleEditShow = (user) => {
        setEditUser({
            id: user._id,
            sections: user.sections?.map(section => section._id).filter(Boolean) || [],
            subjects: user.subjects?.map(subject => subject._id).filter(Boolean) || [],
            semesters: user.semesters?.map(semester => semester._id).filter(Boolean) || [] // Changed
        });
        setEditModalShow(true);
    };
    
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
            // Ensure sections is an array of valid IDs
            const cleanedSections = editUser.sections.filter(id => id && id.trim() !== '');
            
            console.log('Sending update request with data:', {
                assignedSections: cleanedSections,
                assignedSubjects: editUser.subjects,
                semester: editUser.semester
            });
    
            const response = await fetch(`/api/admin/users/${editUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    assignedSections: cleanedSections,
                    assignedSubjects: editUser.subjects,
                    semester: editUser.semester
                }),
            });
    
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update user');
            }
    
            // Refresh the users list after successful update
            const updatedUsersResponse = await fetch('/api/admin/users?role=teacher', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            const updatedUsers = await updatedUsersResponse.json();
            setUsers(updatedUsers);
    
            handleEditClose();
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

// Add null checks when accessing arrays
useEffect(() => {
    const filterSubjects = async () => {
        // Check if both arrays exist and have length
        if (newUser?.sections?.length > 0 && newUser?.semesters?.length > 0) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/admin/subjects/filter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        sections: newUser.sections,
                        semesters: newUser.semesters
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch filtered subjects');
                }

                const filteredSubjects = await response.json();
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
}, [newUser?.sections, newUser?.semesters]); // Add optional chaining here too

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
                                    <Button 
                                        className='btn btn-primary'
                                        onClick={() => setShowAddModal(true)}
                                    >
                                        Add Teacher
                                    </Button>
                                </div>

                                {/* Teachers Table */}
                                <Table responsive hover className="table-striped table-bordered text-center">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Sections</th>
                                        <th>Advisory Section</th>
                                        <th>Subjects</th>
                                        <th>Semesters</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {filteredUsers?.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.username}</td>
                                        <td>{user.sections?.map(section => section?.name).join(', ') || 'No Sections'}</td>
                                        <td>{user.advisorySection?.name || 'None'}</td>
                                        <td>{user.subjects?.map(subject => subject?.name).join(', ') || 'No Subjects'}</td>
                                        <td>{user.semesters?.map(semester => semester?.name).join(', ') || 'No Semesters'}</td>
                                            <td>
                                            <Button variant="primary" onClick={() => handleEditShow(user)}>Edit</Button>
                                            <Button variant="danger" onClick={() => handleShow(user._id)}>Delete</Button>
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

                                {/* Add Teacher Modal */}
                                <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Add New Teacher</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleAddUser}>
            <Form.Group className="mb-3">
                <Form.Label>Username*</Form.Label>
                <Form.Control
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                    isInvalid={!newUser.username}
                />
                <Form.Control.Feedback type="invalid">
                    Username is required
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Password*</Form.Label>
                <Form.Control
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                    isInvalid={!newUser.password}
                />
                <Form.Control.Feedback type="invalid">
                    Password is required
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Role*</Form.Label>
                   <Form.Select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    required
                >
                    <option value="teacher">Teacher</option>
                </Form.Select>
            </Form.Group>

<Form.Group className="mb-3">
    <Form.Label>Advisory Section</Form.Label>
    <Form.Select
        value={newUser.advisorySection || ''}
        onChange={(e) => setNewUser({...newUser, advisorySection: e.target.value})}
    >
        <option value="">Select Advisory Section (Optional)</option>
        {Array.isArray(advisorySections) && advisorySections.map((section) => (
            <option 
                key={section._id} 
                value={section._id}
            >
                {section.name}
            </option>
        ))}
    </Form.Select>
</Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Sections*</Form.Label>
                <Form.Select
                    multiple
                    value={newUser.sections}
                    onChange={(e) => setNewUser({...newUser, sections: Array.from(e.target.selectedOptions, option => option.value)})}
                    required
                    isInvalid={!newUser.sections.length}
                >
                    {sections.map((section) => (
                        <option key={section._id} value={section._id}>
                            {section.name}
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    Please select at least one section
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Semesters*</Form.Label>
                <Form.Select
                    multiple
                    value={newUser.semesters}
                    onChange={(e) => setNewUser({...newUser, semesters: Array.from(e.target.selectedOptions, option => option.value)})}
                    required
                    isInvalid={!newUser.semesters.length}
                >
                    {semesters.map((semester) => (
                        <option key={semester._id} value={semester._id}>
                            {semester.name}
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    Please select at least one semester
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Subjects*</Form.Label>
                <Form.Select
                    multiple
                    value={newUser.subjects}
                    onChange={(e) => setNewUser({...newUser, subjects: Array.from(e.target.selectedOptions, option => option.value)})}
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
                <Form.Control.Feedback type="invalid">
                    Please select at least one subject
                </Form.Control.Feedback>
            </Form.Group>

            <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
            >
                {loading ? 'Adding...' : 'Add Teacher'}
            </Button>
        </Form>
    </Modal.Body>
</Modal>

                                {/* Edit Teacher Modal */}
                                <Modal show={editModalShow} onHide={handleEditClose}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Edit Teacher Account</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form onSubmit={handleEditSubmit}>
                                        <Form.Group className="mb-3">
                                        <Form.Label>Sections</Form.Label>
                                        <Form.Select
                                            multiple
                                            value={editUser.sections}
                                            onChange={(e) => {
                                                const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                                                console.log('Selected sections:', selectedValues); // Debug log
                                                setEditUser({...editUser, sections: selectedValues});
                                            }}
                                            required
                                            style={{ height: '150px' }} // Makes the select box taller
                                        >
                                            {sections.map((section) => (
                                                <option key={section._id} value={section._id}>
                                                    {section.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                        <Form.Text className="text-muted">
                                            Hold Ctrl (Windows) or Command (Mac) to select multiple sections
                                        </Form.Text>
                                    </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Subjects</Form.Label>
                                                <Form.Select
                                                    multiple
                                                    value={editUser.subjects}
                                                    onChange={(e) => setEditUser({...editUser, subjects: Array.from(e.target.selectedOptions, option => option.value)})}
                                                    required
                                                >
                                                    {subjects.map((subject) => (
                                                        <option key={subject._id} value={subject._id}>
                                                            {subject.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Semester</Form.Label>
                                                <Form.Select
                                                    value={editUser.semester}
                                                    onChange={(e) => setEditUser({...editUser, semester: e.target.value})}
                                                    required
                                                >
                                                    <option value="">Select Semester</option>
                                                    {semesters.map((semester) => (
                                                        <option key={semester._id} value={semester._id}>
                                                            {semester.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                            <Button variant="primary" type="submit">
                                                Update Teacher
                                            </Button>
                                        </Form>
                                    </Modal.Body>
                                </Modal>

                                {/* Delete Confirmation Modal */}
                                <Modal show={show} onHide={handleClose}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Confirm Delete</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>Are you sure you want to delete this teacher?</Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleClose}>
                                            Cancel
                                        </Button>
                                        <Button variant="danger" onClick={() => deleteHandler(selectedUserId)}>
                                            Delete
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