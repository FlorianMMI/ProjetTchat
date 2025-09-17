import { Server } from 'socket.io';
import { createServer } from 'http';
import { PrismaClient } from '@prisma/client';

import app from './app.js'; // Importer l'application depuis app.js


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

    
})();

export { httpServer, io };


