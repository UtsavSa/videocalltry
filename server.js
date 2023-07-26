

//basic code to get the server running


const express = require('express'); 
const app = express();

// useful for socket.io - allows us to create a server to be used with socket.io
const server = require('http').Server(app);

const io = require('socket.io')(server); // ccreating a server and passing it to socket.io 

const { v4: uuidV4 } = require('uuid'); // using uuid library to get dynamic roomId


// set up express server 
app.set('view engine', 'ejs'); // EJS (Embedded Javascript) template to write javascript directly in HTML

// setting up static folder 
app.use(express.static('public')); // javascript and css in public folder


// get route take in request and response with this, we want to create a new room and redirect user to the room
// we don't have a home page so this room will serve as homepage
app.get('/', (req, res) => {

    res.redirect(`/${uuidV4()}`);

}); // uuid library gets roomId

// getting our room
app.get('/:room', (req, res) => {
    res.render('room',{roomId: req.params.room} )
});

const activeUsers = {};


io.on('connection', socket => {

    let userId;

    socket.on('join-room', (roomId, userIdArg) =>{
       
        userId = userIdArg;
        
        socket.join(roomId);
        io.to(roomId).emit('user-connected', userId);
        activeUsers[roomId] = activeUsers[roomId] || [];
        activeUsers[roomId].push(userId);

        });

        socket.on('disconnect', () =>{

            if(userId){
                for(const roomId in activeUsers){

                    const index = activeUsers[roomId].indexOf(userId);
                    if(index !== -1){

                        activeUsers[roomId].splice(index, 1);
                        io.to(roomId).emit('user-disconnected', userId);
                        break;
                    }
            
            //socket.to(roomId).broadcast.emit('user-disconnected', userId);
                }
            }
            
        
        
    });
});
server.listen(3000);


