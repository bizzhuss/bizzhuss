import { MongoClient } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not configured");
}

const options = {
  appName: "bizzhuss",
  maxIdleTimeMS: 5000,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development, preserve client across HMR and module reloads
  if (!globalThis._mongoClientPromise) {
    client = new MongoClient(uri, options);
    try {
      attachDatabasePool(client);
    } catch {
      // attachDatabasePool is active within Vercel Lambda contexts
    }
    globalThis._mongoClient = client;
    globalThis._mongoClientPromise = client.connect();
  }
  client = globalThis._mongoClient;
  clientPromise = globalThis._mongoClientPromise;
} else {
  // Production / serverless deployment
  client = new MongoClient(uri, options);
  try {
    attachDatabasePool(client);
  } catch {
    // attachDatabasePool is active within Vercel Lambda contexts
  }
  clientPromise = client.connect();
}

export { client, clientPromise };
export default client;
