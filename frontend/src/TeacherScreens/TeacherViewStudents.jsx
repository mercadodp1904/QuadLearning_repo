import { useState, useEffect } from 'react';
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar';
import { Table, Container, Alert, Form, Row, Col , Modal, Button} from 'react-bootstrap';
import UpdateStudentModal from '../TeacherComponents/UpdateStudentModal';

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
                return section.name === 'STEM202'; // Since we know this is the advisory section
            });
            
            console.log('Found advisory section:', advisorySection);
            
            if (advisorySection && advisorySection.advisoryClass) {
                const advisoryClassId = advisorySection.advisoryClass;
                console.log('Setting advisory class ID:', advisoryClassId);
                setTeacherAdvisoryClassId(advisoryClassId);
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

// Add a function to refresh the data
const refreshData = async () => {
    setLoading(true);
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/teacher/sections', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to refresh sections');
        }

        const newData = await response.json();
        setSections(newData);

        // Update strands and year levels
        const uniqueStrands = [...new Set(newData.map(section => 
            section.strand?.name))].filter(Boolean);
        const uniqueYearLevels = [...new Set(newData.map(section => 
            section.yearLevel?.name))].filter(Boolean);

        setStrands(uniqueStrands);
        setYearLevels(uniqueYearLevels);
    } catch (error) {
        console.error('Error refreshing data:', error);
        setError(error.message);
    } finally {
        setLoading(false);
    }
};

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

// Update the filteredStudents logic
const filteredStudents = sections.flatMap(section => {
    console.log('Filtering section:', section.name, {
        sectionAdvisoryClass: section.advisoryClass,
        teacherAdvisoryClassId,
        isMatch: section.advisoryClass === teacherAdvisoryClassId
    });

    if (showAdvisoryOnly) {
        // Only show students from STEM202
        if (section.name !== 'STEM202') {
            return [];
        }

        return (section.students || []).map(student => ({
            ...student,
            _id: student._id,
            username: student.username,
            sectionName: section.name,
            yearLevelName: section.yearLevel?.name || 'Not Set',
            strandName: section.strand?.name || 'Not Set',
            isAdvisory: true
        }));
    }

    // For non-advisory view, apply filters
    if (!showAdvisoryOnly && (
        (!selectedStrand || section.strand?.name === selectedStrand) &&
        (!selectedYearLevel || section.yearLevel?.name === selectedYearLevel) &&
        (!selectedSection || section._id === selectedSection)
    )) {
        return (section.students || []).map(student => ({
            ...student,
            _id: student._id,
            username: student.username,
            sectionName: section.name,
            yearLevelName: section.yearLevel?.name || 'Not Set',
            strandName: section.strand?.name || 'Not Set',
            isAdvisory: student.isAdvisory
        }));
    }
    
    return [];
});

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

   return (
        <>
            <TeacherDashboardNavbar />
            <Container className="mt-4">
                <h2>My Students</h2>
                
                {/* Advisory Class Filter */}
                <Row className="mb-3">
                    <Col>
                        <Form.Check 
                            type="switch"
                            id="advisory-switch"
                            label="Show Only Advisory Class"
                            checked={showAdvisoryOnly}
                            onChange={(e) => {
                                setShowAdvisoryOnly(e.target.checked);
                                if (e.target.checked) {
                                    // Reset other filters when showing advisory only
                                    setSelectedStrand('');
                                    setSelectedYearLevel('');
                                    setSelectedSection('');
                                }
                            }}
                        />
                    </Col>
                </Row>
                
                {/* Other Filters - Only show if not viewing advisory only */}
                {!showAdvisoryOnly && (
                    <Row className="mb-4">
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Strand</Form.Label>
                                <Form.Select 
                                    value={selectedStrand}
                                    onChange={(e) => setSelectedStrand(e.target.value)}
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
                                <Form.Label>Year Level</Form.Label>
                                <Form.Select
                                    value={selectedYearLevel}
                                    onChange={(e) => setSelectedYearLevel(e.target.value)}
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
                                <Form.Label>Section</Form.Label>
                                <Form.Select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
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

                {/* Students Table */}
                {filteredStudents.length === 0 ? (
                    <Alert variant="info">
                        {showAdvisoryOnly 
                            ? "No advisory students found."
                            : "No students found for the selected filters."}
                    </Alert>
                ) : (
                    <Table striped bordered hover className='table-responsive justify-content-center text-center'>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Section</th>
                                <th>Strand</th>
                                <th>Year Level</th>
                                {!showAdvisoryOnly && <th>Advisory Student</th>}
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStudents.map((student) => (
                                <tr key={student._id}>
                                    <td>{student.username}</td>
                                    <td>{student.sectionName}</td>
                                    <td>{student.strandName}</td>
                                    <td>{student.yearLevelName}</td>
                                    {!showAdvisoryOnly && <td>{student.isAdvisory ? 'Yes' : 'No'}</td>}
                                    <td>
                                        <Button onClick={() => handleViewStudent(student)}>View</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </Table>
                )}
            <UpdateStudentModal
            show={showModal}
            handleClose={() => {
                setShowModal(false);
                refreshData(); // Refresh data when modal closes
            }}
            studentId={selectedStudentId}
            token={localStorage.getItem('token')}
            onUpdate={refreshData} // Also pass it as a prop for explicit refresh
            />
            </Container>
        </>
    );
};

export default TeacherViewStudents;