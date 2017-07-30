var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var expstate = require('express-state');
var request = require('request');
var _ = require('lomath');
var app = express();
var PORT = 3000;

var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));
expstate.extend(app);

app.set('state namespace', 'App');
var authToken = require('./config').auth;

io.on('connection', function(socket) {
    console.log('new connection.');
});

app.get("/", function(req, res) {
    res.render('upload');
});

function post(res, url, form) {
    url = url + '?key=' + authToken;
    x = request.post(url, { json: form }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var str = JSON.stringify(body.responses[0].landmarkAnnotations[0].description
, null, 2); 
            console.log(str);
            res.render('upload', {bodies: str});
        }
        else {
            console.log('hi');
            return error;
        }
    });
}

app.post("/", function(req, res) {
    post(res, 'https://vision.googleapis.com/v1/images:annotate', { "requests":[{ "features":[{"type": "LANDMARK_DETECTION"}, {"maxResults": 10} ],"image":{"source":{"gcsImageUri": "gs://snappy-dragon-3843/DSCF8969.jpg"}}}]});
});

http.listen(PORT, function() {
    console.log('Example app listening on port 3000!');
});
