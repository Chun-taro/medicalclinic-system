# Google Calendar API Integration Guide

## Overview
Your Medical System is now fully integrated with Google Calendar API. This allows users to sync appointments with their Google Calendar.

## Setup Steps

### 1. Backend Configuration (Already Done ✅)
- ✅ Added `googleAccessToken` and `googleRefreshToken` to User model
- ✅ Created Google Calendar OAuth callback handler
- ✅ Added OAuth routes for authentication flow
- ✅ Updated `.env` file with `FRONTEND_URL`

### 2. Environment Variables (Verify These)

Your `.env` file should contain:
```dotenv
# Google Calendar OAuth
GOOGLE_CALENDAR_CLIENT_ID=798011207639-12vohgaislseep76rs6uvbku4b8jt7sb.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=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
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback
GOOGLE_CALENDAR_REFRESH_TOKEN=4/0Ab32j90KC7g4-lI0e5dPXGuoTIVKZHrx-Qe-Ep42oyV453y-FO5pNtvU8jBYzQBuiZHsng

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 3. API Endpoints

#### Get OAuth URL
```
GET /api/calendar/oauth/url
Headers: Authorization: Bearer <token>
Response: { "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..." }
```

#### OAuth Callback (Google redirects here)
```
GET /api/calendar/oauth/callback?code=<authorization_code>&state=<userId>
```

#### Get Calendar Events
```
GET /api/calendar/events
Headers: Authorization: Bearer <token>
Response: [ { id, summary, start, end, ... } ]
```

#### Create Calendar Event
```
POST /api/calendar/events
Headers: Authorization: Bearer <token>
Body: { "summary": "...", "description": "...", "start": "...", "end": "..." }
```

### 4. Frontend Implementation

#### Step 1: Request OAuth URL
```javascript
const response = await fetch('/api/calendar/oauth/url', {
  headers: { Authorization: `Bearer ${token}` }
});
const { authUrl } = await response.json();
```

#### Step 2: Redirect User
```javascript
window.location.href = authUrl;
```

#### Step 3: Handle Callback
Create these pages:
- `/pages/OAuthSuccess.jsx` - Handle success redirect
- `/pages/OAuthFailure.jsx` - Handle failure redirect

### 5. Testing the Integration

1. **Start Backend**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Verify Endpoints**
   ```powershell
   # Test getting OAuth URL (requires valid JWT token)
   curl -H "Authorization: Bearer <your_token>" http://localhost:5000/api/calendar/oauth/url
   ```

3. **Create Frontend Pages** (see below)

4. **Test Flow**
   - User clicks "Connect Google Calendar" button
   - App fetches OAuth URL from backend
   - User is redirected to Google login
   - User grants permissions
   - Google redirects to `/api/calendar/oauth/callback`
   - Tokens stored in database
   - User redirected to success page

## Frontend Components to Create

### OAuthSuccess.jsx
```jsx
import { useEffect, useParams } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { userId } = useParams();

  useEffect(() => {
    // Show success message
    alert('Google Calendar connected successfully!');
    // Redirect to dashboard
    navigate('/dashboard');
  }, [navigate]);

  return (
    <div>
      <h1>Connecting your Google Calendar...</h1>
      <p>You will be redirected shortly.</p>
    </div>
  );
}
```

### Calendar Connection Button (Add to component)
```jsx
const connectGoogleCalendar = async () => {
  try {
    const response = await fetch('/api/calendar/oauth/url', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const { authUrl } = await response.json();
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to connect:', error);
  }
};

return (
  <button onClick={connectGoogleCalendar}>
    Connect Google Calendar
  </button>
);
```

## Features Available

### 1. View Calendar Events
- Fetch upcoming appointments from Google Calendar
- Displays events with date/time details

### 2. Create Events
- Automatically sync medical appointments to Google Calendar
- Set reminders and notifications

### 3. Token Management
- Automatically stores access tokens securely
- Refresh tokens for long-term access
- Auto-refresh when tokens expire

## Security Notes

⚠️ **Important:**
- Never commit `.env` file with credentials
- Keep refresh tokens secure
- Use HTTPS in production
- Validate all user inputs
- Clear tokens if user disconnects

## Troubleshooting

### Error: "No Google tokens stored"
**Solution:** User hasn't connected Google Calendar yet. Show OAuth URL button first.

### Error: "Invalid refresh token"
**Solution:** Token may have expired. Redirect user to connect again.

### Error: "Redirect URI mismatch"
**Solution:** Ensure `GOOGLE_CALENDAR_REDIRECT_URI` in `.env` matches exactly what's set in Google Developer Console.

## Next Steps

1. ✅ Backend setup complete
2. ⏳ Create frontend OAuth pages
3. ⏳ Add "Connect Calendar" button to UI
4. ⏳ Test end-to-end flow
5. ⏳ Deploy to production

## Google Developer Console Settings

Your OAuth 2.0 credentials are configured for:
- **Authorized redirect URIs:** `http://localhost:5000/api/calendar/oauth/callback`
- **Scope:** Google Calendar API (read/write)

For production, update to:
- **Authorized redirect URIs:** `https://yourdomain.com/api/calendar/oauth/callback`

