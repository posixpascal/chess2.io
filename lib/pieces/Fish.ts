import type { BoardPosition } from "../types";
import { Piece } from "./Piece";
import { Color } from "../types";

export class Fish extends Piece {
  value = 2;
  isPromoted = false;

  get imageKey() {
    if (this.isPromoted) {
      return "FishCrown";
    }

    return "Fish";
  }

  canTake(piece: Piece): boolean {
    if (this.isPromoted) {
      return piece.color !== this.color;
    }

    const isDiagonal = !!this.positionDiagonallyForward().find(
      (pos: BoardPosition) => {
        return pos.x === piece.position.x && pos.y === piece.position.y;
      }
    );

    return isDiagonal && this.color !== piece.color;
  }

  postMove(previousPosition: BoardPosition) {
    if (this.isPromoted) {
      return;
    }

    if (this.color === Color.BLACK && this.position.y === 7) {
      this.isPromoted = true;
    }

    if (this.color === Color.WHITE && this.position.y === 0) {
      this.isPromoted = true;
    }
  }

  get possibleMoves() {
    let moves = [
      ...this.positionDiagonallyForward(),
      this.positionForward(),
      this.positionLeft(),
      this.positionRight(),
    ];

    // when promoted, it acts like a queen.
    if (this.isPromoted) {
      moves = [
        ...this.positionDiagonallyUntilPiece(),
        ...this.positionHorizontallyUntilPiece(),
      ];
    }

    return moves.filter((pos: BoardPosition) => this.isValidPosition(pos));
  }
}
