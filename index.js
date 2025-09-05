var Twig = require('twig');
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io')(http);


// Stockage des messages en mémoire (optionnel)
let messages = [];

// Socket.io : gestion des connexions
io.on('connection', function(socket) {
    console.log('Un utilisateur est connecté');

    // Envoyer l'historique des messages au nouvel utilisateur
    socket.emit('chat history', messages);

    // Réception d'un message
    socket.on('chat message', function(msg) {
        messages.push(msg);
        io.emit('chat message', msg); // Diffuse à tous les clients
    });

});

// Remplacer app.listen par http.listen


// Configure Twig view engine
app.set('views', path.join(__dirname));
app.set('view engine', 'twig');
app.engine('twig', Twig.__express);

app.use(express.static(path.join(__dirname, 'public')));




app.get('/', function(req, res){
  res.render('home', {});
});

var server = http.listen(5000, function () {
   console.log("Express App running at http://127.0.0.1:5000/");
})