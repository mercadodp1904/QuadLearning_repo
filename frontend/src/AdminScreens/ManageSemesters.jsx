import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';

const ManageSemesters = () => {
    const navigate = useNavigate();
    const [semesters, setSemesters] = useState([]);
    const [selectedSemesterId, setselectedSemesterId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [show, setShow] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Reusable fetchSemesters function
    const fetchSemesters = async () => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        try {
            const response = await fetch('/api/admin/getSemesters', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Add the Bearer token here
                },
            });

            if (response.ok) {
                const json = await response.json();
                setSemesters(json); // Set the data if the response is successful
            } else {
                console.error('Failed to fetch semesters:', response.status);
            }
        } catch (error) {
            console.error('Error fetching semesters:', error.message);
        }
    };

    // Fetch semesters when the component mounts
    useEffect(() => {
        fetchSemesters();
    }, []);

    const handleSubmit = async (e) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        e.preventDefault();
        setLoading(true);
        setError('');
    
        // Check if both startDate and endDate are not empty
        if (!startDate || !endDate) {
            setError('Both start date and end date are required.');
            setLoading(false);
            return;
        }
    
        // Convert the string dates into Date objects
        const start = new Date(startDate);
        const end = new Date(endDate);
    
        // Check if the Date objects are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            setError('Invalid date format');
            setLoading(false);
            return;
        }
    
        // Create the semester data with ISO format for date
        const semesterData = {
            name,
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };
    
        try {
            const response = await fetch('/api/admin/addSemesters', {
                method: 'POST',
                body: JSON.stringify(semesterData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const json = await response.json();
    
            if (!response.ok) {
                setError(json.message || 'Failed to create semester');
            } else {
                setName('');
                setStartDate('');
                setEndDate('');
                fetchSemesters();
                console.log('Semester created successfully');
                // Optionally, fetch updated semesters or redirect
            }
        } catch (error) {
            setError('An error occurred while creating the semester');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    
    const handleClose = () => {
        setShow(false);
        setselectedSemesterId(null);  // Reset selectedUserId when modal closes
    };

    const handleShow = (semesterId) => {
        setselectedSemesterId(semesterId);  // Set the userId when showing modal
        setShow(true);
    };
    
    const deleteHandler = async (semesterId) => {
        const token = localStorage.getItem('token'); // Retrieve token
        try {
            const response = await fetch(`/api/admin/semesters/${semesterId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            if (response.ok) {
                setSemesters(prevSemesters => prevSemesters.filter(semester => semester._id !== semesterId));
                handleClose();  // Close the modal after deletion
            } else {
                const error = await response.json();  // Log the error message from backend
                console.error('Error deleting semester:', error.message);
            }
        } catch (error) {
            console.error('Error deleting semester:', error.message);
        }
    };
    

    // Filtering and Pagination
    const filteredSemesters = semesters.filter((semester) =>
        semester.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredSemesters.slice(indexOfFirstEntry, indexOfLastEntry);

    const totalPages = Math.ceil(filteredSemesters.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <>
            <AdminSidebar />
            <div className="d-flex">
                <main className="main-content flex-grow-1">
                    <Container>
                        <Card className="mt-4">
                            <Card.Header>
                                <h4 className="mb-0">Create New Semester</h4>
                            </Card.Header>
                            <Card.Body>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Semester Term</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Semester</option>
                                            <option value="1st Semester">1st Semester</option>
                                            <option value="2nd Semester">2nd Semester</option>
                                            <option value="Summer Term">Summer Term</option>
                                        </Form.Control>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => navigate('/admin/ManageSemesters')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating...' : 'Create Semester'}
                                        </Button>
                                    </div>
                                </Form>

                                <h2 className="my-4">Semesters List</h2>

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

                                    {/* Search Bar */}
                                    <InputGroup style={{ width: '300px' }}>
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

                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Term</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody> 
                                        {currentEntries.length > 0 ? (
                                            currentEntries.map((semester) => (
                                                <tr key={semester._id}>
                                                    <td>{semester.name}</td>
                                                    <td>{new Date(semester.startDate).toLocaleDateString()}</td>
                                                    <td>{new Date(semester.endDate).toLocaleDateString()}</td>
                                                    <td>
                                                        <Button variant="info" size="sm" className="me-2">
                                                            Edit
                                                        </Button>
                                                        <button 
                                                        className='btn btn-danger custom-btn' 
                                                        onClick={() => handleShow(semester._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No results found</td>
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
                            </Card.Body>
                        </Card>
                    </Container>
                </main>
            </div>
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
            onClick={() => selectedSemesterId && deleteHandler(selectedSemesterId)}
        >
            Confirm
        </Button>
        </Modal.Footer>
      </Modal>
        </>
    );
};

export default ManageSemesters;
