const redis = require('redis');

// Create a Redis client
const client = redis.createClient({
    // host: 'localhost', // Change to your Redis server's host if different
    // port: 6379         // Change to your Redis server's port if different
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

// Handle connection errors
client.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});

// Connect to the Redis server
client.connect().then(()=>{
    console.log("Redis Connection Successfully");
})

exports.setItem = async (key, value) => {
    try {
        return await client.set(key, value);
    } catch (error) {
        return error
    }
}

exports.getItem = async (key) => {
    try {
        return await client.get(key);
    } catch (error) {
        return error
    }
}