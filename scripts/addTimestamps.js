const mongoose = require('mongoose');
const Role = require('../models/roleModel');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mod20-development', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addTimestamps() {
  try {
    const now = new Date();
    
    // Update all roles that don't have timestamps
    const result = await Role.updateMany(
      {
        $or: [
          { createdAt: { $exists: false } },
          { updatedAt: { $exists: false } }
        ]
      },
      {
        $set: {
          createdAt: now,
          updatedAt: now
        }
      }
    );
    
    console.log('Updated', result.modifiedCount, 'roles with timestamps');
    
    // Check the specific role
    const maestroRole = await Role.findOne({ slug: 'maestro' });
    console.log('Maestro role timestamps:', {
      createdAt: maestroRole.createdAt,
      updatedAt: maestroRole.updatedAt
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding timestamps:', error);
    process.exit(1);
  }
}

addTimestamps();