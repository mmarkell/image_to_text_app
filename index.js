var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var expstate = require('express-state');
var request = require('request');
var _ = require('lodash');
var app = express();
var PORT = 3000;

var http = require('http').Server(app);
var io = require('socket.io')(http);
var multer  = require('multer');
var upload = multer({ dest: 'temp/images'});
var fs = require('fs');

/** Permissible loading a single file, 
    the value of the attribute "name" in the form of "recfile". **/
var type = upload.single('imageUpload');
var path = require('path');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));
app.use(multer({dest:'./temp/images/'}).single('imageUpload'));
expstate.extend(app);

app.set('state namespace', 'App');
var authToken = process.env.GCV_SECRET///require('./config').auth;

io.on('connection', function(socket) {
    console.log('new connection.');
});

app.get("/", function(req, res) {
    res.render('upload');
});

app.post("/", function(req, res) {
    var imageFile = fs.readFileSync('./temp/images/' + req.connection.remoteAddress);
    var encoded = new Buffer(imageFile).toString('base64');
    postAnnotation(res, 'https://vision.googleapis.com/v1/images:annotate', { "requests":[{ "features":[{"type": "LABEL_DETECTION"}, {"maxResults": 10} ],"image":{"content":encoded}}]});
});

app.post("/upload", function(req, res) {
    if (req.file != undefined) {
        var tempPath = req.file.path;
        var target_path = './temp/images/' + req.connection.remoteAddress;
        var src = fs.createReadStream(tempPath);
        var dest = fs.createWriteStream(target_path);
        src.pipe(dest);
        res.render('upload');
    }
    else {
        console.log("failed");
        res.render('upload');
    }
});

app.get("/image.png", function (req, res) {
    res.sendFile(path.resolve('./temp/images/' + req.connection.remoteAddress));
}); 

function postAnnotation(res, url, form) {
    url = url + '?key=' + authToken;
    x = request.post(url, { json: form }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var descriptions = getDescriptions(body, 'labelAnnotations');
            res.render('upload', {bodies: descriptions});
            return;
        }
        else {
            console.log(error);
            console.log(response.statusCode);
            res.render('upload');
            return error;
        }
    });
}

function getDescriptions(body, feature) {
    jBody = body.responses
    jsonDescriptions = "";
    for (var i = 0; i < jBody.length; i++){
        for (var key in jBody[i]){
            var attrName = key;
            if (attrName === feature) {
                for (var key2 in jBody[i][key]) {
                    // var attrName = jBody[i][key][key2];
                    // jsonDescriptions.push({
                    //     id: 'tag',
                    // });
                    jsonDescriptions += " | " + jBody[i][key][key2].description;
                }
            }
        } 
    }
    return jsonDescriptions;
}

http.listen(PORT, function() {
    console.log('Example app listening on port 3000!');
});
