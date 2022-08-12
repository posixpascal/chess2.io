import type { BoardPosition } from "../types";
import { Piece } from "./Piece";
import { Color } from "../types";

export class Bear extends Piece {
  type = "Bear";
  value = 1;
  get imageKey() {
    return "Bear";
  }

  canTake(piece: Piece): boolean {
    return false;
  }

  get possibleMoves() {
    let moves = [
      ...this.positionDiagonally(1),
      this.positionForward(1),
      this.positionBackward(1),
      this.positionLeft(1),
      this.positionRight(1),
    ];

    return moves.filter((pos: BoardPosition) => this.isValidPosition(pos));
  }
}
