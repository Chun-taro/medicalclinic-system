const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value?.toLowerCase();
    const firstName = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'Google';
    const lastName = profile.name?.familyName || profile.displayName?.split(' ')[1] || 'User';

    let user = await User.findOne({ googleId });

    if (user) {
      console.log(`✅ Found user by Google ID: ${email}, role: ${user.role}`);
    }

    if (!user && email) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        await user.save();
        console.log(`🔗 Linked Google ID to existing user: ${email}, role: ${user.role}`);
      }
    }

    if (!user) {
      user = await User.create({
        googleId,
        email,
        firstName,
        lastName,
        password: 'google-oauth',
        role: 'patient'
      });
      console.log(`🆕 Created new user: ${email}, role: ${user.role}`);
    }

    return done(null, user);
  } catch (err) {
    console.error('Google OAuth error:', err.message);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});