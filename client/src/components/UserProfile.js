import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const UserProfile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [editableProfile, setEditableProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const profile_id = user?.user?.profile_id;
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!profile_id) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(apiUrl + `/api/get-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 'id': ""+profile_id }),
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setEditableProfile(data); // Initialize editable profile
        } else {
          setError('Failed to fetch profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('An error occurred while fetching the profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profile_id]);

  if (!user) {
    alert('You have to be logged in to view this page. Please log back in.');
    return <Navigate to="/" />;
  }

  // Handle input changes in the editable profile
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile((prev) => ({ ...prev, [name]: value }));
  };

  // Handle cancel (revert changes)
  const handleCancel = () => {
    setEditableProfile({ ...profile }); // Reset changes
    setIsEditing(false);
  };

  // Placeholder save functionality
  const handleSave = () => {
    alert('Save functionality coming soon!');
    setIsEditing(false);
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>User Profile</h2>
      <form>
        <div style={{ marginBottom: '10px' }}>
          <label>First Name:</label>
          <input
            type="text"
            name="first_name"
            value={editableProfile.first_name || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Last Name:</label>
          <input
            type="text"
            name="last_name"
            value={editableProfile.last_name || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>City:</label>
          <input
            type="text"
            name="location_city"
            value={editableProfile.location_city || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>State:</label>
          <input
            type="text"
            name="location_state"
            value={editableProfile.location_state || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Country:</label>
          <input
            type="text"
            name="location_country"
            value={editableProfile.location_country || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Job Title:</label>
          <input
            type="text"
            name="job_title"
            value={editableProfile.job_title || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Company:</label>
          <input
            type="text"
            name="company"
            value={editableProfile.company || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>LinkedIn:</label>
          <input
            type="url"
            name="linkedin_url"
            value={editableProfile.linkedin_url || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="contact_email"
            value={editableProfile.contact_email || ''}
            onChange={handleInputChange}
            disabled={!isEditing}
          />
        </div>
        <div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            style={{ marginRight: '10px' }}
            disabled={isEditing}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{ marginRight: '10px' }}
            disabled={!isEditing}
          >
            Save
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isEditing}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;