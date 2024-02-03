const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  phoneNumber: String,
  email: String,
  password: String,
  image:{type: String, required: true}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
