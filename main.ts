import express from "express";
import * as http from "http";
import { Socket } from "socket.io";
import cors from "cors";
import Board from "./lib/Board";
import * as events from "./shared/events";
import { BoardPosition } from "./lib/types";

const nanoid = require("nanoid");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: [],
    credentials: true,
  },
});

app.use(cors());
app.use(express.static('./build/static'));
const rooms: Record<string, Room> = {};

class Room {
  id: string;
  isReady = false;
  player1: Socket;
  player2: Socket;
  playerToMove: string;
  playerWhite: string;
  board;

  messages: string[] = [];
  spectators: any = [];

  constructor(id: string) {
    this.id = id;
    this.board = new Board();
  }

  serialize() {
    const data: any = {
      id: this.id,
      messages: this.messages,
      isReady: this.isReady,
      playerToMove: this.playerToMove,
      playerWhite: this.playerWhite,
      board: this.board.toServerState(),
    };

    if (this.player1) {
      data.player1 = {
        avatar: avatars[this.player1.id],
        id: this.player1.id,
      };
    }

    if (this.player2) {
      data.player2 = {
        avatar: avatars[this.player2.id],
        id: this.player2.id,
      };
    }

    return data;
  }

  join(socket: Socket) {
    if (!this.player1 && !this.player2) {
      this.player1 = socket;
      if (this.player1 && this.player2) {
        this.ready();
      }
    } else if (!this.player2 && this.player1.id !== socket.id) {
      this.player2 = socket;
    } else {
      this.spectators.push(socket);
    }

    if (this.player1 && this.player2) {
      this.ready();
    }

    this.broadcast();
  }

  playSound() {
    if (!this.board.turns.length) {
      return;
    }

    const lastTurn = this.board.turns[this.board.turns.length - 1];

    let soundKey = "move";
    if (lastTurn.tookPiece) {
      soundKey = "capture";
    }

    if (lastTurn.rescuedKing) {
      soundKey = "release";
    }

    if (lastTurn.droppedKing) {
      soundKey = "dropped";
    }

    if (
      lastTurn.tookPiece &&
      (lastTurn.toPiece.type === "King" || lastTurn.toPiece.type === "Queen")
    ) {
      soundKey = "prisoner";
    }

    // I'm sorry :')
    if (this.board.isOver) {
      if (this.board.winner === "white") {
        if (this.playerToMove === this.player1.id) {
          this.player1.emit(events.PLAY_SOUND, "victory");
          this.player2.emit(events.PLAY_SOUND, "defeat");
        } else {
          this.player2.emit(events.PLAY_SOUND, "victory");
          this.player1.emit(events.PLAY_SOUND, "defeat");
        }
      } else {
        if (this.playerToMove !== this.player1.id) {
          this.player1.emit(events.PLAY_SOUND, "victory");
          this.player2.emit(events.PLAY_SOUND, "defeat");
        } else {
          this.player2.emit(events.PLAY_SOUND, "victory");
          this.player1.emit(events.PLAY_SOUND, "defeat");
        }
      }
      return;
    }

    io.to(this.id).emit(events.PLAY_SOUND, soundKey);
  }

  moveBear(to: BoardPosition) {
    const movesBefore = this.board.turns.length;
    this.board.moveBear(to);
    if (movesBefore !== this.board.turns.length) {
      this.playSound();
      this.nextPlayer();
    }
  }

  move(from: BoardPosition, to: BoardPosition) {
    const movesBefore = this.board.turns.length;
    this.board.move(from, to);
    if (movesBefore !== this.board.turns.length) {
      this.playSound();
      this.nextPlayer();
    }
  }

  releasePrisoner(from: BoardPosition, cellIndex: number) {
    const movesBefore = this.board.turns.length;
    this.board.releasePrisoner(from, cellIndex);
    if (movesBefore !== this.board.turns.length) {
      this.playSound();
      this.nextPlayer();
    }
  }

  rematch() {
    this.board = new Board();
    // switch sides
    this.playerToMove =
      Math.random() >= 0.5 ? this.player1.id : this.player2.id;
    this.playerWhite = this.playerToMove;
    this.broadcast();
  }

  nextPlayer() {
    if (this.playerToMove === this.player1.id) {
      this.playerToMove = this.player2.id;
      return;
    }

    if (this.playerToMove === this.player2.id) {
      this.playerToMove = this.player1.id;
      return;
    }
  }

  ready() {
    this.isReady = true;
    if (
      !this.playerToMove ||
      this.playerToMove !== this.player1.id ||
      this.playerToMove !== this.player2.id
    ) {
      this.playerToMove =
        Math.random() >= 0.5 ? this.player1.id : this.player2.id;
      this.playerWhite = this.playerToMove;
    }

    this.broadcast();
  }

  broadcast() {
    io.to(this.id).emit(events.ROOM_UPDATED, this.serialize());
  }
}

const avatars: any = {};

io.on("connection", async (socket: Socket) => {
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (room.player1 && room.player1.id === socket.id) {
        room.player1 = null;
        room.isReady = false;
        room.messages.push("Player left this game");
        room.broadcast();
      }

      if (room.player2 && room.player2.id === socket.id) {
        room.player2 = null;
        room.isReady = false;
        room.messages.push("Player left this game");
        room.broadcast();
      }
    }
  });

  socket.on(
    events.UPDATE_AVATAR,
    (newAvatar: { color: string; emoji: string }) => {
      avatars[socket.id] = {
        color: newAvatar.color,
        emoji: newAvatar.emoji,
      };
    }
  );

  socket.on(events.ROOM_CREATE, () => {
    let roomId = nanoid(5);
    while (rooms[roomId]) {
      roomId = nanoid(5);
    }
    const room = new Room(roomId);

    room.join(socket);
    socket.join(roomId);

    room.messages.push("Room created");

    socket.emit(events.ROOM_CREATED, room.serialize());
    rooms[roomId] = room;
  });

  socket.on(events.ROOM_JOIN, (roomId) => {
    let room = rooms[roomId];
    if (!room) {
      rooms[roomId] = new Room(roomId);
      room = rooms[roomId];
    }

    room.messages.push("Player joined this game");

    room.join(socket);
    socket.join(roomId);
    socket.emit(events.ROOM_JOINED, room.serialize());
    room.broadcast();
  });

  socket.on(events.PIECE_MOVE, (data) => {
    const room = rooms[data.roomId];
    if (!room) {
      socket.emit(events.ROOM_NOT_FOUND);
      return;
    }
    room.move(data.from, data.to);
    room.broadcast();
  });

  socket.on(events.RELEASE_PRISONER_MOVE, (data) => {
    const room = rooms[data.roomId];
    if (!room) {
      socket.emit(events.ROOM_NOT_FOUND);
      return;
    }
    room.releasePrisoner(data.position, data.cellIndex);
    room.broadcast();
  });

  socket.on(events.BEAR_MOVE, (data) => {
    const room = rooms[data.roomId];
    if (!room) {
      socket.emit(events.ROOM_NOT_FOUND);
      return;
    }
    room.moveBear(data.to);
    room.broadcast();
  });

  socket.on(events.REMATCH, (data) => {
    const room = rooms[data.roomId];
    if (!room) {
      socket.emit(events.ROOM_NOT_FOUND);
      return;
    }
    room.rematch();
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
