

var koa = require('koa'),
    app = koa(),
    router = require('koa-router'),
    stylus = require('koa-stylus'),
    nib = require('nib'),
    serve = require('koa-static'),
    views = require('koa-views'),
    mongoose = require('mongoose'),
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

// Connect to db
mongoose.connect('mongodb://localhost/guess');


// Router
// https://github.com/alexmingoia/koa-router
app.use(router(app));


app.get('/', function *(next) {
  yield this.render('index', { my: 'data' });
});

app.get('/partial/home', function *(next){
  yield this.render('partials/home', { my: 'data' });
});

app.get('/partial/play', function *(next){
  yield this.render('partials/play', { my: 'data' });
});




app.listen(3001);
app.listen(1337);
console.info('Now running on localhost:3000 and 1337 the last is just because I can.');
