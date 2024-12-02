import { Container, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../AdminComponents/AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState , useEffect } from 'react';
import AdminSidebar from "../AdminComponents/AdminSidebar";
import '../AdminComponents/AdminTableList.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Header from '../components/Header';
import axios from 'axios';
const AdminViewAllUsersScreen = () => {
    const [show, setShow] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: ''
    });
  
    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token'); // Retrieve the token from localStorage
    
            try {
                const response = await fetch('/api/admin/getUsers', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Add the Bearer token here
                    },
                });
    
                if (response.ok) {
                    const json = await response.json();
                    setUsers(json); // Set the users if the response is successful
                } else {
                    console.error('Failed to fetch users:', response.status);
                }
            } catch (error) {
                console.error('Error fetching users:', error.message);
            }
        };
    
        fetchUsers();
    }, []);
    
    const handleResetPassword = async (newPassword) => {
        const token = localStorage.getItem('token');
        
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/resetPassword/${selectedUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword })
            });
    
            if (response.ok) {
                alert('Password reset successful');
                setNewPassword('');
                setConfirmPassword('');
                handleClose();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to reset password');
                alert('Failed to reset password');
            }
        } catch (error) {
            setError('An error occurred while resetting the password');
            alert('An error occurred while resetting the password');
        } finally {
            setLoading(false);
        }
    };
    
    // Update the handleSubmit function to use handleResetPassword
    const handleSubmit = (e) => {
        e.preventDefault();
        if (newPassword === confirmPassword) {
            handleResetPassword(newPassword);
        } else {
            alert("Passwords do not match!");
        }
    };

    const handleClose = () => {
        setShow(false);
        setSelectedUserId(null);  // Reset selectedUserId when modal closes
    };

    const handleShow = (userId) => {
        setSelectedUserId(userId);  // Set the userId when showing modal
        setShow(true);
    };


    const filteredAccounts = users?.filter(user => 
        user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user?.role?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const totalPages = Math.ceil(filteredAccounts.length / entriesPerPage);

    const handlePageChange = (direction) => {
        if (direction === 'prev' && currentPage > 1) setCurrentPage(currentPage - 1);
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    
    return ( 
        <>
        <Header/>
        <AdminSidebar/>
        <div className='d-flex'>
        <main className="main-content flex-grow-1">
        <Container fluid>
             {/* User Accounts Table */}
             <Card>
        <Card.Body>
            <Card.Title>User Accounts</Card.Title>
            
            {/* Table Controls */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                    <span>Show</span>
                    <Form.Select 
                        size="sm"
                        className="mx-2"
                        style={{ width: 'auto' }}
                        value={entriesPerPage}
                        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </Form.Select>
                    <span>entries</span>
                </div>

                <InputGroup style={{ width: '200px' }}>
                    <InputGroup.Text>
                        <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </InputGroup>
            </div>
        
            <Table responsive hover className='table-striped table-bordered text-center'>
    <thead>
        <tr>
            <th>Name</th>
            <th>Date Created</th>
            <th>Role</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {filteredAccounts
            .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
            .map(user => (
                <tr key={user._id}>
                    <td>{user.username || user.name}</td>
                    <td>{user.createdAt}</td>
                    <td>{user.role}</td>
                    <td>
                    <button onClick={() => handleShow(user._id)} className='btn btn-primary custom-btn'>Edit</button>
                    </td>
                </tr>
            ))}
    </tbody>
</Table>


             <div className="d-flex justify-content-between mt-3">
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange('prev')}
                                    >
                                        Previous
                                    </Button>
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange('next')}
                                    >
                                        Next
                                    </Button>
                                </div> 
                                <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Reset Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formNewPassword">
                        <Form.Label className='mb-2'>New Password</Form.Label>
                        <Form.Control
                            className='mb-2'
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="formConfirmPassword">
                        <Form.Label className='mb-2'>Confirm Password</Form.Label>
                        <Form.Control
                            className='mb-2'
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit"> 
                        Reset Password
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
      
        </Card.Body>
        </Card>
        </Container>
        </main>
        </div>
            </>
     );
}
 
export default AdminViewAllUsersScreen;