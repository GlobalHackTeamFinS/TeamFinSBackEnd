/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
// const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const providerController = require('./controllers/provider');
const apiController = require('./controllers/api');
const contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('connected', () => {
  console.log('%s MongoDB connection established!');
});
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    next();
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  // After successful login, redirect back to the intended page
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Passport authentication options
 */
const expressJwt = require('express-jwt');
const authenticate = expressJwt({secret: process.env.SECRET});

/*const verify = function(requestedId, decodedId){
  if (requestedId == decodedId){
    next(true);
  } else {
    next(new Error("Permission denied."));
  }
}*/

/*const verify = function(token, secret) {
  jwt.verify(token, secret);
}*/

/*app.post('/provider/login', passport.authenticate(
  'local', {
    session: false
  }));
*/

/**
 * Primary app routes.
 */
app.get('/me', authenticate, function(req, res) {
  console.log(req.user);
  res.status(200).json(req.user);
});
/*
app.get('/', homeController.index);
app.get('/add', authenticate, providerController.add);*/

// app.get('/login', userController.getLogin);
// app.post('/login', userController.postLogin);
// app.get('/logout', userController.logout);
// app.get('/forgot', userController.getForgot);
// app.post('/forgot', userController.postForgot);
// app.get('/reset/:token', userController.getReset);
// app.post('/reset/:token', userController.postReset);
// app.get('/signup', userController.getSignup);
// app.post('/signup', userController.postSignup);
// app.get('/contact', contactController.getContact);
// app.post('/contact', contactController.postContact);
// app.get('/account', passportConfig.isAuthenticated, userController.getAccount);
// app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
// app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
// app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
// app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);

/**
 * Provider App Routes
 */

 app.get('/', homeController.index);
 app.get('/dashboard', homeController.dashboard);
 app.post('/provider/new', providerController.newProvider);
 app.put('/provider/:id', authenticate, providerController.updateProvider);
 // app.delete('/provider/:id', providerController.deleteProvider);
 app.post('/provider/login', providerController.login);
 app.post('/provider/logout', providerController.logout);
 app.post('/provider/:id/increment', authenticate, providerController.increment);
 app.post('/provider/:id/decrement', authenticate, providerController.decrement);
 app.post('/provider/:id/setBase', providerController.setBase);


/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
// app.get('/api/scraping', apiController.getScraping);
// app.get('/api/twilio', apiController.getTwilio);
// app.post('/api/twilio', apiController.postTwilio);
// app.get('/api/clockwork', apiController.getClockwork);
// app.post('/api/clockwork', apiController.postClockwork);
// app.get('/api/upload', apiController.getFileUpload);
// app.post('/api/upload', upload.single('myFile'), apiController.postFileUpload);
// app.get('/api/google-maps', apiController.getGoogleMaps);


/*app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect(req.session.returnTo || '/');
});
*/
/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('Express server listening on port %d in %s mode.', app.get('port'), app.get('env'));
});

module.exports = app;
