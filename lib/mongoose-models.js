
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/guess');


module.exports = {
  Guessing: mongoose.model('Guessing', { name: String, result: Boolean })
};
