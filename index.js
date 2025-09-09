import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Twig from 'twig';
import { PrismaClient } from '@prisma/client';


// Pour __dirname et __filename en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const prisma = new PrismaClient();
// Stockage des messages en mémoire (optionnel)
let messages = [];
let users = {};

(async () => {
    messages = await prisma.message.findMany();
    console.log("les messages sont ", messages);

    io.on('connection', function(socket) {
        console.log('Un utilisateur est connecté');

        socket.emit('chat history', messages);

        socket.on('user connected', function(pseudo) {
            users[socket.id] = pseudo;
            if(!pseudo) return;
            io.emit('user connected', pseudo);
            io.emit('users list', Object.values(users));
        });

        socket.on('chat message', async function(msg) {
            await prisma.message.create({
                data: {
                    message: msg.message,
                    pseudo: users[socket.id] || 'Anonyme',
                    createdAt: new Date()
                }
            });
            messages.push(msg);
            io.emit('chat message', msg);
        });

        socket.on('disconnect', function() {
            const pseudo = users[socket.id];
            if (pseudo) {
                io.emit('user disconnected', pseudo);
                delete users[socket.id];
                io.emit('users list', Object.values(users));
            }
        });
    });

    httpServer.listen(5000, function () {
        console.log("Express App running at http://127.0.0.1:5000/");
    });
})();

// Configure Twig view engine
app.set('views', __dirname);
app.set('view engine', 'twig');
app.engine('twig', Twig.__express);

app.use(express.static(join(__dirname, 'public')));

app.get('/', function(req, res){
  res.render('home', {});
});
