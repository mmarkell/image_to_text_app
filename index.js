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
    res.render('upload')
});

function post(url, form) {
    request.post(url + '?key=' + authToken, {data: form}, function optionalCallback(err, httpResponse, body) {
    if (err) {
        return console.error('post failed:', err);
    }
    console.log('success, server response:', body);
    return;
    });
}

app.get("/analyze", function(req, res) {
    params = {
      "requests": [
        {
          "image": {
            "source": {
              "imageUri": "gs://snappy-dragon-3843/DSCF8969.jpg"
            }
          },
          "features": [
            {
              "type": "LABEL_DETECTION"
            }
          ]
        }
      ]
    };
    return post('https://vision.googleapis.com/v1/images:annotate', _.flattenJSON(params));
});

http.listen(PORT, function() {
    console.log('Example app listening on port 3000!');
});
