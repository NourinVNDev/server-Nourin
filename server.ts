import "reflect-metadata";
import app from "./app.ts";
import dotenv from 'dotenv';
import initializeSocket from "../server/src/sockets/commentSocket.ts";


dotenv.config();
const PORT = process.env.PORT || 3001
console.log("Port", PORT);

const server = app.listen(PORT, () => {
  console.log(`PORT is Running http://localhost:${PORT}`);
});

const socket = initializeSocket(server);