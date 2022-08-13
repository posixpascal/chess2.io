import type { Piece } from "./pieces/Piece";

export interface BoardPosition {
  x: number;
  y: number;
}

export interface Move {
  from: BoardPosition;
  to: BoardPosition;
}

export enum Color {
  BLACK = "black",
  WHITE = "white",
  OTHER = "other",
}

export interface Turn {
  no: number;
  from?: BoardPosition;
  to?: BoardPosition;
  fromPiece?: Partial<Piece>;
  toPiece?: Partial<Piece>;

  isBear: boolean;
  tookPiece: boolean;
  rescuedKing: boolean;
  droppedKing: boolean;
}

export interface SerializedPiece {
  type: string;
  position: BoardPosition;
  color: string;
  attributes: Record<string, any>;
  imageKey: string;
}
