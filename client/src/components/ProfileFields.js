import React from 'react';

const ProfileFields = ({ profile, editableProfile, isEditing, handleInputChange, errors }) => {
  // Handle URL fields: Add schema (https://) if missing on blur
  const handleUrlBlur = (e) => {
    const { name, value } = e.target;
    if (value && !value.match(/^https?:\/\//)) {
      const updatedValue = `https://${value}`;
      handleInputChange({ target: { name, value: updatedValue } });
    }
  };

  return (
    <form
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto 1fr',
        gap: '10px 20px',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      {/* First Name and Last Name */}
      <label>First Name:</label>
      <div>
        <input
          type="text"
          name="first_name"
          value={editableProfile.first_name || ''}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        {errors?.first_name && <small style={{ color: 'red' }}>{errors.first_name}</small>}
      </div>

      <label>Last Name:</label>
      <div>
        <input
          type="text"
          name="last_name"
          value={editableProfile.last_name || ''}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        {errors?.last_name && <small style={{ color: 'red' }}>{errors.last_name}</small>}
      </div>

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
        style={{ gridColumn: '2 / span 3', width: '100%' }}
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
      <div>
        <input
          type="text"
          name="years_of_experience"
          value={editableProfile.years_of_experience || ''}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
        {errors?.years_of_experience && (
          <small style={{ color: 'red' }}>{errors.years_of_experience}</small>
        )}
      </div>

      {/* LinkedIn and Website */}
      <label>LinkedIn:</label>
      <div>
        <input
          type="url"
          name="linkedin_url"
          value={editableProfile.linkedin_url || ''}
          onChange={handleInputChange}
          onBlur={handleUrlBlur}
          disabled={!isEditing}
          style={{ width: 250 }}
        />
        {errors?.linkedin_url && <small style={{ color: 'red' }}>{errors.linkedin_url}</small>}
      </div>
      <label>Website:</label>
      <div>
        <input
          type="url"
          name="personal_website_url"
          value={editableProfile.personal_website_url || ''}
          onChange={handleInputChange}
          onBlur={handleUrlBlur}
          disabled={!isEditing}
          style={{ width: 250 }}
        />
        {errors?.personal_website_url && (
          <small style={{ color: 'red' }}>{errors.personal_website_url}</small>
        )}
      </div>

      {/* Email */}
      <label>Email:</label>
      <div>
        <input
          type="email"
          name="email_address"
          value={editableProfile.email_address || ''}
          onChange={handleInputChange}
          disabled={!isEditing}
          style={{ width: 250 }}
        />
        {errors?.email_address && <small style={{ color: 'red' }}>{errors.email_address}</small>}
      </div>

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