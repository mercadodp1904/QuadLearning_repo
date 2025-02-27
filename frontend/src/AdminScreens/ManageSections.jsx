import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, InputGroup } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
import { FaSearch } from 'react-icons/fa';
import Modal from 'react-bootstrap/Modal';
import { set } from 'mongoose';
import Header from '../components/Header';
const ManageSections = () => {
    const navigate = useNavigate();
    const [studSections, setStudSections] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [linkedStrand, setLinkedStrand] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [studStrands, setStudStrands] = useState([]);
    const [show, setShow] = useState(false);
    const [editModalShow, setEditModalShow] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [linkedYearLevel, setLinkedYearLevel] = useState('');
    const [yearLevels, setYearLevels] = useState([]);
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
            setLinkedYearLevel(section.yearLevel); // Add this line
            setEditModalShow(true);
        } else {
            console.error('Section not found');
        }
    };
    
    const handleCloseModal = () => {
        setEditModalShow(false);
        setSelectedSectionId(null);
        setName('');
        setLinkedStrand('');
        setLinkedYearLevel(''); // Add this line
    };
    
    
    const handleSaveChanges = async () => {
        const updatedSection = {
            name,
            strand: linkedStrand,
            yearLevel: linkedYearLevel // Add this field
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
                setStudSections((prevSections) =>
                    prevSections.map((section) =>
                        section._id === selectedSectionId ? result : section
                    )
                );
                handleCloseModal();
            } else {
                console.error('Error updating section:', result.message);
            }
        } catch (error) {
            console.error('Failed to update section:', error);
        }
        fetchData();
    };
    
    
    const deleteHandler = async (sectionId) => {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage
        console.log("Deleting section with ID:", sectionId);
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
            const [sectionsResponse, strandsResponse, yearLevelsResponse] = await Promise.all([
                fetch('/api/admin/getSections', { method: 'GET', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/getStrands', { method: 'GET', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/yearLevels', { method: 'GET', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }),
            ]);
        
            if (!sectionsResponse.ok || !strandsResponse.ok || !yearLevelsResponse.ok) {
                throw new Error('Failed to fetch one or more resources');
            }
        
            const [sectionsData, strandsData, yearLevelsData] = await Promise.all([
                sectionsResponse.json(),
                strandsResponse.json(),
                yearLevelsResponse.json(),
            ]);
        
            console.log('Fetched Sections:', sectionsData);
            console.log('Fetched Strands:', strandsData);
            console.log('Fetched Year Levels:', yearLevelsData);

            setStudSections(sectionsData || []);  // Set empty array if data is missing
            setStudStrands(strandsData || []);  // Set empty array if data is missing
            setYearLevels(yearLevelsData || []);  // Set empty array if data is missing
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
        e.preventDefault();
        setLoading(true);
        setError('');
    
        // Clean the yearLevel ID by removing any trailing characters
        const cleanYearLevelId = linkedYearLevel.replace(/[^0-9a-fA-F]/g, '');
    
        const sectionData = {
            name,
            strand: linkedStrand,
            yearLevel: cleanYearLevelId
        };
    
        console.log('Submitting Section Data:', sectionData);
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/addSections', {
                method: 'POST',
                body: JSON.stringify(sectionData),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const json = await response.json();
            console.log('Server Response:', json);
    
            if (!response.ok) {
                setError(json.message || 'Failed to create section');
            } else {
                setName('');
                setLinkedStrand('');
                setLinkedYearLevel('');
                console.log('Section created successfully');
                fetchData();
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
        <Header/>
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
                                        onChange={(e) => {
                                            console.log('Selected Strand ID:', e.target.value); // Log the selected value
                                            setLinkedStrand(e.target.value);
                                        }}
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
    <Form.Label>Year Level:</Form.Label>
    <Form.Select
        value={linkedYearLevel}
        onChange={(e) => {
            const selectedId = e.target.value;
            console.log('Selected Year Level ID:', selectedId);
            setLinkedYearLevel(selectedId);
        }}
        required
    >
        <option value="">Select Year Level</option>
        {yearLevels.map(yearLevel => {
            console.log('Year Level Option:', yearLevel); // Debug log
            return (
                <option key={yearLevel._id} value={yearLevel._id}>
                    {yearLevel.name}
                </option>
            );
        })}
                                    </Form.Select>
                                </Form.Group>

                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => navigate('/admin/ManageSections')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="outline-success"
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

                                <Card className="shadow-sm">
                    <Card.Body className="p-0">
                    <Table responsive hover className='custom-table text-center align-middle'>
                            <thead className="bg-light">
                            <tr className='text-center'>
                                <th>Section Name</th>
                                <th>Strand</th>
                                <th>Year Level</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            {currentEntries.map((section) => (
                                <tr key={section._id}>
                                    <td>{`${section.name ? section.name : 'N/A'}`}</td>
                                    <td>{section.strand ? section.strand.name : 'N/A'}</td>
                                    <td>{section.yearLevel ? section.yearLevel.name : 'N/A'}</td> {/* Update this line */}
                                    <td>
                                                    <div className="action-buttons">
                                                        <Button 
                                                            variant="outline-success" 
                                                            size="sm" 
                                                                className="btn-action"
                                                                onClick={() => handleEditShow(section._id)}
                                                        >
                                                            <i className="bi bi-pencil-square me-1"></i>
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            variant="outline-danger" 
                                                            size="sm" 
                                                            className="btn-action"
                                                            onClick={() => handleShow(section._id)}
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
    <Form.Label>Year Level:</Form.Label>
    <Form.Select
        value={linkedYearLevel}
        onChange={(e) => setLinkedYearLevel(e.target.value)}
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

export default ManageSections;
