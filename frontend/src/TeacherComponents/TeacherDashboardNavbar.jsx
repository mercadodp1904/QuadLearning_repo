import { Navbar, Nav, Button, Container, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { Table, Form } from 'react-bootstrap';
import axios from 'axios';
function TeacherDashboardNavbar() {

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    gender: '',
    birthdate: '',
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
    school: {
      name: '',
      year: ''
    },
    contactNumber: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('/api/teacher/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      middleInitial: student.middleInitial,
      gender: student.gender,
      birthdate: student.birthdate?.split('T')[0], // Format date for input
      birthplace: student.birthplace,
      address: student.address,
      guardian: student.guardian,
      yearLevel: student.yearLevel,
      school: student.school,
      contactNumber: student.contactNumber
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`/api/teachers/student/${selectedStudent._id}/form`, formData);
      setShowModal(false);
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  
  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand href="#home" className="me-4">TVNHS</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Nav.Link className="mx-3" href="#home">Home</Nav.Link>
              <Nav.Link className="mx-3" href="#link">View Students</Nav.Link>
              <Nav.Link className="mx-3" href="#link">Encode Grades</Nav.Link>
              <Nav.Link className="mx-3" href="#link">Generate Form</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link href="#link">Sign Out</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Form.Group>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Year Level</th>
              <th>Section</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students
              .filter(student => 
                `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((student) => (
                <tr key={student._id}>
                  <td>{`${student.firstName} ${student.lastName}`}</td>
                  <td>{student.yearLevel}</td>
                  <td>{student.section?.name}</td>
                  <td>
                    <Button variant="primary" size="sm" onClick={() => handleEdit(student)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Edit Student Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <div className="row">
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Middle Initial</Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={1}
                      value={formData.middleInitial}
                      onChange={(e) => setFormData({...formData, middleInitial: e.target.value})}
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Form.Select>
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Birthdate</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.birthdate}
                      onChange={(e) => setFormData({...formData, birthdate: e.target.value})}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </Form.Group>

              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Guardian Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.guardian.name}
                      onChange={(e) => setFormData({
                        ...formData,
                        guardian: {...formData.guardian, name: e.target.value}
                      })}
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label>Guardian Occupation</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.guardian.occupation}
                      onChange={(e) => setFormData({
                        ...formData,
                        guardian: {...formData.guardian, occupation: e.target.value}
                      })}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Contact Number</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
          </>
  );
}

export default TeacherDashboardNavbar;