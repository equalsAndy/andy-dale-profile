const createTestFunFactData = (overrides = {}) => {
    return {
      profileId: 1, // Default profile ID
      type: 'Fact', // Default type (e.g., 'Fact', 'Quote', or 'Talent')
      description: 'I can juggle flaming torches!', // Default test description
      ...overrides, // Allow overriding fields
    };
  };
  
  module.exports = { createTestFunFactData };