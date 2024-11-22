import React, { useState } from 'react';

const ClaimMyProfile = ({ andy, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [allowAndyContact, setAllowAndyContact] = useState(false); // Default unchecked
  const [allowPublicContact, setAllowPublicContact] = useState(false); // Default unchecked

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter a valid email address.');
      return;
    }
    onSubmit(andy, email, allowAndyContact, allowPublicContact);
  };

  return (
    <>
      {/* Modal Content */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          width: '400px',
          textAlign: 'center',
        }}
      >
        <h3>
          Claim Profile: {andy.first_name} {andy.last_name}
        </h3>
        <p style={{ marginBottom: '20px' }}>
          By adding your email, you agree that the admin of this site can
          contact you. 
          <br /><br />
          Your email will never be shared, sold, or otherwise used beyond the scope of messaging you choose!. 
          <br /><br />
          Optionally, you
          can allow other Andy Dales or general users to send you messages
          through this platform.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              padding: '10px',
              fontSize: '16px',
              marginBottom: '20px',
              width: '80%',
            }}
          />
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
            <label>
              <input
                type="checkbox"
                checked={allowAndyContact}
                onChange={(e) => setAllowAndyContact(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Allow other Andy Dales to contact me
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                checked={allowPublicContact}
                onChange={(e) => setAllowPublicContact(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              Allow general users to contact me
            </label>
          </div>
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Submit
          </button>
        </form>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            marginTop: '10px',
            fontSize: '16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      {/* Modal Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999,
        }}
        onClick={onClose}
      ></div>
    </>
  );
};

export default ClaimMyProfile;