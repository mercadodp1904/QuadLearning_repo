import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const UpdateStudentModal = ({ show, handleClose, studentId, token }) => {
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
        section: '',
        strand: '',
        school: {
            name: 'Tropical Village National Highschool', // Default value
            year: ''
        },
        attendance: {
            totalYears: ''
        },
        contactNumber: '',
    });
    const [isEditing, setIsEditing] = useState(false);  // Add this state

    const fetchStudentData = async () => {
        try {
            const response = await fetch(`/api/teacher/student/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
     
            if (!response.ok) {
                throw new Error('Failed to fetch student data');
            }
     
            const data = await response.json();
            console.log('Received student data:', data);
     
            setFormData(prevData => ({
                ...prevData,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                middleInitial: data.middleInitial || '',
                gender: data.gender || '',
                birthdate: data.birthdate ? data.birthdate.split('T')[0] : '',
                contactNumber: data.contactNumber || '',
                birthplace: {
                    province: data.birthplace?.province || '',
                    municipality: data.birthplace?.municipality || '',
                    barrio: data.birthplace?.barrio || ''
                },
                address: data.address || '',
                guardian: {
                    name: data.guardian?.name || '',
                    occupation: data.guardian?.occupation || ''
                },
                // Ensure these are populated with multiple fallback options
                yearLevel: 
                    data.yearLevel?.name || 
                    data.yearLevel || 
                    data.yearLevelName || 
                    prevData.yearLevel || 
                    '',
                section: 
                    data.section?.name || 
                    data.section || 
                    data.sectionName || 
                    prevData.section || 
                    '',
                strand: 
                    data.strand?.name || 
                    data.strand || 
                    data.strandName || 
                    prevData.strand || 
                    '',
                school: {
                    name: data.school?.name || 'Tropical Village National Highschool',
                    year: data.school?.year || ''
                },
                attendance: {
                    totalYears: data.attendance?.totalYears || ''
                }
            }));
        } catch (error) {
            console.error('Error fetching student data:', error);
            alert('Failed to load student data: ' + error.message);
        }
    };

       // Call fetchStudentData when modal opens
       useEffect(() => {
        if (show && studentId) {
            fetchStudentData();
            setIsEditing(false);
        }
    }, [show, studentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        // Handle nested objects (guardian, school, attendance, birthplace)
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            // Handle non-nested fields
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            
            // Format gender to match enum
            const formattedGender = formData.gender ? 
                formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).toLowerCase() 
                : undefined;
    
            const response = await fetch(`/api/teacher/student/${studentId}/form`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user: studentId,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    middleInitial: formData.middleInitial,
                    gender: formattedGender,
                    birthdate: formData.birthdate,
                    birthplace: {
                        province: formData.birthplace.province,
                        municipality: formData.birthplace.municipality,
                        barrio: formData.birthplace.barrio
                    },
                    yearLevel: formData.yearLevel,
                    section: formData.section,
                    strand: formData.strand,
                    address: formData.address,
                    guardian: {
                        name: formData.guardian?.name,
                        occupation: formData.guardian?.occupation
                    },
                    school: {
                        name: 'Tropical Village National Highschool',
                        year: formData.school?.year
                    },
                    attendance: {
                        totalYears: formData.attendance?.totalYears
                    },
                    contactNumber: formData.contactNumber
                })
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update student');
            }
    
            const data = await response.json();
            if (data.success) {
                // Show success message
                alert('Student information updated successfully');
                setIsEditing(false);  // Set editing state to false
                await fetchStudentData();  // Fetch fresh data
            } else {
                throw new Error(data.message || 'Failed to update student');
            }
        } catch (error) {
            // Only show error alert if it's actually an error
            if (!error.message.includes('updated successfully')) {
                console.error('Error updating student:', error);
                alert('Failed to update student: ' + error.message);
            }
        }
    };

     // Add toggle edit mode function
     const toggleEditMode = (e) => {
        e.preventDefault(); // Prevent any form submission
        setIsEditing(!isEditing);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
            <Modal.Title>Update Student Information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form onSubmit={handleSubmit}>
                {/* Personal Information */}
                <h5 className="mb-3">Personal Information</h5>
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Middle Initial</Form.Label>
                            <Form.Control
                                type="text"
                                name="middleInitial"
                                value={formData.middleInitial}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={4}>
                    <Form.Group>
                    <Form.Label>Gender</Form.Label>
                    <Form.Select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </Form.Select>
                </Form.Group>
                    </Col>
                    <Col md={4}>
                    <Form.Group>
                        <Form.Label>Birthdate</Form.Label>
                        <Form.Control
                            type="date"
                            name="birthdate"
                            value={formData.birthdate || ''}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Contact Number</Form.Label>
                            <Form.Control
                                type="text"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
    <Form.Label>Birthplace</Form.Label>
    <Row>
        <Col md={4}>
            <Form.Control
                type="text"
                name="birthplace.province"
                placeholder="Province"
                value={formData.birthplace?.province || ''}
                onChange={handleChange}
                disabled={!isEditing}
            />
        </Col>
        <Col md={4}>
            <Form.Control
                type="text"
                name="birthplace.municipality"
                placeholder="Municipality"
                value={formData.birthplace?.municipality || ''}
                onChange={handleChange}
                disabled={!isEditing}
            />
        </Col>
        <Col md={4}>
            <Form.Control
                type="text"
                name="birthplace.barrio"
                placeholder="Barrio"
                value={formData.birthplace?.barrio || ''}
                onChange={handleChange}
                disabled={!isEditing}
            />
        </Col>
    </Row>
</Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </Form.Group>

                {/* Guardian Information */}
                <h5 className="mb-3">Guardian Information</h5>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Guardian Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="guardian.name"
                                value={formData.guardian?.name || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Guardian Occupation</Form.Label>
                            <Form.Control
                                type="text"
                                name="guardian.occupation"
                                value={formData.guardian?.occupation || ''}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Form.Group>
                    </Col>
                </Row>

               {/* Academic Information */}
               <h5 className="mb-3">Academic Information</h5>
<Row className="mb-3">
    <Col md={4}>
        <Form.Group>
            <Form.Label>Year Level</Form.Label>
            <Form.Control
                type="text"
                name="yearLevel"
                value={formData.yearLevel || ''}
                readOnly
                disabled={!isEditing}
            />
        </Form.Group>
    </Col>
    <Col md={4}>
        <Form.Group>
            <Form.Label>Section</Form.Label>
            <Form.Control
                type="text"
                name="section"
                value={formData.section || ''}
                readOnly
                disabled={!isEditing}
            />
        </Form.Group>
    </Col>
    <Col md={4}>
        <Form.Group>
            <Form.Label>Strand</Form.Label>
            <Form.Control
                type="text"
                name="strand"
                value={formData.strand || ''}
                readOnly
                disabled={!isEditing}
            />
        </Form.Group>
    </Col>
</Row>

                 {/* School Information */}
                 <h5 className="mb-3">School Information</h5>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>School Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="school.name"
                                    value={formData.school?.name || 'Tropical Village National Highschool'}
                                    readOnly // Make it read-only
                                    disabled={!isEditing}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>School Year</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="school.year"
                                    value={formData.school?.year || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={!isEditing}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                {/* Attendance Information */}
                <h5 className="mb-3">Attendance Information</h5>
                <Form.Group className="mb-3">
                    <Form.Label>Attendance for the whole semester</Form.Label>
                    <Form.Control
                        type="number"
                        name="attendance.totalYears"
                        value={formData.attendance?.totalYears || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </Form.Group>
                </Form>
                   {/* Update your buttons */}
                   <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    {isEditing ? (
                        <Button 
                            variant="primary" 
                            type="submit"  // Only the Update button should be type="submit"
                            onClick={handleSubmit}
                        >
                            Update Student
                        </Button>
                    ) : (
                        <Button 
                            variant="primary" 
                            type="button"  // Edit button should be type="button"
                            onClick={toggleEditMode}  // Just toggle edit mode
                        >
                            Edit
                        </Button>
                    )}
                </div>
        </Modal.Body>
    </Modal>
    );
};

export default UpdateStudentModal;