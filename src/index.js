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
    const body = await c.req.json();
    const dateFrom = new Date(body.dateFrom);
    const dateTo = new Date(body.dateTo);

    // Function to format the date
    const formatDate = (date) => date.toISOString().split('T')[0];

    // Function to format the time in IST
    const formatTime = (date) => {
      // Convert UTC time to IST
      const offset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const istDate = new Date(date.getTime() + offset);

      // Format the time
      const hours = String(istDate.getHours()).padStart(2, '0');
      const minutes = String(istDate.getMinutes()).padStart(2, '0');
      const seconds = String(istDate.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds} IST`;
    };

    // Build the HTML message with custom styling
    const message = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            color: #333;
            line-height: 1.6;
            background-color: #f3f4f6;
            padding: 40px;
          }
          .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #e0e0e0;
          }
          h1 {
            color: #2a9d8f;
            font-size: 28px;
            margin-bottom: 30px;
            text-align: center;
            border-bottom: 2px solid #2a9d8f;
            padding-bottom: 10px;
          }
          .detail-group {
            margin: 20px 0;
          }
          .detail-group p {
            margin: 10px 0;
            font-size: 16px;
          }
          .highlight {
            background-color: #f0fdf4;
            padding: 10px;
            border-radius: 8px;
            font-weight: bold;
          }
          .emphasize {
            color: #264653;
            font-weight: bold;
            font-size: 18px;
          }
          .small-note {
            font-size: 14px;
            color: #555;
            margin-top: 10px;
            border-left: 4px solid #2a9d8f;
            padding-left: 10px;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #888;
            text-align: center;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Booking Request</h1>
          <div class="detail-group">
            <p><strong>First Name:</strong> ${body.firstName}</p>
            <p><strong>Last Name:</strong> ${body.lastName}</p>
          </div>
          <div class="detail-group highlight">
            <p><strong>Email Address:</strong> ${body.email}</p>
            <p><strong>Phone Number:</strong> ${body.phone}</p>
          </div>
          <div class="detail-group">
            <p><span class="emphasize">Booking Time:</span> ${formatTime(dateFrom)}</p>
            <p><span class="emphasize">Date of Stay (From):</span> ${formatDate(dateFrom)}</p>
            <p><span class="emphasize">Date of Stay (To):</span> ${formatDate(dateTo)}</p>
          </div>
          <div class="detail-group">
            <p><strong>Number of Persons:</strong> ${body.numPersons}</p>
            <p><strong>Number of Rooms:</strong> ${body.numRooms}</p>
            <p><strong>Room Type:</strong> ${body.roomType}</p>
          </div>
          <div class="small-note">
            <p>Additional Information / Special Requests:</p>
            <p>${body.info}</p>
          </div>
        </div>
        <div class="footer">
          <p>This email was generated automatically. Please do not reply.</p>
        </div>
      </body>
    </html>
  `;
  




    // Initialize Resend
    const resend = new Resend('re_jhHk6Ar7_DxmMo34uAt1z2avpqbFzx6YJ');

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Customer Info <info@baivabprojects.site>',
      to: ['05baivab@gmail.com'],
      subject: 'Hello from PondyVibes',
      html: message,
    });

    // Handle errors if any
    if (error) {
      console.error({ error });
      return c.json({
        success: false,
        message: 'Failed to send email',
        error: error.message,
      });
    }

    // Success response
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
