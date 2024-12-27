const funFactManager = require('../managers/funFact');

const getFunFacts = async (req, res) => {
  try {
    const funFacts = await funFactManager.getAllFunFacts();
    res.status(200).json(funFacts);
  } catch (err) {
    console.error('Error fetching fun facts:', err);
    res.status(500).send('Error fetching fun facts.');
  }
};

const addFunFact = async (req, res) => {
  const { profileId, type, description } = req.body;

  if (!profileId || !type || !description) {
    return res.status(400).send('Profile ID, type, and description are required.');
  }

  try {
    const newFunFactId = await funFactManager.addFunFact(profileId, type, description);
    res.status(201).json({ id: newFunFactId });
  } catch (err) {
    console.error('Error adding fun fact:', err);
    res.status(500).send('Error adding fun fact.');
  }
};

const updateFunFact = async (req, res) => {
  
  const { fact_id, type, description } = req.body;

  if (!fact_id || !type || !description) {
    return res.status(400).send('Fact ID, type, and description are required.');
  }

  try {
    const updatedRows = await funFactManager.updateFunFact(fact_id, type, description);

    if (updatedRows === 0) {
      return res.status(404).send('Fun fact not found.');
    }

    res.status(200).json({ message: 'Fun fact updated successfully.' });
  } catch (err) {
    console.error('Error updating fun fact:', err);
    res.status(500).send('Error updating fun fact.');
  }
};

const deleteFunFact = async (req, res) => {
  const { factId } = req.body;

  if (!factId) {
    return res.status(400).send('Fact ID is required.');
  }

  try {
    const deletedRows = await funFactManager.deleteFunFact(factId);

    if (deletedRows === 0) {
      return res.status(404).send('Fun fact not found.');
    }

    res.status(200).json({ message: 'Fun fact deleted successfully.' });
  } catch (err) {
    console.error('Error deleting fun fact:', err);
    res.status(500).send('Error deleting fun fact.');
  }
};

const getFunFactsByProfileId = async (req, res) => {
  const { profileId } = req.body;

  if (!profileId) {
    return res.status(400).send('Profile ID is required.');
  }

  try {
    const funFacts = await funFactManager.getFunFactsByProfileId(profileId);
    res.status(200).json(funFacts);
  } catch (err) {
    console.error('Error fetching fun facts by profile ID:', err);
    res.status(500).send('Error fetching fun facts by profile ID.');
  }
};

module.exports = {
  getFunFacts,
  addFunFact,
  updateFunFact,
  deleteFunFact,
  getFunFactsByProfileId,
};