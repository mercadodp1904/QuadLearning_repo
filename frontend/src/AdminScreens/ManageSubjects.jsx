import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Header from '../components/Header';
const ManageSubjects = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [studSubjects, setStudSubjects] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [strands, setStrands] = useState([]);
    const [selectedStrand, setSelectedStrand] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [semester, setSemester] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [editModalShow, setEditModalShow] = useState(false);
    const [yearLevels, setYearLevels] = useState([]);

    const filteredSemesters = Array.isArray(semesters) 
    ? semesters.filter(semester => 
        semester.strand?._id === selectedStrand && 
        semester.yearLevel?._id === selectedYearLevel
    ) 
    : [];


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
            setSelectedStrand(subject.strand._id);
            setSelectedYearLevel(subject.yearLevel._id);
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
        setSelectedStrand('');
        setSelectedYearLevel('');
        setSelectedSemester('');
    };
    

    
    
    const handleSaveChanges = async () => {
        const updatedSubject = {
            name,
            code,
            semester: selectedSemester,
            yearLevel: selectedYearLevel,
            strand: selectedStrand
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
            console.error('Error deleting subject:', error);
            setError('Failed to delete subject');
        }
    };

    const fetchAllData = async () => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    
        try {
            const [subjectsResponse, semestersResponse, strandsResponse, yearLevelsResponse] = await Promise.all([
                fetch('/api/admin/getSubjects', { headers }),
                fetch('/api/admin/semesters', { headers }),
                fetch('/api/admin/getStrands', { headers }),
                fetch('/api/admin/yearLevels', { headers }) // Add this line
            ]);
    
            const [subjectsData, semestersData, strandsData, yearLevelsData] = await Promise.all([
                subjectsResponse.json(),
                semestersResponse.json(),
                strandsResponse.json(),
                yearLevelsResponse.json() // Add this line
            ]);

            console.log('Subjects from server:', subjectsData);

            console.log('Fetched data:', {
                subjects: subjectsData,
                semesters: semestersData,
                strands: strandsData,
                yearLevels: yearLevelsData
            });
    
            setStudSubjects(subjectsData);
            setSemesters(semestersData);
            setStrands(strandsData);
            setYearLevels(yearLevelsData); // Add this line
        } catch (error) {
            console.error('Error fetching data:', error.message);
            setError('An error occurred while fetching data');
        }
    };

    // Fetch data when the component mounts
    useEffect(() => {
        fetchAllData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        const token = localStorage.getItem('token');
    
        // Create subject data
        const subjectData = {
            strand: selectedStrand,
            yearLevel: selectedYearLevel,
            semester: selectedSemester,
            name,
            code
        };
    
        try {
            // Make sure this endpoint matches your backend route
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
                // Clear form
                setName('');
                setCode('');
                setSelectedStrand('');
                setSelectedYearLevel('');
                setSelectedSemester('');
                
                console.log('Subject created successfully');
            }
        } catch (error) {
            setError('An error occurred while creating the subject');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
        fetchAllData();
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
        <Header/>
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
                                                <Form.Label>Strand</Form.Label>
                                                <Form.Select
                                                    value={selectedStrand}
                                                    onChange={(e) => setSelectedStrand(e.target.value)}
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

                                            <Form.Group className="mb-3">
                                            <Form.Label>Year Level</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={selectedYearLevel}
                                                onChange={(e) => setSelectedYearLevel(e.target.value)}
                                                required
                                            >
                                                <option value="">Select Year Level</option>
                                                {yearLevels.map(yearLevel => (
                                                    <option key={yearLevel._id} value={yearLevel._id}>
                                                        {yearLevel.name}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>

                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Term</Form.Label>
                                    <Form.Select
                                        value={selectedSemester}
                                        onChange={(e) => setSelectedSemester(e.target.value)}
                                        required
                                        disabled={!selectedStrand || !selectedYearLevel}
                                    >
                                        <option value="">Select Term</option>
                                        {filteredSemesters.map(semester => (
                                            <option key={semester._id} value={semester._id}>
                                                {`${semester.name} - ${semester.strand.name}`}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Subject Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder='Enter subject name'
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

                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => navigate('/admin/ManageSubjects')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="outline-success"
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

                                <Card className="shadow-sm">
                    <Card.Body className="p-0">
                    <Table responsive hover className='custom-table text-center align-middle'>
                            <thead className="bg-light">
                    <tr>
                        <th>Subject Name</th>
                        <th>Subject Code</th>
                        <th>Strand</th>
                        <th>Year Level</th>
                        <th>Semester</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
    {currentEntries.map((subject) => (
        <tr key={subject._id}>
            <td>{subject.name}</td>
            <td>{subject.code}</td>
            <td>{subject.strand?.name}</td>
            <td>{subject.yearLevel?.name}</td>
            <td>
                {`${subject.semester?.name} - ${subject.semester?.strand?.name || ''}`}
            </td>
            <td>
                                                    <div className="action-buttons">
                                                        <Button 
                                                            variant="outline-success" 
                                                            size="sm" 
                                                                className="btn-action"
                                                                onClick={() => handleEditShow(subject._id)}
                                                        >
                                                            <i className="bi bi-pencil-square me-1"></i>
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm" 
                                                            className="btn-action"
                                                            onClick={() => handleShow(subject._id)}
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
                            </Card.Body>
                        </Card>


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

                            </Card.Body>
                        </Card>
                    </Container>
                    <Modal show={show} onHide={handleClose} className='text-center'>
        <Modal.Header closeButton className='text-center'>
          <Modal.Title className='text-center w-100'>CONFIRMATION MESSAGE</Modal.Title>
        </Modal.Header>
        <Modal.Body>The data will be erased and cannot be retrieved. Are you sure you want to continue?</Modal.Body>
        <Modal.Footer className='justify-content-center'>
        <Button variant="outline-secondary" className="px-4" onClick={() => setShow(false)}>
            Cancel
          </Button>
      <Button 
            variant="outline-danger" 
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
                                                <Form.Label>Strand</Form.Label>
                                                <Form.Select
                                                    value={selectedStrand}
                                                    onChange={(e) => setSelectedStrand(e.target.value)}
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

                                            <Form.Group className="mb-3">
                                            <Form.Label>Year Level</Form.Label>
                                            <Form.Control
                                                as="select"
                                                value={selectedYearLevel}
                                                onChange={(e) => setSelectedYearLevel(e.target.value)}
                                                required
                                            >
                                                <option value="">Select Year Level</option>
                                                {yearLevels.map(yearLevel => (
                                                    <option key={yearLevel._id} value={yearLevel._id}>
                                                        {yearLevel.name}
                                                    </option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>

                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Term</Form.Label>
                                    <Form.Select
                                        value={selectedSemester}
                                        onChange={(e) => setSelectedSemester(e.target.value)}
                                        required
                                        disabled={!selectedStrand || !selectedYearLevel}
                                    >
                                        <option value="">Select Term</option>
                                        {filteredSemesters.map(semester => (
                                            <option key={semester._id} value={semester._id}>
                                                {`${semester.name} - ${semester.strand.name}`}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Subject Name</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder='Enter subject name'
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
        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleCloseModal}>
            Cancel
        </Button>
        <Button variant="outline-success" onClick={handleSaveChanges}>
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