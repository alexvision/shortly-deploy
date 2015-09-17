var mongoose = require('mongoose');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var db = mongoose.connection;
var Schema = mongoose.Schema;

db.on('error', console.error.bind(console, 'connection error:'));

var userSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: Date,
  updated_at: Date
});

var urlSchema = new Schema({
  url: { type: String, required: true, unique: true },
  base_url: String,
  code: String,
  title: String,
  visits: Number
});

urlSchema.pre('save', function(next){
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  next();
});

userSchema.pre('save', function(next){
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
  .then(function(hash) {
    this.password = hash;
    next();
  }.bind(this));
});

var User = mongoose.model('User', userSchema);

var Url = mongoose.model('Url', urlSchema);

mongoose.connect('mongodb://localhost/shortly');

module.exports.User = User;
module.exports.Url = Url;
