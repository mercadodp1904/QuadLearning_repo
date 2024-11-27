import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';

const ManageSubjects = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [studSubjects, setStudSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [semester, setSemester] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSections, setSelectedSections] = useState([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [editModalShow, setEditModalShow] = useState(false);
    const [sectionsData, setSectionsData] = useState([]);


    const handleClose = () => {
        setShow(false);
        setSelectedSubjectId(null);  // Reset selectedUserId when modal closes
    };

    const handleShow = (subjectId) => {
        setSelectedSubjectId(subjectId);  // Set the userId when showing modal
        setShow(true);
    };

    
    
    const handleEditShow = (subjectId) => {
        const subject = studSubjects.find((subj) => subj._id === subjectId);
        if (subject) {
            setSelectedSubjectId(subjectId);
            setName(subject.name);
            setCode(subject.code);
            setSemester(subject.semester);
            setSections(subject.sections);
            setSelectedSections(subject.sections); // Set selected sections when the modal opens
            setEditModalShow(true);
        } else {
            console.error('Subject not found');
        }
    };
    
    
    

    const handleCloseModal = () => {
        setEditModalShow(false);
        setSelectedSubjectId(null); // Reset selected subject data only when modal closes
        setName('');  // Clear name
        setCode('');  // Clear code
        setSemester('');  // Clear semester
        // Do not reset selectedSections, as you want to keep it after the modal closes.
    };
    

    
    
    const handleSaveChanges = async () => {
        const updatedSubject = {
            name,
            code,
            semester,
            sections: selectedSections, // Ensure selectedSections is passed here
        };
    
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch(`/api/admin/subjects/${selectedSubjectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedSubject),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                // Successfully updated the subject
                setStudSubjects((prevSubjects) =>
                    prevSubjects.map((subject) =>
                        subject._id === selectedSubjectId ? result : subject
                    )
                );
                handleCloseModal();  // Close the modal after saving
            } else {
                console.error('Error updating subject:', result.message);
            }
        } catch (error) {
            console.error('Failed to update subject:', error);
        }
        fetchAllData();
    };
    
    
    
    

    const deleteHandler = async (subjectId) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        console.log("Deleting subject with ID:", subjectId);
        try {
            const response = await fetch(`/api/admin/subjects/${subjectId}`, { // Corrected endpoint
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Ensure token is included
                }
            });
    
            console.log("Response status:", response.status);
            if (response.ok) {
                setStudSubjects(prevSubjects => prevSubjects.filter(subject => subject._id !== subjectId));
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

    // Fetch subjects, semesters, and sections
    const fetchAllData = async () => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        try {
            const [subjectsResponse, semestersResponse, sectionsResponse] = await Promise.all([
                fetch('/api/admin/getSubjects', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch('/api/admin/getSemesters', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch('/api/admin/getSections', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                })
            ]);

            const [subjectsData, semestersData, sectionsData] = await Promise.all([
                subjectsResponse.json(),
                semestersResponse.json(),
                sectionsResponse.json()
            ]);

            setStudSubjects(subjectsData);
            setSemesters(semestersData);
            setSections(sectionsData)
            setSectionsData(sectionsData);

        } catch (error) {
            console.error('Error fetching data:', error.message);
            setError('An error occurred while fetching data');
        }
    };

    // Fetch data when the component mounts
    useEffect(() => {
        fetchAllData();
    }, []);

    // Handle form submission to create a new subject
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        const token = localStorage.getItem('token');
    
        // Create subject data with only selected 
        const subjectData = {
            name,
            code,
            semester,
            sections: selectedSections,
        };
    
        try {
            const response = await fetch('/api/admin/addSubjects', {
                method: 'POST',
                body: JSON.stringify(subjectData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const json = await response.json();
    
            if (!response.ok) {
                setError(json.message || 'Failed to create subject');
            } else {
                setName('');
                setCode('');
                setSemester('');
                setSelectedSections([]);
                console.log('Subject created successfully');
                // Re-fetch subjects to update the table
                fetchAllData();
            }
        } catch (error) {
            setError('An error occurred while creating the subject');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    

    const filteredSubjects = Array.isArray(studSubjects)
    ? studSubjects.filter((subject) => subject.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];  // If it's not an array, return an empty array

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredSubjects.slice(indexOfFirstEntry, indexOfLastEntry);

    const totalPages = Math.ceil(filteredSubjects.length / entriesPerPage);

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
                                <h4 className="mb-0">Create New Subject</h4>
                            </Card.Header>
                            <Card.Body>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Subject Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter subject name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Subject Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter subject code"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Semester</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={semester}
                                            onChange={(e) => setSemester(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Semester</option>
                                            {semesters.map((sem) => (
                                                <option key={sem._id} value={sem._id}>
                                                    {sem.name}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Sections</Form.Label>
                                        <Form.Control
                                            as="select"
                                            multiple
                                            value={selectedSections} // Bind to selectedSections state
                                            onChange={(e) => setSelectedSections([...e.target.selectedOptions].map(option => option.value))}
                                            required
                                        >
                                            {sectionsData.map((section) => (
                                                <option key={section._id} value={section._id}>
                                                    {section.name}
                                                </option>
                                            ))}
                                        </Form.Control>

                                    </Form.Group>

                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => navigate('/admin/ManageSubjects')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="primary"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating...' : 'Create Subject'}
                                        </Button>
                                    </div>
                                </Form>
                                
                                <h2 className="my-4">Subjects List</h2>

                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    {/* Entries Dropdown */}
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

                                    {/* Search Input */}
                                    <div className="d-flex align-items-center">
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                placeholder="Search Subject Name"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <InputGroup.Text>
                                                <FaSearch />
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </div>
                                </div>

                               <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Code</th>
                                        <th>Semester</th>
                                        <th>Sections</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
    {currentEntries.length > 0 ? (
        currentEntries.map((subject) => (
            <tr key={subject._id}>
                <td>{subject.name}</td>
                <td>{subject.code}</td>
                <td>
                    {subject.semester ? subject.semester.name : 'No Semester'}
                </td>
                    <td>
                        {subject.sections && subject.sections.length > 0 ? (
                            subject.sections
                                .map((section) => section.name) 
                                .sort() 
                                .map((section, index) => (
                                    <div key={index}>{section}</div>
                                ))
                        ) : (
                            <span>No section assigned</span>
                        )}
                    </td>
                <td>
                                    <button
                        className="btn btn-primary custom-btn"
                        onClick={() => handleEditShow(subject._id)}
                    >
                        Edit
                    </button>

                    <button
                              className="btn btn-danger custom-btn"
                                onClick={() => handleShow(subject._id)}
                            >
                              Delete
                            </button>
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="6" className="text-center">No results found</td>
        </tr>
    )}
</tbody>


                            </Table>


                                <div className="d-flex justify-content-between">
                                    <Button
                                        variant="secondary"
                                        onClick={() => handlePageChange('prev')}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="secondary"
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
            onClick={() => selectedSubjectId && deleteHandler(selectedSubjectId)}
        >
            Confirm
        </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={editModalShow} onHide={handleCloseModal}>
    <Modal.Header closeButton>
        <Modal.Title>Edit Subject</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        <Form>
            <Form.Group className="mb-3">
                <Form.Label>Subject Name</Form.Label>
                <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Subject Code</Form.Label>
                <Form.Control
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Semester</Form.Label>
                <Form.Control
                    as="select"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                >
                    <option value="">Select Semester</option>
                    {semesters.map((sem) => (
                        <option key={sem._id} value={sem._id}>
                            {sem.name}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Sections</Form.Label>
                <Form.Control
                    as="select"
                    multiple
                    value={sections}
                     onChange={(e) => setSelectedSections([...e.target.selectedOptions].map(option => option.value))}
                    required
                >
                    {sectionsData.map((section) => (
                        <option key={section._id} value={section._id}>
                            {section.name}
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

export default ManageSubjects;
