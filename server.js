// simple server


var express    = require('express');
var bodyParser = require('body-parser');
var shortid    = require('shortid');

var fs         = require('fs');
var app        = express();

app.use(express.static('.'));
app.use( bodyParser.json() );


app.post('/api', function (req, res) {
    var content = req.body;
    console.log(content);

    var id = shortid.generate();

    filePath = __dirname + '/data/' + id;

    fs.writeFile(filePath, JSON.stringify(content), function(err) {
        if(err) {
            return console.log(err);
        }
            res.sendStatus(200)
        });

}); 

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
})