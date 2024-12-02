import React, { useState, useEffect } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import TeacherDashboardNavbar from '../TeacherComponents/TeacherDashboardNavbar';

const TeacherGenerateForm = () => {
    const [sections, setSections] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [error, setError] = useState('');

    const handleGenerateForm = async (studentId) => {
        try {
            console.log('Generating form for student:', studentId);
    
            const response = await fetch(`/api/teacher/generate-form137/${studentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to generate Form 137' }));
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
            window.URL.revokeObjectURL(url); // Clean up
        } catch (error) {
            console.error('Error generating Form 137:', error);
            setError('Failed to generate Form 137: ' + error.message);
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

            const response = await fetch(`/api/teacher/student/${studentId}`, {  // Updated endpoint
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
                school: data.school?.name || 'Not Set'
            });
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

    return (
        <>
            <TeacherDashboardNavbar />
            <div className="container mt-4">
                <h2>Generate Form 137</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Section</th>
                            <th>Year Level</th>
                            <th>Strand</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allStudents.map(student => (
                            <tr key={student._id}>
                                <td>{student.username}</td>
                                <td>{student.sectionName}</td>
                                <td>{student.yearLevel}</td>
                                <td>{student.strand}</td>
                                <td>
                                    <Button
                                        variant="primary"
                                        onClick={() => handleSelectStudent(student._id)}
                                    >
                                        Select
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                {selectedStudent && (
                    <div className="mt-4">
                        <h3>Selected Student Information</h3>
                        <p><strong>Name:</strong> {`${selectedStudent.firstName || ''} ${selectedStudent.middleInitial || ''} ${selectedStudent.lastName || ''}`}</p>
                        <p><strong>Section:</strong> {selectedStudent.section}</p>
                        <p><strong>Year Level:</strong> {selectedStudent.yearLevel}</p>
                        <p><strong>Strand:</strong> {selectedStudent.strand}</p>
                        <p><strong>Gender:</strong> {selectedStudent.gender}</p>
                        <p><strong>Birthdate:</strong> {selectedStudent.birthdate}</p>
                        <p><strong>Address:</strong> {selectedStudent.address}</p>
                        <p><strong>Guardian:</strong> {selectedStudent.guardian}</p>
                        <p><strong>School:</strong> {selectedStudent.school}</p>
                        <Button 
                            variant="success" 
                            onClick={() => handleGenerateForm(selectedStudent._id)}
                            className="mt-3"
                        >
                            Generate Form 137
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

export default TeacherGenerateForm;