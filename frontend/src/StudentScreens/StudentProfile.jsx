import { useState, useEffect } from 'react';
import StudentDashboardNavbar from '../StudentComponents/StudentDashboardNavbar';
import { Container, Card, Row, Col, Table } from 'react-bootstrap';
import { FaUser, FaGraduationCap, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const StudentProfile = () => {
    const [studentData, setStudentData] = useState({
        firstName: '',
        lastName: '',
        middleInitial: '',
        gender: '',
        birthdate: '',
        contactNumber: '',
        birthplace: {
            province: '',
            municipality: '',
            barrio: ''
        },
        address: '',
        guardian: {
            name: '',
            occupation: ''
        },
        yearLevel: '',
        section: '',
        strand: '',
        school: {
            name: 'Tropical Village National Highschool',
            year: ''
        }
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Fetching with token:', token); // Debug log

                const response = await fetch('/api/student/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response status:', response.status); // Debug log

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log('Received data:', result); // Debug log

                if (result.success) {
                    setStudentData(result.data);
                } else {
                    throw new Error(result.message || 'Failed to fetch profile');
                }
            } catch (error) {
                console.error('Error fetching student profile:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentProfile();
    }, []);

    return ( 
        <>
            <StudentDashboardNavbar />
            <Container className="py-4">
                <h2 className="mb-4">Student Profile</h2>
                
                {/* Personal Information Card */}
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="bg-primary text-white">
                        <FaUser className="me-2" />
                        Personal Information
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={4}>
                                <p className="text-muted mb-1">Full Name</p>
                                <p className="fw-bold">{`${studentData.firstName} ${studentData.middleInitial} ${studentData.lastName}`}</p>
                            </Col>
                            <Col md={4}>
                                <p className="text-muted mb-1">Gender</p>
                                <p className="fw-bold">{studentData.gender}</p>
                            </Col>
                            <Col md={4}>
                                <p className="text-muted mb-1">Birthdate</p>
                                <p className="fw-bold">{new Date(studentData.birthdate).toLocaleDateString()}</p>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col md={4}>
                                <p className="text-muted mb-1">Contact Number</p>
                                <p className="fw-bold">{studentData.contactNumber}</p>
                            </Col>
                            <Col md={8}>
                                <p className="text-muted mb-1">Address</p>
                                <p className="fw-bold">{studentData.address}</p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Academic Information Card */}
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="bg-success text-white">
                        <FaGraduationCap className="me-2" />
                        Academic Information
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={4}>
                                <p className="text-muted mb-1">Year Level</p>
                                <p className="fw-bold">{studentData.yearLevel}</p>
                            </Col>
                            <Col md={4}>
                                <p className="text-muted mb-1">Section</p>
                                <p className="fw-bold">{studentData.section}</p>
                            </Col>
                            <Col md={4}>
                                <p className="text-muted mb-1">Strand</p>
                                <p className="fw-bold">{studentData.strand}</p>
                            </Col>
                        </Row>
                        <Row className="mt-3">
                            <Col md={6}>
                                <p className="text-muted mb-1">School</p>
                                <p className="fw-bold">{studentData.school.name}</p>
                            </Col>
                            <Col md={6}>
                                <p className="text-muted mb-1">School Year</p>
                                <p className="fw-bold">{studentData.school.year}</p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Guardian Information Card */}
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="bg-info text-white">
                        <FaPhone className="me-2" />
                        Guardian Information
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <p className="text-muted mb-1">Guardian Name</p>
                                <p className="fw-bold">{studentData.guardian.name}</p>
                            </Col>
                            <Col md={6}>
                                <p className="text-muted mb-1">Guardian Occupation</p>
                                <p className="fw-bold">{studentData.guardian.occupation}</p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Birthplace Information Card */}
                <Card className="shadow-sm">
                    <Card.Header className="bg-warning text-white">
                        <FaMapMarkerAlt className="me-2" />
                        Birthplace Information
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={4}>
                                <p className="text-muted mb-1">Province</p>
                                <p className="fw-bold">{studentData.birthplace.province}</p>
                            </Col>
                            <Col md={4}>
                                <p className="text-muted mb-1">Municipality</p>
                                <p className="fw-bold">{studentData.birthplace.municipality}</p>
                            </Col>
                            <Col md={4}>
                                <p className="text-muted mb-1">Barrio</p>
                                <p className="fw-bold">{studentData.birthplace.barrio}</p>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        </>
    );
}
 
export default StudentProfile;