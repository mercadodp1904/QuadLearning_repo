import React, { useState, useEffect } from 'react';
import { Table, Button, Alert, Card, InputGroup, Form, Modal, Row, Col, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar';

const TeacherGenerateForm = () => {
    const [sections, setSections] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);  // State to control the modal visibility

    const handleGenerateForm = async (studentId) => {
        try {
            console.log('Attempting to generate form for studentId:', studentId);
    
            // Verify studentId before fetch
            if (!studentId) {
                throw new Error('Invalid Student ID');
            }
    
            const response = await fetch(`/api/teacher/generate-form137/${studentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
    
            console.log('Response Status:', response.status);
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error Response:', errorData);
                throw new Error(errorData.message || 'Failed to generate Form 137');
            }
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `form137-${studentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Detailed Error generating Form 137:', error);
            setError(`Failed to generate Form 137: ${error.message}`);
        }
    };
    useEffect(() => {
        const fetchTeacherSections = async () => {
            try {
                const response = await fetch('/api/teacher/sections', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch sections');
                }

                const data = await response.json();
                console.log('Fetched sections:', data);
                setSections(data);
            } catch (error) {
                console.error('Error fetching sections:', error);
                setError('Failed to fetch sections');
            }
        };

        fetchTeacherSections();
    }, []);

    const handleSelectStudent = async (studentId) => {
        try {
            console.log('Fetching student with ID:', studentId); // Debug log
    
            const response = await fetch(`/api/teacher/student/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch student details');
            }
    
            const data = await response.json();
            console.log('Fetched student data:', data); // Debug log
    
            setSelectedStudent({
                _id: data._id,
                username: data.username,
                firstName: data.firstName,
                lastName: data.lastName,
                middleInitial: data.middleInitial,
                section: data.section?.name || 'No Section',
                yearLevel: data.yearLevel?.name || 'Not Set',
                strand: data.strand?.name || 'Not Set',
                gender: data.gender || 'Not Set',
                birthdate: data.birthdate ? new Date(data.birthdate).toLocaleDateString() : 'Not Set',
                address: data.address || 'Not Set',
                guardian: data.guardian?.name || 'Not Set',
                school: data.school?.name || 'Not Set',
                grades: data.grades?.map(grade => ({
                    semester: grade.semester?.name || 'No Semester',
                    subjects: grade.subjects.map(subject => ({
                        subjectName: subject.subject?.name || 'No Subject',
                        midterm: subject.midterm || 'N/A',
                        finals: subject.finals || 'N/A',
                        finalRating: subject.finalRating || 'N/A',
                        action: subject.action || 'N/A'
                    }))
                })) || []  // Ensure that grades are an empty array if undefined
            });
            setShowModal(true);  // Show the modal when a student is selected
        } catch (error) {
            console.error('Error fetching student details:', error);
            setError('Failed to fetch student details: ' + error.message);
        }
    };

    // Get all students from sections
    const allStudents = sections.flatMap(section => 
        section.students.map(student => ({
            _id: student._id,
            username: student.username,
            sectionName: section.name,
            yearLevel: section.yearLevel?.name || 'Not Set',
            strand: section.strand?.name || 'Not Set',
            isAdvisory: section.isAdvisory || false
        }))
    );

    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredStudents = allStudents
    .filter((student) =>
        student.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <>
            <TeacherDashboardNavbar />
            <div className="container mt-4">
            <Card className="mb-4 border-0 shadow-sm">
    <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
                <div>
                    <h2 className="mb-1 fw-bold">Generate Form 137</h2>
                    <small className="text-muted">
                        Record Management
                        <OverlayTrigger
                            placement="right"
                            overlay={
                                <Tooltip>
                                    Ensure all grades and student information are encoded before generating
                                </Tooltip>
                            }
                        >
                            <i className="bi bi-info-circle text-muted ms-2"></i>
                        </OverlayTrigger>
                    </small>
                </div>
            </div>
            <InputGroup style={{ width: "250px" }}>
                <InputGroup.Text className="bg-light border-0">
                    <FaSearch className="text-muted" />
                </InputGroup.Text>
                <Form.Control
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-light"
                />
            </InputGroup>
        </div>

        <div className="p-3 bg-light rounded-3">
            <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle text-warning me-3"></i>
                <p className="text-secondary mb-0">
                    In this section, you can generate the Form 137 for your students. Please ensure that you have encoded the grades for the students before generating the form.
                </p>
            </div>
        </div>
    </Card.Body>
</Card>

                {error && <Alert variant="danger">{error}</Alert>}

                <Card className="shadow-sm">
                    <Card.Body className="p-0">
                    <Table responsive hover className='custom-table text-center align-middle'>
                            <thead className="bg-light">
                                <tr>
                                    <th className="px-4 py-3">Student Name</th>
                                    <th className="px-4 py-3">Section</th>
                                    <th className="px-4 py-3">Year Level</th>
                                    <th className="px-4 py-3">Strand</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map(student => (
                                    <tr key={student._id}>
                                        <td className="px-4 py-3 fw-medium">{student.username}</td>
                                        <td className="px-4 py-3">{student.sectionName}</td>
                                        <td className="px-4 py-3">{student.yearLevel}</td>
                                        <td className="px-4 py-3">{student.strand}</td>
                                        <td>
                                            <Button
                                                variant="outline-success" 
                                                size="sm"
                                                onClick={() => handleSelectStudent(student._id)}
                                            >
                                                Select
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>

                {/* Modal for displaying student details */}
                <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                    <Modal.Header closeButton class>
                        <Modal.Title>Student Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    {selectedStudent && (
    <div className="student-details-container bg-white rounded-4 p-4 border">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0 text-dark fw-bold">
                <i className="bi bi-person-vcard text-primary me-2"></i>
                Student Profile
            </h3>
            <Badge bg="secondary" className="px-3 py-2">
                ID: {selectedStudent._id}
            </Badge>
        </div>
        
        <div className="row g-4">
            <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-person-circle text-primary me-2 fs-4"></i>
                        <h5 className="mb-0 text-muted">Personal Information</h5>
                    </div>
                    <div className="row">
                        <div className="col-4 text-muted">Full Name:</div>
                        <div className="col-8 fw-bold">
                            {`${selectedStudent.firstName || ''} ${selectedStudent.middleInitial || ''} ${selectedStudent.lastName || ''}`}
                        </div>
                    </div>
                    <hr className="my-2"/>
                    <div className="row">
                        <div className="col-4 text-muted">Gender:</div>
                        <div className="col-8">{selectedStudent.gender}</div>
                    </div>
                    <hr className="my-2"/>
                    <div className="row">
                        <div className="col-4 text-muted">Birthdate:</div>
                        <div className="col-8">{selectedStudent.birthdate}</div>
                    </div>
                </div>
            </div>
            
            <div className="col-md-6">
                <div className="border rounded-3 p-3 h-100">
                    <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-mortarboard text-success me-2 fs-4"></i>
                        <h5 className="mb-0 text-muted">Academic Details</h5>
                    </div>
                    <div className="row">
                        <div className="col-4 text-muted">Section:</div>
                        <div className="col-8 fw-bold">{selectedStudent.section}</div>
                    </div>
                    <hr className="my-2"/>
                    <div className="row">
                        <div className="col-4 text-muted">Year Level:</div>
                        <div className="col-8">{selectedStudent.yearLevel}</div>
                    </div>
                    <hr className="my-2"/>
                    <div className="row">
                        <div className="col-4 text-muted">Strand:</div>
                        <div className="col-8">{selectedStudent.strand}</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-4">
            <div className="d-flex align-items-center mb-3">
                <i className="bi bi-journal-text text-info me-2 fs-4"></i>
                <h4 className="mb-0 text-muted">Academic Performance</h4>
            </div>
        
            <Card className="border shadow-sm">
                <Table responsive hover className='mb-0 text-center'>
                    <thead className="table-light">
                        <tr>
                            <th>Subject</th>
                            <th>Midterm</th>
                            <th>Finals</th>
                            <th>Final Rating</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedStudent.grades.map((grade, index) => (
                            grade.subjects.map((subject, idx) => (
                                <tr key={`${index}-${idx}`} 
                                    className={subject.finalRating < 75 ? 'table-warning' : ''}>
                                    <td>{subject.subjectName}</td>
                                    <td>{subject.midterm}</td>
                                    <td>{subject.finals}</td>
                                    <td>{subject.finalRating}</td>
                                    <td>
                                        <Badge 
                                            bg={subject.finalRating >= 75 ? 'success' : 'danger'}
                                            className="px-2 py-1"
                                        >
                                            {subject.finalRating >= 75 ? 'Passed' : 'Failed'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        ))}
                    </tbody>
                </Table>
            </Card>
        </div>

        <div className="text-center mt-4">
            <Button 
                variant="outline-success" 
                onClick={() => handleGenerateForm(selectedStudent._id)}
                className="px-4 py-2"
            >
                <i className="bi bi-file-earmark-arrow-down me-2"></i>
                Generate Official Form 137
            </Button>
        </div>
    </div>
)}
                    </Modal.Body>
                </Modal>
            </div>
        </>
    );
};

export default TeacherGenerateForm;
