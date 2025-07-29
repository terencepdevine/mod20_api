const mongoose = require('mongoose');
require('dotenv').config();

async function fixRoleIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('roles');

    // List current indexes
    console.log('Current indexes:');
    const indexes = await collection.listIndexes().toArray();
    indexes.forEach(index => {
      console.log(`- ${index.name}:`, index.key);
    });

    // Drop the old simple unique index on name if it exists
    try {
      await collection.dropIndex('name_1');
      console.log('Successfully dropped the old name_1 unique index');
    } catch (error) {
      if (error.code === 27) {
        console.log('Index name_1 does not exist (already removed)');
      } else {
        throw error;
      }
    }

    // Verify the compound index exists
    const newIndexes = await collection.listIndexes().toArray();
    const compoundIndex = newIndexes.find(index => 
      index.key.name === 1 && 
      index.key.system === 1 && 
      index.unique === true
    );

    if (compoundIndex) {
      console.log('✅ Compound unique index (name + system) exists:', compoundIndex.name);
    } else {
      console.log('⚠️  Creating compound unique index...');
      await collection.createIndex({ name: 1, system: 1 }, { unique: true });
      console.log('✅ Created compound unique index (name + system)');
    }

    console.log('\nFinal indexes:');
    const finalIndexes = await collection.listIndexes().toArray();
    finalIndexes.forEach(index => {
      console.log(`- ${index.name}:`, index.key, index.unique ? '(unique)' : '');
    });

    console.log('\n✅ Role indexes fixed successfully!');
    console.log('Roles can now have duplicate names across different systems.');

  } catch (error) {
    console.error('Error fixing role indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixRoleIndexes();