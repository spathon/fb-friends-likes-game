
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/guess');


module.exports = {
  Guess: mongoose.model('Guess', {
    //id: Number,
    fb_id: Number, // The user
    friend_ids: [], // the friends in the guess
    like_id: Number, //
    correct_friend_id: Number,
    answer_friend_id: Number,
    answer_was_correct: Boolean
  })
};
