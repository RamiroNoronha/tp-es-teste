import React from 'react';
import Login from './Login';
import Register from './Register';

const LandingPage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Our Application</h1>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <Login />
        <Register />
      </div>
    </div>
  );
};

export default LandingPage;