import { MongoClient } from 'mongodb';

const username = process.argv[2] || 'Jace';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bettrackr';

async function setPremium() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    const result = await db.collection('users').updateOne(
      { username: { $regex: new RegExp(`^${username}$`, 'i') } },
      { $set: { premiumOverride: true } }
    );
    
    if (result.matchedCount === 0) {
      console.log(`User '${username}' not found`);
    } else {
      console.log(`✅ Premium access granted to '${username}'`);
    }
    
    // Verify
    const user = await db.collection('users').findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (user) {
      console.log(`User: ${user.username}, Email: ${user.email}, Premium: ${user.premiumOverride ? 'YES' : 'NO'}`);
    }
  } finally {
    await client.close();
  }
}

setPremium().catch(console.error);
