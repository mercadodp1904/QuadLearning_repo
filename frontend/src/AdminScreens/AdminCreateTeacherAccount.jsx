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
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: 'teacher',
        sections: [],
        subjects: [],
        semester: '',
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

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const [usersRes, sectionsRes, subjectsRes, semestersRes] = await Promise.all([
                    fetch('/api/admin/users?role=teacher', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getSections', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getSubjects', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getSemesters', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                ]);

                const handleResponse = async (res, label) => {
                    if (!res.ok) {
                        const errorDetails = await res.clone().json();
                        console.error(`${label} Error:`, errorDetails);
                        return null;
                    }
                    return await res.json();
                };

                const [user, sections, subjects, semesters] = await Promise.all([
                    handleResponse(usersRes, 'Users'),
                    handleResponse(sectionsRes, 'Sections'),
                    handleResponse(subjectsRes, 'Subjects'),
                    handleResponse(semestersRes, 'Semesters'),
                ]);

                if (user && sections && subjects && semesters) {
                    setUsers(user);
                    setSections(sections);
                    setSubjects(subjects);
                    setSemesters(semesters);
                } else {
                    console.error('Failed to fetch some or all dropdown data');
                }
            } catch (error) {
                console.error('Error fetching dropdown data:', error.message);
            }
        };

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

    const handleAddUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const userData = {
            username: newUser.username,
            password: newUser.password,
            role: 'teacher',
            assignedSections: newUser.sections,
            assignedSubjects: newUser.subjects,
            semester: newUser.semester
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/addUsers', {
                method: 'POST',
                body: JSON.stringify(userData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await response.json();
            if (!response.ok) throw new Error(json.message || 'Failed to add user');

            setUsers((prevUsers) => [...prevUsers, json.data]);
            setNewUser({ username: '', password: '', role: 'teacher', sections: [], subjects: [], semester: '' });
            setShowAddModal(false);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

 // Also update the handleEditShow function to ensure proper data formatting:
    const handleEditShow = (user) => {
        setEditUser({
            id: user._id,
            sections: user.sections?.map(section => section._id).filter(Boolean) || [], // Ensure valid IDs only
            subjects: user.subjects?.map(subject => subject._id).filter(Boolean) || [],
            semester: user.semester?._id || ''
        });
        setEditModalShow(true);
    };

    const handleEditClose = () => {
        setEditModalShow(false);
        setEditUser({
            id: '',
            sections: [],
            subjects: [],
            semester: ''
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

    return (
        <>
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
                                            <th>Subjects</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user) => (
                                                <tr key={user._id}>
                                                    <td>{user.username}</td>
                                                    <td>{user.sections?.map(section => section.name).join(', ') || 'No Sections'}</td>
                                                    <td>{user.subjects?.map(subject => subject.name).join(', ') || 'No Subjects'}</td>
                                                    <td>
                                                        <div className="button-group">
                                                            <Button
                                                                className="btn btn-primary custom-btn"
                                                                onClick={() => handleEditShow(user)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                className="btn btn-danger custom-btn"
                                                                onClick={() => handleShow(user._id)}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4">No users found</td>
                                            </tr>
                                        )}
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
                                        <Form onSubmit={handleAddUser}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Username</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={newUser.username}
                                                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    value={newUser.password}
                                                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Sections</Form.Label>
                                                <Form.Select
                                                    multiple
                                                    value={newUser.sections}
                                                    onChange={(e) => setNewUser({...newUser, sections: Array.from(e.target.selectedOptions, option => option.value)})}
                                                    required
                                                >
                                                    {sections.map((section) => (
                                                        <option key={section._id} value={section._id}>
                                                            {section.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Subjects</Form.Label>
                                                <Form.Select
                                                    multiple
                                                    value={newUser.subjects}
                                                    onChange={(e) => setNewUser({...newUser, subjects: Array.from(e.target.selectedOptions, option => option.value)})}
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
                                                    value={newUser.semester}
                                                    onChange={(e) => setNewUser({...newUser, semester: e.target.value})}
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
                                                Add Teacher
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