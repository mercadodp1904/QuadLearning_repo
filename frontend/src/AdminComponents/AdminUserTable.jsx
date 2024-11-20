import { Container, Card, Table, Form, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import '../AdminComponents/AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useState } from 'react';
const AdminUserTable = () => {
    const [accountsData, setAccountsData] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', status: 'Active' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Student', status: 'Inactive' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Teacher', status: 'Active' },
    ]);
    const numberofUsers = accountsData.length;
    const numberOfStudents = accountsData.filter(account => account.role === 'Student').length;
    const numberOfTeachers = accountsData.filter(account => account.role === 'Teacher').length;
    const numberOfActiveUsers = accountsData.filter(account => account.status === 'Active').length;

    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    
    const accountId = accountsData.map(account => account.id);
    const filteredAccounts = accountsData.filter(account => 
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return ( 
        <>
     
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

                <div>
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
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
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
                                <td>
                                    <button className='btn btn-primary custom-btn'>Edit</button>
                                    <button 
                                        className='btn btn-danger custom-btn' 
                                        onClick={(e) => {
                                            e.preventDefault();  // Prevent default behavior
                                            handleShow(account.id);
                                        }}
                                    >Delete</button>
                                    </td>
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
 
export default AdminUserTable;