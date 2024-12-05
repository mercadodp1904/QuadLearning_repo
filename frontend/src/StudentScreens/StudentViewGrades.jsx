// StudentViewGrades.jsx
import { useState, useEffect } from 'react';
import StudentDashboardNavbar from '../StudentComponents/StudentDashboardNavbar';
import { Container, Card, Table, Alert, Spinner } from 'react-bootstrap';

const StudentViewGrades = () => {
    const [grades, setGrades] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Attempting to fetch grades with token:', token);

                const response = await fetch('/api/student/grades', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                // Log the raw response
                console.log('Response status:', response.status);
                
                const data = await response.json();
                console.log('Response data:', data);

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch grades');
                }

                if (data.success) {
                    setGrades(data.data);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Detailed error:', error);
                setError(error.message || 'An error occurred while fetching grades');
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, []);

    if (loading) {
        return (
            <>
                <StudentDashboardNavbar />
                <Container className="d-flex justify-content-center align-items-center mt-4">
                    <Spinner animation="border" variant="primary" />
                </Container>
            </>
        );
    }

    if (error) {
        return (
            <>
                <StudentDashboardNavbar />
                <Container className="mt-4">
                    <Alert variant="danger">
                        {error}
                    </Alert>
                </Container>
            </>
        );
    }

    return (
        <>
            <StudentDashboardNavbar />
            <Container className="py-4">
                {grades.length === 0 ? (
                    <Alert variant="info">
                        No grades available at this time.
                    </Alert>
                ) : (
                    grades.map((semester, index) => (
                        <Card key={index} className="mb-4">
                            <Card.Header className="bg-success text-white">
                                <h5 className="mb-0">{semester.name} - {semester.strand}</h5>
                            </Card.Header>
                            <Card.Body className="p-0">
                    <Table responsive hover className='custom-table text-center align-middle'>
                            <thead className="bg-light">
                                        <tr>
                                            <th>Subject</th>
                                            <th>Code</th>
                                            <th>Midterm</th>
                                            <th>Finals</th>
                                            <th>Final Rating</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {semester.subjects.map((subject, idx) => (
                                            <tr key={idx}>
                                                <td>{subject.name}</td>
                                                <td>{subject.code}</td>
                                                <td>{subject.midterm}</td>
                                                <td>{subject.finals}</td>
                                                <td>{subject.finalRating}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        subject.finalRating >= 75 ? 'bg-success' : 'bg-danger'
                                                    }`}>
                                                        {subject.finalRating >= 75 ? 'PASSED' : 'FAILED'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </Container>
        </>
    );
};

export default StudentViewGrades;