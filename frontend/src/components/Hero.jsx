import { Container, Card, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Hero = () => {
  return (
    <div className='hero-section py-5'>
      <Container className='d-flex justify-content-center'>
        <Card className='p-5 d-flex flex-column align-items-center hero-card bg-white w-75'>
          {/* School Logo could be added here */}
          <img 
            src="./img/TVNHS.png" 
            alt="School Logo" 
            className="mb-4"
            style={{ width: '100px' }}
          />
          
          <h1 className='text-center mb-3 school-title'>
            Welcome to<br />
            <span className='highlight'>Tropical Village</span><br />
            National High School
          </h1>

          <p className='text-center mb-4 welcome-text'>
            Empowering minds, building futures.<br />
            Your gateway to learning and excellence.
          </p>

          <div className='d-flex gap-3'>
            <LinkContainer to='/login'>
              <Button variant='success' size='lg' className='get-started-btn'>
                Get Started
              </Button>
            </LinkContainer>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Hero;