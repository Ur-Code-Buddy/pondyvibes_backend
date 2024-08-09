import { Hono } from 'hono';
import { z } from 'zod';

const app = new Hono();

const AdminSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const MessageSchema = z.object({
  content: z.string(),
});

// Endpoint to check server status
app.get('/status', (c) => {
  return c.text('Server is up and running', 200);
});

// Endpoint to store admin credentials
app.post('/store_admin', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    const parsedData = AdminSchema.safeParse({ username, password });

    if (!parsedData.success) {
      return c.text('Invalid request body', 400);
    }

    await c.env.USERS_KV.put('username', username); // Store username
    await c.env.USERS_KV.put('password', password); // Store password
    return c.json({
      success: true,
      message: 'Admin credentials stored successfully',
    });
  } catch (error) {
    console.error(error);
    return c.text('Internal server error', 500);
  }
});

// Endpoint to store content
app.post('/store_content', async (c) => {
  try {
    const body = await c.req.json();
    const { content } = body;

    const parsedMessage = MessageSchema.safeParse({ content });

    if (!parsedMessage.success) {
      return c.text('Invalid request body', 400);
    }

    await c.env.CONTENT_KV.put('message', content); // Store content
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
    const username = c.req.headers.get('username');
    const password = c.req.headers.get('password');

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
    return c.text('Internal server error', 500);
  }
});

export default {
  fetch: app.fetch,
};
