path = require('path');
var express = require('express');
promise = require('bluebird');
mongoose = promise.promisifyAll(require('mongoose'));
fs = promise.promisifyAll(require('fs'));
logLib = require('./app/src/lib/log');
exphbs = require('express-handlebars');
cookieParser = require('cookie-parser');
expressValidator = require('express-validator');
flash = require('connect-flash');
var session = require('express-session');
passport = require('passport');
LocalStrategy = require('passport-local').Strategy;
bcrypt = require('bcryptjs');

app = express();

http = require('http').Server(app);
var io = require('socket.io')(http);

// BodyParser middleware
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//config
app.use(express.static(path.join(__dirname + '/')));

 app.set('views', __dirname + '/app/src/views');
 app.engine('handlebars', exphbs({defaultLayout: 'main', layoutsDir: __dirname + '/app/src/views/layouts'}));
 app.set('view engine', 'handlebars');
mongoose.connect('mongodb://localhost/qwirk_db');


// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

//connect flash
app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('errr_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})

//import models
models = require('./app/src/models');

//import routing
require('./app/routing/users');
require('./app/routing/chats');
require('./app/routing/invitations');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    models.getUserById(id, function (err, user) {
        done(err, user);
    })
});



passport.use(new LocalStrategy(
    function(username, password, done) {
        models.getUserByUsername(username, function (err, user) {
            if(err) throw  err;
            if (!user){
                return done(null, false, {message: 'Unknown User'});
            };

            models.comparePassword(password, user.password, function (err, isMatch) {
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }
));

utilisateur = [];

io.on('connection', function(socket){

    // utilisateur.push(socket.id);

    console.log('messgae 1 socket io')
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log(('user disconnected'));
    });
    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
        var option = {messageText: msg};
        models.MessageGroupes(option).saveAsync()
          .then(logLib.logContent);

    });
});


http.listen(3000, () => {
    console.log('http://localhost:3000');
});



//
// io.sockets.on('connection', function (socket) {
//     // get the handshake and the session object
//     var hs = socket.handshake;
//     users[hs.session.username] = socket.id; // connected user with its socket.id
//     clients[socket.id] = socket; // add the client data to the hash
//     ...
//     socket.on('disconnect', function () {
//         delete clients[socket.id]; // remove the client from the array
//         delete users[hs.session.username]; // remove connected user & socket.id
//     });
// }