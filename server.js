// ReactGIFs server

// imports
var express    = require('express');
var bodyParser = require('body-parser');
var shortid    = require('shortid');
var multiparty = require('multiparty');
var fs         = require('fs');
var jwt        = require('express-jwt');
var dotenv     = require('dotenv');
var filetype   = require('file-type');
var readChunk  = require('read-chunk');

// inits
var app        = express();
dotenv.load();
var auth       = jwt({
  secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
  audience: process.env.AUTH0_CLIENT_ID
});

// settings
app.use( bodyParser.json() );
var TMPDIR  = __dirname + "/tmp/";
var IMGDIR  = __dirname + '/images/';
var METADIR = __dirname + '/data/';
var PORT = process.env.PORT;

// Secure post urls
app.use('/api', auth);
app.use('/upload', auth);

// Upload handling for a Gallery
app.post('/upload', function (req, res) {
  // Creating a new Gallery
  console.log("Creating new Gallery");
  var id = shortid.generate();
  var title = "";
  var author = "";
  var count = 0;
  var images = [];
  var form = new multiparty.Form();
  form.autoFiles = true;
  form.uploadDir = TMPDIR;
  form.maxFilesSize = 2000*1024;

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

    // Check file type against whitelist
    var type = '';
    fs.readFile(tmp_path, function (err,data) {
      if (err) {
        return console.log(err);
      };
      type = filetype(data);
      console.log(type);

      var whitelist = /png|jpg|jpeg|gif|mp4|webp/;

      if (type && type.ext.match(whitelist) && type.mime.match(whitelist)) {
        console.log("filetype matched whitelist")
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

          console.log("Created Gallery:" + JSON.stringify(content));

          fs.writeFile(filePath, JSON.stringify(content), function(err) {
            if(err) {
              return console.log(err);
            }
            res.send(JSON.stringify(id));
          });
        })
      }
      // If the file didn't match whitelist, remove tempfile
      else {
        fs.unlink(tmp_path)
      }

    });
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
    // Creating a comment to an existing Gallery
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


// Explicitly defined static serves
app.get('/static/:file', function(req, res) {
  res.sendFile(__dirname + '/static/' + req.params.file);
});

app.get('/data/:file', function(req, res) {
  res.sendFile(__dirname + '/data/' + req.params.file);
});

app.get('/images/:file', function(req, res) {
  res.sendFile(__dirname + '/images/' + req.params.file);
});


// Catch-all - render the "single-page app"
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/static/index.html');
});


// Start server!
app.listen(PORT, function () {
  console.log('Running ReactGIFs on port ' + PORT);
});
