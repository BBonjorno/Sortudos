require('rootpath')();
var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');


// =======================
// check configuration =========
// =======================
var mongo = require('mongoskin'); 
var db = mongo.db(config.connectionString);// connect to database
//Run Mongodb
//sudo mongod --bind_ip=$IP --nojournal

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));

var mongo_express = require('mongo-express/lib/middleware');
var mongo_express_config = require('./node_modules/mongo-express/config');

app.use('/mongo_express', mongo_express(mongo_express_config));

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});
 
// start server
app.listen(1080,"localhost", function () {
    console.log('Server listening at http://lolcahost:1080');
});