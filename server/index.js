require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cloneDeep = require('lodash/cloneDeep');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');

const db = require('./db');
const {
  addProfile,
  getLocations,
  getTitles,
  getProfiles,
  getProfileById,
} = require('./controllers/profileController');
const {
  addEmail,
  updateEmail,
  deleteEmail,
  getEmails,
  sendAdminMessage,
  sendAndyToAndyMessage,
} = require('./controllers/emailController');

const { ensureAccountExists, claimProfile } = require('./controllers/userController');

const app = express();
const PORT = process.env.SERVER_PORT || 5001;

const allowedOrigins = [
  'http://localhost:3003', // Client running on port 3003
  'http://localhost:5001', // Allow server origin for testing
  'https://andy.ootao.io',
  'https://www.andydale.me',
  'https://andydale.me',
  'http://www.andydale.me',
  'http://andydale.me',
  'http://54.205.87.18',
];

// CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`Origin ${origin} not allowed by CORS`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

// Express middleware
app.use(express.json());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL: process.env.AUTH0_CALLBACK_URL, // Server's callback URL
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
      return done(null, profile);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  try {
    if (!user || !user.emails || !user.emails[0]) {
      console.error('Invalid user object during deserialization');
      return done(null, null); // No email in user object
    }

    const email = user.emails[0].value; // Auth0 email
    //console.log("auth0 email - " + email);

    // Fetch the account from the database
    const [result] = await db.query(
      'SELECT account_id, username, verified, profile_id FROM accounts WHERE username = ?',
      [email]
    );

    if (result) {
      const account = result; // Explicitly use the first result object
      console.log("account: " + JSON.stringify(account));

      const deserializedUser = {
        displayName: user.displayName || user.name || user.nickname,
        email: email,
        picture: user.picture || '/default-avatar.png', // Default picture
      };

      if (account.length>0 )
      {
        
        deserializedUser.id= account[0].account_id;
        deserializedUser.profile_id= account[0].profile_id;
        deserializedUser.username= account[0].username;
        deserializedUser.verified= account[0].verified === 1; // Convert verified field to boolean
      }

     // console.log("Deserialized User:", deserializedUser);
      done(null, deserializedUser);
    } else {
      console.error('No account found for email:', email);
      done(null, null); // No matching account in the database
    }
  } catch (err) {
    console.error('Error deserializing user:', err);
    done(err);
  }
});

// Auth routes

  app.get('/auth/login', (req, res) => {
    const returnTo = process.env.DEFAULT_RETURN+req.query.returnTo || process.env.DEFAULT_RETURN || '/';
    //console.log('Setting returnTo:', returnTo);
  
    req.session.returnTo = returnTo;
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
      } else {
        //console.log('Session after saving:', req.session);
      }
      passport.authenticate('auth0', { scope: 'openid email profile' })(req, res);
    });
  });

  app.get('/auth/callback', (req, res, next) => {
   // console.log('Session at callback:', req.session);
    const _returnTo = cloneDeep(req.session.returnTo);
   // console.log('Session.returnTo at callback:', _returnTo);
  
    
    passport.authenticate('auth0', (err, user) => {
      if (err) return next(err);
      if (!user) return res.redirect('/auth/login');
  
      req.logIn(user, (err) => {
        if (err) return next(err);
  
        // Retrieve and log the `returnTo` value
        const returnTo = _returnTo || process.env.DEFAULT_RETURN || '/';
        //console.log('Redirecting to:', _returnTo);
  
        // Clear `returnTo` from the session after retrieving it
        delete req.session.returnTo;
  
        // Ensure `returnTo` is a valid URL
        if (!_returnTo.startsWith('http://') && !_returnTo.startsWith('https://')) {
          //console.log("REDIRECTING to / ");
          return res.redirect('/');
        }
  
        // Redirect to the original page
        res.redirect(_returnTo);
      });
    })(req, res, next);
  });



app.post('/auth/logout', (req, res) => {
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Failed to destroy session:', err);
      return res.status(500).send('Failed to log out');
    }
    const returnTo = process.env.AUTH0_LOGOUT_REDIRECT_URL || 'http://localhost:3003';
    const logoutUrl = `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(returnTo)}&federated`;
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect(logoutUrl);
  });
});

app.get('/api/user', (req, res) => {
 // console.log('Request User:', req.user); // Debug logging
  if (req.user) {
    res.json({
      user: req.user,
      verified: req.user.verified || false, // Include verified status
    });
  } else {
    console.error('No user found in request.');
    res.status(401).json({ error: 'User not authenticated' });
  }
});

// API routes
// Add this route to handle account creation
app.post('/api/ensure-account', ensureAccountExists);
app.post('/api/claimProfile', claimProfile);


app.post('/api/sendAdminMessage', sendAdminMessage);
app.post('/api/sendAndyToAndyMessage', sendAndyToAndyMessage);
app.post('/api/add-profile', addProfile);
app.get('/api/locations', getLocations);
app.get('/api/titles', getTitles);
app.get('/api/profiles', getProfiles);
app.post('/api/add-email', addEmail);
app.post('/api/addEmail', addEmail);
app.post('/api/update-email', updateEmail);
app.post('/api/delete-email', deleteEmail);
app.post('/api/get-profile', getProfileById);
app.post('/api/get-emails', getEmails);






// Test database route
app.get('/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) throw err;
    res.send(`Database Test: 1 + 1 = ${results[0].solution}`);
  });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 