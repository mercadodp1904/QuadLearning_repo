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
import Header from '../components/Header';

const AdminCreateStudentAccount = () => {

    // First, add these styles at the top of your file
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
    const [filteredSections, setFilteredSections] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    // Add these new state variables
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: 'student',
        strand: '',
        section: '',
        subjects: [],
        semester: '',
        yearLevel: '',
    });

    const [strands, setStrands] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [selectedStrand, setSelectedStrand] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [yearLevels, setYearLevels] = useState([]);


  // Add a new useEffect to filter subjects based on strand, semester, and year level
useEffect(() => {
    
    if (newUser.strand && newUser.semester && newUser.yearLevel) {
        console.log('Filtering subjects for:', {
            strand: newUser.strand,
            semester: newUser.semester,
            yearLevel: newUser.yearLevel
            

        },[]);

        // Filter subjects that match all criteria
        const filteredSubjects = subjects.filter(subject => 
            subject.strand._id === newUser.strand &&
            subject.semester._id === newUser.semester &&
            subject.yearLevel._id === newUser.yearLevel
        );

        console.log('Filtered subjects:', filteredSubjects);
        setAvailableSubjects(filteredSubjects);
    } else {
        setAvailableSubjects([]);
    }
}, [newUser.strand, newUser.semester, newUser.yearLevel, subjects]);
    
        const fetchData = async () => {
            console.log("fetchData function executed"); // Debug log
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    
            try {
                const [usersRes, strandsRes, sectionsRes, subjectsRes, semestersRes, yearLevelsRes] = await Promise.all([
                    fetch('/api/admin/users?role=student', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getStrands', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getSections', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getSubjects', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/getSemesters', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                    fetch('/api/admin/yearLevels', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
                ]);
    
                const handleResponse = async (res, label) => {
                    if (!res.ok) {
                        const errorDetails = await res.clone().json();
                        console.error(`${label} Error:`, errorDetails);

                        return null;

                    }
                    return await res.json();
                };
    

                const [user, strands, sections, subjects, semesters, yearLevels] = await Promise.all([

                    handleResponse(usersRes, 'Users'),
                    handleResponse(strandsRes, 'Strands'),
                    handleResponse(sectionsRes, 'Sections'),
                    handleResponse(subjectsRes, 'Subjects'),
                    handleResponse(semestersRes, 'Semesters'),
                    handleResponse(yearLevelsRes, 'Year Levels'),
                ]);
    

                if (user) {
                    console.log('Fetched Users:', user); // Ensure this logs user data correctly
                }
    
                if (strands && sections && subjects && semesters && yearLevels) {
                    setUsers(user);
                    setStrands(strands);
                    setSections(sections);
                    setSubjects(subjects);
                    setSemesters(semesters);
                    setYearLevels(yearLevels);
                } else {
                    console.error('Failed to fetch some or all dropdown data');
                }

            } catch (error) {
                console.error('Error fetching dropdown data:', error.message);
            }
        };
    

    useEffect(() => {
        fetchData();
    }, []);
    
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
        const token = localStorage.getItem('token');
    
        const userData = {
            username: newUser.username,
            password: newUser.password,
            role: 'student',
            sections: [newUser.section],  // Wrap the section ID in an array
            strand: newUser.strand,
            yearLevel: newUser.yearLevel,
            semester: newUser.semester,
            subjects: newUser.subjects
        };
    
        console.log('Sending User Data:', userData);
    
        try {
            const response = await fetch('/api/admin/addUsers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(userData),
            });
    
            const data = await response.json();
            console.log('Response Data:', data);
    
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create user');
            }
    
            setNewUser({
                username: '',
                password: '',
                role: 'student',
                strand: '',
                section: '',
                subjects: [],
                semester: '',
                yearLevel: ''
            });
            
            setShowAddModal(false);
            fetchData();
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        }
    };


// Update the editUser state
const [editUser, setEditUser] = useState({
    id: '',
    username: '',
    role: 'student',
    strand: '',
    section: '',
    subjects: [],
    semester: '',
    yearLevel: '',
});


// Update useEffect for sections filtering
useEffect(() => {
    if (editUser.strand) {
        console.log('Filtering sections for strand:', editUser.strand);
        const sectionsForStrand = sections.filter(section => 
            section.strand._id === editUser.strand
        );
        console.log('Filtered sections:', sectionsForStrand);
        setFilteredSections(sectionsForStrand);
    } else if (newUser.strand) {
        const sectionsForStrand = sections.filter(section => 
            section.strand._id === newUser.strand
        );
        setFilteredSections(sectionsForStrand);
    } else {
        setFilteredSections([]);
    }
}, [newUser.strand, editUser.strand, sections]);

// Update the useEffect for filtering subjects
useEffect(() => {
    const activeUser = showAddModal ? newUser : editUser;
    
    if (activeUser.strand && activeUser.semester && activeUser.yearLevel) {
        console.log('Filtering subjects for:', {
            strand: activeUser.strand,
            semester: activeUser.semester,
            yearLevel: activeUser.yearLevel
        });

        // Filter subjects that match all criteria
        const filteredSubjects = subjects.filter(subject => 
            subject.strand._id === activeUser.strand &&
            subject.semester._id === activeUser.semester &&
            subject.yearLevel._id === activeUser.yearLevel
        );

        console.log('Filtered subjects:', filteredSubjects);
        setAvailableSubjects(filteredSubjects);
    } else {
        setAvailableSubjects([]);
    }
}, [
    newUser.strand, newUser.semester, newUser.yearLevel,
    editUser.strand, editUser.semester, editUser.yearLevel,
    subjects, showAddModal
]);

// Update handleEditShow
const handleEditShow = (user) => {
    setEditUser({
        id: user._id,
        username: user.username,
        role: user.role,
        strand: user.strand?._id || '',
        yearLevel: user.yearLevel?._id || '',
        semester: user.semester?._id || '',
        section: user.sections?.[0]?._id || '',
        subjects: user.subjects?.map(subject => subject._id) || [],
    });
    setEditModalShow(true);
};

const handleEditClose = () => {
    setEditModalShow(false);
    setEditUser({
        id: '',
        username: '',
        strand: '',
        section: '',
        subjects: []
    });
};

const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const userData = {
            username: editUser.username,
            role: 'student',
            sections: [editUser.section],
            strand: editUser.strand,
            yearLevel: editUser.yearLevel,
            semester: editUser.semester,
            subjects: editUser.subjects
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

        handleEditClose();
        fetchData(); // Refresh the data
    } catch (error) {
        setError(error.message);
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
};
    
    

const filteredUsers = users
.filter((user) => user.role === "student")
.filter((user) => (selectedStrand ? user.strand?._id === selectedStrand : true))
.filter((user) => (selectedSection ? user.sections?.some(section => section._id === selectedSection) : true))
.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
);
console.log('Filtered Users:', filteredUsers);



    const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <>
        <Header/>
        <AdminSidebar/>
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
        className='btn btn-outline-success mx-2 px-10'
        style={{ width: '150px' }} // Fixed width of 150 pixels
        size="sm" 
        onClick={() => setShowAddModal(true)}
    >
        Add Users
    </button>
</div>
            </div>
        
              {/* Table */}
              <Table responsive hover className='custom-table text-center align-middle'>
    <thead>
        <tr>
            <th>Student ID</th>
            <th>Section</th>
            <th>Strand</th>
            <th>Year Level</th>
            <th>Subjects</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {users.map((user) => (
    <tr key={user._id}>
        <td>{user.username}</td>
        <td>{user.role}</td>
        <td>
            <span className="text-muted">
                {user.advisorySection ? user.advisorySection.name : 'Not Assigned'}
            </span>
        </td>
        {/* Other columns */}
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

<Modal 
    show={showAddModal} 
    onHide={() => setShowAddModal(false)}
    size="lg"
    centered
>
    <Modal.Header closeButton style={modalStyles.modalHeader}>
        <Modal.Title>
            <i className="bi bi-person-plus-fill me-2"></i>
            Add New Student Account
        </Modal.Title>
    </Modal.Header>
    <Modal.Body className="p-4">
        <Form onSubmit={handleAddUser}>
            {/* Basic Information Section */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Basic Information</h6>
                <div style={modalStyles.formGrid}>
                    <Form.Group>
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            required
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            required
                        />
                    </Form.Group>
                </div>
            </div>

            {/* Academic Information Section */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Academic Information</h6>
                <div style={modalStyles.formGrid}>
                    <Form.Group>
                        <Form.Label>Year Level</Form.Label>
                        <Form.Select
                            value={newUser.yearLevel}
                            onChange={(e) => setNewUser({...newUser, yearLevel: e.target.value, semester: '', subjects: []})}
                            required
                        >
                            <option value="">Select Year Level</option>
                            {yearLevels.map(yearLevel => (
                                <option key={yearLevel._id} value={yearLevel._id}>
                                    {yearLevel.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Strand</Form.Label>
                        <Form.Select
                            value={newUser.strand}
                            onChange={(e) => setNewUser({...newUser, strand: e.target.value, section: '', subjects: []})}
                            required
                        >
                            <option value="">Select Strand</option>
                            {strands.map(strand => (
                                <option key={strand._id} value={strand._id}>
                                    {strand.name} 
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Semester</Form.Label>
                        <Form.Select
                            value={newUser.semester}
                            onChange={(e) => setNewUser({...newUser, semester: e.target.value, subjects: []})}
                            required
                            disabled={!newUser.strand || !newUser.yearLevel}
                        >
                            <option value="">Select Semester</option>
                            {semesters.map(semester => (
                                <option key={semester._id} value={semester._id}>
                                    {semester.name} - {semester.strand.name} - {semester.yearLevel.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Section</Form.Label>
                        <Form.Select
                            value={newUser.section}
                            onChange={(e) => setNewUser({...newUser, section: e.target.value})}
                            required
                            disabled={!newUser.strand}
                        >
                            <option value="">Select Section</option>
                            {filteredSections.map(section => (
                                <option key={section._id} value={section._id}>
                                    {section.name} - {section.yearLevel.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>

            {/* Subjects Section */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Subjects</h6>
                {availableSubjects.length > 0 ? (
                    <div className="subjects-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '0.5rem' 
                    }}>
                        {availableSubjects.map(subject => (
                            <Form.Check
                                key={subject._id}
                                type="checkbox"
                                id={`add-${subject._id}`}
                                label={subject.name}
                                checked={newUser.subjects.includes(subject._id)}
                                onChange={(e) => {
                                    setNewUser(prev => ({
                                        ...prev,
                                        subjects: e.target.checked
                                            ? [...prev.subjects, subject._id]
                                            : prev.subjects.filter(id => id !== subject._id)
                                    }));
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted">
                        Please select strand, year level, and semester to view available subjects
                    </p>
                )}
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </Form>
    </Modal.Body>
    <Modal.Footer style={modalStyles.modalFooter}>
        <Button variant="outline-secondary" onClick={() => setShowAddModal(false)}>
            <i className="bi bi-x-circle me-2"></i>Cancel
        </Button>
        <Button variant="outline-success" onClick={handleAddUser}>
            <i className="bi bi-check-circle me-2"></i>Add Student
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
            Are you sure you want to delete this student account? This action cannot be undone.
        </p>
    </Modal.Body>
    <Modal.Footer style={modalStyles.modalFooter} className="justify-content-center">
        <Button variant="outline-secondary" onClick={handleClose}>
            <i className="bi bi-x-circle me-2"></i>Cancel
        </Button>
        <Button variant="outline-danger" onClick={() => deleteHandler(selectedUserId)}>
            <i className="bi bi-trash me-2"></i>Delete
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
            Edit Student Account
        </Modal.Title>
    </Modal.Header>
    <Modal.Body className="p-4">
        <Form onSubmit={handleEditSubmit}>
            {/* Basic Information */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Basic Information</h6>
                <Form.Group>
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        value={editUser.username}
                        readOnly
                        disabled
                        className="bg-light"
                    />
                </Form.Group>
            </div>

            {/* Academic Information */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Academic Information</h6>
                <div style={modalStyles.formGrid}>
                    <Form.Group>
                        <Form.Label>Year Level</Form.Label>
                        <Form.Select
                            value={editUser.yearLevel}
                            onChange={(e) => setEditUser({...editUser, yearLevel: e.target.value, semester: '', subjects: []})}
                            required
                        >
                            <option value="">Select Year Level</option>
                            {yearLevels.map(yearLevel => (
                                <option key={yearLevel._id} value={yearLevel._id}>
                                    {yearLevel.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Strand</Form.Label>
                        <Form.Select
                            value={editUser.strand}
                            onChange={(e) => setEditUser({...editUser, strand: e.target.value, section: '', subjects: []})}
                            required
                        >
                            <option value="">Select Strand</option>
                            {strands.map(strand => (
                                <option key={strand._id} value={strand._id}>
                                    {strand.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Semester</Form.Label>
                        <Form.Select
                            value={editUser.semester}
                            onChange={(e) => setEditUser({ ...editUser, semester: e.target.value, subjects: [] })}
                            required
                            disabled={!editUser.strand || !editUser.yearLevel}
                        >
                            <option value="">Select Semester</option>
                            {semesters.map((semester) => (
                                <option key={semester._id} value={semester._id}>
                                    {semester.displayName || semester.name} {/* Use displayName or fallback to name */}
                                </option>
                            ))}
                        </Form.Select>

                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Section</Form.Label>
                        <Form.Select
                            value={editUser.section}
                            onChange={(e) => setEditUser({...editUser, section: e.target.value})}
                            required
                            disabled={!editUser.strand}
                        >
                            <option value="">Select Section</option>
                            {filteredSections.map(section => (
                                <option key={section._id} value={section._id}>
                                    {section.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
            </div>

            {/* Subjects Section */}
            <div style={{...modalStyles.formSection, ...modalStyles.fullWidth}}>
                <h6 className="mb-3">Subjects</h6>
                {availableSubjects.length > 0 ? (
                    <div className="subjects-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '0.5rem' 
                    }}>
                        {availableSubjects.map(subject => (
                            <Form.Check
                                key={subject._id}
                                type="checkbox"
                                id={`edit-${subject._id}`}
                                label={subject.name}
                                checked={editUser.subjects.includes(subject._id)}
                                onChange={(e) => {
                                    setEditUser(prev => ({
                                        ...prev,
                                        subjects: e.target.checked
                                            ? [...prev.subjects, subject._id]
                                            : prev.subjects.filter(id => id !== subject._id)
                                    }));
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted">
                        Please select strand, year level, and semester to view available subjects
                    </p>
                )}
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
        </Form>
    </Modal.Body>
    <Modal.Footer style={modalStyles.modalFooter}>
        <Button variant="outline-secondary" onClick={handleEditClose}>
            <i className="bi bi-x-circle me-2"></i>Cancel
        </Button>
        <Button 
            variant="outline-success" 
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
                    Update Student
                </>
            )}
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