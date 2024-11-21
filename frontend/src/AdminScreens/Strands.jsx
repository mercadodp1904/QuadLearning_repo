import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';

const AdminCreateStrand = () => {
    const navigate = useNavigate();
    const [studStrands, setStudStrands] = useState([]);
    const [studSubjects, setStudSubjects] = useState([]);  // List of all subjects
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedSubjects, setSelectedSubjects] = useState([]);  // List of selected subject IDs
    const [selectedSections, setSelectedSections] = useState([]);  // List of selected section IDs
    const [studSections, setStudSections] = useState([]);  // List of all sections
    
    const fetchData = async () => {
        const token = localStorage.getItem('token');
    
        try {
            const [strandsResponse, subjectsResponse, sectionResponse] = await Promise.all([
                fetch('/api/admin/getStrands', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }),
                fetch('/api/admin/getSubjects', {
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
                }),
            ]);
    
            if (strandsResponse.ok && subjectsResponse.ok && sectionResponse.ok) {
                const [strandsJson, subjectsJson, sectionsJson] = await Promise.all([
                    strandsResponse.json(),
                    subjectsResponse.json(),
                    sectionResponse.json(),
                ]);
    
                // Check the structure of the data returned
                console.log('Strands:', strandsJson);
                console.log('Subjects:', subjectsJson);
                console.log('Sections:', sectionsJson);
    
                setStudStrands(strandsJson);
                setStudSubjects(subjectsJson);
                setStudSections(sectionsJson);
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };
    

    // Fetch strands and subjects when the component mounts
    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        e.preventDefault();
        setLoading(true);
        setError('');

        const strandData = {
            name,
            description,
            subjects: selectedSubjects, // Use selected subjects
            sections: selectedSections // Use selected sections
        };

        try {
            const response = await fetch('/api/admin/addStrands', {
                method: 'POST',
                body: JSON.stringify(strandData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.message || 'Failed to create strand');
            } else {
                setName('');
                setDescription('');
                setSelectedSubjects([]);  // Reset selected subjects
                setSelectedSections([]);  // Reset selected sections
                console.log('Strand created successfully');
                // Re-fetch strands to update the table
                fetchData();
            }
        } catch (error) {
            setError('An error occurred while creating the strand');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtering and Pagination
    const filteredStrands = studStrands.filter((strand) =>
        strand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredStrands.slice(indexOfFirstEntry, indexOfLastEntry);

    const totalPages = Math.ceil(filteredStrands.length / entriesPerPage);

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
                                <h4 className="mb-0">Create New Strand</h4>
                            </Card.Header>
                            <Card.Body>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Strand Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter strand name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Enter strand description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Section(s):</Form.Label>
                                        <Form.Select
                                            multiple
                                            value={selectedSections}  // Use selected section ids
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                                                setSelectedSections(selected);
                                            }}
                                            required
                                        >
                                            {studSections.map((section) => (
                                                <option key={section._id} value={section._id}>
                                                    {section.name}
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
                                                setSelectedSubjects(selected);
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
                                            onClick={() => navigate('/admin/strands')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating...' : 'Create Strand'}
                                        </Button>
                                    </div>
                                </Form>
                                
                                <h2 className="my-4">Strands List</h2>

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
                                        <th>Description</th>
                                        <th>Sections</th>
                                        <th>Subjects</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                            {currentEntries.length > 0 ? (
                                                currentEntries.map((strand) => (
                                                    <tr key={strand._id}>
                                                        <td>{strand.name}</td>
                                                        <td>{strand.description}</td>
                                                        <td>
                                                            {strand.sections && strand.sections.length > 0 ? (
                                                                strand.sections.map((section) => (
                                                                    <span key={section._id}>{section.name} </span>
                                                                ))
                                                            ) : (
                                                                <span>No sections available</span>
                                                            )}
                                                        </td>
                                                        <td>{strand.subjects.map((subject) => subject.name).join(', ')}</td>
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
                                                    <td colSpan="5" className="text-center">No results found</td>
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

export default AdminCreateStrand;
