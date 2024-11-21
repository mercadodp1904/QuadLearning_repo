import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';

const ManageSubjects = () => {
    const navigate = useNavigate();
    const [studSubjects, setStudSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [semesters, setSemesters] = useState([]);


    // Function to fetch semesters
const fetchSemesters = async () => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/api/admin/getSemesters', { // Ensure the endpoint is correct
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            setSemesters(data); // Assuming the backend returns an array of semesters
        } else {
            console.error('Failed to fetch semesters:', response.status);
        }
    } catch (error) {
        console.error('Error fetching semesters:', error.message);
    }
};

// Fetch semesters on component mount
useEffect(() => {
    fetchSemesters();
}, []);

    // Reusable fetchSubjects function
    const fetchSubjects = async () => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        try {
            const response = await fetch('/api/admin/getSubjects', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Add the Bearer token here
                },
            });

            if (response.ok) {
                const json = await response.json();
                setStudSubjects(json); // Set the data if the response is successful
            } else {
                console.error('Failed to fetch subjects:', response.status);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error.message);
        }
    };

    // Fetch subjects when the component mounts
    useEffect(() => {
        fetchSubjects();
    }, []);
    const [semester, setSemester] = useState('');
    const handleSubmit = async (e) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        e.preventDefault();
        setLoading(true);
        setError('');

        const subjectData = {
            name,
            code,
            semester,
        };

        try {
            const response = await fetch('/api/admin/addSubjects', {
                method: 'POST',
                body: JSON.stringify(subjectData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`, // Add the Bearer token here
                },
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.message || 'Failed to create subject');
            } else {
                setName('');
                setCode('');
                console.log('Subject created successfully');
                // Re-fetch subjects to update the table
                fetchSubjects();
            }
        } catch (error) {
            setError('An error occurred while creating the subject');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtering and Pagination
    const filteredSubjects = studSubjects.filter((subject) =>
        subject.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                        onChange={(e) => setSemester(e.target.value)} // Set the selected semester
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
                                            <th>Name</th>
                                            <th>Subject Code</th>
                                            <th>Semester</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody> 
                                        {currentEntries.length > 0 ? (
                                            currentEntries.map((studSubjects) => (
                                                <tr key={studSubjects._id}>
                                                    <td>{studSubjects.name}</td>
                                                    <td>{studSubjects.code}</td>
                                                    <td>{studSubjects.semester.name}</td>
                                                    <td>
                                                        <Button variant="info" size="sm" className="me-2">
                                                            Edit
                                                        </Button>
                                                        <Button variant="danger" size="sm">
                                                            Delete
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center">No results found</td>
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
        </>
    );
};

export default ManageSubjects;
