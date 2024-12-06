import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import Header from '../components/Header';
const ManageSemesters = () => {
    const navigate = useNavigate();
    const [semesters, setSemesters] = useState([]);
    const [selectedSemesterId, setselectedSemesterId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [strands, setStrands] = useState([]);
    const [selectedStrand, setSelectedStrand] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [show, setShow] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [yearLevels, setYearLevels] = useState([]);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };
    
        try {
            // Add comprehensive logging
            console.log('Fetching data with token:', token);
    
            const [semestersRes, strandsRes, yearLevelsRes] = await Promise.all([
                fetch('/api/admin/semesters', { headers }),
                fetch('/api/admin/getStrands', { headers }),
                fetch('/api/admin/yearLevels', { headers })
            ]);
    
            // Comprehensive error logging for each response
            const logResponse = async (response, resourceName) => {
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`${resourceName} Fetch Error:`, {
                        status: response.status,
                        statusText: response.statusText,
                        errorText
                    });
                    throw new Error(`Failed to fetch ${resourceName}`);
                }
                return response;
            };
    
            // Log and validate each response
            await Promise.all([
                logResponse(semestersRes, 'Semesters'),
                logResponse(strandsRes, 'Strands'),
                logResponse(yearLevelsRes, 'Year Levels')
            ]);
    
            // Parse responses
            const [semestersData, strandsData, yearLevelsData] = await Promise.all([
                semestersRes.json(),
                strandsRes.json(),
                yearLevelsRes.json()
            ]);
    
            // Comprehensive validation and sanitization
            const validateArray = (data, resourceName) => {
                if (!Array.isArray(data)) {
                    console.error(`Expected an array for ${resourceName}, got:`, data);
                    return [];
                }
                return data.filter(item => item && item._id);
            };
    
            // Sanitize and set data
            const sanitizedSemesters = validateArray(semestersData, 'Semesters').map(semester => ({
                ...semester,
                name: semester.name || 'Unnamed Semester',
                strand: semester.strand || { name: 'No Strand', _id: null },
                yearLevel: semester.yearLevel || { name: 'No Year Level', _id: null }
            }));
    
            const sanitizedStrands = validateArray(strandsData, 'Strands');
            const sanitizedYearLevels = validateArray(yearLevelsData, 'Year Levels');
    
            // Extensive logging of parsed and sanitized data
            console.log('Parsed and Sanitized Data:', {
                semesters: sanitizedSemesters,
                strands: sanitizedStrands,
                yearLevels: sanitizedYearLevels
            });
    
            // Set states with sanitized data
            setSemesters(sanitizedSemesters);
            setStrands(sanitizedStrands);
            setYearLevels(sanitizedYearLevels);
    
        } catch (error) {
            console.error('Comprehensive Fetch Error:', {
                message: error.message,
                stack: error.stack
            });
            
            // Set user-friendly error message
            setError(`Failed to load data: ${error.message}`);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        e.preventDefault();
        setLoading(true);
        setError('');
    
        if (!name || !selectedStrand || !selectedYearLevel || !startDate || !endDate) {
            setError('All fields are required');
            setLoading(false);
            return;
        }
    
        const semesterData = {
            name,
            strand: selectedStrand,
            yearLevel: selectedYearLevel,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
        };
    
        try {
            const response = await fetch('/api/admin/addSemesters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(semesterData),
            });
    
            const json = await response.json();
    
            if (!response.ok) {
                setError(json.message || 'Failed to create semester');
            } else {
                setName('');
                setSelectedStrand('');
                setSelectedYearLevel('');
                setStartDate('');
                setEndDate('');
                fetchData();
            }
        } catch (error) {
            setError('An error occurred while creating the semester');
        } finally {
            setLoading(false);
        }
       fetchData();
    };

    
    const handleClose = () => {
        setShow(false);
        setselectedSemesterId(null);
    };
    

    const handleShow = (semesterId) => {
        setselectedSemesterId(semesterId);  // Set the userId when showing modal
        setShow(true);
    };

const handleEdit = (semester) => {
    setselectedSemesterId(semester._id);
    setName(semester.name);
    setSelectedStrand(semester.strand?._id || '');
    setStartDate(semester.startDate?.split('T')[0] || '');
    setEndDate(semester.endDate?.split('T')[0] || '');
    setEditModalShow(true);
};
    
    const handleCloseModal = () => {
        setEditModalShow(false);
        setselectedSemesterId(null);
        setName('');
        setStartDate('');
        setEndDate('');
        // Don't reset studSections unless necessary.
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
                // Update semesters list
                setSemesters(prevSemesters => prevSemesters.filter(semester => semester._id !== semesterId));
                
                // Close the modal
                handleClose();
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

    const handleSaveChanges = async () => {
        
        const updatedSection = {
            name,
            startDate: startDate, // This could be the value selected from the dropdown
            endDate: endDate, // Pass the selected subjects 
            yearLevel: selectedYearLevel,
        };
    
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch(`/api/admin/semesters/${selectedSemesterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedSection),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                // Successfully updated the semester
                setSemesters((prevSemesters) =>
                    prevSemesters.map((semester) =>
                        semester._id === selectedSemesterId ? result : semester // Use `semester` instead of `section`
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
    

    return (
        <>
        <Header/>
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
                                <Form.Label>Strand</Form.Label>
        <Form.Control
            as="select"
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
        </Form.Control>
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
        <Form.Label>Semester Name</Form.Label>
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
                                            variant="outline-secondary" 
                                            onClick={() => navigate('/admin/ManageSemesters')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="outline-success" 
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

                                {/* Update the table to show strand information */}
                                <Table responsive hover className='custom-table text-center align-middle'>
                                        <thead className='text-center'>
                                            <tr>
                                                <th>Strand</th>
                                                <th>Term</th>
                                                <th>Year Level</th>
                                                <th>Start Date</th>
                                                <th>End Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className='text-center'>
                                            {currentEntries.map((semester) => (
                                                <tr key={semester._id}>
                                                    <td>{semester.strand ? semester.strand.name : 'N/A'}</td>
                                                    <td>{`${semester.name} - ${semester.strand.name}`}</td>
                                                    <td>{semester.yearLevel ? semester.yearLevel.name : 'N/A'}</td>
                                                    <td>{new Date(semester.startDate).toLocaleDateString()}</td>
                                                    <td>{new Date(semester.endDate).toLocaleDateString()}</td>
                                                    <td>
                                                    <div className="action-buttons">
                                                        <Button 
                                                            variant="outline-success" 
                                                            size="sm" 
                                                                className="btn-action"
                                                                onClick={() => handleEdit(semester)}
                                                        >
                                                            <i className="bi bi-pencil-square me-1"></i>
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm" 
                                                            className="btn-action"
                                                            onClick={() => handleShow(semester._id)}
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
        <Button variant="outline-secondary" className="px-4" onClick={() => setShow(false)}>
            Cancel
          </Button>
      <Button 
            variant="outline-danger" 
            className="px-4" 
            onClick={() => selectedSemesterId && deleteHandler(selectedSemesterId)}
        >
            Confirm
        </Button>
        </Modal.Footer>
      </Modal>
       {/* Edit Modal */}
       <Modal show={editModalShow} onHide={handleCloseModal}>
    <Modal.Header closeButton>
        <Modal.Title>Edit Semester</Modal.Title>
    </Modal.Header>
    <Modal.Body>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form>
        <Form.Group className="mb-3">
    <Form.Label>Strand</Form.Label>
    <Form.Control
        as="select"
        value={selectedStrand}
        onChange={(e) => setSelectedStrand(e.target.value)}
        required
    >
        <option value="">Select Strand</option>
        {strands && strands.length > 0 ? (
            strands.map(strand => (
                <option key={strand._id} value={strand._id}>
                    {strand.name || 'Unnamed Strand'}
                </option>
            ))
        ) : (
            <option disabled>No strands available</option>
        )}
    </Form.Control>
</Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Semester Name</Form.Label>
                <Form.Control
                    as="select"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                >
                    <option value="">Select Semester</option>
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="Summer Term">Summer Term</option>
                </Form.Control>
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
        {yearLevels && yearLevels.length > 0 ? (
            yearLevels.map(yearLevel => (
                <option key={yearLevel._id} value={yearLevel._id}>
                    {yearLevel.name || 'Unnamed Year Level'}
                </option>
            ))
        ) : (
            <option disabled>No year levels available</option>
        )}
    </Form.Control>
</Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </Form.Group>
        </Form>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleCloseModal}>
            Cancel
        </Button>
        <Button
            variant="outline-success"
            onClick={handleSaveChanges}
            disabled={loading}
        >
            {loading ? 'Updating...' : 'Update Semester'}
        </Button>
    </Modal.Footer>
</Modal>
        </>
    );
};

export default ManageSemesters;
