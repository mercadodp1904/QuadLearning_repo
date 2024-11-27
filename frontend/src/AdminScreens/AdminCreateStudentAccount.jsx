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


    // Filtering the sections and subjects based on the selected strand and section
    useEffect(() => {
    if (newUser.strand) {
        console.log('Current strand:', newUser.strand);
        console.log('All sections:', sections);
        // Update the filter to match the data structure
        const sectionsForStrand = sections.filter(section => section.strand._id === newUser.strand);
        // or if strand is stored as just the ID:
        // const sectionsForStrand = sections.filter(section => section.strand === newUser.strand);
        console.log('Filtered sections:', sectionsForStrand);
        setFilteredSections(sectionsForStrand);
        setNewUser(prev => ({
            ...prev,
            section: '',
            subjects: []
        }));
    } else {
        setFilteredSections([]);
    }
}, [newUser.strand, sections]);

useEffect(() => {
    if (newUser.section) {
        console.log('Current section:', newUser.section);
        console.log('All subjects:', subjects);
        // Update the filter to match the data structure
        const subjectsForSection = subjects.filter(subject => 
            subject.sections && subject.sections.some(sec => sec._id === newUser.section)
            // or if sections are stored as just IDs:
            // subject.sections && subject.sections.includes(newUser.section)
        );
        console.log('Filtered subjects:', subjectsForSection);
        setFilteredSubjects(subjectsForSection);
    } else {
        setFilteredSubjects([]);
    }
}, [newUser.section, subjects]);
    

    

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

                        return null;

                    }
                    return await res.json();
                };
    

                const [user, strands, sections, subjects, semesters] = await Promise.all([

                    handleResponse(usersRes, 'Users'),
                    handleResponse(strandsRes, 'Strands'),
                    handleResponse(sectionsRes, 'Sections'),
                    handleResponse(subjectsRes, 'Subjects'),
                    handleResponse(semestersRes, 'Semesters'),
                ]);
    

                if (user) {
                    console.log('Fetched Users:', user); // Ensure this logs user data correctly
                }
    
                if (strands && sections && subjects && semesters) {
                    setUsers(user);
                    setStrands(strands);
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


// Update the editUser state
const [editUser, setEditUser] = useState({
    id: '',
    strand: '',
    section: '',
    subjects: [],
    semester: ''
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

// Update useEffect for subjects filtering  
useEffect(() => {
    if (editUser.section) {
        console.log('Filtering subjects for section:', editUser.section);
        const subjectsForSection = subjects.filter(subject => 
            subject.sections && subject.sections.some(sec => sec._id === editUser.section)
        );
        console.log('Filtered subjects:', subjectsForSection);
        setFilteredSubjects(subjectsForSection);
    } else if (newUser.section) {
        const subjectsForSection = subjects.filter(subject => 
            subject.sections && subject.sections.some(sec => sec._id === newUser.section)
        );
        setFilteredSubjects(subjectsForSection);
    } else {
        setFilteredSubjects([]);
    }
}, [newUser.section, editUser.section, subjects]);
// Update handleEditShow
const handleEditShow = (user) => {
    setEditUser({
        id: user._id,
        strand: user.strand?._id || '',
        section: user.sections?.[0]?._id || '',
        subjects: user.subjects?.map(subject => subject._id) || [],
        semester: user.semester?._id || ''
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
        // Add console.log to debug the request
        console.log('Sending update request for user:', editUser);

        const response = await fetch(`/api/admin/users/${editUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                strand: editUser.strand,
                assignedSections: editUser.section,
                assignedSubjects: editUser.subjects,
                semester: editUser.semester
            }),
        });
        // Add response logging
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update user');
        }
        handleEditClose();
    } catch (error) {
        setError(error.message);
        console.error('Error:', error);
    } finally {
        setLoading(false);
        fetchData();
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
      <th>Section</th>
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
        <td>
          {user.sections && user.sections.length > 0
            ? user.sections.map((section) => section.name).join(', ')
            : 'No Sections'} {/* Access section.name and join if multiple */}
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

            {/* Strand Field */}
            <Form.Group className="mb-3">
                <Form.Label>Strand</Form.Label>
                <Form.Select
    value={newUser.strand || ''}
    onChange={(e) => {
        const selectedStrand = e.target.value;
        setNewUser({
            ...newUser,
            strand: selectedStrand,
            section: '',
            subjects: []
        });
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

            {/* Section Field */}
<Form.Group className="mb-3">
    <Form.Label>Section</Form.Label>
    <Form.Select
    value={newUser.section || ''}
    onChange={(e) => setNewUser({ ...newUser, section: e.target.value, subjects: [] })}
    required
    disabled={!newUser.strand}
>
    <option value="">Select Section</option>
    {filteredSections.map((section) => (
        <option key={section._id} value={section._id}>
            {section.name}
        </option>
    ))}
</Form.Select>
</Form.Group>

{/* Subjects Field */}
<Form.Group className="mb-3">
    <Form.Label>Subjects</Form.Label>
    <Form.Select
        multiple
        value={newUser.subjects || []}
        onChange={(e) => {
            const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
            setNewUser({
                ...newUser,
                subjects: selectedValues
            });
        }}
        required
        disabled={!newUser.section}
        style={{ height: '150px' }} // Make the multiple select box taller
    >
        {filteredSubjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
                {subject.name}
            </option>
        ))}
    </Form.Select>
    <Form.Text className="text-muted">
        Hold Ctrl (Windows) or Command (Mac) to select multiple subjects
    </Form.Text>
</Form.Group>

            {/* Semester Field */}
            <Form.Group className="mb-3">
                <Form.Label>Semester</Form.Label>
                <Form.Select
                    value={newUser.semester || ''}
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
            {/* Strand Field */}
            <Form.Group className="mb-3">
                <Form.Label>Strand</Form.Label>
                <Form.Select
                    value={editUser.strand || ''}
                    onChange={(e) => {
                        const selectedStrand = e.target.value;
                        setEditUser({
                            ...editUser,
                            strand: selectedStrand,
                            section: '',
                            subjects: []
                        });
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

            {/* Section Field */}
            <Form.Group className="mb-3">
                <Form.Label>Section</Form.Label>
                <Form.Select
                    value={editUser.section || ''}
                    onChange={(e) => setEditUser({ 
                        ...editUser, 
                        section: e.target.value,
                        subjects: []
                    })}
                    required
                    disabled={!editUser.strand}
                >
                    <option value="">Select Section</option>
                    {filteredSections.map((section) => (
                        <option key={section._id} value={section._id}>
                            {section.name}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            {/* Subjects Field */}
            <Form.Group className="mb-3">
                <Form.Label>Subjects</Form.Label>
                <Form.Select
                    multiple
                    value={editUser.subjects || []}
                    onChange={(e) => {
                        const selectedValues = Array.from(
                            e.target.selectedOptions,
                            option => option.value
                        );
                        setEditUser({
                            ...editUser,
                            subjects: selectedValues
                        });
                    }}
                    required
                    disabled={!editUser.section}
                    style={{ height: '150px' }}
                >
                    {filteredSubjects.map((subject) => (
                        <option key={subject._id} value={subject._id}>
                            {subject.name}
                        </option>
                    ))}
                </Form.Select>
                <Form.Text className="text-muted">
                    Hold Ctrl (Windows) or Command (Mac) to select multiple subjects
                </Form.Text>
            </Form.Group>

            {/* Semester Field */}
            <Form.Group className="mb-3">
                <Form.Label>Semester</Form.Label>
                <Form.Select
                    value={editUser.semester || ''}
                    onChange={(e) => setEditUser({ 
                        ...editUser, 
                        semester: e.target.value 
                    })}
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