

var koa = require('koa'),
    app = koa(),
    router = require('koa-router'),

    // view
    stylus = require('koa-stylus'),
    nib = require('nib'),
    serve = require('koa-static'),
    views = require('koa-views'),

    // db
    //mongoose = require('mongoose'),
    mongo = require('./lib/mongoose-models'),

    // Other
    FB = require('fb'),

    // Extend
    compress = require('koa-compress'),
    favicon = require('koa-favicon'),
    etag = require('koa-etag');


// Compress
app.use(compress());
app.use(etag());
app.use(favicon());
// Send static files
function compile(str, path) {
  return require('stylus')(str)
    .set('filename', path)
    .set('compress', false)
    .use(nib());
}
app.use(stylus({
  src: './public',
  compile: compile
}));
app.use(serve('./public'));
// Use jade
app.use(views(__dirname +'/views', 'jade', {}));
// x-response-time
app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
  this.set('X-Powered-By', 'Spathon');
});
// logger
app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// Router
// https://github.com/alexmingoia/koa-router
app.use(router(app));

// This must come after app is all set (app.use())
var server = require('http').Server(app.callback()),
    io = require('socket.io')(server);


/**
 * App and server conf is now set
 */


/**
 * Routes
 */
app.get('/', function *(next) {
  yield this.render('index');
});

app.get('/partial/home', function *(next){
  yield this.render('partials/home');
});

app.get('/partial/play', function *(next){
  yield this.render('partials/play');
});

// API
// app.get('/stats')

// Test
app.get('/moon', function *(next){

  mongo.Guess.aggregate(
    { $match: { responder_user_id: 518241305 } },
    { $group: { _id: "$answer_friend_id", count: { $sum: 1 } } },
    { $sort: { "count": -1 } },
    function (err, res) {
    if (err) console.log('Mongo error: ', err);
    console.log(res); // [ { maxBalance: 98000 } ]
  });
  // http://stackoverflow.com/questions/13073770/mongodb-aggregate-on-subdocument-in-array
  this.body = ':)';
});



/**
 * Socket.io
 */
// http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/
io.on('connection', function(socket){

  // Set the users ID
  var fb_id = false;

  // Set the users id
  socket.on('FB', function (data){

    // https://github.com/Thuzi/facebook-node-sdk/
    FB.setAccessToken(data.authResponse.accessToken);
    FB.api('me', function (response) {

      if(response && !response.error) {
        fb_id = response.id;

        // Count times answerd
        mongo.Guess.count({ responder_user_id: response.id }, function(err, total){

          console.log('Total: ', total);
          // Count number of times answered right
          mongo.Guess.count({ responder_user_id: response.id,  answer_was_correct: true }, function(err, right){
            console.log('Right: ', right);
            socket.emit('guesses', { total: total, right: right });
          });
        });
      }
    });
  });

  // save the guess
  socket.on('guess', function (data){

    if(!fb_id) {
      socket.emit('guess_no_user', { success: 'Darn' });
      return;
    }

    // console.log(data);
    var guess_data = {
      fb_id: fb_id,
      friend_ids: data.friends.map(function(friend){ return friend.id }),
      like_id: data.like.id,
      correct_friend_id: data.friends[data.correct].id,
      answer_friend_id: data.friends[data.answer].id,
      answer_was_correct: (data.answer === data.correct)
    };

    // console.log(guess_data);
    var guess = new mongo.Guess(guess_data);

    guess.save(function (err, product) {
      if (err) console.log('Save error: ', err);
      else console.log('Saved...');
    });
    socket.emit('guess_cb', { success: ':)' });
  });

});




//server.listen(3001);
server.listen(1337);
console.info('Now running on localhost:1337. Let\'s play!');
