// ReactGIFs server

// imports
var express    = require('express');
var bodyParser = require('body-parser');
var shortid    = require('shortid');
var multiparty = require('multiparty');
var fs         = require('fs');
var jwt        = require('express-jwt');
var dotenv     = require('dotenv');

// inits
var app        = express();
dotenv.load();
var auth       = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});

// settings
app.use(express.static('.'));
app.use( bodyParser.json() );
var TMPDIR  = __dirname + "/tmp/";
var IMGDIR  = __dirname + '/images/';
var METADIR = __dirname + '/data/';

// Secure post urls
app.use('/api', auth);
app.use('/upload', auth);

// Upload handling for a Post
app.post('/upload', function (req, res) {
  // Creating a new post
  console.log("Creating new post");
  var id = shortid.generate();
  var title = "";
  var author = "";
  var count = 0;
  var images = [];
  var form = new multiparty.Form();
  form.autoFiles = true;
  form.uploadDir = TMPDIR;

  form.on('error', function(err) {
    console.log('Error parsing form: ' + err.stack);
  });

  // Parts are emitted when parsing the form
  form.on('field', function(name, value) {
    console.log("Got field: " + name + "=" + value);
      switch (name) {
        case "title":
          title = value;
          break;
        case "author":
          author = value;
          break;
        case "caption":
          caption = value;
          break;
        default:
          console.log("unknown field: " + value)
      }
  });

  form.on('file', function(name, file) {
    console.log("Saving file " + id);
    var tmp_path = file.path;
    var target_path = IMGDIR + id;

    fs.rename(tmp_path, target_path, function(err) {
        if(err) console.error(err.stack);
        // Image file written. Write metadata

        var imgObj = {
          "src": "/images/" + id,
          "alt": caption,
          "txt": caption
        }
        images.push(imgObj);

        console.log("Writing metadata");
        var content = {
          "id": id,
          "title": title,
          "author": author,
          "images": images,
          "comments": []
        };

        filePath = METADIR + id;

        fs.writeFile(filePath, JSON.stringify(content), function(err) {
          if(err) {
            return console.log(err);
          }
          res.send(JSON.stringify(id));
        });
    })


  });

  // Close emitted after form parsed
  form.on('close', function() {
    console.log('Upload completed!');
  });

  // Call the parser
  form.parse(req);
});

// Drafting of generic api. At the moment used only for comments
app.post('/api', function (req, res) {
  var body = req.body;
  console.log(body);

  if (body.command==="comment") {
    // Creating a comment to an existing post
    console.log("Creating new comment")
    imageid = body.imageid;
    imagePath = METADIR + imageid;
    var commentID = shortid.generate();
    var content = {
      "id": commentID,
      "author": body.author,
      "text": body.text,
    };

    fs.readFile(imagePath, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      };

      var temp = JSON.parse(data);

      temp["comments"].push(content);

      fs.writeFile(imagePath, JSON.stringify(temp), function(err) {
        if(err) {
          return console.log(err);
        };
      });
      res.sendStatus(200);
    })
  }

  else {
    console.log("Reached end of whitelist, Bad Request.")
    res.sendStatus(400)
  }
});

app.get('*', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(8080, function () {
  console.log('Running ReactGIFs on port 8080!');
});
