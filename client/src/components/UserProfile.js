import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import ProfileFields from './ProfileFields';
import FunFacts from './FunFacts';

const UserProfile = ({ user: initialUser }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : initialUser;
  });

  const [profile, setProfile] = useState(null);
  const [editableProfile, setEditableProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({}); // Validation errors

  const profile_id = user?.user?.profile_id;
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  // Persist user in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  // Fetch profile data
  useEffect(() => {
    if (!profile_id) {
      setLoading(false);
      setError('Profile ID is missing');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/get-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: profile_id }),
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setEditableProfile(data);
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

  // Validation logic
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'first_name':
      case 'last_name':
        if (!value.trim()) {
          error = 'This field is required.';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Only alphabetic characters are allowed.';
        }
        break;
      case 'years_of_experience':
        if (value.trim() && (isNaN(value) || parseFloat(value) <= 0)) {
          error = 'Must be a positive number.';
        }
        break;
      case 'email_address':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Enter a valid email address.';
        }
        break;
      case 'linkedin_url':
      case 'personal_website_url':
        if (value && !/^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/.test(value)) {
          error = 'Enter a valid URL.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Validate all fields
  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(editableProfile).forEach((key) => {
      const error = validateField(key, editableProfile[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handle Save Profile
  const handleSaveProfile = async () => {
    if (!validateAllFields()) {
      setMessage({ text: 'Please fix the errors before saving.', type: 'error' });
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableProfile),
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ text: data.message || 'Profile updated successfully!', type: 'success' });
        setProfile(editableProfile); // Sync the original profile with the updated one
        setIsEditing(false);
        setErrors({}); // Clear errors after successful save
      } else {
        const errorData = await response.json();
        setMessage({ text: errorData.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ text: 'An error occurred while saving the profile.', type: 'error' });
    }

    setTimeout(() => setMessage(null), 3000);
  };

  const handleCancelEdit = () => {
    setErrors({}); // Clear errors on cancel
    setEditableProfile({ ...profile }); // Revert changes
    setIsEditing(false);
  };

  // Handle field change with inline validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditableProfile((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  if (!user) {
    alert('You have to be logged in to view this page. Please log back in.');
    return <Navigate to="/" />;
  }

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => navigate('/andy-list')}
        style={{
          backgroundColor: '#007BFF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 20px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        Return to Andy List
      </button>

      <h2>User Profile</h2>

      {message && (
        <div
          style={{
            marginBottom: '15px',
            padding: '10px',
            textAlign: 'center',
            color: message.type === 'success' ? 'green' : 'red',
            border: `1px solid ${message.type === 'success' ? 'green' : 'red'}`,
            borderRadius: '5px',
          }}
        >
          {message.text}
        </div>
      )}

      <ProfileFields
        profile={profile}
        editableProfile={editableProfile}
        isEditing={isEditing}
        handleInputChange={handleInputChange}
        errors={errors}
      />

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        {isEditing ? (
          <>
            <button
              onClick={handleSaveProfile}
              style={{ marginRight: '10px', backgroundColor: 'green', color: 'white' }}
            >
              Save
            </button>
            <button onClick={handleCancelEdit} style={{ backgroundColor: 'gray', color: 'white' }}>
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            style={{ backgroundColor: 'blue', color: 'white' }}
          >
            Edit
          </button>
        )}
      </div>

      <FunFacts profileId={profile_id} apiUrl={apiUrl} />
    </div>
  );
};

export default UserProfile;