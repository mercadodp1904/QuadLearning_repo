import { Container, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../AdminComponents/AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState , useEffect } from 'react';
import AdminSidebar from "../AdminComponents/AdminSidebar"; 
import '../AdminComponents/AdminTableList.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const AdminCreateStudentAccount = () => {
    const [show, setShow] = useState(false);
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
        role: 'student', // Default to student
        strand: '',
        section: '',
        subjects: [],
        semester: '',
    });

    const [strands, setStrands] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);

    const [selectedStrand, setSelectedStrand] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    useEffect(() => {
        console.log("useEffect triggered"); // Debug log
        const fetchData = async () => {
            console.log("fetchData function executed"); // Debug log
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    
            try {
                const [usersRes, strandsRes, sectionsRes, subjectsRes, semestersRes] = await Promise.all([
                    fetch('/api/admin/users?role=student', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getStrands', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getSections', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getSubjects', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getSemesters', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                ]);
    
                const handleResponse = async (res, label) => {
                    if (!res.ok) {
                        const errorDetails = await res.clone().json();
                        console.error(`${label} Error:`, errorDetails);
                        throw new Error(`${label} failed with status ${res.status}`);
                    }
                    return await res.json();
                };
    
                const [users, strands, sections, subjects, semesters] = await Promise.all([
                    handleResponse(usersRes, 'Users'),
                    handleResponse(strandsRes, 'Strands'),
                    handleResponse(sectionsRes, 'Sections'),
                    handleResponse(subjectsRes, 'Subjects'),
                    handleResponse(semestersRes, 'Semesters'),
                ]);
    
                console.log('Fetched users:', users);
                console.log('Fetched strands:', strands);
                console.log('Fetched sections:', sections);
                console.log('Fetched subjects:', subjects);
                console.log('Fetched semesters:', semesters);
    
                setUsers(users);
                setStrands(strands);
                setSections(sections);
                setSubjects(subjects);
                setSemesters(semesters);
            } catch (error) {
                console.error('Error fetching dropdown data:', error.message);
            }
        };
    
        fetchData();
    }, []); // Empty dependency array ensures it runs once on mount
    const handleClose = () => {
        setShow(false);
        setSelectedUserId(null);  // Reset selectedUserId when modal closes
    };

    const handleShow = (userId) => {
        setSelectedUserId(userId);  // Set the userId when showing modal
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
            role: 'student', // Hardcoded as student
            strand: newUser.strand,
            assignedSections: newUser.section, // Matches controller
            assignedSubjects: newUser.subjects, // Matches controller
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

            setUsers((prevUsers) => [...prevUsers, json.data]); // Update UI
            setNewUser({ username: '', password: '', role: 'student', strand: '', section: '', subjects: [] });
            setShowAddModal(false);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on strand and section
    const filteredUsers = users
        .filter((user) => user.role === "student")
        .filter((user) =>
            selectedStrand ? user.strand === selectedStrand : true
        )
        .filter((user) =>
            selectedSection ? user.section === selectedSection : true
        )
        .filter((user) =>
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
                        {/* User Accounts Table */}
                        <Card>
                            <Card.Body>
                                <Card.Title>Student Accounts</Card.Title>
                                {/* Filters */}
                                <div className="d-flex gap-3 mb-4">
                                    <Form.Select
                                        value={selectedStrand}
                                        onChange={(e) => {
                                            setSelectedStrand(e.target.value);
                                            setSelectedSection(""); // Reset section filter
                                        }}
                                    >
                                        <option value="">All Strands</option>
                                        {strands.map((strand) => (
                                            <option key={strand._id} value={strand._id}>
                                                {strand.name}
                                            </option>
                                        ))}
                                    </Form.Select>

                                    <Form.Select
                                        value={selectedSection}
                                        onChange={(e) => setSelectedSection(e.target.value)}
                                        disabled={!selectedStrand} // Disable if no strand selected
                                    >
                                        <option value="">All Sections</option>
                                        {sections
                                            .filter((section) => section.strand === selectedStrand)
                                            .map((section) => (
                                                <option key={section._id} value={section._id}>
                                                    {section.name}
                                                </option>
                                            ))}

                                    </Form.Select>

                                    <InputGroup style={{ width: "700px" }}>
                                        <InputGroup.Text>
                                            <FaSearch />
                                        </InputGroup.Text>
                                        <Form.Control
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </div>
                                {/* Table Controls */}
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <span>Show</span>
                                        <Form.Select
                                            size="sm"
                                            className="mx-2"
                                            style={{ width: 'auto' }}
                                            value={entriesPerPage}
                                            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </Form.Select>
                                        <span>entries</span>
                                    </div>

                                    <div>
                                        <button
                                            className='btn btn-primary mx-5 px-3 custom-width-btn'
                                            onClick={() => setShowAddModal(true)}
                                        >
                                            Add Users
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <Table
                                    responsive
                                    hover
                                    className="table-striped table-bordered text-center"
                                >
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Strand</th>
                                            <th>Section</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers
                                            .slice(
                                                (currentPage - 1) * entriesPerPage,
                                                currentPage * entriesPerPage
                                            )
                                            .map((user) => (
                                                <tr key={user._id}>
                                                    <td>{user.username}</td>
                                                    <td>{strands.find((s) => s._id === user.strand)?.name || "N/A"}</td>
                                                    <td>{sections.find((s) => s._id === user.section)?.name || "N/A"}</td>
                                                    <td>
                                                        <button className="btn btn-primary custom-btn">
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-danger custom-btn"
                                                            onClick={() => handleShow(user._id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Table>

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

                                <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>Add New User</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <Form onSubmit={handleAddUser}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Username</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={newUser.username}
                                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    value={newUser.password}
                                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                    required
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Role</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value="Student" // Set the value to "Student"
                                                    readOnly // Make the field read-only
                                                    disabled // Optionally, you can also disable it
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Strand</Form.Label>
                                                <Form.Select
                                                    value={newUser.strand}
                                                    onChange={(e) => {
                                                        const selectedStrand = e.target.value;
                                                        setNewUser({ ...newUser, strand: selectedStrand, section: '', subjects: [] });
                                                    }}
                                                    required
                                                >
                                                    <option value="">Select Strand</option>
                                                    {strands.map((strand) => (
                                                        <option key={strand._id} value={strand._id}>
                                                            {strand.name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label>Section</Form.Label>
                                                <Form.Select
                                                    value={newUser.section}
                                                    onChange={(e) => setNewUser({ ...newUser, section: e.target.value })}
                                                    required
                                                    disabled={!newUser.strand} // Disable if no strand is selected
                                                >
                                                    <option value="">Select Section</option>
                                                    {sections
                                                        .filter((section) => section.strand === newUser.strand)
                                                        .map((section) => (
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
                                                    onChange={(e) =>
                                                        setNewUser({
                                                            ...newUser,
                                                            subjects: Array.from(e.target.selectedOptions, (option) => option.value),
                                                        })
                                                    }
                                                    required
                                                    disabled={!newUser.section} // Disable if no section is selected
                                                >
                                                    {subjects
                                                        .filter((subject) =>
                                                            subject.sections.includes(newUser.section)
                                                        )
                                                        .map((subject) => (
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
                                                    onChange={(e) => setNewUser({ ...newUser, semester: e.target.value })}
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

                                            <div className="text-center mt-3">
                                                <Button variant="secondary" onClick={() => setShowAddModal(false)} className="me-2">
                                                    Cancel
                                                </Button>
                                                <Button variant="primary" type="submit">
                                                    Add User
                                                </Button>
                                            </div>
                                        </Form>
                                    </Modal.Body>
                                </Modal>

                                <Modal show={show} onHide={handleClose} className='text-center'>
                                    <Modal.Header closeButton className='text-center'>
                                        <Modal.Title className='text-center w-100'>CONFIRMATION MESSAGE</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>The data will be erased and cannot be retrieved. Are you sure you want to continue?</Modal.Body>
                                    <Modal.Footer className='justify-content-center'>
                                        <Button variant="primary" className="px-4" onClick={() => setShow(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="px-4"
                                            onClick={() => selectedUserId && deleteHandler(selectedUserId)}
                                        >
                                            Confirm
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

export default AdminCreateStudentAccount;