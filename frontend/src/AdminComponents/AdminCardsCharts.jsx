import { Container, Row, Col, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers, FaGraduationCap, FaBook, FaSearch, FaUserClock} from 'react-icons/fa';
import './AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminSidebar from './AdminSidebar';
import { useState } from 'react';
const AdminCardsCharts = () => {
    const chartData = [
        { month: 'Jan', Students: 1, Teachers: 1 },
        { month: 'Feb', Students: 1, Teachers: 2 },
        { month: 'Mar', Students: 5, Teachers: 2 },
        { month: 'Apr', Students: 15, Teachers: 10 }
    ];

    const [accountsData, setAccountsData] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Active' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Student', status: 'Inactive' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Teacher', status: 'Active' },
    ]);
    
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    
    const accountId = accountsData.map(account => account.id);
    const filteredAccounts = accountsData.filter(account => 
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const numberofUsers = accountsData.length;
    const numberOfStudents = accountsData.filter(account => account.role === 'Student').length;
    const numberOfTeachers = accountsData.filter(account => account.role === 'Teacher').length;
    const numberOfActiveUsers = accountsData.filter(account => account.status === 'Active').length;
    
    return ( 
        <>
         <AdminSidebar />
         <div className='d-flex'>
        <main className="main-content flex-grow-1">
        <Container fluid>
        {/* Stats Cards */}
        <Row className="g-4 mb-4">
        <Col sm={6} lg={3}>
            <Card className="stat-card total-users h-100">
                <Card.Body className="d-flex align-items-center">
                    <FaUsers className="text-primary me-3" size={24} />
                    <div>
                        <Card.Subtitle className="text-muted">Total Users</Card.Subtitle>
                        <Card.Title as="h3">{numberofUsers}</Card.Title>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col sm={6} lg={3}>
            <Card className="stat-card total-users h-100">
                <Card.Body className="d-flex align-items-center">
                    <FaGraduationCap className="text-success me-3" size={24} />
                    <div>
                        <Card.Subtitle className="text-muted">Students</Card.Subtitle>
                        <Card.Title as="h3">{numberOfStudents}</Card.Title>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col sm={6} lg={3}>
            <Card className="stat-card total-users h-100">
                <Card.Body className="d-flex align-items-center">
                    <FaBook className="text-warning me-3" size={24} />
                    <div>
                        <Card.Subtitle className="text-muted">Teachers</Card.Subtitle>
                        <Card.Title as="h3">{numberOfTeachers}</Card.Title>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        <Col sm={6} lg={3}>
            <Card className="stat-card total-users h-100">
                <Card.Body className="d-flex align-items-center">
                    <FaUserClock className="text-danger me-3" size={24} />
                    <div>
                        <Card.Subtitle className="text-muted">Active Users</Card.Subtitle>
                        <Card.Title as="h3">{numberOfActiveUsers}</Card.Title>
                    </div>
                </Card.Body>
            </Card>
        </Col>
        </Row>
        
        {/* Charts */}
        <Row className="g-4 mb-4">
        <Col lg={6}>
            <Card>
                <Card.Body>
                    <Card.Title>Number of Students</Card.Title>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Students" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>
        </Col>
        <Col lg={6}>
            <Card>
                <Card.Body>
                    <Card.Title>Number of Teachers</Card.Title>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Teachers" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card.Body>
            </Card>
        </Col>
        </Row>
        
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
        
            <Table responsive hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAccounts
                        .slice(0, entriesPerPage)
                        .map(account => (
                            <tr key={account.id}>
                                <td>{account.name}</td>
                                <td>{account.email}</td>
                                <td>{account.role}</td>
                                <td>{account.status}</td>
                            </tr>
                        ))}
                </tbody>
            </Table>
        
            {/* Showing entries info */}
            <div className="text-muted">
                Showing {Math.min(entriesPerPage, filteredAccounts.length)} of {filteredAccounts.length} entries
            </div>
        </Card.Body>
        </Card>
        </Container>
        </main>
        </div>
        </>
     );
}
 
export default AdminCardsCharts;