import type { BoardPosition } from "../types";
import { Piece } from "./Piece";

export class Crow extends Piece {
  value = 5;
  get imageKey() {
    return "Crow";
  }

  /**
   * The crow can take a nearby piece if your own piece was took last time.
   * @param piece
   */
  canTake(piece: Piece): boolean {
    if (this.board.turns.length === 0) {
      return false;
    }

    const lastTurn = this.board.turns[this.board.turns.length - 1];
    if (!lastTurn.tookPiece || !lastTurn.toPiece) {
      return false;
    }

    if (lastTurn.toPiece.color !== this.color) {
      return false;
    }

    const nearbyPositions = [
      ...this.positionDiagonally(1),
      this.positionForward(1),
      this.positionLeft(1),
      this.positionRight(1),
      this.positionBackward(1),
    ];

    return !!nearbyPositions.find((pos: BoardPosition) => {
      return piece.at(pos) && piece.color !== this.color;
    });
  }

  get possibleMoves() {
    return Array.from({ length: 8 })
      .flatMap((_, row: number) => {
        return Array.from({ length: 8 }).flatMap((_, cell: number) => {
          return { x: cell, y: row };
        });
      })
      .filter((s: BoardPosition) => this.isValidPosition(s));
  }
}
