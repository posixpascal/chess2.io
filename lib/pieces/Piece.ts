import { Color, SerializedPiece } from "../types";
import type { BoardPosition } from "../types";
import type Board from "../Board";

export class Piece {
  type: string = "Piece";
  value = 128;

  get imageKey() {
    return "";
  }

  position!: BoardPosition;
  board!: Board;
  color!: string;
  isImprisonable: boolean = false;

  at(position: BoardPosition) {
    if (!this.position || !position) {
      return false;
    }

    return this.position.x === position.x && this.position.y === position.y;
  }

  static make(board: Board, color: Color, position: BoardPosition) {
    const newPiece = new this();
    newPiece.position = position;
    newPiece.color = color;
    newPiece.board = board;
    return newPiece;
  }

  setAttributes(attributes: Record<string, any>) {
    return;
  }

  getAttributes(): Record<string, any> {
    return;
  }

  get possibleMoves(): BoardPosition[] {
    return [];
  }

  take(field: BoardPosition) {}

  move(field: BoardPosition) {}

  canTake(piece: Piece) {
    return this.color !== piece.color;
  }

  isValidPosition(pos: BoardPosition) {
    const pieceOnPosition = this.board.pieceAt(pos);
    return (
      this.board.isWithinBoard(pos) &&
      (!pieceOnPosition || this.canTake(pieceOnPosition))
    );
  }

  /**
   * Returns whether the piece moves up or down depending on the color
   */
  get forwardModifier() {
    return this.color == Color.BLACK ? +1 : -1;
  }

  // movement helper
  positionLeft(delta = 1) {
    return {
      x: this.position.x - delta,
      y: this.position.y,
    };
  }

  positionRight(delta = 1) {
    return {
      x: this.position.x + 1,
      y: this.position.y,
    };
  }

  positionForward(delta = 1) {
    return {
      x: this.position.x,
      y: this.position.y + delta * this.forwardModifier,
    };
  }

  get selectablePrisonCell() {
    return -1;
  }

  postMove(previousPosition: BoardPosition) {}

  positionBackward(delta = 1) {
    return {
      x: this.position.x,
      y: this.position.y - delta * this.forwardModifier,
    };
  }

  positionDiagonallyForward(delta = 1) {
    return [
      {
        x: this.position.x + delta,
        y: this.position.y + delta * this.forwardModifier,
      },
      {
        x: this.position.x - delta,
        y: this.position.y + delta * this.forwardModifier,
      },
    ];
  }

  /**
   * Calculates a list of positions which can be accessed by the corresponding piece diagonally.
   * It stops producing diagonal positions until a piece is detected and adds the piece's position
   * depending on whether it can take or not.
   */
  positionDiagonallyUntilPiece() {
    let reachedEndOfDiagonal = {
      topLeft: false,
      topRight: false,
      bottomLeft: false,
      bottomRight: false,
    };

    let positions = [];
    let delta = 1;

    while (true) {
      if (delta > 8) {
        break;
      }

      if (!reachedEndOfDiagonal.bottomRight) {
        let pos = {
          x: this.position.x + delta,
          y: this.position.y + delta,
        };

        if (!this.board.pieceAt(pos)) {
          positions.push(pos);
        } else if (this.canTake(this.board.pieceAt(pos)!)) {
          positions.push(pos);
          reachedEndOfDiagonal.bottomRight = true;
        } else {
          reachedEndOfDiagonal.bottomRight = true;
        }
      }

      if (!reachedEndOfDiagonal.topRight) {
        let pos = {
          x: this.position.x + delta,
          y: this.position.y - delta,
        };

        if (!this.board.pieceAt(pos)) {
          positions.push(pos);
        } else if (this.canTake(this.board.pieceAt(pos)!)) {
          positions.push(pos);
          reachedEndOfDiagonal.topRight = true;
        } else {
          reachedEndOfDiagonal.topRight = true;
        }
      }

      if (!reachedEndOfDiagonal.bottomLeft) {
        let pos = {
          x: this.position.x - delta,
          y: this.position.y + delta,
        };

        if (!this.board.pieceAt(pos)) {
          positions.push(pos);
        } else if (this.canTake(this.board.pieceAt(pos)!)) {
          positions.push(pos);
          reachedEndOfDiagonal.bottomLeft = true;
        } else {
          reachedEndOfDiagonal.bottomLeft = true;
        }
      }

      if (!reachedEndOfDiagonal.topLeft) {
        let pos = {
          x: this.position.x - delta,
          y: this.position.y - delta,
        };

        if (!this.board.pieceAt(pos)) {
          positions.push(pos);
        } else if (this.canTake(this.board.pieceAt(pos)!)) {
          positions.push(pos);
          reachedEndOfDiagonal.topLeft = true;
        } else {
          reachedEndOfDiagonal.topLeft = true;
        }
      }

      delta += 1;
    }

    return positions;
  }

  positionHorizontallyUntilPiece() {
    let reachedEndOfDiagonal = {
      left: false,
      top: false,
      right: false,
      bottom: false,
    };

    let positions = [];
    let delta = 1;

    while (true) {
      if (delta > 8) {
        break;
      }

      if (!reachedEndOfDiagonal.right) {
        let pos = {
          x: this.position.x + delta,
          y: this.position.y,
        };

        if (!this.board.pieceAt(pos)) {
          positions.push(pos);
        } else if (this.canTake(this.board.pieceAt(pos)!)) {
          positions.push(pos);
          reachedEndOfDiagonal.right = true;
        } else {
          reachedEndOfDiagonal.right = true;
        }
      }

      if (!reachedEndOfDiagonal.left) {
        let pos = {
          x: this.position.x - delta,
          y: this.position.y,
        };

        if (!this.board.pieceAt(pos)) {
          positions.push(pos);
        } else if (this.canTake(this.board.pieceAt(pos)!)) {
          positions.push(pos);
          reachedEndOfDiagonal.left = true;
        } else {
          reachedEndOfDiagonal.left = true;
        }
      }

      if (!reachedEndOfDiagonal.top) {
        let pos = {
          x: this.position.x,
          y: this.position.y - delta,
        };

        if (!this.board.pieceAt(pos)) {
          positions.push(pos);
        } else if (this.canTake(this.board.pieceAt(pos)!)) {
          positions.push(pos);
          reachedEndOfDiagonal.top = true;
        } else {
          reachedEndOfDiagonal.top = true;
        }
      }

      if (!reachedEndOfDiagonal.bottom) {
        let pos = {
          x: this.position.x,
          y: this.position.y + delta,
        };

        if (!this.board.pieceAt(pos)) {
          positions.push(pos);
        } else if (this.canTake(this.board.pieceAt(pos)!)) {
          positions.push(pos);
          reachedEndOfDiagonal.bottom = true;
        } else {
          reachedEndOfDiagonal.bottom = true;
        }
      }

      delta += 1;
    }

    return positions;
  }

  positionDiagonally(delta = 1) {
    return [
      {
        x: this.position.x + delta,
        y: this.position.y + delta,
      },
      {
        x: this.position.x - delta,
        y: this.position.y + delta,
      },
      {
        x: this.position.x + delta,
        y: this.position.y - delta,
      },
      {
        x: this.position.x - delta,
        y: this.position.y - delta,
      },
    ];
  }

  toServerState(): SerializedPiece {
    return {
      type: this.type,
      position: this.position,
      attributes: this.getAttributes(),
      color: this.color,
      imageKey: this.imageKey
    };
  }
}
