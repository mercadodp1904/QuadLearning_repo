import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table } from 'react-bootstrap';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminCreateStrand.css';
const AdminCreateStrand = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [studStrands, setstudStrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchStrands = async () => {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    
            try {
                const response = await fetch('/api/admin/getStrands', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Add the Bearer token here
                    },
                });
    
                if (response.ok) {
                    const json = await response.json();
                    setstudStrands(json); // Set the data if the response is successful
                } else {
                    console.error('Failed to fetch strands:', response.status);
                }
            } catch (error) {
                console.error('Error fetching strands:', error.message);
            }
        };
    
        fetchStrands();
    }, []);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const strandData = {
            name,
            description
        }

        const response = await fetch('/api/admin/addStrands', {
            method: 'POST',
            body: JSON.stringify(strandData),
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, // Add the Bearer token here
            }
        });
        const json = await response.json();

        if(!response.ok){ 
            setError(json.message);
        }

        if(response.ok){
            setName('');
            setDescription('');
            setLoading(false);
            console.log('Strand created successfully');
        }
    };



    return (
        <>
            <AdminSidebar />
            <div className='d-flex'>
                <main className="main-content flex-grow-1">
                    <Container>
                        <Card className="mt-4">
                            <Card.Header>
                                <h4 className="mb-0">Create New Strand</h4>
                            </Card.Header>
                            <Card.Body>
                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Strand Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter strand name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            placeholder="Enter strand description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <div className="d-flex gap-2">
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => navigate('/admin/strands')}
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            variant="primary" 
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Creating...' : 'Create Strand'}
                                        </Button>
                                    </div>
                                </Form>
                                
                                <h2 className="my-4">Strands List</h2>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody> 
                                {studStrands && 
                                studStrands.map((studStrand) => (
                                    <tr key={studStrand._id}>
                                        <td>{studStrand.name}</td>
                                        <td>{studStrand.description}</td>
                                        <td>
                                            <Button variant="info" size="sm" className="me-2">
                                                Edit
                                            </Button>
                                            <Button variant="danger" size="sm">
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                            </Card.Body>
                        </Card>
                    </Container>
                </main>
            </div>
        </>
    );
};

export default AdminCreateStrand;