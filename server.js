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

    if (body.command="post") {
        // Creating a new post
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
    } else {
        res.sendStatus(400)
    }
}); 

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
})