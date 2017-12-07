//Nicolle Lenzmeier
//CS4850
//Lab 3
//Desciption: This file is the server side (AKA: the haaaaard side)
//          Here I add new users to my JSON file (users.json) as well as parse through
//          the file for existing users. This page also does all of the redirecting and 
//          error handling.

// create reference to express object
var express = require("express"); 
//This creates our “app” object.
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 19824;

//to serve multiple html files in the html folders
app.use(express.static("html"));

//automatically parse form posts into req.body
app.use(express.urlencoded({extended: false}));

http.listen(port, function(){
  console.log('listening on *:' + port);
});


io.on('connection', function(socket){
    //making sure we can connect and identify users
    console.log("A user connected.");
    //making sure we can acknowledge a disconnection
    socket.on('disconnect', function(){
       console.log("A user disconnected."); 
    });
    
    socket.on('chat message', function(msg){
        //sending the message to the terminal
        console.log('message: ' + msg);
        //server sending message back to user in client.html
        io.emit('chat message', msg);
    });
});


app.post("/create", function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    
    //testing username and password
    //console.log("username: " + username);
    //console.log("password: " + password);

    //for file writing/reading
    var fs = require("fs");
    var newUser = {
            username: username,
            password: password
    };
    
    
    fs.readFile("./users.json", (err, data) => {
        if (err) throw err;
        //testing purposes
        //console.log(data);
        
        //handleUsername returns a 1 if the username is taken, and a 0 if it is free to use
        var check = handleUsername(data, username, res);
        if(check == 1){
            console.log("Username is already taken. Please try again.");
            res.redirect("index.html");
        }
        else{
            handleReadFile(data,newUser);
            res.redirect("client.html");
        }
    });
    
});

function handleUsername(data, username, res){
    //error checking
    //console.log("Hi: " + data);
    
    var list = JSON.parse(data);
    
    for(var i in list){
        //testing purposes
        //console.log(list[i].username);
        
        //checks to see if username is already taken
        if((username == list[i].username)){
            return 1
        } 
    }
    return 0;
}

function handleReadFile(data, newUser){
        //file is emtpy 
        //console.log("Here is data: " + data);
        if (data == null || data == ""){
            handleEmptyFile(data, newUser);
        }//it is not
        else {
            handleExistingFile(data, newUser);
        }
}

function handleEmptyFile(data, newUser){
    var fs = require("fs");
    console.log("No data here");
    
    var users = [newUser];
    
    fs.writeFile("./users.json", JSON.stringify(users, null, 4), (err) => {
        if (err) {
            console.error(err);
            return;
        };
        //console.log("File has been created");
    });
}

function handleExistingFile(data, newUser){
    var fs = require("fs");
    //file is not empty
    //userList contains everything that the file CURRENTLY holds
    //console.log("HI THERE!!!!");
    //console.log("hi: " + data);
    var userList = JSON.parse(data);
    //console.log(data);
    
    //add newUser to userList
    userList.push(newUser);
         
    //rewrite users.json with the updated version of userList
    fs.writeFile("./users.json", JSON.stringify(userList, null, 4), (err) => {
        if (err) {
            console.error(err);
            return;
        };
        //console.log("File has been created");
    });
}

app.post("/login", function(req, res){    
    var username = req.body.username;
    var password = req.body.password;
    var fs = require("fs");
    
    fs.readFile("./users.json", (err, data) => {
        if (err) throw err;
        //console.log(data);
        handleLogin(data, username, password, res);
    });  
});
         
function handleLogin(data, username, password, res){
    var list = JSON.parse(data);
    
    var check = 0;
    for(var i in list){
        //testing purposes
        //console.log(i);
        //console.log(list[i].username);
        
        //checks to see if username and password are both valid
        if((username == list[i].username) && (password == list[i].password)){
            //change check to 1 so it does not hit next if statement
            check = 1;
            console.log(username + " has logged in!");
            res.redirect("client.html");
        } 
    }
    
    //if check still equals 0, then there was not a match in users.json
    if (check == 0){
        console.log("Invalid username or password");
        res.redirect("index.html"); 
    }
}


