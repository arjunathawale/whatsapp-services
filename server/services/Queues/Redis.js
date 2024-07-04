const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
    host: 'localhost', // Change to your Redis server's host if different
    port: 6379         // Change to your Redis server's port if different
});

// Handle connection errors
client.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});

// Connect to the Redis server
client.connect();

// Function to delete all hash keys
async function deleteAllHashes() {
    try {
        // Get all keys
        const keys = await client.keys('*');
        // console.log("Keys: ", keys);
        // Iterate over the keys and check their type
        for (const key of keys) {
            const type = await client.type(key);
            console.log(`Key: ${key}, Type: ${type}`);
            if (type === 'hash') {
                await client.del(key);
                console.log(`Deleted hash: ${key}`);
            }
        }

        console.log('All hash keys have been deleted.');
    } catch (err) {
        console.error('Error deleting hash keys:', err);
    } finally {
        // Close the Redis client
        client.quit();
    }
}

// Delete all hashes
deleteAllHashes();
