const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Provider = require('../models/Provider');
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');

/**
 * Passport authentication via jwt
 */
const db = {
  updateOrCreate: function(user, callback){
    callback(null,user);
  }
};

exports.serialize = function(req, res, next) {
  //call db function for update or create
  db.updateOrCreate(req.user, function (err, user){
    if(err) {return next(err);}
    req.user = {
      id: user.id
    };
    next();
  });
}


exports.generateToken = function(req, res, next){
  req.token = jwt.sign({
    id: req.user.id,
  }, process.env.SECRET),
  { noTimeStamp: true };
  next();
}

exports.respond = function(req, res){
  res.status(200).json({
    user: req.user,
    token: req.token
  });
}

/**
 * POST /provider/:id/increment
 */

 exports.increment = (req, res) => {
  if(verify(req.params.id, req.user.id)){
    Provider.findOneAndUpdate(req.id, { $inc : { occupiedBeds : 1 } } )
      .exec(function(err, db_res) { 
      if (err) { 
        throw err; 
      } 
      else { 
        console.log(db_res); 
        res.send(200);
      } 
    });
    }else{
      res.send(404);
    }
  // const provider = mongoose.model('Provider').findById(req.id, function(err, provider) {
  //   if(err) {
  //     return console.log(err);
  //   } else {
  //     console.log(provider);
  //     provider.increment();
  //   }
  // });
 }

/**
 * POST /provider/:id/decrement
 */

 exports.decrement = (req, res) => {
  Provider.findOneAndUpdate(req.id, { $inc : { occupiedBeds : -1 } } )
    .exec(function(err, db_res) { 
    if (err) { 
      throw err; 
    } 
    else { 
      console.log(db_res); 
      res.send(200);
    }
  }); 
  // const provider = mongoose.model('Provider').findById(req.id, function(err, provider) {
  //   if(err) {
  //     return console.log(err);
  //   } else {
  //     provider.decrement();
  //   }
  // });  
 }

/**
 * POST /provider/:id/setBase
 */

 exports.setBase = (req, res) => {
  console.log(req.body);
  Provider.findOneAndUpdate(req.id, { $set : { occupiedBeds : parseInt(req.body.setBase) } } )
    .exec(function(err, db_res) { 
    if (err) { 
      throw err; 
    } 
    else { 
      console.log(db_res); 
      res.send(200);
    }
  }); 
  // const provider = mongoose.model('Provider').findById(req.id, function(err, provider) {
  //   if(err) {
  //     return console.log(err);
  //   } else {
  //     provider.setBase(req.body.setBase);
  //   }
  // });
 }


/**
 * POST /provider/login
 * Sign in using email and password.
 */
exports.login = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    // req.flash('errors', errors);
    // return res.redirect('/login');
    res.json(errors);
  }

  passport.authenticate('local', { session: false}, (err, provider, info) => {
    if (err) { return next(err); }
    /*if (!provider) {
      // req.flash('errors', info);
      return res.json(401, { "error": info.message});
    }*/
    req.logIn(provider, (err) => {
      if (err) { return next(err); }
    req.token = jwt.sign({
      id: provider._id,
    }, process.env.SECRET),
    { noTimeStamp: true };
    //next();
    req.flash('success', { msg: 'Success! You are logged in.' });
    res.status(200).json({
      provider: req.provider,
      token: req.token
    });
      //res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  // res.redirect('/');
};


/**
 * POST /provider/new
 * Create a new account.
 */
exports.newProvider = (req, res, next) => {
  console.log(req.body);
  req.assert('email', 'Email is not valid').isEmail();
  // req.assert('password', 'Password must be at least 4 characters long').len(4);
  // req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    // req.flash('errors', errors);
    // return res.redirect('/signup');
    return res.json({error : errors })
  }
  const provider = new Provider(req.body);
  Provider.findOne({ email: req.body.email }, (err, existingProvider) => {
    if (err) { return next(err); }
    if (existingProvider) {
      return res.json({error: 'Account with that email address already exists.'});
      // return res.redirect('/signup');
    }
    provider.save((err) => {
      if (err) { return next(err); }
      req.logIn(provider, (err) => {
        if (err) {
          return next(err);
        }
        req.token = jwt.sign({
          id: provider._id,
        }, process.env.SECRET),
        { noTimeStamp: true };
        //next();
        req.flash('success', { msg: 'Success! You are logged in.' });
        res.status(200).json({
          provider: req.provider,
          token: req.token
        });
        // res.redirect('/');
      });
    });
  });
};


/**
 * POST /provider/:id/
 * Update profile information.
 */
exports.updateProvider = (req, res, next) => {
  // req.assert('email', 'Please enter a valid email address.').isEmail();
  // req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    // req.flash('errors', errors);
    // return res.redirect('/signup');
    return res.json({error : errors })
  }

 console.log(req.body)
 console.log(req);
  Provider.where({_id: req.params.id }).update({ $set : req.body }, function(err, provider) {
      if (err) { return next(err); }
      // return res.json(provider);
      res.send(200);
  }); 

  // Provider.findById(req.id, (err, provider) => {
  //   if (err) { return next(err); }

  //   provider.email = req.body.email || '';
  //   provider.profile.name = req.body.name || '';
  //   provider.profile.gender = req.body.gender || '';
  //   provider.profile.location = req.body.location || '';
  //   provider.profile.website = req.body.website || '';
  //   provider.save((err) => {
  //     if (err) {
  //       if (err.code === 11000) {
  //         req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
  //         return res.redirect('/account');
  //       }
  //       return next(err);
  //     }
  //     req.flash('success', { msg: 'Profile information has been updated.' });
  //     res.redirect('/account');
  //   });
  // });
};

/**
 * POST /account/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  Provider.findById(req.provider.id, (err, provider) => {
    if (err) { return next(err); }
    provider.password = req.body.password;
    provider.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};

/**
 * DELETE /provider/:id
 * Delete provider account.
 */
exports.deleteProvider = (req, res, next) => {
  Provider.remove({ _id: req.provider.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  Provider.findById(req.provider.id, (err, provider) => {
    if (err) { return next(err); }
    provider[provider] = undefined;
    provider.tokens = provider.tokens.filter(token => token.kind !== provider);
    provider.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  Provider
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, provider) => {
      if (err) { return next(err); }
      if (!provider) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function (done) {
      Provider
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, provider) => {
          if (err) { return next(err); }
          if (!provider) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          provider.password = req.body.password;
          provider.passwordResetToken = undefined;
          provider.passwordResetExpires = undefined;
          provider.save((err) => {
            if (err) { return next(err); }
            req.logIn(provider, (err) => {
              done(err, provider);
            });
          });
        });
    },
    function (provider, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          provider: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: provider.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${provider.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send provider an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function (done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      Provider.findOne({ email: req.body.email }, (err, provider) => {
        if (err) { return done(err); }
        if (!provider) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
          return res.redirect('/forgot');
        }
        provider.passwordResetToken = token;
        provider.passwordResetExpires = Date.now() + 3600000; // 1 hour
        provider.save((err) => {
          done(err, token, provider);
        });
      });
    },
    function (token, provider, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          provider: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: provider.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: `An e-mail has been sent to ${provider.email} with further instructions.` });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/forgot');
  });
};

const verify = function(requestedId, decodedId){
  if (requestedId == decodedId){
    return true;
  } else {
    return false;
  }
};
/**
//  * GET /login
//  * Login page.
//  */
// exports.getLogin = (req, res) => {
//   if (req.provider) {
//     return res.redirect('/');
//   }
//   res.render('account/login', {
//     title: 'Login'
//   });
// };


/**
 * GET /signup
 * Signup page.
 */
// exports.getSignup = (req, res) => {
//   if (req.provider) {
//     return res.redirect('/');
//   }
//   res.render('account/signup', {
//     title: 'Create Account'
//   });
// };


/**
//  * GET /account
//  * Profile page.
//  */
// exports.getAccount = (req, res) => {
//   res.render('account/profile', {
//     title: 'Account Management'
//   });
// };
