import type { BoardPosition } from "../types";
import { Piece } from "./Piece";

export class King extends Piece {
  type = "King";
  value = 8;
  isImprisonable = true;

  get imageKey() {
    if (this.hasBanana) {
      return "KingBanana";
    }
    return "King";
  }

  hasBanana = true;

  getAttributes(): Record<string, any> {
    return {
      hasBanana: this.hasBanana,
    };
  }

  setAttributes(attributes: Record<string, any>) {
    if (!attributes) {
      return;
    }

    this.hasBanana = attributes.hasBanana;
  }

  get possibleMoves() {
    return [
      this.positionLeft(1),
      this.positionRight(1),
      this.positionForward(1),
      this.positionBackward(1),
      ...this.positionDiagonally(1),
    ].filter((pos: BoardPosition) => this.isValidPosition(pos));
  }
}
