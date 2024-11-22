import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import { set } from 'mongoose';
const ManageSections = () => {
    const navigate = useNavigate();
    const [studSections, setStudSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [linkedStrand, setLinkedStrand] = useState('');
    const [teacher, setTeacher] = useState('');  // Store selected teacher ID
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [studStrands, setStudStrands] = useState([]);
    const [users, setUsers] = useState([]);
    const [studSubjects, setStudSubjects] = useState([]);  // List of all subjects
    const [selectedSubjects, setSelectedSubjects] = useState([]);  // List of selected subject IDs
    const [selectedTeachers, setSelectedTeachers] = useState([]);  // List of selected subject IDs
    const [show, setShow] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    
    const handleClose = () => {
        setShow(false);
        setSelectedSectionId(null);  // Reset selectedUserId when modal closes
    };

    const handleShow = (sectionId) => {
        setSelectedSectionId(sectionId);  // Set the userId when showing modal
        setShow(true);
    };

      
    const handleEditShow = (sectionId) => {
        const section = studSections.find((section) => section._id === sectionId);
        if (section) {
            setSelectedSectionId(sectionId);
            setName(section.name);
            setLinkedStrand(section.strand);
            setSelectedTeachers(section.teacher || []);
            setSelectedSubjects(section.subject || []);  // Ensure it's an array
    
            setEditModalShow(true);
        } else {
            console.error('Section not found');
        }
    };
    
    const handleCloseModal = () => {
        setEditModalShow(false);
        setSelectedSectionId(null);
        setName('');
        setStudStrands('');
        setSelectedTeachers([]);
        setSelectedSubjects([]);
        // Don't reset studSections unless necessary.
    };
    
    

    
    
    const handleSaveChanges = async () => {
        
        const updatedSection = {
            name,
            strand: linkedStrand, // This could be the value selected from the dropdown
            teacher: selectedTeachers, // Pass the selected subjects
            subjects: selectedSubjects, // Pass the selected sections
        };
    
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch(`/api/admin/sections/${selectedSectionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedSection),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                // Successfully updated the strand
                setStudSections((prevSections) =>
                    prevSections.map((section) =>
                        section._id === selectedSectionId ? result : section
                    )
                );
                handleCloseModal(); // Close modal after saving
            } else {
                console.error('Error updating strand:', result.message);
            }
        } catch (error) {
            console.error('Failed to update strand:', error);
        }
        fetchData(); // Refresh the data
    };
    
    
    
    
    

    const deleteHandler = async (sectionId) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        console.log("Deleting subject with ID:", sectionId);
        try {
            const response = await fetch(`/api/admin/sections/${sectionId}`, { // Corrected endpoint
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Ensure token is included
                }
            });
    
            console.log("Response status:", response.status);
            if (response.ok) {
                setStudSections((prevSections) => prevSections.filter((section) => section._id !== sectionId));
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
        fetchData();
    };
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        
        try {
            const [sectionsResponse, strandsResponse, usersResponse, subjectsResponse] = await Promise.all([
                fetch('/api/admin/getSections', { method: 'GET', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/getStrands', { method: 'GET', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/users?role=teacher', { method: 'GET', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/getSubjects', { method: 'GET', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }),
            ]);
        
            if (!sectionsResponse.ok || !strandsResponse.ok || !usersResponse.ok || !subjectsResponse.ok) {
                throw new Error('Failed to fetch one or more resources');
            }
        
            const [sectionsData, strandsData, usersData, subjectsData] = await Promise.all([
                sectionsResponse.json(),
                strandsResponse.json(),
                usersResponse.json(),
                subjectsResponse.json(),
            ]);
        
            console.log('Fetched Sections:', sectionsData);
            console.log('Fetched Strands:', strandsData);
            console.log('Fetched Users:', usersData);
            console.log('Fetched Subjects:', subjectsData);
        
            setStudSections(sectionsData || []);  // Set empty array if data is missing
            setStudStrands(strandsData || []);  // Set empty array if data is missing
            setUsers(usersData || []);
            setStudSubjects(subjectsData || []);
        
        } catch (error) {
            setError('An error occurred while fetching data');
            console.error('Error fetching data:', error.message);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);
    
    useEffect(() => {
        console.log('Stud Sections:', studSections);
        console.log('Stud Strands:', studStrands);
    }, [studSections, studStrands]);
    
    
    const handleSubmit = async (e) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        e.preventDefault();
        setLoading(true);
        setError('');

        const sectionData = {
            name,
            strand: linkedStrand,
            teacher: selectedTeachers, // Use the selected teacher ID
            subjects: selectedSubjects,  // Use selectedSubjects here
        };

        try {
            const response = await fetch('/api/admin/addSections', {
                method: 'POST',
                body: JSON.stringify(sectionData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.message || 'Failed to create section');
            } else {
                setName('');
                setLinkedStrand('');
                setSelectedTeachers([]); // Reset teacher after successful creation
                setSelectedSubjects([]); // Reset selected subjects after successful section creation
                console.log('Section created successfully');
                fetchData();  // Re-fetch Sections to update the table
            }
        } catch (error) {
            setError('An error occurred while creating the section');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtering and Pagination
    const filteredSections = studSections.filter((section) =>
        section.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredSections.slice(indexOfFirstEntry, indexOfLastEntry);

    const totalPages = Math.ceil(filteredSections.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <>
            <AdminSidebar />
            <div className='d-flex'>
                <main className="main-content flex-grow-1">
                    <Container>
                        <Card className="mt-4">
                            <Card.Header>
                                <h4 className="mb-0">Create New Section</h4>
                            </Card.Header>
                            <Card.Body>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Section Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter section name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                    <Form.Label>Strands:</Form.Label>
                                    <Form.Select
                                        value={linkedStrand}
                                        onChange={(e) => setLinkedStrand(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Strand</option>
                                        {Array.isArray(studStrands) && studStrands.length > 0 ? (
                                            studStrands.map((strand) => (
                                                <option key={strand._id} value={strand._id}>
                                                    {strand.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No strands available</option>  
                                        )}
                                    </Form.Select>
                                </Form.Group>



                                    <Form.Group className="mb-3">
                                        <Form.Label>Teachers:</Form.Label>
                                        <Form.Select
                                        multiple
                                            value={selectedTeachers}
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                setSelectedTeachers(selected); // Update selected subjects
                                            }}
                                            required
                                        >
                                            {users.map((teacher) => (
                                                <option key={teacher._id} value={teacher._id}>
                                                    {teacher.username}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Select Subjects:</Form.Label>
                                        <Form.Select
                                        multiple
                                        value={selectedSubjects}
                                        onChange={(e) => {
                                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                                            setSelectedSubjects(selected); // Update selected subjects
                                        }}
                                        required
                                    >
                                        {studSubjects.map((subject) => (
                                            <option key={subject._id} value={subject._id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </Form.Select>

                                    </Form.Group>



                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => navigate('/admin/ManageSections')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating...' : 'Create Section'}
                                        </Button>
                                    </div>
                                </Form>

                                <h2 className="my-4">Sections List</h2>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <div className="d-flex align-items-center">
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by name"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{ width: '300px' }}
                                        />
                                        <Button variant="outline-secondary">
                                            <FaSearch />
                                        </Button>
                                    </div>

                                    <Form.Select
                                        value={entriesPerPage}
                                        onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
                                        style={{ width: '150px' }}
                                    >
                                        <option value={10}>10 Entries</option>
                                        <option value={25}>25 Entries</option>
                                        <option value={50}>50 Entries</option>
                                    </Form.Select>
                                </div>

                                <Table striped bordered hover responsive>
                                    <thead>
                                        <tr>
                                            <th>Section Name</th>
                                            <th>Strand</th>
                                            <th>Teacher</th>
                                            <th>Subjects</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                {currentEntries.map((section) => (
                                    <tr key={section._id}>
                                        <td>{section.name}</td>
                                        <td>{section.strand ? section.strand.name : 'N/A'}</td>
                                        <td>
                                        {Array.isArray(section.teacher) && section.teacher.length > 0
                                            ? section.teacher.map((teacher) => teacher.username).join(', ')
                                            : 'N/A'}
                                    </td>

                                        <td>
                                            {Array.isArray(section.subjects) && section.subjects.length > 0
                                                ? section.subjects.map((subject) => subject.name).join(', ')
                                                : 'N/A'}
                                        </td>
                                        <td>
                                        <button
                                             className="btn btn-primary custom-btn"
                                                onClick={() => handleEditShow(section._id)}
                                             >
                                                  Edit
                                        </button>
                                             <button
                                            className="btn btn-danger custom-btn"
                                            onClick={() => handleShow(section._id)}
                                        >
                                             Delete
                                         </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                                </Table>

                                <div className="d-flex justify-content-between">
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => handlePageChange('prev')}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => handlePageChange('next')}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Container>
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
            onClick={() => selectedSectionId && deleteHandler(selectedSectionId)}
        >
            Confirm
        </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={editModalShow} onHide={handleCloseModal}>
    <Modal.Header closeButton>
        <Modal.Title>Edit Section</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form>
            {/* Strand Name */}
            <Form.Group className="mb-3">
                <Form.Label>Section Name</Form.Label>
                <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </Form.Group>

                                        {/* Strand Description */}
                                        <Form.Group className="mb-3">
    <Form.Label>Strand</Form.Label>
    <Form.Control
        as="select"
        value={linkedStrand || ""} // Default to an empty string
        onChange={(e) => setLinkedStrand(e.target.value)}
        required
    >
        <option value="">Select Strand</option>
        {Array.isArray(studStrands) &&
            studStrands.map((strand) => (
                <option key={strand._id} value={strand._id}>
                    {strand.name}
                </option>
            ))}
    </Form.Control>
</Form.Group>

<Form.Group className="mb-3">
    <Form.Label>Teachers</Form.Label>
    <Form.Control
        as="select"
        multiple
        value={selectedTeachers || []} // Default to an empty array
        onChange={(e) =>
            setSelectedTeachers([...e.target.selectedOptions].map((option) => option.value))
        }
        required
    >
        {users.map((teacher) => (
            <option key={teacher._id} value={teacher._id}>
                {teacher.username}
            </option>
        ))}
    </Form.Control>
</Form.Group>

<Form.Group className="mb-3">
    <Form.Label>Subjects</Form.Label>
    <Form.Control
        as="select"
        multiple
        value={selectedSubjects || []} // Default to an empty array
        onChange={(e) =>
            setSelectedSubjects([...e.target.selectedOptions].map((option) => option.value))
        }
        required
    >
        {studSubjects.map((subject) => (
            <option key={subject._id} value={subject._id}>
                {subject.name}
            </option>
        ))}
    </Form.Control>
</Form.Group>


        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveChanges}>
            Save Changes
        </Button>
    </Modal.Footer>
</Modal>
                </main>
            </div>
        </>
    );
};

export default ManageSections;
