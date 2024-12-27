import React from 'react';

const ProfileFields = ({ profile, editableProfile, isEditing, handleInputChange }) => {
  return (
    <form
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto 1fr', // Two pairs of label-input columns
        gap: '10px 20px', // Row and column spacing
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      {/* First Name and Last Name */}
      <label>First Name:</label>
      <input
        type="text"
        name="first_name"
        value={editableProfile.first_name || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />
      <label>Last Name:</label>
      <input
        type="text"
        name="last_name"
        value={editableProfile.last_name || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />

      {/* AKA */}
      <label>AKA:</label>
      <input
        type="text"
        name="aka"
        value={editableProfile.aka || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />

      {/* Bio */}
      <label style={{ gridColumn: '1 / span 1' }}>Bio:</label>
      <textarea
        name="bio"
        value={editableProfile.bio || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
        rows={3}
        style={{ gridColumn: '2 / span 3', width: '100%' }} // Span all columns for bio
      />

      {/* City, State, Country */}
      <label>City:</label>
      <input
        type="text"
        name="location_city"
        value={editableProfile.location_city || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />
      <label>State:</label>
      <input
        type="text"
        name="location_state"
        value={editableProfile.location_state || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />
      <label>Country:</label>
      <input
        type="text"
        name="location_country"
        value={editableProfile.location_country || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />

      {/* Job Title and Company */}
      <label>Job Title:</label>
      <input
        type="text"
        name="job_title"
        value={editableProfile.job_title || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />
      <label>Company:</label>
      <input
        type="text"
        name="company"
        value={editableProfile.company || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />

      {/* Years of Experience */}
      <label>Years of Experience:</label>
      <input
        type="text"
        name="years_of_experience"
        value={editableProfile.years_of_experience || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />

      {/* LinkedIn and Website */}
      <label>LinkedIn:</label>
      <input
        type="url"
        name="linkedin_url"
        value={editableProfile.linkedin_url || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />
      <label>Website:</label>
      <input
        type="url"
        name="personal_website_url"
        value={editableProfile.personal_website_url || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />

      {/* Email */}
      <label>Email:</label>
      <input
        type="email"
        name="email_address"
        value={editableProfile.email_address || ''}
        onChange={handleInputChange}
        disabled={!isEditing}
      />

      {/* Created At */}
      <label>Created At:</label>
      <input
        type="text"
        name="created_at"
        value={editableProfile.created_at || ''}
        disabled
      />
    </form>
  );
};

export default ProfileFields;