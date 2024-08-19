import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';

const app = new Hono();

// Apply CORS middleware globally
app.use('*', cors({
  origin: '*', // Replace '*' with a specific origin if needed
  methods: ['GET', 'POST', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization'],
}));

const AdminSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const MessageSchema = z.object({
  content: z.string(),
});

// Endpoint to check server status
app.get('/status', (c) => {
  console.log(" here from status endpoint");
  return c.text('Server is up and running', 200);
});

app.get('/', (c) => {
  return c.text('This is the backend for pondyvibes', 200);
});

// Endpoint to store content
app.post('/store_content', async (c) => {
  try {
    // Retrieve username and password from headers
    const username = c.req.header('username');
    const password = c.req.header('password');

    // Check for missing username or password
    if (!username || !password) {
      return c.text('Missing username or password', 400);
    }

    // Retrieve stored admin credentials from KV
    const storedUsername = await c.env.USERS_KV.get('username');
    const storedPassword = await c.env.USERS_KV.get('password');

    // Check if the provided credentials match the stored credentials
    if (username !== storedUsername || password !== storedPassword) {
      return c.text('Invalid username or password', 403);
    }

    // Parse and validate content from the request body
    const body = await c.req.json();
    const { content } = body;

    const parsedMessage = MessageSchema.safeParse({ content });

    if (!parsedMessage.success) {
      return c.text('Invalid request body', 400);
    }

    // Store content in KV namespace
    await c.env.CONTENT_KV.put('message', content);

    return c.json({
      success: true,
      message: 'Content stored successfully',
    });
  } catch (error) {
    console.error(error);
    return c.text('Internal server error', 500);
  }
});

// Endpoint to get content
app.get('/get_content', async (c) => {
  try {
    const content = await c.env.CONTENT_KV.get('message');

    if (!content) {
      return c.json({
        success: false,
        message: 'No content found',
      });
    }

    return c.json({
      success: true,
      content: content,
    });
  } catch (error) {
    console.error(error);
    return c.text('Internal server error', 500);
  }
});

// Endpoint to login and verify admin credentials
app.get('/login', async (c) => {
  try {
    const username = c.req.header('username');
    const password = c.req.header('password');
    // console.log(username,password);

    if (!username || !password) {
      return c.text('Missing username or password', 400);
    }

    const storedUsername = await c.env.USERS_KV.get('username');
    const storedPassword = await c.env.USERS_KV.get('password');

    if (username === storedUsername && password === storedPassword) {
      return c.json({
        success: true,
        message: 'Login successful',
      });
    } else {
      return c.json({
        success: false,
        message: 'Invalid username or password',
      });
    }
  } catch (error) {
    console.error(error);
    return c.text(error, 500);
  }
});

export default {
  fetch: app.fetch,
};
