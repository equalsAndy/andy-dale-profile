const db = require('../db');

// Get all fun facts for a profile
const getFunFactsByProfileId = async (profileId) => {
  const [results] = await db.query(
    'SELECT * FROM fun_facts WHERE profile_id = ?',
    [profileId]
  );
  return results;
};

// Add a new fun fact
const addFunFact = async (profileId, type, description) => {
  const [result] = await db.query(
    'INSERT INTO fun_facts (profile_id, type, description) VALUES (?, ?, ?)',
    [profileId, type, description]
  );
  return result.insertId;
};

// Update a fun fact by fact_id
const updateFunFact = async (factId, type, description) => {
  const [result] = await db.query(
    'UPDATE fun_facts SET type = ?, description = ? WHERE fact_id = ?',
    [type, description, factId]
  );
  return result.affectedRows;
};

// Delete a fun fact by fact_id
const deleteFunFact = async (factId) => {
  const [result] = await db.query('DELETE FROM fun_facts WHERE fact_id = ?', [factId]);
  return result.affectedRows;
};

// Get all fun facts
const getAllFunFacts = async () => {
  const [results] = await db.query('SELECT profile_id, type, description FROM fun_facts');
  return results;
};

module.exports = {
  getFunFactsByProfileId,
  addFunFact,
  updateFunFact,
  deleteFunFact,
  getAllFunFacts,
};