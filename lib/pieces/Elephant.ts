import type { BoardPosition } from "../types";
import { Piece } from "./Piece";

export class Elephant extends Piece {
  type = "Elephant";
  value = 3;
  get imageKey() {
    return "Elephant";
  }

  get possibleMoves() {
    let moves = [...this.positionDiagonally(2)];

    return moves.filter((pos: BoardPosition) => this.isValidPosition(pos));
  }
}
