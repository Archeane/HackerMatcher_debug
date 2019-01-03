const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  emailVerified: Boolean,
  emailVerifyToken: String,
  
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  socialmedia:{
    facebook: String,
    twitter: String,
    google: String,
    github: String,
    instagram: String,
    linkedin: String,
    website: String,
    tokens: Array,
    phone: String,
    devpost: String,
  },

  profile: {
    major: String,
    firstName: String,
    lastName: String,
    name: String,
    gender: String,
    school: String,
    
    graduationYear: String,
    educationLevel: String,
    about: String,
    picture: String
  },
  preferences: {
    interests: Array,
    languages: Array,
    fields: Array,
    technologies: Array,
    hobbies: Array,
  },
  careScores: {
    interests: Number,
    languages: Number,
    fields: Number,
    technologies: Number,
  },
  numOfHackathons: Number,
  hackathons: Array
}, 

{ timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
