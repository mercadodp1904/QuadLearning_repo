import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Navbar, Nav, Card } from 'react-bootstrap';

const StudentHomeScreen = () => {
    return ( 
        <>
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">Student Portal</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                        <Nav.Link as={Link} to="/courses">Courses</Nav.Link>
                        <Nav.Link as={Link} to="/assignments">Assignments</Nav.Link>
                        <Nav.Link as={Link} to="/grades">Grades</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>

        <Container className="mt-4">
            <Card>
                <Card.Body>
                    <Card.Title>Welcome to the Student Portal!</Card.Title>
                    <Card.Text>
                        Here you can manage your courses, view assignments, and check your grades.
                    </Card.Text>
                    <Card.Text>
                        Use the navigation menu to explore different sections of the portal.
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    </>
     );
}
 
export default StudentHomeScreen;