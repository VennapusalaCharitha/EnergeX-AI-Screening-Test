const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const port = 3001;

app.use(cors());
app.use(express.json());

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Function to broadcast new posts
function broadcastNewPost(post) {
  io.emit('newPost', post);
}

// Function to broadcast post deletion
function broadcastPostDeleted(postId) {
  io.emit('postDeleted', postId);
}

// GraphQL Schema
const schema = buildSchema(`
  type Post {
    id: ID!
    title: String!
    content: String!
    user_id: Int!
    created_at: String!
  }
  
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }
  
  type Query {
    posts: [Post]
    post(id: ID!): Post
    users: [User]
  }
  
  type Mutation {
    createPost(title: String!, content: String!): Post
  }
`);

// GraphQL Resolvers
const root = {
  posts: () => {
    return [];
  },
  post: ({ id }) => {
    return null;
  },
  users: () => {
    return [];
  },
  createPost: ({ title, content }) => {
    return {
      id: '1',
      title,
      content,
      user_id: 1,
      created_at: new Date().toISOString()
    };
  }
};

// GraphQL endpoint
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'EnergeX Cache Service', status: 'Running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'EnergeX Cache Service' });
});

app.get('/cache/posts', async (req, res) => {
  try {
    const redis = require('redis');
    const client = redis.createClient({ url: 'redis://redis:6379' });
    await client.connect();
    
    const cacheKey = 'posts:all';
    const cachedPosts = await client.get(cacheKey);
    
    if (cachedPosts) {
      await client.disconnect();
      return res.json({ posts: JSON.parse(cachedPosts), cached: true });
    }
    
    // Simulate fetching from database
    const posts = [];
    
    // Cache with 5 minute expiry and LRU eviction
    await client.setEx(cacheKey, 300, JSON.stringify(posts));
    await client.disconnect();
    
    res.json({ posts, cached: false });
  } catch (error) {
    res.json({ posts: [], cached: false, error: error.message });
  }
});

app.get('/cache/posts/:id', async (req, res) => {
  try {
    const redis = require('redis');
    const client = redis.createClient({ url: 'redis://redis:6379' });
    await client.connect();
    
    const postId = req.params.id;
    const cacheKey = `posts:${postId}`;
    const cachedPost = await client.get(cacheKey);
    
    if (cachedPost) {
      await client.disconnect();
      return res.json({ post: JSON.parse(cachedPost), cached: true });
    }
    
    // Simulate fetching from database
    const post = null;
    
    if (post) {
      // Cache with 5 minute expiry
      await client.setEx(cacheKey, 300, JSON.stringify(post));
    }
    
    await client.disconnect();
    res.json({ post, cached: false });
  } catch (error) {
    res.json({ post: null, cached: false, error: error.message });
  }
});

server.listen(port, () => {
  console.log(`Cache service with WebSockets running on port ${port}`);
});