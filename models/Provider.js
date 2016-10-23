const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Float = require('mongoose-float').loadType(mongoose);
const geocoder = require('geocoder');
const providerSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  name: { type: String, default: null },
  phoneNumber: { type: String, default: null },
  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  tokens: Array,
  gpsLocation: {
    latitude: { type: Float, default: 0 },
    longitude: { type: Float, default: 0 }
  },
  address: {
    line1: { type: String, default: null },
    line2: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    zip: { type: Number, default: 00000 }
  },
  acceptedClients: {
    men: { type: Boolean, default: false },
    women: { type: Boolean, default: false },
    children: { type: Boolean, default: false },
    veteran: { type: Boolean, default: false },
    handicap: { type: Boolean, default: false }
  },
  totalBeds: { type: Number, default: 0 },
  occupiedBeds: { type: Number, default: 0 },
  intakeStart: { type: Number, default: 0 },
  intakeEnd: { type: Number, default: 0 },
  description: { type: String, default: null }
}, { timestamps: true });


// providerSchema.methods.increment = function(){
//   // get from db Total beds do not exceed this value
//   this.occupiedBeds += 1;
//   this.save();
// }

// providerSchema.methods.decrement = function(){
//   // don't be less than zero beds ocupado
//   this.occupiedBeds -= 1;
//   this.save();
// }

// providerSchema.methods.setBase = function(occupiedBeds){
//   this.occupiedBeds = occupiedBeds;
//   this.save();
// }

/**
 * Password hash middleware.
 */
providerSchema.pre('save', function (next) {
  const provider = this;
  if (!provider.isModified('password')) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(provider.password, salt, null, (err, hash) => {
      if (err) { return next(err); }
      provider.password = hash;
      next();
    });
  });
});

providerSchema.pre('save', function(next) {
  var doc = this;
  var address = this.address.line1+" "+this.address.city+", "+this.address.state+", "+this.address.zip;
  geocoder.geocode({address: address}, function ( err, data ) {
    if(data && data.status == 'OK'){
      doc.gpsLocation.latitude = data.results[0].geometry.location.lat;
      doc.gpsLocation.longitude = data.results[0].geometry.location.lng;
    }
    next();
  });
});
/**
 * Helper method for validating provider's password.
 */
providerSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

/**
 * Helper method for getting provider's gravatar.
 */
/*providerSchema.methods.gravatar = function (size = 200) {
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};*/

const Provider = mongoose.model('Provider', providerSchema);

module.exports = Provider;
