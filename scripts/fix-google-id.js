import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('bizzhuss');
  
  const users = await db.collection('users').find({ google_id: { $exists: true, $ne: null } }).toArray();
  console.log(`Found ${users.length} users with google_id`);
  
  for (const u of users) {
    console.log(`User: ${u.email}, current google_id: ${u.google_id} (typeof: ${typeof u.google_id})`);
    if (typeof u.google_id !== 'string') {
      const stringified = String(u.google_id);
      await db.collection('users').updateOne(
        { _id: u._id },
        { $set: { google_id: stringified } }
      );
      console.log(`  Updated ${u.email} google_id to string: "${stringified}"`);
    }
  }

  await client.close();
  console.log('Done checking and normalizing google_id types.');
}

run().catch(console.error);
