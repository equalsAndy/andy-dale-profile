const db = require('../db'); // Adjust the path to your database connection module

const funFactsData = [
  { profileId: 2, type: 'Fact', description: 'Loves hiking in the mountains.' },
  { profileId: 3, type: 'Quote', description: 'Life is what happens when you’re busy making other plans.' },
  { profileId: 4, type: 'Talent', description: 'Expert in origami folding.' },
  { profileId: 5, type: 'Fact', description: 'Has climbed Mt. Kilimanjaro.' },
  { profileId: 6, type: 'Quote', description: 'The only limit to our realization of tomorrow is our doubts of today.' },
  { profileId: 7, type: 'Talent', description: 'Plays the piano professionally.' },
  { profileId: 8, type: 'Fact', description: 'Has a collection of over 1,000 stamps.' },
  { profileId: 9, type: 'Quote', description: 'Do or do not, there is no try.' },
];

const seedFunFacts = async () => {
  try {
    for (const fact of funFactsData) {
      await db.query(
        `
        INSERT INTO fun_facts (profile_id, type, description)
        VALUES (?, ?, ?)
        `,
        [fact.profileId, fact.type, fact.description]
      );
    }
    console.log('Fun facts seeded successfully.');
  } catch (err) {
    console.error('Error seeding fun facts:', err);
  } finally {
    await db.close(); // Close the database connection
  }
};

// Call the function
seedFunFacts();