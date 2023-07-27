const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socketIO = require("socket.io");
const cookieParser = require("cookie-parser");

const io = socketIO(server);
const cors = require("cors");

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("Server down because of unhandledException");
  process.exit(1);
});

const dotenv = require("dotenv");
dotenv.config();

const port = process.env.port  || 5000;
const userRoute = require("./Routes/UserRoutes");
const messageRoute=require("./Routes/messageRoutes")
const db = require("./config/db");
const Error = require("./Middleware/Error");
const messages = require("./Schema/messageSchema");

db();
console.log("hi")

app.use(
  cors({
    origin: "https://chat-app-kjvv.onrender.com",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/user", userRoute);
app.use("/message",messageRoute)

app.use(Error);

const users=new Map()
io.on("connection", (socket) => {

  if (!users.has(socket)){
    console.log("connected");
  }

  socket.on("message", async (data) => {
    console.log(data)
  const newMessage=await messages.create({senderID:data.ID,senderName:data.name,message:data.message}); 
    io.sockets.emit("add-mess",newMessage)
  /* 
  socket.emit("add-mess",newMessage)
  socket.broadcast.emit("add-mess",newMessage) */
   console.log(data)
  });
 
  
});

process.on("unhandledRejection", (err) => {
  console.log("Server down because of unhandledRejection");
  console.log(err);
  process.exit(1);
});

server.listen(port, () => {
  console.log("server started");
});
