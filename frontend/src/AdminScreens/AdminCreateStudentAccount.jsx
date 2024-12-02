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
        });

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
    .filter((user) => (selectedStrand ? user.strand === selectedStrand : true))
    .filter((user) => (selectedSection ? user.section === selectedSection : true))
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
            className='btn btn-primary mx-5 px-3 custom-width-btn'
                    onClick={() => setShowAddModal(true)}
                >
                    Add Users
                </button>
                </div>
            </div>
        
              {/* Table */}
              <Table responsive hover className="table-striped table-bordered text-center">
  <thead>
    <tr>
      <th>Name</th>
      <th>Strand</th>
      <th>Year Level</th>
      <th>Section</th>
      <th>Subjects</th>
      <th>Actions</th>
    </tr>
  </thead>
{/* Update the Table body rendering */}
<tbody>
  {filteredUsers.length > 0 ? (
    filteredUsers.map((user) => (
      <tr key={user._id}>
        <td>{user.username}</td>
        <td>{user.strand ? user.strand.name : 'No Strand'}</td> {/* Access strand.name */}
        <td>{user.yearLevel ? user.yearLevel.name : 'No Year Level'}</td> {/* Access yearLevel.name */}
        <td>
          {user.sections && user.sections.length > 0
            ? user.sections.map((section) => section.name).join(', ')
            : 'No Sections'} {/* Access section.name and join if multiple */}
        </td>
        <td>
        {user.subjects && user.subjects.length > 0
            ? user.subjects.map((subject) => subject.name).join(', ')
            : 'No Subjects'} {/* Access subject.name and join if multiple */}
        </td>
        <td>
        <button
                    className="btn btn-primary custom-btn"
                    onClick={() => {
                        console.log('Edit button clicked for user:', user); // Debug log
                        handleEditShow(user);
                    }}
                >
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
    ))
  ) : (
    <tr>
      <td colSpan="4">No users found</td>
    </tr>
  )}
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

                                {/* Add Modal */}
                                <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
    <Modal.Header closeButton>
        <Modal.Title>Add New User</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form onSubmit={handleAddUser}>
            {/* Username Field */}
            <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type="text"
                    value={newUser.username || ''}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                />
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type="password"
                    value={newUser.password || ''}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                />
            </Form.Group>

            {/* Role Field (Read Only) */}
            <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                    type="text"
                    value="Student" // Set the value to "Student"
                    readOnly
                    disabled
                />
            </Form.Group>

                {/* Year Level Selection */}
    <Form.Group className="mb-3">
        <Form.Label>Year Level</Form.Label>
        <Form.Select
            value={newUser.yearLevel}
            onChange={(e) => setNewUser(prev => ({
                ...prev,
                yearLevel: e.target.value,
                // Reset dependent fields
                semester: '',
                section: '',
                subjects: []
            }))}
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

    {/* Strand Selection */}
    <Form.Group className="mb-3">
        <Form.Label>Strand</Form.Label>
        <Form.Select
            value={newUser.strand}
            onChange={(e) => setNewUser(prev => ({
                ...prev,
                strand: e.target.value,
                // Reset dependent fields
                section: '',
                semester: '',
                subjects: []
            }))}
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

    {/* Semester Selection */}
    <Form.Group className="mb-3">
        <Form.Label>Semester</Form.Label>
        <Form.Select
            value={newUser.semester}
            onChange={(e) => setNewUser(prev => ({
                ...prev,
                semester: e.target.value,
                // Reset dependent fields
                subjects: []
            }))}
            required
            disabled={!newUser.strand || !newUser.yearLevel}
        >
            <option value="">Select Semester</option>
            {semesters
                .filter(semester => 
                    semester.strand._id === newUser.strand &&
                    semester.yearLevel._id === newUser.yearLevel
                )
                .map(semester => (
                    <option key={semester._id} value={semester._id}>
                        {semester.name}
                    </option>
                ))
            }
        </Form.Select>
    </Form.Group>

    {/* Section Selection */}
    <Form.Group className="mb-3">
        <Form.Label>Section</Form.Label>
        <Form.Select
            value={newUser.section}
            onChange={(e) => setNewUser(prev => ({
                ...prev,
                section: e.target.value
            }))}
            required
            disabled={!newUser.strand}
        >
            <option value="">Select Section</option>
            {filteredSections.map(section => (
                <option key={section._id} value={section._id}>
                    {section.name}
                </option>
            ))}
        </Form.Select>
    </Form.Group>

    {/* Subjects Selection */}
    <Form.Group className="mb-3">
        <Form.Label>Subjects</Form.Label>
        {availableSubjects.length > 0 ? (
            availableSubjects.map(subject => (
                <div key={subject._id} className="mb-2">
                    <Form.Check
                        type="checkbox"
                        id={subject._id}
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
                </div>
            ))
        ) : (
            <p className="text-muted">
                Please select strand, year level, and semester to view available subjects
            </p>
        )}
    </Form.Group>

            {/* Modal Footer with Buttons */}
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

{/* Delete Modal */}
<Modal show={show} onHide={handleClose}>
    <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        Are you sure you want to delete this user?
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
            Cancel
        </Button>
        <Button variant="danger" onClick={() => deleteHandler(selectedUserId)}>
            Delete
        </Button>
    </Modal.Footer>
</Modal>

{/* Edit Modal */}
<Modal show={editModalShow} onHide={handleEditClose}>
    <Modal.Header closeButton>
        <Modal.Title>Edit Student Account</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form onSubmit={handleEditSubmit}>
            {/* Username Field (Read Only) */}
            <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type="text"
                    value={editUser.username}
                    readOnly
                    disabled
                />
            </Form.Group>

            {/* Role Field (Read Only) */}
            <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Control
                    type="text"
                    value="Student"
                    readOnly
                    disabled
                />
            </Form.Group>

            {/* Year Level Selection */}
            <Form.Group className="mb-3">
                <Form.Label>Year Level</Form.Label>
                <Form.Select
                    value={editUser.yearLevel}
                    onChange={(e) => setEditUser(prev => ({
                        ...prev,
                        yearLevel: e.target.value,
                        semester: '',
                        subjects: []
                    }))}
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

            {/* Strand Selection */}
            <Form.Group className="mb-3">
                <Form.Label>Strand</Form.Label>
                <Form.Select
                    value={editUser.strand}
                    onChange={(e) => setEditUser(prev => ({
                        ...prev,
                        strand: e.target.value,
                        section: '',
                        semester: '',
                        subjects: []
                    }))}
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

            {/* Semester Selection */}
            <Form.Group className="mb-3">
                <Form.Label>Semester</Form.Label>
                <Form.Select
                    value={editUser.semester}
                    onChange={(e) => setEditUser(prev => ({
                        ...prev,
                        semester: e.target.value,
                        subjects: []
                    }))}
                    required
                    disabled={!editUser.strand || !editUser.yearLevel}
                >
                    <option value="">Select Semester</option>
                    {semesters
                        .filter(semester => 
                            semester.strand._id === editUser.strand &&
                            semester.yearLevel._id === editUser.yearLevel
                        )
                        .map(semester => (
                            <option key={semester._id} value={semester._id}>
                                {semester.name}
                            </option>
                        ))
                    }
                </Form.Select>
            </Form.Group>

            {/* Section Selection */}
            <Form.Group className="mb-3">
                <Form.Label>Section</Form.Label>
                <Form.Select
                    value={editUser.section}
                    onChange={(e) => setEditUser(prev => ({
                        ...prev,
                        section: e.target.value
                    }))}
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

            {/* Subjects Selection */}
            <Form.Group className="mb-3">
                <Form.Label>Subjects</Form.Label>
                {availableSubjects.length > 0 ? (
                    availableSubjects.map(subject => (
                        <div key={subject._id} className="mb-2">
                            <Form.Check
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
                        </div>
                    ))
                ) : (
                    <p className="text-muted">
                        Please select strand, year level, and semester to view available subjects
                    </p>
                )}
            </Form.Group>

            {/* Error message */}
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Modal Footer with Buttons */}
            <div className="d-flex gap-2 justify-content-end">
                <Button variant="secondary" onClick={handleEditClose}>
                    Cancel
                </Button>
                <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Updating...' : 'Update Student'}
                </Button>
            </div>
        </Form>
    </Modal.Body>
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