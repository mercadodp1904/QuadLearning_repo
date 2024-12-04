import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Navbar, Nav, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import StudentDashboardNavbar from '../StudentComponents/StudentDashboardNavbar';
const StudentHomeScreen = () => {
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
    </>
     );
}
 
export default StudentHomeScreen;