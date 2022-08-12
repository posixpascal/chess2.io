import { BoardPosition, Color, SerializedPiece } from "./types";
import Board from "./Board";
import { King } from "./pieces/King";
import { Queen } from "./pieces/Queen";
import { Monkey } from "./pieces/Monkey";
import { Crow } from "./pieces/Crow";
import { Fish } from "./pieces/Fish";
import { Elephant } from "./pieces/Elephant";
import { Bear } from "./pieces/Bear";

export const makePiece = (serializedPiece: SerializedPiece, board: Board) => {
  const classForType: any = {
    King: King,
    Queen: Queen,
    Monkey: Monkey,
    Crow: Crow,
    Fish: Fish,
    Elephant: Elephant,
    Bear: Bear,
  };

  const type = serializedPiece.type;
  const pieceClass = classForType[type];

  const piece = pieceClass.make(
    board,
    serializedPiece.color as Color,
    serializedPiece.position
  );
  piece.setAttributes(serializedPiece.attributes);
  return piece;
};

interface Move {
  from: BoardPosition;
  to: BoardPosition;
}

export const listAllValidMoves: (board: Board, color: string) => Move[] = (
  board: Board,
  color: string
) => {
  const pieces = board.pieces.filter((p) => p.color === color);
  return pieces.reduce((acc, piece) => {
    return [
      ...acc,
      ...piece.possibleMoves.map((target) => {
        return { from: piece.position, to: target };
      }),
    ];
  }, []);
};

export function searchBestMoves(
  board: Board,
  maxDepth: number,
  listMoves: (board: Board) => any,
  rateBoard: (board: Board) => any
) {
  return miniMax(board, 0, maxDepth, -Infinity, Infinity, listMoves, rateBoard);
}

// Scores are categorized into buckets:
export const MOVE = 0;
export const MATE = 10;
export type GameScore = number;

type MiniMaxResponse = { score: GameScore; move?: Move; nodes: number };
type ListMovesFn = (b: Board) => Move[];
type RateBoardFn = (b: Board) => number;

/**
 * Logically, GameScores are organized like this:
 *
 * |           | Black checkmate |  Black advantage   | Tie | White advantage  | White checkmate |
 * |-----------|-----------------|--------------------|-----|------------------|-----------------|
 * | Logically | -M1 .... -M1000 | -2^32 ... -1       |  0  | 1 ... 2^32       | +M1000 ... +M1  |
 *
 *
 * Basically, there is a line (currently drawn at +/- 2**32) that separates standard move scores and checkmate scores.
 * Also note that checkmates are reversed, since we prefer a mate in 3 moves over a mate in 20.
 */

// A non-checkmate score can be this value, at max. The reason why is because values OVER this number are actually
// encoded Checkmates.
const SCORE_MAX = 2 ** 32;

// We will never find a checkmate MORE moves out than this. Yes, this number is VERY optimistic, but I'd rather that we
// not have to worry about our limits on this:
const CHECKMATE_MAX = 1000;

export function mateScore(score: number): GameScore {
  // Note M0 doesn't make any sense, since these scores represent moves. M0 implies that the board is already mated, and
  // so there isn't a move to score...
  if (
    isNaN(score) ||
    score > CHECKMATE_MAX ||
    score < -CHECKMATE_MAX ||
    score === 0
  ) {
    throw new Error("Out of range checkmate score: " + score);
  }
  return score > 0
    ? SCORE_MAX + CHECKMATE_MAX - score
    : -SCORE_MAX - CHECKMATE_MAX - score;
}

export function moveScore(score: number): GameScore {
  if (isNaN(score) || score >= SCORE_MAX || score <= -SCORE_MAX) {
    throw new Error("Out of range move score: " + score);
  }
  return score;
}

function miniMax(
  board: Board,
  curDepth: number,
  maxDepth: number,
  alpha: GameScore,
  beta: GameScore,
  listMoves: ListMovesFn,
  rateBoard: RateBoardFn
): MiniMaxResponse {
  // Reached the tree's horizon:
  if (curDepth >= maxDepth) {
    return { score: moveScore(rateBoard(board)), nodes: 1 };
  }

  let best: GameScore = Infinity;
  let bestMoves: Move[] = [];

  const orderedMoves = listMoves(board);

  let nodes = 0;

  for (const move of orderedMoves) {
    console.log(board.turns.length);
    board.save();

    // console.log("> ".repeat(curDepth) + "MOVE:", moveToSAN(orderedMoves, move));
    try {
      board.move(move.from, move.to);
    } catch (e) {
      board.saveStates.pop();
      continue;
    }
    console.log(board.turns.length);
    const { score, nodes: branchNodes } = miniMax(
      board,
      curDepth + 1,
      maxDepth,
      alpha,
      beta,
      listMoves,
      rateBoard
    );

    // if (!curDepth) {
    //   console.log(moveToSAN(orderedMoves, move), score);
    // }

    board.restore();

    nodes += branchNodes;

    // Easy case: Whether minimizing or maximizing: we've seen this literal score before, so
    // we can just store it as an alternative: it shouldn't cause alpha or beta bailouts:
    if (score === best) {
      bestMoves.push(move);

      // Maximizer
    } else {
      if (score < best) {
        best = score;
        bestMoves = [move];
      }
      if (best <= alpha) {
        // console.log("> ".repeat(curDepth) + "BAIL:", best, "<=", alpha);
        break;
      }
      if (beta > best) {
        beta = score;
      }
    }
  }

  return curDepth
    ? { score: best, nodes }
    : { score: best, move: _pickOne(bestMoves), nodes };
}

function _pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
