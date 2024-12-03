import React, { useState, useEffect } from 'react';

const ContactAdmin = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [senderEmail, setSenderEmail] = useState(''); // Optional sender email
  const [submitted, setSubmitted] = useState(false); // Track submission status
  const [error, setError] = useState(false); // Track error state
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Fetch the logged-in user's email
    const fetchUserEmail = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/user`, {
          credentials: 'include', // Include cookies for session
        });
        if (response.ok) {
          const userData = await response.json();
          console.log("ContactAdmin - userData - "+ JSON.stringify(userData));
          setSenderEmail(userData.user.email || ''); // Set email if available
        } else {
          console.error('Failed to fetch user email:', response.statusText);
        }
      } catch (err) {
        console.error('Error fetching user email:', err);
      }
    };

    fetchUserEmail();
  }, [apiUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      alert('Subject and message are required.');
      return;
    }

    try {
      const response = await fetch(apiUrl + '/api/sendAdminMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, email: senderEmail }),
      });

      if (response.ok) {
        setSubmitted(true);
        setSubject('');
        setMessage('');
        setSenderEmail('');
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
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            style={{
              width: '80%',
              maxWidth: '600px',
              padding: '10px',
              fontSize: '16px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
          <br />
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
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              resize: 'none',
            }}
          ></textarea>
          <br />
          <input
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="Your email (optional)"
            style={{
              width: '80%',
              maxWidth: '600px',
              padding: '10px',
              fontSize: '16px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          />
          <br />
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