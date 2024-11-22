import React from 'react';

const InfoModal = ({ onClose, onConfirm }) => {
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
          textAlign: 'center',
        }}
      >
        <h3>Welcome to the Andy Dale Project!</h3>
        <p style={{ marginBottom: '20px' }}>
          This site is a work in progress, and many features are still being developed. It’s meant to
          be a fun way to showcase and connect with other Andy Dales.
        </p>
        <ul style={{ textAlign: 'left', marginBottom: '20px' }}>
          <li>💡 Explore skills and stories of Andy Dales worldwide.</li>
          <li>🌍 Connect with others who share the name.</li>
          <li>🚀 New features are coming soon!</li>
        </ul>
        <p>
          If you have any questions, you can contact the admin by clicking on the{' '}
          <strong>Message Admin</strong> button available on any page.
        </p>
        <p>Click <strong>Continue</strong> to view the profiles of other Andy Dales.</p>
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
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

export default InfoModal;