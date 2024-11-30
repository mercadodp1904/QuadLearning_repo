import { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import './AdminSidebar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
const AdminSidebar = () => {
    const [dropdowns, setDropdowns] = useState({
        users: false,
        academic: false,
        settings: false
    });

    const toggleDropdown = (key) => {
        setDropdowns(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (

        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Admin Panel</h3>
            </div>

            <Nav className="flex-column flex-grow-1">
                <LinkContainer to="/admin/dashboard">
                    <Nav.Link className="sidebar-link">
                    <i className="bi bi-house-door"></i> Home
                    </Nav.Link>
                </LinkContainer>

                {/* Users Management Dropdown */}
                <div className="sidebar-dropdown">
                    <div className="sidebar-link" onClick={() => toggleDropdown('users')}>
                        <i className="bi bi-people"></i>
                        <span>Users Management</span>
                        <i className={`bi bi-chevron-${dropdowns.users ? 'up' : 'down'} ms-auto`}></i>
                    </div>
                    <div className={`sidebar-dropdown-content ${dropdowns.users ? 'show' : ''}`}>
                        <LinkContainer to="/admin/AdminViewAllUsersScreen">
                            <Nav.Link>View All Users</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/AdminCreateStudentAccount">
                            <Nav.Link>Add New Student Account</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/AdminCreateTeacherAccount">
                            <Nav.Link>Add New Teacher Account</Nav.Link>
                        </LinkContainer>
                    </div>
                </div>

                {/* Academic Management Dropdown */}
                <div className="sidebar-dropdown">
                    <div className="sidebar-link" onClick={() => toggleDropdown('academic')}>
                    <i className="bi bi-diagram-3"></i>
                        <span>Academic Management</span>
                        <i className={`bi bi-chevron-${dropdowns.academic ? 'up' : 'down'} ms-auto`}></i>
                    </div>
                    <div className={`sidebar-dropdown-content ${dropdowns.academic ? 'show' : ''}`}>
                        <LinkContainer to="/admin/strands">
                        <Nav.Link as={Link} to="/admin/strands">
                            Manage Strands
                        </Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/ManageSections">
                            <Nav.Link>Manage Sections</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/ManageSubjects">
                            <Nav.Link>Manage Subjects</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/ManageSemesters">
                            <Nav.Link>Manage Semesters</Nav.Link>
                        </LinkContainer>
                    </div>
                </div>

                {/* Settings Dropdown */}
                <div className="sidebar-dropdown">
                    <div className="sidebar-link" onClick={() => toggleDropdown('settings')}>
                    <i className="bi bi-person-plus"></i>
                        <span>Assign Users</span>
                        <i className={`bi bi-chevron-${dropdowns.settings ? 'up' : 'down'} ms-auto`}></i>
                    </div>
                    <div className={`sidebar-dropdown-content ${dropdowns.settings ? 'show' : ''}`}>
                        <LinkContainer to="/admin/assign-students">
                            <Nav.Link>Assign Students</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/admin/assign-teachers">
                            <Nav.Link>Assign Teachers</Nav.Link>
                        </LinkContainer>
                        
                    </div>
                </div>
                    {/* Added Sidebar Footer */}
            <div className="sidebar-footer">
            <div className="logout-link">
                <div 
                    
                    onClick={() => {
                        // Add your logout logic here
                        console.log('Logging out...');
                    }}
                >
                    <LinkContainer to="/admin/dashboard">
                    <Nav.Link className="sidebar-link">
                        
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                    
                    </Nav.Link>
                    </LinkContainer>
                </div>
                </div>
                </div>
            </Nav>
        </div>
    );
}

export default AdminSidebar;