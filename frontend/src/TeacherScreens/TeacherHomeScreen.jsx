import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar';
import './Teacher.css';

const TeacherHomeScreen = () => {
    const [dashboardData, setDashboardData] = useState({
        username: '',
        totalStudents: 0,
        totalSubjects: 0,
        totalSections: 0,
        advisorySection: 'None',
        sections: [],
        subjects: [],
        currentSemester: ''
    });
    
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/teacher/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { data } = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };
    
    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <>
        
            <TeacherDashboardNavbar />
            <Container className="py-4">
                {/* Welcome Section */}
                <Row className="mb-4 align-items-center">
    <Col>
        <h2 className="mb-1 fw-bold">
            {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return "Good Morning";
                if (hour < 17) return "Good Afternoon";
                return "Good Evening";
            })()}, {dashboardData.username}
        </h2>
        <p className="text-muted">
            Ready to inspire and educate today's learners?
        </p>
    </Col>
    <Col md={4} className="text-end">
    <div className="calendar-badge">
        <i className="bi bi-calendar-week me-2"></i>
        {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}
    </div>
</Col>
</Row>

<style jsx>{`
    .calendar-badge {
        background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
        color: #2c3e50;
        border-radius: 20px;
        padding: 8px 15px;
        display: inline-block;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }
    .calendar-badge:hover {
        transform: scale(1.05);
    }
`}</style>

                {/* Quick Stats */}
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <i className="bi bi-people fs-1 text-primary mb-2"></i>
                                <h3>{dashboardData.totalStudents}</h3>
                                <Card.Text>Total Students</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <i className="bi bi-book fs-1 text-success mb-2"></i>
                                <h3>{dashboardData.subjects?.length || 0}</h3>
                                <Card.Text>Subjects Handled</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <i className="bi bi-diagram-3 fs-1 text-info mb-2"></i>
                                <h3>{dashboardData.sections?.length || 0}</h3>
                                <Card.Text>Sections</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <i className="bi bi-mortarboard fs-1 text-warning mb-2"></i>
                                <h3>{dashboardData.advisorySection || 'N/A'}</h3>
                                <Card.Text>Advisory Section</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row className="mb-4">
                    <Col>
                        <h4 className="mb-3">Quick Actions</h4>
                        <Row>
                            <Col md={3}>
                                <Link to="/login/TeacherScreens/TeacherEncodeGrade" className="text-decoration-none">
                                    <Card className="mb-3 shadow-sm hover-card">
                                        <Card.Body className="text-center">
                                            <i className="bi bi-pencil-square fs-2 text-primary mb-2"></i>
                                            <h5>Manage Grades</h5>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                            <Col md={3}>
                                <Link to="/login/TeacherScreens/TeacherGenerateForm" className="text-decoration-none">
                                    <Card className="mb-3 shadow-sm hover-card">
                                        <Card.Body className="text-center">
                                            <i className="bi bi-calendar-check fs-2 text-success mb-2"></i>
                                            <h5>Generate Form</h5>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                            <Col md={3}>
                                <Link to="/login/TeacherScreens/TeacherViewStudents" className="text-decoration-none">
                                    <Card className="mb-3 shadow-sm hover-card">
                                        <Card.Body className="text-center">
                                            <i className="bi bi-people-fill fs-2 text-warning mb-2"></i>
                                            <h5>View Sections</h5>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default TeacherHomeScreen;