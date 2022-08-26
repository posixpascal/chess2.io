import type { BoardPosition } from "../types";
import { Piece } from "./Piece";

export class Elephant extends Piece {
  type = "Elephant";
  value = 3;
  get imageKey() {
    return "Elephant";
  }

  get possibleMoves() {
    let moves = [];

    if (this.board.pieceAt(this.positionDiagonallyRight(1))){
      moves.push(this.positionDiagonallyRight(2));
    }

    if (this.board.pieceAt(this.positionDiagonallyLeft(1))){
      moves.push(this.positionDiagonallyLeft(2));
    }

    return moves.filter((pos: BoardPosition) => this.isValidPosition(pos));
  }
}
