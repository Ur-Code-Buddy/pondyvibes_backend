import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { Resend } from 'resend';


const app = new Hono();

// Apply CORS middleware globally
app.use('*', cors({
  origin: '*',
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
  console.log("here from status endpoint");
  return c.text('Server is up and running', 200);
});

app.get('/', (c) => {
  return c.text('This is the backend for pondyvibes', 200);
});



app.post('/store_content', async (c) => {
  try {
    const username = c.req.header('username');
    const password = c.req.header('password');

    if (!username || !password) {
      return c.text('Missing username or password', 400);
    }

    const storedUsername = await c.env.USERS_KV.get('username');
    const storedPassword = await c.env.USERS_KV.get('password');

    if (username !== storedUsername || password !== storedPassword) {
      return c.text('Invalid username or password', 403);
    }

    const body = await c.req.json();
    const { content } = body;

    const parsedMessage = MessageSchema.safeParse({ content });

    if (!parsedMessage.success) {
      return c.text('Invalid request body', 400);
    }

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

app.post('/send_message', async (c) => {
  try {
    const resend = new Resend('re_jhHk6Ar7_DxmMo34uAt1z2avpqbFzx6YJ');

    // Get the body data from the request
    const body = await c.req.json();

    // Extract the form data from the body
    const { firstName, lastName, email, phone, dateFrom, dateTo, numPersons, numRooms, roomType, info } = body;

    // Construct the HTML message with inline CSS for styling
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h1 style="color: #333; text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Booking Request</h1>
        <p style="font-size: 16px; color: #555;"><strong>First Name:</strong> ${firstName}</p>
        <p style="font-size: 16px; color: #555;"><strong>Last Name:</strong> ${lastName}</p>
        <p style="font-size: 16px; color: #555;"><strong>Email Address:</strong> ${email}</p>
        <p style="font-size: 16px; color: #555;"><strong>Phone Number:</strong> ${phone}</p>
        <p style="font-size: 16px; color: #555;"><strong>Date of Stay (From):</strong> ${dateFrom}</p>
        <p style="font-size: 16px; color: #555;"><strong>Date of Stay (To):</strong> ${dateTo}</p>
        <p style="font-size: 16px; color: #555;"><strong>Number of Persons:</strong> ${numPersons}</p>
        <p style="font-size: 16px; color: #555;"><strong>Number of Rooms:</strong> ${numRooms}</p>
        <p style="font-size: 16px; color: #555;"><strong>Room Type:</strong> ${roomType}</p>
        <p style="font-size: 16px; color: #555;"><strong>Additional Information / Special Requests:</strong> ${info}</p>
        <hr style="border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 14px; color: #777; text-align: center;">Thank you for your request. We will get back to you shortly.</p>
      </div>
    `;

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Customer Info <info@baivabprojects.site>', // Set the sender email address
      to: ['05baivab@gmail.com'], // Set the recipient email address
      subject: 'New Booking Request from PondyVibes',
      html: message, // Use the constructed and styled message
    });

    if (error) {
      console.error({ error });
      return c.json({
        success: false,
        message: 'Failed to send email',
        error: error.message,
      });
    }

    return c.json({
      success: true,
      message: 'Email sent successfully',
      data: data,
    });
  } catch (error) {
    console.error(error);
    return c.text('Internal server error', 500);
  }
});



export default {
  fetch: app.fetch,
};
