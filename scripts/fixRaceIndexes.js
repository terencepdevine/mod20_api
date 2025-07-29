const mongoose = require('mongoose');
require('dotenv').config();

async function fixRaceIndexes() {
  try {
    // Connect to MongoDB (you'll need to update DATABASE_URI in .env with real credentials)
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('races');

    // List current indexes
    console.log('Current race indexes:');
    const indexes = await collection.listIndexes().toArray();
    indexes.forEach(index => {
      console.log(`- ${index.name}:`, index.key, index.unique ? '(unique)' : '');
    });

    // Drop the old simple unique index on name if it exists
    try {
      await collection.dropIndex('name_1');
      console.log('✅ Successfully dropped the old name_1 unique index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index name_1 does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // Verify the compound indexes exist
    const newIndexes = await collection.listIndexes().toArray();
    
    const nameSystemIndex = newIndexes.find(index => 
      index.key.name === 1 && 
      index.key.system === 1 && 
      index.unique === true
    );

    const slugSystemIndex = newIndexes.find(index => 
      index.key.slug === 1 && 
      index.key.system === 1 && 
      index.unique === true
    );

    if (nameSystemIndex) {
      console.log('✅ Compound unique index (name + system) exists:', nameSystemIndex.name);
    } else {
      console.log('⚠️  Creating compound unique index (name + system)...');
      await collection.createIndex({ name: 1, system: 1 }, { unique: true });
      console.log('✅ Created compound unique index (name + system)');
    }

    if (slugSystemIndex) {
      console.log('✅ Compound unique index (slug + system) exists:', slugSystemIndex.name);
    } else {
      console.log('⚠️  Creating compound unique index (slug + system)...');
      await collection.createIndex({ slug: 1, system: 1 }, { unique: true });
      console.log('✅ Created compound unique index (slug + system)');
    }

    console.log('\nFinal race indexes:');
    const finalIndexes = await collection.listIndexes().toArray();
    finalIndexes.forEach(index => {
      console.log(`- ${index.name}:`, index.key, index.unique ? '(unique)' : '');
    });

    console.log('\n✅ Race indexes fixed successfully!');
    console.log('Races can now have duplicate names across different systems.');

  } catch (error) {
    console.error('Error fixing race indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixRaceIndexes();