import React, { useState } from 'react';

const ContactAdmin = () => {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false); // Track submission status
  const [error, setError] = useState(false); // Track error state

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      alert('Please enter a message before submitting.');
      return;
    }

    try {
      // Simulate sending the message to the admin
      const response = await fetch('/api/contact-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        setSubmitted(true);
        setMessage(''); // Clear the form
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Error submitting message:', err);
      setError(true);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Contact Admin</h2>
      {submitted ? (
        <div style={{ marginTop: '20px', color: '#4CAF50' }}>
          <h3>Thank you for your message!</h3>
          <p>The admin has received your message and will respond as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            rows="6"
            style={{
              width: '80%',
              maxWidth: '600px',
              padding: '10px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              resize: 'none',
            }}
          ></textarea>
          <br />
          <button
            type="submit"
            style={{
              padding: '10px 20px',
              marginTop: '10px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Send Message
          </button>
        </form>
      )}
      {error && (
        <div style={{ marginTop: '20px', color: '#f44336' }}>
          <h3>Something went wrong!</h3>
          <p>There was an issue sending your message. Please try again later.</p>
        </div>
      )}
    </div>
  );
};

export default ContactAdmin;