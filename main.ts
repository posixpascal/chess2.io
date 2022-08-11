import express from "express";
import * as http from "http";
import { Socket } from "socket.io";
import cors from "cors";
import Board from "./lib/Board";
import * as events from "./shared/events";

const nanoid = require("nanoid");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
    allowedHeaders: [],
    credentials: true,
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>Hello world</h1>");
});

const rooms: Record<string, Room> = {};

class Room {
  id: string;
  player1: null;
  player2: null;
  board;

  constructor(id: string) {
    this.id = id;
    this.board = new Board();
  }
}

io.on("connection", async (socket: Socket) => {
  socket.on(events.ROOM_CREATE, () => {
    const roomId = nanoid(8);
    rooms[roomId] = new Room(roomId);
    socket.join(roomId);
    socket.emit(events.ROOM_CREATED, {
      id: roomId,
      board: rooms[roomId].board.toServerState(),
    });
  });

  socket.on(events.ROOM_JOIN, (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = new Room(roomId);
    }
    socket.join(roomId);
    socket.emit(events.ROOM_JOINED, {
      id: roomId,
      board: rooms[roomId].board.toServerState(),
    });
  });

  socket.on(events.PIECE_MOVE, (data) => {
    console.log(data);
    rooms[data.roomId].board.move(data.from, data.to);
    io.to(data.roomId).emit(events.BOARD_UPDATED, {
      id: data.roomId,
      board: rooms[data.roomId].board.toServerState(),
    });
  });

  socket.on(events.BEAR_MOVE, (data) => {
    rooms[data.roomId].board.moveBear(data.to);
    io.to(data.roomId).emit(events.BOARD_UPDATED, {
      id: data.roomId,
      board: rooms[data.roomId].board.toServerState(),
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
