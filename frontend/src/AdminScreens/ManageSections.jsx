import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';

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
    
            setStudSections(sectionsData);
            setStudStrands(strandsData);
            setUsers(usersData);
            setStudSubjects(subjectsData);
    
        } catch (error) {
            setError('An error occurred while fetching data');
            console.error('Error fetching data:', error.message);
        }
    };

    useEffect(() => {
        fetchData(); // Fetch data when the component mounts
    }, []);
    
    const handleSubmit = async (e) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        e.preventDefault();
        setLoading(true);
        setError('');

        const sectionData = {
            name,
            teacher, // Use the selected teacher ID
            strand: linkedStrand,
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
                setTeacher(''); // Reset teacher after successful creation
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
                                            {studStrands.map((strand) => (
                                                <option key={strand._id} value={strand._id}>
                                                    {strand.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Teachers:</Form.Label>
                                        <Form.Select
                                            value={teacher}
                                            onChange={(e) => setTeacher(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Teacher</option>
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
                                            value={selectedSubjects} // Bind this to selectedSubjects
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                                setSelectedSubjects(selected); // Update selected subjects
                                            }}
                                            required
                                        >
                                            <option value="">Select Subjects</option>
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
                                                <td>{section.strand.name}</td>
                                                <td>{section.teacher.username}</td>
                                                <td>{section.subjects.map((subject) => subject.name).join(', ')}</td>
                                                <td>
                                                    <Button variant="warning" onClick={() => handleEdit(section._id)}>
                                                        Edit
                                                    </Button>
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
                </main>
            </div>
        </>
    );
};

export default ManageSections;
