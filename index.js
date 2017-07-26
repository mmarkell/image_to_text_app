var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var expstate = require('express-state');
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
var accountSid = require('./config').sid;
var authToken = require('./config').auth;

app.post('/', function(req, res) {
    console.log(req);
});

io.on('connection', function(socket) {
    console.log('new connection.');
});

app.get("/", function(req, res) {
    res.render('upload')
});

http.listen(PORT, function() {
    console.log('Example app listening on port 3000!');
});
