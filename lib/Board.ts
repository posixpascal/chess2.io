import { Crow } from "./pieces/Crow";
import { BoardPosition, Color, SerializedPiece, Turn } from "./types";
import { Piece } from "./pieces/Piece";
import { Monkey } from "./pieces/Monkey";
import { Fish } from "./pieces/Fish";
import { Elephant } from "./pieces/Elephant";
import { Queen } from "./pieces/Queen";
import { King } from "./pieces/King";
import { Bear } from "./pieces/Bear";
import { makePiece } from "./utils";

export default class Board {
  pieces = [
    /**
     * black pieces
     */
    Crow.make(this, Color.BLACK, { x: 0, y: 0 }),
    Monkey.make(this, Color.BLACK, { x: 1, y: 0 }),
    Fish.make(this, Color.BLACK, { x: 2, y: 0 }),
    Queen.make(this, Color.BLACK, { x: 3, y: 0 }),
    King.make(this, Color.BLACK, { x: 4, y: 0 }),
    Fish.make(this, Color.BLACK, { x: 5, y: 0 }),
    Monkey.make(this, Color.BLACK, { x: 6, y: 0 }),
    Crow.make(this, Color.BLACK, { x: 7, y: 0 }),
    Fish.make(this, Color.BLACK, { x: 0, y: 1 }),
    Fish.make(this, Color.BLACK, { x: 1, y: 1 }),
    Elephant.make(this, Color.BLACK, { x: 2, y: 1 }),
    Fish.make(this, Color.BLACK, { x: 3, y: 1 }),
    Fish.make(this, Color.BLACK, { x: 4, y: 1 }),
    Elephant.make(this, Color.BLACK, { x: 5, y: 1 }),
    Fish.make(this, Color.BLACK, { x: 6, y: 1 }),
    Fish.make(this, Color.BLACK, { x: 7, y: 1 }),

    /**
     * white pieces
     */
    Crow.make(this, Color.WHITE, { x: 0, y: 7 }),
    Monkey.make(this, Color.WHITE, { x: 1, y: 7 }),
    Fish.make(this, Color.WHITE, { x: 2, y: 7 }),
    Queen.make(this, Color.WHITE, { x: 3, y: 7 }),
    King.make(this, Color.WHITE, { x: 4, y: 7 }),
    Fish.make(this, Color.WHITE, { x: 5, y: 7 }),
    Monkey.make(this, Color.WHITE, { x: 6, y: 7 }),
    Crow.make(this, Color.WHITE, { x: 7, y: 7 }),
    Fish.make(this, Color.WHITE, { x: 0, y: 6 }),
    Fish.make(this, Color.WHITE, { x: 1, y: 6 }),
    Elephant.make(this, Color.WHITE, { x: 2, y: 6 }),
    Fish.make(this, Color.WHITE, { x: 3, y: 6 }),
    Fish.make(this, Color.WHITE, { x: 4, y: 6 }),
    Elephant.make(this, Color.WHITE, { x: 5, y: 6 }),
    Fish.make(this, Color.WHITE, { x: 6, y: 6 }),
    Fish.make(this, Color.WHITE, { x: 7, y: 6 }),
  ];

  hasDefaultBear = true;

  isOver = false;
  winner: Color | null = null;

  prisons: Array<King | Queen | null> = [null, null, null, null];
  turns: Turn[] = [];
  taken: Piece[] = [];

  get playerToMove() {
    return this.turns.length % 2 === 0 ? Color.WHITE : Color.BLACK;
  }

  releasePrisoner(pieceAtPos: BoardPosition, cellIndex: number) {
    const monkey = this.pieceAt(pieceAtPos);
    if (!monkey) {
      // TODO: throw?
      return this;
    }

    if (!(monkey instanceof Monkey)) {
      return this;
    }

    const prisoner = this.prisons[cellIndex];
    if (!prisoner) {
      // TODO: throw?
      return this;
    }

    if (!(prisoner instanceof King)) {
      // TODO: throw?
      return this;
    }

    if (!prisoner.hasBanana) {
      // TODO: throw?
      return this;
    }

    if (prisoner.color !== monkey.color) {
      // TODO: throw?
      return this;
    }

    // finally release the prisoner
    monkey.hasKing = true;
    monkey.king = this.prisons[cellIndex];
    monkey.hasBanana = true;

    (this.prisons[cellIndex]! as King).hasBanana = false;
    this.prisons[cellIndex] = null;

    this.createTurn({
      from: pieceAtPos,
      fromPiece: monkey.toServerState(),
      to: pieceAtPos,
      rescuedKing: true,
    });

    return this;
  }

  createTurn(turn: Partial<Turn>) {
    this.turns.push({
      rescuedKing: false,
      isBear: false,
      tookPiece: false,
      droppedKing: false,
      no: this.turns.length + 1,
      ...turn,
    });

    if (turn.tookPiece && turn.toPiece && turn.toPiece.isImprisonable) {
      this.playAudio("prisoner");
    } else if (turn.tookPiece) {
      this.playAudio("capture");
    } else if (turn.rescuedKing) {
      this.playAudio("release");
    } else {
      this.playAudio("move");
    }
  }

  postTook(piece: Piece) {
    if (piece instanceof Monkey && piece.hasKing) {
      this.postTook(piece.king!);
      return;
    }

    if (piece instanceof King || piece instanceof Queen) {
      if (piece.color === Color.BLACK) {
        if (!this.prisons[0]) {
          this.prisons[0] = piece;
          return;
        }

        if (!this.prisons[1]) {
          this.prisons[1] = piece;
        }
      } else {
        if (!this.prisons[2]) {
          this.prisons[2] = piece;
          return;
        }

        if (!this.prisons[3]) {
          this.prisons[3] = piece;
        }
      }
    }

    this.checkGameState();
  }

  checkGameState() {
    if (this.prisons[0] && this.prisons[1]) {
      this.isOver = true;
      this.winner = Color.WHITE;
      this.playAudio("victory");
    }

    if (this.prisons[2] && this.prisons[3]) {
      this.isOver = true;
      this.winner = Color.BLACK;
      this.playAudio("victory");
    }
  }

  // Inject the bear into the current game at position
  moveBear(toPosition: BoardPosition) {
    if (!this.hasDefaultBear) {
      // TODO: throw?
      return this;
    }

    if (this.pieceAt(toPosition)) {
      // TODO: throw?
      return this;
    }

    const bear = new Bear();
    bear.position = toPosition;
    bear.board = this;
    bear.color = "other";
    this.pieces.push(bear);

    this.hasDefaultBear = false;

    this.createTurn({
      isBear: true,
      to: toPosition,
      toPiece: bear.toServerState(),
    });

    this.playAudio("move");
    return this;
  }

  // This does not handle validation of the player moving
  // It should be done in a different place (i.e. the service that calls this action)
  move(fromPosition: BoardPosition, toPosition: BoardPosition) {
    if (!this.isWithinBoard(fromPosition) || !this.isWithinBoard(toPosition)) {
      // TODO: throw?
      return this;
    }

    const fromPiece = this.pieceAt(fromPosition);
    const toPiece = this.pieceAt(toPosition);

    if (!fromPiece) {
      // TODO: throw?
      return this;
    }

    if (!(fromPiece instanceof Bear) && fromPiece.color !== this.playerToMove) {
      // TODO: throw
      return this;
    }

    const isValidMove = fromPiece.possibleMoves.find((pos) => {
      return pos.x === toPosition.x && pos.y === toPosition.y;
    });
    if (!isValidMove) {
      // TODO: throw?
      return this;
    }

    if (toPiece && toPiece.color !== fromPiece.color) {
      if (!fromPiece.canTake(toPiece)) {
        // TODO: throw?
        return this;
      }
    }

    // perform taking
    if (toPiece) {
      // add to taken collection
      this.taken = [
        ...this.taken,
        ...this.pieces.filter((piece) => {
          return toPiece.at(piece.position);
        }),
      ];

      // remove the piece from board (or put in prison)
      this.pieces = this.pieces.filter((piece) => {
        return !toPiece.at(piece.position);
      });

      this.postTook(toPiece);
    }

    fromPiece.position = { x: toPosition.x, y: toPosition.y };

    this.createTurn({
      from: fromPosition,
      to: toPosition,
      toPiece: toPiece?.toServerState(),
      fromPiece: fromPiece?.toServerState(),
      tookPiece: !!toPiece,
      droppedKing: false,
      rescuedKing: false,
    });

    fromPiece.postMove(fromPosition);

    return this;
  }

  get field() {
    return Array.from({ length: 8 }).map((row, y) => {
      return Array.from({ length: 8 }).map((cell, x) => {
        return this.pieceAt({ y, x }) || 0;
      });
    });
  }

  pieceAt(pos: BoardPosition) {
    return this.pieces.find((piece) => {
      return piece.position.x === pos.x && piece.position.y === pos.y;
    });
  }

  isWithinBoard(pos: BoardPosition) {
    return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
  }

  // TODO: shouldn't belong in this library
  playAudio(
    key:
      | "capture"
      | "move"
      | "prisoner"
      | "dropped"
      | "release"
      | "victory"
      | "defeat"
  ) {
    // (SOUNDS[key] as HTMLAudioElement).play().then(() => {
    //
    // });
  }

  /**
   * Replicate the board client side from a json payload.
   * @param serverState
   */
  static fromServerState(serverState: ServerState) {
    const board = new this();

    board.turns = serverState.turns.map((turn) => {
      return {
        ...turn,
        toPiece: turn.toPiece
          ? makePiece(turn.toPiece as SerializedPiece, board)
          : null,
        fromPiece: turn.fromPiece
          ? makePiece(turn.fromPiece as SerializedPiece, board)
          : null,
      };
    });

    board.isOver = serverState.isOver;
    board.winner = serverState.winner;

    // only pieces and prison is required to be serialized
    board.pieces = serverState.pieces.map((serializedPiece) => {
      if (!serializedPiece) {
        return null;
      }

      return makePiece(serializedPiece, board);
    });

    board.prisons = serverState.prisons.map((serializedPiece) => {
      if (!serializedPiece) {
        return null;
      }

      return makePiece(serializedPiece, board);
    });
    board.hasDefaultBear = serverState.hasDefaultBear;

    return board;
  }

  toServerState(): ServerState {
    return {
      hasDefaultBear: this.hasDefaultBear,
      isOver: this.isOver,
      winner: this.winner,
      turns: this.turns.map((turn) => {
        return {
          ...turn,
          fromPiece: turn.fromPiece,
          toPiece: turn.toPiece,
        };
      }),
      pieces: this.pieces.map((piece) => {
        if (!piece) {
          return null;
        }

        return piece.toServerState();
      }),
      prisons: this.prisons.map((piece) => {
        if (!piece) {
          return null;
        }
        return piece.toServerState();
      }),
    };
  }
}

interface ServerState {
  hasDefaultBear: boolean;
  turns: Turn[];
  isOver: boolean;
  winner: Color;
  pieces: Array<SerializedPiece>;
  prisons: Array<SerializedPiece>;
}
