/**
 *   PROBLEMS TO BE ADDRESSED for production:
 *   1. UrlID = tempoary using email
 *   2. CSRF tokens in url for postregister, postaccount for uploading
 *   3. Error Handling
 * 
 */

const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const fs = require('fs');

const randomstring = require('randomstring');
const randomBytesAsync = promisify(crypto.randomBytes);

const { Storage } = require('@google-cloud/storage');
var storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_STORAGE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_STORAGE_KEYFILE_NAME
});
var myBucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

//TODO: edit redirect address when login failed
exports.postLogin = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    // TODO: redirect to re login page
    return res.redirect('/');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      //req.flash('success', { msg: 'Success! You are logged in.' });
      res.redirect('/home');
    });
  })(req, res, next);
};


exports.logout = (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) console.log('Error : Failed to destroy the session during logout.', err);
    req.user = null;
    res.redirect('/');
  });
};


/**
 * GET /signup
 * Signup page.
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account'
  });
};
*/


//TODO: 
// 1. node mailer -> do verification step
// 2. Add a default random profile image for the user
exports.postSignup = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 8 characters long').len(8);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/');
  }
  const secretToken = randomstring.generate();
  var confirmurl = process.env.BASE_URL+'/verifyemail?token='+secretToken;
  const user = new User({
    email: req.body.email.replace(/\s/g, ''),
    password: req.body.password,
    emailVerifyToken: secretToken,
    emailVerified: false
  });

  user.profile.picture = 'http://cameronmcefee.com/img/work/the-octocat/codercat.jpg';

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }

    //TODO: send email with verification code
    user.save((err) => {
      if (err) { return next(err); }

        //TODO: redirect to verify email page
        //1. Send email 
        //2. User clicks on verify email link 
        //3. activiate user in database
        //4. Direct user to "successful verify, please log in" page
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          res.redirect('/register');
        });
    });
  });
};

exports.getRegister = (req, res) => {
  res.render('account/register', {
    title: 'Register'
  });
}


var getPublicUrl = file_name => {
  return `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/${file_name}`
}

function uploadImgToGcloud(file){
  var localReadStream = fs.createReadStream(file.path);
  const gcsname = Date.now() + file.originalname;
  var image = myBucket.file(gcsname);
  localReadStream.pipe(image.createWriteStream({
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          custom: 'metadata'
        }
      }
  })).on('error', function(err) {throw err;})
  .on('finish', function() {
    myBucket.file(gcsname).makePublic().then(() =>{
      console.log('upload to gcloud success!', getPublicUrl(gcsname));
      return getPublicUrl(gcsname);
    });
  });
}

exports.postProfilePicture = (req, res)=>{
  const file = req.file;
  User.findById(req.user.id, (err, user)=>{
    if(file){ //upload pfp to gcloud
        var localReadStream = fs.createReadStream(file.path);
      const gcsname = Date.now() + file.originalname;
      var image = myBucket.file(gcsname);
      localReadStream.pipe(image.createWriteStream({
          metadata: {
            contentType: 'image/jpeg',
            metadata: {
              custom: 'metadata'
            }
          }
      })).on('error', function(err) {
        console.log(err);
        //still save the user
        user.save((err)=>{
          if(err){return next(err);}
          //TODO: Inform the user pfp is not saved but other information is saved
          req.flash('errors', {msg: 'An error has occured with the server. Your profile image was not saved, but your other information has been saved.'});
          res.redirect('/home');
        })
      })
      .on('finish', function() {
          myBucket.file(gcsname).makePublic().then(() =>{
            console.log('upload to gcloud success!', getPublicUrl(gcsname));
            user.profile.picture = getPublicUrl(gcsname);
            //async function to upload so must require a save function after
            user.save((err)=>{
              if(err){
                console.log("error!");
                if (err.code === 11000) {
                  req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
                  return res.redirect('/account');
                }
                return next(err);
              }
              req.flash('success', { msg: 'Profile information has been updated.' });
              res.redirect('/home')
            });
          });
      });
    }
  });
};



exports.postRegister = (req, res) => {
  User.findById(req.user.id, (err, user)=>{
    if (err){return next(err);}
    
    user.profile.gender=req.body.gender || '';
    if(req.body.gender == 'female'){
      user.profile.picture = 'https://i.pinimg.com/originals/9d/4d/31/9d4d314ec7722d05541111a180e4e54b.png';
    }

    user.profile.school=req.body.school || '';
    user.profile.major=req.body.major ||'';
    user.profile.graduationYear=req.body.gradYear || '';
    user.profile.educationLevel=req.body.eduLevel || '';
    user.numOfHackathons = req.body.numOfHackathons || -1;

    //--------------------preferences---------------------------

    interests = req.body.interests;
    if(interests){ //verfiy if user choose anything
      if(interests instanceof Array){
        for(i=0;i<interests.length;i++){
          var temp = [interests[i], 5];
          interests[i]=temp
        }
      }else{  //user only chose one element for the option
        var temp = [interests, 5];
        interests = [temp];
      }
    }
    user.preferences.interests=interests || [];

    languages = req.body.languages;
    if(languages){
      if (languages instanceof Array){
        for(i=0;i<languages.length;i++){
          var temp = [languages[i], 5];
          languages[i]=temp
        }
      }else{
        var temp=[languages,5];
        languages = [temp];
      }
    }
    user.preferences.languages=languages || [];
    
    technologies = req.body.technologies;
    if(technologies){
      if (technologies instanceof Array){
        for(i=0;i<technologies.length;i++){
          var temp = [technologies[i], 5];
          technologies[i]=temp
        }
      }else{
        var temp=[technologies,5];
        technologies=[temp];
      }
    }
    user.preferences.technologies=technologies || [];
    
    fields = req.body.fields;
    if(fields){
      if (fields instanceof Array){
        for(i=0;i<fields.length;i++){
          var temp = [fields[i], 5];
          fields[i]=temp
        }
      }else{
        var temp=[fields,5];
        fields=[temp];
      }
    }
    user.preferences.fields=fields || [];

    //-----------------------------social media-------------------------------
    user.socialmedia.facebook = req.body.facebook || '';
    user.socialmedia.phone = req.body.phone || '';
    user.socialmedia.website = req.body.website || '';
    user.socialmedia.devpost = req.body.devpost || '';
    user.socialmedia.instagram = req.body.instagram || '';
    user.socialmedia.linkedin = req.body.linkedin || '';
    user.socialmedia.github = req.body.github || '';
    //---------upload profile to gcloud-----------
    const file = req.file;
    if(file){ //upload pfp to gcloud
      var localReadStream = fs.createReadStream(file.path);
      const gcsname = Date.now() + file.originalname;
      var image = myBucket.file(gcsname);
      localReadStream.pipe(image.createWriteStream({
          metadata: {
            contentType: 'image/jpeg',
            metadata: {
              custom: 'metadata'
            }
          }
      })).on('error', function(err) {
        console.log(err);
        //still save the user
        user.save((err)=>{
          if(err){return next(err);}
          //TODO: Inform the user pfp is not saved but other information is saved
          req.flash('errors', {msg: 'An error has occured with the server. Your profile image was not saved, but your other information has been saved.'});
          res.redirect('/home');
        })
      })
      .on('finish', function() {
          myBucket.file(gcsname).makePublic().then(() =>{
            console.log('upload to gcloud success!', getPublicUrl(gcsname));
            user.profile.picture = getPublicUrl(gcsname);
            //async function to upload so must require a save function after
            user.save((err)=>{
              if(err){
                console.log("error!");
                if (err.code === 11000) {
                  req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
                  return res.redirect('/account');
                }
                return next(err);
              }
              req.flash('success', { msg: 'Profile information has been updated.' });
              res.redirect('/home')
            });
          });
        });
    }else{  //no profile picture chosen, just save user
      user.save((err)=>{
        if(err){
          console.log("error!");
          if (err.code === 11000) {
            req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
            return res.redirect('/account');
          }
          return next(err);
        }
        req.flash('success', { msg: 'Profile information has been updated.' });
        res.redirect('/home')
      });
    }

  });
};

exports.getAccount = (req, res) => {
  if(req.user){
    res.render('account/dashboard', {
      title: 'Account Management', user:req.user
    });
  }
};


exports.postUpdateDashboard = (req, res, next) => {
  console.log(req.body);
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
      //update about
      user.profile.gender = req.body.gender || user.profile.gender;
      user.profile.school = req.body.school || user.profile.school;
      user.profile.major = req.body.major || user.profile.major;
      user.profile.graduationYear = req.body.gradYear || user.profile.graduationYear;
      user.profile.educationLevel = req.body.eduLevel || user.profile.educationLevel;

      //social media
      user.socialmedia.facebook = req.body.facebook || user.socialmedia.facebook ;
      user.socialmedia.phone = req.body.phone || user.socialmedia.phone;
      user.socialmedia.website = req.body.website || user.socialmedia.website;
      user.socialmedia.devpost = req.body.devpost || user.socialmedia.devpost;
      user.socialmedia.instagram = req.body.instagram || user.socialmedia.instagram;
      user.socialmedia.linkedin = req.body.linkedin || user.socialmedia.linkedin;
      user.socialmedia.github = req.body.github || user.socialmedia.github;

      //update preferences
      var updates = req.body;
      const preferences = extractPreferencesArray();
      const mapping = ["interests", "languages", "technologies", "fields"];
      var updatedresults = [[],[],[],[]];
      for (var key in updates){
      if(updates.hasOwnProperty(key)){ //looping through req.body
        //if it's a similiarity score
        if(key == "similiarinterersts"){
          user.careScores.interests = updates[key];
        }else if(key == "similiarlanguages"){
          user.careScores.languages = updates[key];
        }else if(key == "similiartechnologies"){
          user.careScores.technologies = updates[key];
        }else if(key == "similiarfields"){
          user.careScores.fields = updates[key];
        }else{
          //check which category 
          for(j = 0; j < preferences.length; j++){
            if(preferences[j].includes(key)){
              var containedPref = user['preferences'][mapping[j]];
              var temp = [];
              temp.push(key);
              temp.push(parseInt(updates[key]));
              updatedresults[j].push(temp);
            }
          }
        }
      }
    }
    user.preferences.interests = updatedresults[0];
    user.preferences.languages = updatedresults[1];
    user.preferences.technologies = updatedresults[2];
    user.preferences.fields = updatedresults[3];
    user.save((err)=>{
      if(err){throw err;}
      req.flash('success', { msg: 'Profile information has been updated.' });
      res.redirect('/home');
    });
  });
};


exports.getPreferences = (req, res) => {
  res.render('account/preferences', {
    title: 'Preferences', user: req.user
  })
};


function extractPreferencesArray(){
  const allInterests = require('../public/assets/interests.json');
  const allLanguages = require('../public/assets/languages.json');
  const allTechnologies = require('../public/assets/technologies.json');
  const allFields = require('../public/assets/fields.json');
  var interests = [];
  var languages = [];
  var technologies = [];
  var fields = [];
  for(i = 0; i < allInterests.length; i++){
    interests.push(allInterests[i]['name']);
  }
  for(i = 0; i < allLanguages.length; i++){
    languages.push(allLanguages[i]['name']);
  }
  for(i = 0; i < allTechnologies.length; i++){
    technologies.push(allTechnologies[i]['name']);
  }
  for(i = 0; i < allFields.length; i++){
    fields.push(allFields[i]['name']);
  }
  var arr = [];
  arr.push(interests);
  arr.push(languages);
  arr.push(technologies);
  arr.push(fields);
  return arr;
}

exports.postPreferences = (req, res) => {
  const preferences = extractPreferencesArray();
  const mapping = ["interests", "languages", "technologies", "fields"];
  var updatedresults = [[],[],[],[]];
  
  var updates = req.body;
  User.findById(req.user.id, (err,user)=>{
    for (var key in updates){
      if(updates.hasOwnProperty(key)){ //looping through req.body
        //if it's a similiarity score
        if(key == "similiarinterersts"){
          user.careScores.interests = updates[key];
        }else if(key == "similiarlanguages"){
          user.careScores.languages = updates[key];
        }else if(key == "similiartechnologies"){
          user.careScores.technologies = updates[key];
        }else if(key == "similiarfields"){
          user.careScores.fields = updates[key];
        }else{
          //check which category 
          for(j = 0; j < preferences.length; j++){
            if(preferences[j].includes(key)){
              var containedPref = user['preferences'][mapping[j]];
              var temp = [];
              temp.push(key);
              temp.push(parseInt(updates[key]));
              console.log(temp);
              updatedresults[j].push(temp);
            }
          }
        }
      }
    }
    console.log('updatedresults:');
    console.log(updatedresults);
    user.preferences.interests = updatedresults[0];
    user.preferences.languages = updatedresults[1];
    user.preferences.technologies = updatedresults[2];
    user.preferences.fields = updatedresults[3];
    user.save((err)=>{
      if(err){throw err;}
      console.log('saved success!');
      console.log(user.preferences);
      res.redirect('/home');
    });
    
  });
  
};



exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/account');
    });
  });
};


exports.postDeleteAccount = (req, res, next) => {
  User.deleteOne({ _id: req.user.id }, (err) => {
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
  const { provider } = req.params;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
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
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
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

  const resetPassword = () =>
    User
      .findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires').gt(Date.now())
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
          return res.redirect('back');
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        return user.save().then(() => new Promise((resolve, reject) => {
          req.logIn(user, (err) => {
            if (err) { return reject(err); }
            resolve(user);
          });
        }));
      });

  const sendResetPasswordEmail = (user) => {
    if (!user) { return; }
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'hackathon@starter.com',
      subject: 'Your Hackathon Starter password has been changed',
      text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
      })
      .catch((err) => {
        if (err.message === 'self signed certificate in certificate chain') {
          console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
          transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: process.env.SENDGRID_USER,
              pass: process.env.SENDGRID_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          return transporter.sendMail(mailOptions)
            .then(() => {
              req.flash('success', { msg: 'Success! Your password has been changed.' });
            });
        }
        console.log('ERROR: Could not send password reset confirmation email after security downgrade.\n', err);
        req.flash('warning', { msg: 'Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly.' });
        return err;
      });
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => { if (!res.finished) res.redirect('/'); })
    .catch(err => next(err));
};

exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  const createRandomToken = randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User
      .findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
        } else {
          user.passwordResetToken = token;
          user.passwordResetExpires = Date.now() + 3600000; // 1 hour
          user = user.save();
        }
        return user;
      });

  const sendForgotPasswordEmail = (user) => {
    if (!user) { return; }
    const token = user.passwordResetToken;
    let transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'hackathon@starter.com',
      subject: 'Reset your password on Hackathon Starter',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };
    return transporter.sendMail(mailOptions)
      .then(() => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
      })
      .catch((err) => {
        if (err.message === 'self signed certificate in certificate chain') {
          console.log('WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.');
          transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: process.env.SENDGRID_USER,
              pass: process.env.SENDGRID_PASSWORD
            },
            tls: {
              rejectUnauthorized: false
            }
          });
          return transporter.sendMail(mailOptions)
            .then(() => {
              req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
            });
        }
        console.log('ERROR: Could not send forgot password email after security downgrade.\n', err);
        req.flash('errors', { msg: 'Error sending the password reset message. Please try again shortly.' });
        return err;
      });
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/forgot'))
    .catch(next);
};


exports.getUser = (req, res) => {
  console.log(req.params);
  console.log(req.params.id);
  if(req.user && req.params.id == req.user.email){
    res.render('account/dashboard',{
      title:'Account Management', Profile: req.user
    })
  }else{
    User.findOne({"email": req.params.id}, (err, user) => {
      if(err){throw err;}
      res.render('account/profile', {
        title: 'Account Management', Profile:user
      });
    });
  }
};
