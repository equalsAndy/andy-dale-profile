import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const TestAuth = () => {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return <button onClick={() => loginWithRedirect()}>Log In</button>;
  }

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <button onClick={() => logout({ returnTo: window.location.origin })}>
        Log Out
      </button>
    </div>
  );
};

export default TestAuth;