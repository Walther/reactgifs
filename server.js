// node.js -based server

var express = require('express');
var app = express();
var shortid = require('shortid');


// Directory for static files served as-is
app.use(express.static('static'));
app.use(express.static('api'));


// Default root to index page
app.get('/', function (req, res, next) {
    app.get(/static/index.html);
})


// Static file handling
app.get('/static/:name', function (req, res, next) {

  var options = {
    root: __dirname + '/static/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });

})

// API
app.get('/api/:name', function (req, res, next) {

  var options = {
    root: __dirname + '/api/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

  var fileName = req.params.name;
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });

})






app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
})