import React, { useState, useEffect } from 'react';

const FunFacts = ({ profileId, apiUrl }) => {
  const [funFacts, setFunFacts] = useState([]);
  const [editingFactId, setEditingFactId] = useState(null);
  const [editingFact, setEditingFact] = useState(null);
  const [message, setMessage] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // Track if the add modal is open
  const [newFact, setNewFact] = useState({ type: '', description: '' }); // New fact data

  const enumTypes = ['Quote', 'Talent', 'Fact']; // Enum options for the pick list

  useEffect(() => {
    const fetchFunFacts = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/getFunFactsByProfileId`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId }),
        });

        if (response.ok) {
          const facts = await response.json();
          setFunFacts(facts);
        } else {
          console.error('Failed to fetch fun facts');
        }
      } catch (err) {
        console.error('Error fetching fun facts:', err);
      }
    };

    if (profileId) fetchFunFacts();
  }, [profileId, apiUrl]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000); // Clear message after 3 seconds
  };

  const handleAddFactChange = (e) => {
    const { name, value } = e.target;
    setNewFact((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFact = async () => {
    if (!newFact.type || !newFact.description) {
      showMessage('Type and description are required.', 'error');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/add-funfact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newFact, profileId }),
      });

      if (response.ok) {
        const { id } = await response.json();
        setFunFacts((prevFacts) => [...prevFacts, { ...newFact, fact_id: id }]);
        showMessage('Fun fact added successfully!', 'success');
        setNewFact({ type: '', description: '' });
        setIsAdding(false); // Close modal
      } else {
        showMessage('Failed to add fun fact.', 'error');
      }
    } catch (err) {
      console.error('Error adding fun fact:', err);
      showMessage('An error occurred. Please try again.', 'error');
    }
  };

  const handleCancelAdd = () => {
    setNewFact({ type: '', description: '' });
    setIsAdding(false); // Close modal
  };

  const handleEditFact = (fact) => {
    setEditingFactId(fact.fact_id);
    setEditingFact({ ...fact });
  };

  const handleFactChange = (e) => {
    const { name, value } = e.target;
    setEditingFact((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveFact = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/update-funfact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFact),
      });

      if (response.ok) {
        const { message } = await response.json();
        setFunFacts((prevFacts) =>
          prevFacts.map((fact) =>
            fact.fact_id === editingFact.fact_id ? { ...fact, ...editingFact } : fact
          )
        );
        showMessage(message, 'success');
      } else {
        showMessage('Failed to update fun fact.', 'error');
      }
    } catch (err) {
      console.error('Error updating fun fact:', err);
      showMessage('An error occurred. Please try again.', 'error');
    } finally {
      setEditingFactId(null);
      setEditingFact(null);
    }
  };

  const handleDeleteFact = async (factId) => {
    try {
      const response = await fetch(`${apiUrl}/api/delete-funfact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factId }),
      });

      if (response.ok) {
        const { message } = await response.json();
        setFunFacts((prevFacts) => prevFacts.filter((fact) => fact.fact_id !== factId));
        showMessage(message, 'success');
      } else {
        showMessage('Failed to delete fun fact.', 'error');
      }
    } catch (err) {
      console.error('Error deleting fun fact:', err);
      showMessage('An error occurred. Please try again.', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingFactId(null);
    setEditingFact(null);
  };

  return (
    <div>
      <h3>Fun Facts</h3>

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

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Type</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Description</th>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {funFacts.map((fact) => (
            <tr key={fact.fact_id}>
              {editingFactId === fact.fact_id ? (
                <>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <input
                      type="text"
                      name="type"
                      value={editingFact.type}
                      onChange={handleFactChange}
                      style={{ width: '100%' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <textarea
                      name="description"
                      value={editingFact.description}
                      onChange={handleFactChange}
                      rows={3}
                      style={{ width: '100%', resize: 'vertical' }}
                    ></textarea>
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <button onClick={handleSaveFact}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{fact.type}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{fact.description}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <button onClick={() => handleEditFact(fact)}>Edit</button>
                    <button onClick={() => handleDeleteFact(fact.fact_id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Fun Fact Button */}
      <button
        onClick={() => setIsAdding(true)}
        style={{ marginTop: '20px', backgroundColor: '#007BFF', color: 'white' }}
      >
        Add Fun Fact
      </button>

      {/* Add Fun Fact Modal */}
      {isAdding && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h4>Add a New Fun Fact</h4>
            <div>
              <select
                name="type"
                value={newFact.type}
                onChange={handleAddFactChange}
                style={{ marginBottom: '10px', width: '100%' }}
              >
                <option value="">Select Type</option>
                {enumTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <textarea
                name="description"
                placeholder="Description"
                value={newFact.description}
                onChange={handleAddFactChange}
                rows={4}
                style={{ marginBottom: '10px', width: '100%', resize: 'vertical' }}
              ></textarea>
              <button onClick={handleAddFact} style={{ marginRight: '10px' }}>
                Add
              </button>
              <button onClick={handleCancelAdd}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FunFacts;