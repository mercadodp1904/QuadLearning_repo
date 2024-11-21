import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const Header = () => {
  const [loading, setLoading] = useState(false); // Define loading state
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Define navigate

  const handleLogOut = async (e) => {
    e.preventDefault(); // Prevent the default behavior of the event
    setLoading(true);   // Set loading state to true
    setError('');       // Clear any previous errors

    try {
        const response = await fetch('/api/users/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies in the request if they're used for authentication
        });

        if (!response.ok) {
            throw new Error('Logout failed');
        }

        // Clear token and user info from local storage
        localStorage.removeItem('token'); // Clear token if stored locally
        localStorage.removeItem('userInfo'); // Remove additional user data if stored

        // Redirect to the login page
        navigate('/login');
        console.log('Logout successful');
    } catch (err) {
        setError(err.message); // Display error message in the UI
        console.error('Error during logout:', err.message); // Log the error for debugging
    } finally {
        setLoading(false); // Reset the loading state
    }
};




  return (
    <header>
      <Navbar bg='success' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>
            <img
              alt=""
              src="../img/TVNHS.png"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            TVNHS
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              <LinkContainer to='/login'>
                <Nav.Link>
                  <FaSignInAlt /> Sign In
                </Nav.Link>
              </LinkContainer>
              <button onClick={handleLogOut} disabled={loading}>
                {loading ? 'Logging out...' : 'Log Out'}
            </button>
            {error && <div className="alert alert-danger">{error}</div>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;