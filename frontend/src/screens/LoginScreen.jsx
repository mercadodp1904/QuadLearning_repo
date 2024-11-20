import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
const LoginScreen = () => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const response = await fetch('/api/users/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();

        // Debugging: Log data to verify the response structure
        console.log('Response data:', data);

        // Save the token and user info to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));

      setLoading(false);
        // Navigate to dashboard based on role
    if (data.user.role === 'student') {
        navigate('./StudentScreens/StudentHomeScreen');
    } else if (data.user.role === 'teacher') {
        navigate('./TeacherScreens/TeacherHomeScreen');
    } else if (data.user.role === 'admin') {
        navigate('./AdminScreens/AdminHomeScreen');
    }
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <FormContainer>
      <h1>Sign In</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <Form onSubmit={submitHandler}>
        <Form.Group className='my-2' controlId='lrn'>
          <Form.Label>Student Number / LRN</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter LRN'
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group className='my-2' controlId='password'>
          <Form.Label>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Enter password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type='submit' variant='success' className='mt-3' disabled={loading}>
          {loading ? 'Loading...' : 'Sign In'}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default LoginScreen;