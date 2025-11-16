const { google } = require('googleapis');

const createEvent = async ({ user, summary, description, start, end }) => {
  try {
    if (!user.googleAccessToken || !user.googleRefreshToken) {
      throw new Error('Missing Google tokens');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary,
      description,
      start: { dateTime: new Date(start).toISOString(), timeZone: 'Asia/Manila' },
      end:   { dateTime: new Date(end).toISOString(), timeZone: 'Asia/Manila' }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    return response.data;
  } catch (err) {
    console.error('Google Calendar sync failed:', err.message);
    return null;
  }
};

module.exports = { createEvent };