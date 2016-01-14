// simple server


var express    = require('express');
var bodyParser = require('body-parser');
var shortid    = require('shortid');

var fs         = require('fs');
var app        = express();

app.use(express.static('.'));
app.use( bodyParser.json() );


app.post('/api', function (req, res) {
    var body = req.body;
    console.log(body);

    if (body.command==="post") {
        // Creating a new post
        console.log("Creating new post")
        var id = shortid.generate()
        var content = {
            "id": id,
            "title": body.title,
            "author": body.author,
            "images": body.images,
            "comments": []
        }

        filePath = __dirname + '/data/' + id;

        fs.writeFile(filePath, JSON.stringify(content), function(err) {
            if(err) {
                return console.log(err);
            }
            res.send(JSON.stringify(id));
        });
    }

    else if (body.command==="comment") {
        // Creating a comment to an existing post
        console.log("Creating new comment")
        imageid = body.imageid;
        imagePath = __dirname + "/data/" + imageid;
        var commentID = shortid.generate();
        var content = {
            "id": commentID,
            "author": body.author,
            "text": body.text,
        }

        fs.readFile(imagePath, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            
            var temp = JSON.parse(data);

            temp["comments"].push(content);

            fs.writeFile(imagePath, JSON.stringify(temp), function(err) {
                if(err) {
                    return console.log(err);
                }
                res.send(JSON.stringify(commentID));
            });
        })
    }

    else {
        res.sendStatus(400)
    }
}); 

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
})