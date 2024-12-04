import { useState, useEffect, useMemo } from 'react';
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar';
import { Table, Container, Alert, Form, Row, Col , Modal, Button, Badge, Card, OverlayTrigger, Tooltip} from 'react-bootstrap';
import UpdateStudentModal from '../TeacherComponents/UpdateStudentModal';
import './TeacherViewStudent.css';
const TeacherViewStudents = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Filter states
    const [strands, setStrands] = useState([]);
    const [yearLevels, setYearLevels] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);
    const [showAdvisoryOnly, setShowAdvisoryOnly] = useState(false);
    

    // Selected filter states
    const [selectedStrand, setSelectedStrand] = useState('');
    const [selectedYearLevel, setSelectedYearLevel] = useState('');
    const [selectedSection, setSelectedSection] = useState('');

    const [selectedStudent, setSelectedStudent] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [teacherAdvisoryClassId, setTeacherAdvisoryClassId] = useState('');

    

// Update the fetchData function in useEffect
useEffect(() => {
    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Fetch teacher's sections with populated student data
            const sectionsResponse = await fetch('/api/teacher/sections', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!sectionsResponse.ok) {
                throw new Error('Failed to fetch sections');
            }

         
            const sectionsData = await sectionsResponse.json();
            console.log('Fetched sections data:', sectionsData);

            // Find the section where advisoryClass exists
            const advisorySection = sectionsData.find(section => {
                console.log('Checking section:', section.name, 'Advisory:', section.advisoryClass);
                return section.advisoryClass; // Since we know this is the advisory section
            });
            
            console.log('Found advisory section:', advisorySection);
            
            if (advisorySection && advisorySection.advisoryClass) {
                setTeacherAdvisoryClassId(advisorySection.advisoryClass.trim());
            }
            
            
            setSections(sectionsData);

            // Extract unique strands and year levels from sections
            const uniqueStrands = [...new Set(sectionsData.map(section => 
                section.strand?.name))].filter(Boolean);
            const uniqueYearLevels = [...new Set(sectionsData.map(section => 
                section.yearLevel?.name))].filter(Boolean);

            setStrands(uniqueStrands);
            setYearLevels(uniqueYearLevels);

        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, []); // Empty dependency array for initial load




// Update the handleViewStudent function to refresh data after modal closes
const handleViewStudent = (student) => {
    setSelectedStudentId(student._id);
    setShowModal(true);
};

    // Update available sections when strand or year level changes
    useEffect(() => {
        const filteredSections = sections.filter(section => {
            const matchesStrand = !selectedStrand || section.strand?.name === selectedStrand;
            const matchesYearLevel = !selectedYearLevel || section.yearLevel?.name === selectedYearLevel;
            return matchesStrand && matchesYearLevel;
        });

        setAvailableSections(filteredSections);
        setSelectedSection(''); // Reset selected section when filters change
    }, [selectedStrand, selectedYearLevel, sections]);

    const filteredStudents = useMemo(() => {
        return sections.flatMap(section => {
            // If advisory-only is selected, filter for advisory students
            if (showAdvisoryOnly) {
                return (section.students || []).filter(student => student.isAdvisory).map(student => ({
                    ...student,
                    sectionName: section.name,
                    strandName: section.strand?.name || 'Not Set',
                    yearLevelName: section.yearLevel?.name || 'Not Set',
                }));
            }
    
            // Filter based on selected Strand, Year Level, and Section
            const matchesFilters =
                (!selectedStrand || section.strand?.name === selectedStrand) &&
                (!selectedYearLevel || section.yearLevel?.name === selectedYearLevel) &&
                (!selectedSection || section._id === selectedSection);
    
            if (matchesFilters) {
                return (section.students || []).map(student => ({
                    ...student,
                    _id: student._id,
                    username: student.username,
                    sectionName: section.name,
                    strandName: section.strand?.name || 'Not Set',
                    yearLevelName: section.yearLevel?.name || 'Not Set',
                    isAdvisory: student.isAdvisory,
                }));
            }
    
            return [];
        });
    }, [sections, showAdvisoryOnly, selectedStrand, selectedYearLevel, selectedSection]);


    
useEffect(() => {
    console.log('State Updated:', {
        sections,
        teacherAdvisoryClassId,
        selectedStrand,
        selectedYearLevel,
        showAdvisoryOnly
    });
}, [sections, teacherAdvisoryClassId, selectedStrand, selectedYearLevel, showAdvisoryOnly]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

   return (
    <>
    <TeacherDashboardNavbar />
    <Container fluid className="px-4 py-3">
        {/* Header Section */}
        <Card className="mb-4 shadow-sm">
    <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
            <div>
                <h2 className="mb-0 fw-bold">My Students</h2>
                <small className="text-muted">
                Manage and view student information
                <OverlayTrigger
                    placement="right"
                    overlay={
                        <Tooltip>
                            <div>
                                <strong>Student Information Management</strong>
                                <ul className="list-unstyled mt-2">
                                    <li>✓ View comprehensive student profiles</li>
                                    <li>✓ Update personal and academic details</li>
                                </ul>
                            </div>
                        </Tooltip>
                    }
                >
                    
                        <i className="bi bi-info-circle me-2 ms-2"></i>
                        
                </OverlayTrigger>
                </small>
            </div>
            <div className="d-flex gap-2">
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip>
                            <strong>Total Students Enrolled</strong>
                            <p className="mb-0 mt-1">Current count of students you are handling</p>
                        </Tooltip>
                    }
                >
                    <Badge bg="primary" className="px-3 py-2">
                        Total Students: {filteredStudents.length}
                    </Badge>
                </OverlayTrigger>
                {showAdvisoryOnly && (
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                <strong>Advisory Class View</strong>
                                <p className="mb-0 mt-1">Displaying students in your advisory class</p>
                            </Tooltip>
                        }
                    >
                        <Badge bg="success" className="px-3 py-2">
                            Advisory Class View
                        </Badge>
                    </OverlayTrigger>
                )}
            </div>
        </div>
        <div className="p-3 bg-light rounded-3">
            <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle text-warning me-3"></i>
            <p className="text-secondary mb-0">
            Complete student personal information for Form 137. Ensure all fields are accurately filled, 
    including full name, birthdate, address, and other essential demographic details. 
    Accurate and comprehensive information is crucial for official school records.
            </p>
            </div>
        </div>
    </Card.Body>
</Card>

        {/* Controls Section */}
        <Card className="mb-4 shadow-sm">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <Form.Check 
                        type="switch"
                        id="advisory-switch"
                        label={<span className="fw-bold">Show Only Advisory Class</span>}
                        checked={showAdvisoryOnly}
                        onChange={(e) => {
                            setShowAdvisoryOnly(e.target.checked);
                            if (e.target.checked) {
                                setSelectedStrand('');
                                setSelectedYearLevel('');
                                setSelectedSection('');
                            }
                        }}
                        className="mb-0"
                    />
                    {!showAdvisoryOnly && (
                        <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => {
                                setSelectedStrand('');
                                setSelectedYearLevel('');
                                setSelectedSection('');
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Filters Section */}
                {!showAdvisoryOnly && (
                    <Row className="g-3">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    <i className="bi bi-funnel me-1"></i>
                                    Strand
                                </Form.Label>
                                <Form.Select 
                                    value={selectedStrand}
                                    onChange={(e) => setSelectedStrand(e.target.value)}
                                    className="shadow-sm"
                                >
                                    <option value="">All Strands</option>
                                    {strands.map((strand, index) => (
                                        <option key={index} value={strand}>{strand}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    <i className="bi bi-calendar me-1"></i>
                                    Year Level
                                </Form.Label>
                                <Form.Select
                                    value={selectedYearLevel}
                                    onChange={(e) => setSelectedYearLevel(e.target.value)}
                                    className="shadow-sm"
                                >
                                    <option value="">All Year Levels</option>
                                    {yearLevels.map((yearLevel, index) => (
                                        <option key={index} value={yearLevel}>{yearLevel}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label className="fw-bold">
                                    <i className="bi bi-people me-1"></i>
                                    Section
                                </Form.Label>
                                <Form.Select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    className="shadow-sm"
                                >
                                    <option value="">All Sections</option>
                                    {availableSections.map((section) => (
                                        <option key={section._id} value={section._id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                )}
            </Card.Body>
        </Card>

        {/* Students Table Section */}
        <Card className="shadow-sm">
            <Card.Body className="p-0">
                {filteredStudents.length === 0 ? (
                    <Alert variant="info" className="m-4">
                        <i className="bi bi-info-circle me-2"></i>
                        {showAdvisoryOnly 
                            ? "No advisory students found."
                            : "No students found for the selected filters."}
                    </Alert>
                ) : (
                    <Table responsive hover className='custom-table text-center align-middle'>
                        <thead className="bg-light">
                            <tr>
                                <th className="px-4 py-3">Student Name</th>
                                <th className="px-4 py-3">Section</th>
                                <th className="px-4 py-3">Strand</th>
                                <th className="px-4 py-3">Year Level</th>
                                {!showAdvisoryOnly && <th className="px-4 py-3">Advisory Student</th>}
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student._id}>
                                    <td className="px-4 py-3 fw-medium">{student.username}</td>
                                    <td className="px-4 py-3">{student.sectionName}</td>
                                    <td className="px-4 py-3">{student.strandName}</td>
                                    <td className="px-4 py-3">{student.yearLevelName}</td>
                                    {!showAdvisoryOnly && (
                                        <td className="px-4 py-3">
                                            <Badge bg={student.isAdvisory ? 'success' : 'secondary'}>
                                                {student.isAdvisory ? 'Yes' : 'No'}
                                            </Badge>
                                        </td>
                                    )}
                                    <td className="px-4 py-3 text-center">
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            onClick={() => handleViewStudent(student)}
                                            className="action-button"
                                        >
                                            <i className="bi bi-eye me-1"></i>
                                            View Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Card.Body>
        </Card>

        <UpdateStudentModal
            show={showModal}
            handleClose={() => {
                setShowModal(false);
            }}
            studentId={selectedStudentId}
            token={localStorage.getItem('token')}
        />
    </Container>
</>
    );
};

export default TeacherViewStudents;