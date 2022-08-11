import type { BoardPosition } from "../types";
import { Piece } from "./Piece";

export class Queen extends Piece {
  value = 9;
  get imageKey() {
    return "Queen";
  }
  isImprisonable = true;

  get possibleMoves() {
    let moves = [
      ...this.positionDiagonallyUntilPiece(),
      ...this.positionHorizontallyUntilPiece(),
    ];

    return moves.filter((pos: BoardPosition) => this.isValidPosition(pos));
  }
}
