import { useState, useEffect, useMemo } from 'react';
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar';
import { Table, Container, Alert, Form, Row, Col, Button } from 'react-bootstrap';

const TeacherEncodeGrade = () => {
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

    // Add new states for subjects
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    // State to store the teacher's advisory class ID
    const [teacherAdvisoryClassId, setTeacherAdvisoryClassId] = useState(null);

    const [successMessage, setSuccessMessage] = useState('');
    const [studentGrades, setStudentGrades] = useState({});

    const [currentSemester, setCurrentSemester] = useState('');
    const [semesters, setSemesters] = useState([]);

    // Add new state for subject students
const [subjectStudents, setSubjectStudents] = useState([]);

// Add these states at the top of your component
const [editMode, setEditMode] = useState({});
const [tempGrades, setTempGrades] = useState({});
const [saving, setSaving] = useState(false);



// Add function to handle temporary grade changes
const handleTempGradeChange = (studentId, gradeType, value) => {
    setTempGrades(prev => ({
        ...prev,
        [studentId]: {
            ...prev[studentId],
            [gradeType]: value
        }
    }));
};

// Add function to handle save
const handleSaveGrades = async (studentId) => {
    try {
        setSaving(true);
        setError('');
        
        // Get the temporary grades for this student
        const grades = tempGrades[studentId];
        if (!grades) return;

        // Save midterm and finals grades if they exist
        const promises = [];
        if (grades.midterm !== undefined) {
            promises.push(handleGradeChange(
                studentId,
                selectedSubject,
                'midterm',
                grades.midterm,
                currentSemester
            ));
        }
        if (grades.finals !== undefined) {
            promises.push(handleGradeChange(
                studentId,
                selectedSubject,
                'finals',
                grades.finals,
                currentSemester
            ));
        }

        await Promise.all(promises);
        
        // Clear temp grades and edit mode for this student
        setTempGrades(prev => {
            const newTemp = { ...prev };
            delete newTemp[studentId];
            return newTemp;
        });
        setEditMode(prev => ({
            ...prev,
            [studentId]: false
        }));

        setSuccessMessage('Grades saved successfully');
    } catch (error) {
        setError('Failed to save grades: ' + error.message);
    } finally {
        setSaving(false);
    }
};



// Add effect to fetch students when subject or semester changes
useEffect(() => {
    const fetchSubjectStudents = async () => {
        if (!selectedSubject || !currentSemester) {
            setSubjectStudents([]);
            return;
        }

        try {
            const response = await fetch(
                `/api/teacher/subject-students?subjectId=${selectedSubject}&semesterId=${currentSemester}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch subject students');
            }

            const data = await response.json();
            setSubjectStudents(data);
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to fetch subject students');
        }
    };

    fetchSubjectStudents();
}, [selectedSubject, currentSemester]);

// Add this effect to fetch subjects when semester changes
useEffect(() => {
    const fetchSubjects = async () => {
        if (!currentSemester) return; // Don't fetch if no semester selected

        try {
            const response = await fetch(`/api/teacher/subjects?semesterId=${currentSemester}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch subjects');
            }

            const data = await response.json();
            setSubjects(data);
            setSelectedSubject(''); // Reset subject selection
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to fetch subjects');
        }
    };

    fetchSubjects();
}, [currentSemester]); // Dependency on currentSemester

useEffect(() => {
    const fetchSemesters = async () => {
        try {
            const response = await fetch('/api/semesters', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch semesters');
            }
            
            const data = await response.json();
            console.log('Fetched semesters:', data); // Debug log
            
            if (Array.isArray(data) && data.length > 0) {
                setSemesters(data);
                setCurrentSemester(data[0]._id);
            } else {
                setError('No semesters found');
            }
        } catch (error) {
            console.error('Error fetching semesters:', error);
            setError(error.message || 'Failed to fetch semesters');
        }
    };

    fetchSemesters();
}, []);




const handleGradeChange = async (studentId, subjectId, gradeType, gradeValue, semesterId) => {
    try {
        setLoading(true);
        
        // Validate grade value
        const numericGrade = Number(gradeValue);
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
            setError('Grade must be between 0 and 100');
            return;
        }

        const response = await fetch('/api/teacher/grades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                studentId,
                subjectId,
                gradeType,  // 'midterm' or 'finals'
                gradeValue: numericGrade,
                semesterId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save grade');
        }

        const data = await response.json();
        
        // Update local state with new grade
        setStudentGrades(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [subjectId]: {
                    ...prev[studentId]?.[subjectId],
                    [gradeType]: numericGrade,
                    finalRating: data.data.finalRating,
                    action: data.data.action
                }
            }
        }));

        // Show success message
        setSuccessMessage('Grade saved successfully');
        
    } catch (error) {
        console.error('Error saving grade:', error);
        setError(error.message || 'Failed to save grade');
    } finally {
        setLoading(false);
    }
};
    
const getSubjectGrades = async () => {
    try {
        const response = await fetch(
            `/api/teacher/subject-grades/${selectedSubject}?semesterId=${currentSemester}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch grades');
        }

        const data = await response.json();
        setStudentGrades(data);
    } catch (error) {
        console.error('Error fetching grades:', error);
        setError('Failed to fetch grades');
    }
};

useEffect(() => {
    if (selectedSubject && currentSemester) {
        getSubjectGrades();
    } else {
        setStudentGrades({}); // Clear grades if no subject/semester selected
    }
}, [selectedSubject, currentSemester]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }

                // Fetch sections and subjects in parallel
                const [sectionsResponse, subjectsResponse] = await Promise.all([
                    fetch('/api/teacher/sections', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }),
                    fetch('/api/teacher/subjects', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                ]);

                if (!sectionsResponse.ok || !subjectsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const sectionsData = await sectionsResponse.json();
                const subjectsData = await subjectsResponse.json();

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

                console.log('Fetched sections data:', sectionsData);
                setSections(sectionsData);

                // Extract unique strands and year levels
                const uniqueStrands = [...new Set(sectionsData.map(section => 
                    section.strand?.name))].filter(Boolean);
                const uniqueYearLevels = [...new Set(sectionsData.map(section => 
                    section.yearLevel?.name))].filter(Boolean);

                setStrands(uniqueStrands);
                setYearLevels(uniqueYearLevels);
                setSubjects(subjectsData);
                
            } catch (error) {
                console.error('Error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredStudents = useMemo(() => {
        if (!selectedSubject || !currentSemester) {
            return [];
        }
    
        // First filter by subject enrollment
        let filteredList = subjectStudents.map(student => ({
            _id: student._id,
            username: student.username,
            sectionName: student.sections[0]?.name || 'No Section',
            yearLevelName: student.yearLevel?.name || 'Not Set',
            strandName: student.strand?.name || 'Not Set',
            isAdvisory: student.isAdvisory // Use the boolean from backend
        }));
    
        console.log('Filtered list before advisory filter:', filteredList); // Debug log
    
        // Apply filters
        if (showAdvisoryOnly) {
            filteredList = filteredList.filter(student => {
                console.log(`Student ${student.username} isAdvisory:`, student.isAdvisory); // Debug log
                return student.isAdvisory;
            });
        } else {
            if (selectedStrand) {
                filteredList = filteredList.filter(student => student.strandName === selectedStrand);
            }
            
            if (selectedYearLevel) {
                filteredList = filteredList.filter(student => student.yearLevelName === selectedYearLevel);
            }
            
            if (selectedSection) {
                filteredList = filteredList.filter(student => student.sectionName === selectedSection);
            }
        }
    
        console.log('Final filtered list:', filteredList); // Debug log
        return filteredList;
    }, [
        subjectStudents,
        selectedSubject,
        currentSemester,
        showAdvisoryOnly,
        selectedStrand,
        selectedYearLevel,
        selectedSection
    ]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
            <TeacherDashboardNavbar />
            <Container className="mt-4">
                <h2>Encode Grades</h2>

                       {/* Add Alerts here, right after the header */}
            {successMessage && (
                <Alert 
                    variant="success" 
                    onClose={() => setSuccessMessage('')} 
                    dismissible
                    className="mb-3"
                >
                    {successMessage}
                </Alert>
            )}
            {error && (
                <Alert 
                    variant="danger" 
                    onClose={() => setError('')} 
                    dismissible
                    className="mb-3"
                >
                    {error}
                </Alert>
            )}

               {/* Semester Selection */}
        <Row className="mb-3">
            <Col md={12}>
                <Form.Group>
                    <Form.Label>Semester</Form.Label>
                    <Form.Select
                        value={currentSemester}
                        onChange={(e) => setCurrentSemester(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Select Semester</option>
                        {semesters.map(semester => (
                            <option key={semester._id} value={semester._id}>
                                {semester.name} - {semester.strand?.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Col>
        </Row>

        {/* Subject Selection - Only show if semester is selected */}
        {currentSemester && (
            <Row className="mb-3">
                <Col md={12}>
                    <Form.Group>
                        <Form.Label>Subject</Form.Label>
                        <Form.Select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={!currentSemester || loading}
                        >
                            <option value="">Choose Subject</option>
                            {subjects.map((subject) => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
)}
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
                          {/* Strand Filter */}
<Form.Select 
    value={selectedStrand}
    onChange={(e) => setSelectedStrand(e.target.value)}
>
    <option value="">All Strands</option>
    {strands.map((strand) => (
        <option key={strand} value={strand}>
            {strand}
        </option>
    ))}
</Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Year Level</Form.Label>
                              {/* Year Level Filter */}
<Form.Select
    value={selectedYearLevel}
    onChange={(e) => setSelectedYearLevel(e.target.value)}
>
    <option value="">All Year Levels</option>
    {yearLevels.map((yearLevel) => (
        <option key={yearLevel} value={yearLevel}>
            {yearLevel}
        </option>
    ))}
</Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Label>Section</Form.Label>
                            {/* Section Filter */}
<Form.Select
    value={selectedSection}
    onChange={(e) => setSelectedSection(e.target.value)}
>
    <option value="">All Sections</option>
    {sections.map((section) => (
        <option key={section._id} value={section.name}>
            {section.name}
        </option>
    ))}
</Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                )}

                {/* Students Table */}
                {!selectedSubject ? (
                    <Alert variant="info">Please select a subject to encode grades.</Alert>
                ) : filteredStudents.length === 0 ? (
                    <Alert variant="info">
                        {showAdvisoryOnly 
                            ? "No advisory students found."
                            : "No students found for the selected filters."}
                    </Alert>
                ) : (
                    <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Section</th>
                            <th>Midterm</th>
                            <th>Finals</th>
                            <th>Final Rating</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                            <tr key={student._id}>
                                <td>{student.username}</td>
                                <td>{student.sectionName}</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={
                                            editMode[student._id]
                                                ? tempGrades[student._id]?.midterm || ''
                                                : studentGrades[student._id]?.[selectedSubject]?.midterm || ''
                                        }
                                        onChange={(e) => handleTempGradeChange(
                                            student._id,
                                            'midterm',
                                            e.target.value
                                        )}
                                        disabled={!editMode[student._id] || saving}
                                    />
                                </td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={
                                            editMode[student._id]
                                                ? tempGrades[student._id]?.finals || ''
                                                : studentGrades[student._id]?.[selectedSubject]?.finals || ''
                                        }
                                        onChange={(e) => handleTempGradeChange(
                                            student._id,
                                            'finals',
                                            e.target.value
                                        )}
                                        disabled={!editMode[student._id] || saving}
                                    />
                                </td>
                                <td>
                                    {studentGrades[student._id]?.[selectedSubject]?.finalRating?.toFixed(2) || '-'}
                                </td>
                                <td>
                                    {studentGrades[student._id]?.[selectedSubject]?.action || '-'}
                                </td>
                                <td>
                                    {editMode[student._id] ? (
                                        <>
                                            <Button
                                                variant="success"
                                                size="sm"
                                                onClick={() => handleSaveGrades(student._id)}
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : 'Save'}
                                            </Button>
                                            {' '}
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => {
                                                    setEditMode(prev => ({
                                                        ...prev,
                                                        [student._id]: false
                                                    }));
                                                    setTempGrades(prev => {
                                                        const newTemp = { ...prev };
                                                        delete newTemp[student._id];
                                                        return newTemp;
                                                    });
                                                }}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => {
                                                setEditMode(prev => ({
                                                    ...prev,
                                                    [student._id]: true
                                                }));
                                                setTempGrades(prev => ({
                                                    ...prev,
                                                    [student._id]: {
                                                        midterm: studentGrades[student._id]?.[selectedSubject]?.midterm || '',
                                                        finals: studentGrades[student._id]?.[selectedSubject]?.finals || ''
                                                    }
                                                }));
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                )}
            </Container>
        </>
    );
};

export default TeacherEncodeGrade;