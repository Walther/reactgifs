// ReactGIFs server

// imports
var express    = require('express');
var bodyParser = require('body-parser');
var shortid    = require('shortid');
var multiparty = require('multiparty');
var fs         = require('fs');
var app        = express();

// settings
app.use(express.static('.'));
app.use( bodyParser.json() );

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
  form.uploadDir = __dirname + "/tmp/";

  form.on('error', function(err) {
    console.log('Error parsing form: ' + err.stack);
  });

  // Parts are emitted when parsing the form
  form.on('part', function(part) {

    if (!part.filename) {
      // filename is not defined when this is a field and not a file
      console.log('got field named ' + part.name);
      // ignore field's content
      part.resume();
    }


    part.on('error', function(err) {
      console.log("error:" + err);
    });
  });

  form.on('file', function(name, file) {
    console.log("Saving file " + id);
    var tmp_path = file.path;
    var target_path = __dirname + '/images/' + id;

    fs.rename(tmp_path, target_path, function(err) {
        if(err) console.error(err.stack);
    })

    // Image file written. Write metadata

    var imgObj = {
      "src": "/images/" + id,
      "alt": "alt text",
      "txt": "caption"
    }
    images.push(imgObj);
    console.log("Images: " + images)


    console.log("Writing metadata");
    var content = {
      "id": id,
      "title": title,
      "author": author,
      "images": images,
      "comments": []
    };

    filePath = __dirname + '/data/' + id;

    fs.writeFile(filePath, JSON.stringify(content), function(err) {
      if(err) {
        return console.log(err);
      }
      res.send(id);
    });
  });

  // Close emitted after form parsed
  form.on('close', function() {
    console.log('Upload completed!');
  });

  // Call the parser
  form.parse(req);
});

app.post('/api', function (req, res) {
  var body = req.body;
  console.log(body);

  if (body.command==="comment") {
    // Creating a comment to an existing post
    console.log("Creating new comment")
    imageid = body.imageid;
    imagePath = __dirname + "/data/" + imageid;
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

app.listen(8080, function () {
  console.log('Running ReactGIFs on port 8080!');
});
