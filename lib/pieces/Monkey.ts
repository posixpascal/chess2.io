import { BoardPosition, Color } from "../types";
import { Piece } from "./Piece";
import { King } from "./King";
import { Queen } from "./Queen";
import { makePiece } from "../utils";

export class Monkey extends Piece {
  type = "Monkey";
  value = 4;

  get imageKey() {
    if (this.hasBanana) {
      return "MonkeyBanana";
    }
    return "Monkey";
  }

  hasBanana = false;
  hasKing = false;
  king: Piece | null = null;

  getAttributes(): Record<string, any> {
    return {
      hasBanana: this.hasBanana,
      hasKing: this.hasKing,
      king: this.hasKing && this.king ? this.king.toServerState() : null,
    };
  }

  setAttributes(attributes: Record<string, any>) {
    if (!attributes) {
      return;
    }

    this.hasBanana = attributes.hasBanana;
    this.hasKing = attributes.hasKing;
    this.king =
      attributes.hasKing && attributes.king
        ? makePiece(attributes.king, this.board)
        : null;
  }

  /**
   * Can only take pieces which are located at the jump positions.
   * @param piece
   */
  canTake(piece: Piece): boolean {
    return !!this.jumpMovesFromPosition(this.position).find(
      (p: BoardPosition) => {
        return piece.at(p);
      }
    );
  }

  /**
   * When the monkey moves and has a king attached, we drop the king on the previous position of the monkey.
   * @param previousPosition
   */
  postMove(previousPosition: BoardPosition) {
    if (!this.hasKing || !this.king) {
      return;
    }

    this.king.position = previousPosition;
    this.board.pieces.push(this.king);
    this.king = null;
    this.hasKing = false;

    const lastTurn = this.board.turns[this.board.turns.length - 1];
    lastTurn.droppedKing = true;

    return this;
  }

  /**
   * Since the monkey is the only piece that can access the prisons
   * We define the possible prison cells in this method depending on the monkeys location on the board.
   */
  get selectablePrisonCell(): number {
    if (this.color === Color.BLACK) {
      // check upper prison cell
      if (this.position.x === 7 && this.position.y === 3) {
        let pieceInPrison: any = this.board.prisons[0];
        if (
          pieceInPrison &&
          pieceInPrison instanceof King &&
          pieceInPrison!.hasBanana
        ) {
          return 0;
        }
      }

      // check lower prison cell
      if (this.position.x === 7 && this.position.y === 4) {
        let pieceInPrison: any = this.board.prisons[1];
        if (
          pieceInPrison &&
          pieceInPrison instanceof King &&
          pieceInPrison!.hasBanana
        ) {
          return 1;
        }
      }
    }

    if (this.color === Color.WHITE) {
      // check upper prison cell
      if (this.position.x === 0 && this.position.y === 3) {
        let pieceInPrison: any = this.board.prisons[2];
        if (
          pieceInPrison &&
          pieceInPrison instanceof King &&
          pieceInPrison!.hasBanana
        ) {
          return 2;
        }
      }

      // check lower prison cell
      if (this.position.x === 0 && this.position.y === 4) {
        let pieceInPrison: any = this.board.prisons[3];
        if (
          pieceInPrison &&
          pieceInPrison instanceof King &&
          pieceInPrison!.hasBanana
        ) {
          return 3;
        }
      }
    }

    return -1;
  }

  /**
   * Basic moves in any direction and jump moves.
   */
  get possibleMoves() {
    let basicMoves = [
      this.positionLeft(1),
      this.positionRight(1),
      this.positionForward(1),
      this.positionBackward(1),
      ...this.positionDiagonally(1),
    ].filter((pos: BoardPosition) => this.isValidPosition(pos));

    return [
      ...basicMoves,
      ...this.jumpMovesFromPosition(this.position, [this.position]),
    ];
  }

  /**
   * Recursively find all available positions for the monkey at a given position on the board.
   * @param pos
   * @param ignoredPosition
   */
  jumpMovesFromPosition(
    pos: BoardPosition,
    ignoredPosition: BoardPosition[] = []
  ) {
    const jumpDirections = [
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: 1, y: 0 },
      { x: -1, y: 1 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    let allPositions: BoardPosition[] = [];
    for (const jumpDirection of jumpDirections) {
      // Checks if the adjecent field is occupied by a piece
      let adjecentPosition = {
        x: pos.x + jumpDirection.x,
        y: pos.y + jumpDirection.y,
      };

      const inVisitedPositions = ignoredPosition.find(
        (s) => s.x === adjecentPosition.x && s.y === adjecentPosition.y
      );

      if (inVisitedPositions) {
        continue;
      }

      // can't jump over the board
      if (!this.board.isWithinBoard(adjecentPosition)) {
        continue;
      }

      // can't take if no piece at this position.
      if (!this.board.pieceAt(adjecentPosition)) {
        continue;
      }

      // Then checks if the next adjecent field (in the same direction) is not occupied OR occupied by enemy.
      const targetPosition = {
        x: pos.x + jumpDirection.x * 2,
        y: pos.y + jumpDirection.y * 2,
      };

      // safety checks for target position
      if (!this.board.isWithinBoard(targetPosition)) {
        continue;
      }

      const targetInVisitedPositions = ignoredPosition.find(
        (s) => s.x === adjecentPosition.x && s.y === adjecentPosition.y
      );

      // don't reiterate over ignored fields
      if (targetInVisitedPositions) {
        continue;
      }

      let pieceAtPosition = this.board.pieceAt(targetPosition);
      if (!pieceAtPosition || pieceAtPosition.color !== this.color) {
        // at this point, this jump is a suitable candidate, we add it to the positions list
        allPositions.push(targetPosition);

        // If there is no piece at target, we allow the monkey to jump again.
        if (
          !pieceAtPosition &&
          !ignoredPosition.find(
            (p) => p.x === targetPosition.x && p.y === targetPosition.y
          )
        ) {
          allPositions = [
            ...allPositions,
            ...this.jumpMovesFromPosition(targetPosition, [
              ...ignoredPosition,
              pos,
            ]),
          ];
        }
      }
    }

    return allPositions;
  }
}
