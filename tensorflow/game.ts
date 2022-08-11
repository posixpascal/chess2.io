import * as tf from "@tensorflow/tfjs";

import { assertPositiveInteger, getRandomInteger } from "./utils";
import Board from "../lib/Board";
import { King } from "../lib/pieces/King";
import { Queen } from "../lib/pieces/Queen";
import * as fs from "fs";

const DEFAULT_HEIGHT = 8;
const DEFAULT_WIDTH = 8;
const DEFAULT_INIT_LEN = 4;

// TODO(cais): Tune these parameters.
export const NO_CAPTURE_REWARD = 0.01;
export const CAPTURE_REWARD = 10;
export const DEATH_REWARD = -10;
export const WIN_REWARD = 300;
export const INVALID_MOVE_REWARD = -10;

// Move pieces from coords to coords
const ALL_CORDS = Array.from({ length: 8 }).flatMap((_, row) => {
  return Array.from({ length: 8 }).map((_, cell) => {
    return [row, cell];
  });
});

const ALL_MOVES = ALL_CORDS.flatMap(([row, cell]) => {
  return ALL_CORDS.filter(([r, c]) => r !== row && c !== cell).map(
    ([row2, cell2]) => {
      return [row, cell, row2, cell2];
    }
  );
});

export const ALL_ACTIONS = [
  ...ALL_MOVES,
  [0, 3, 128, 128], // prison 1
  [0, 4, 128, 129], // prison 3
  [7, 3, 128, 128], // prison 2
  [7, 4, 128, 129], // prison 4
];

export const NUM_ACTIONS = ALL_ACTIONS.length;

/**
 * Generate a random action among all possible actions.
 *
 * @return {0 | 1 | 2} Action represented as a number.
 */
export function getRandomAction() {
  return getRandomInteger(0, NUM_ACTIONS);
}

export class ChessGame {
  constructor(args: any) {
    if (args == null) {
      args = {};
    }
    if (args.height == null) {
      args.height = DEFAULT_HEIGHT;
    }
    if (args.width == null) {
      args.width = DEFAULT_WIDTH;
    }

    if (args.initLen == null) {
      args.initLen = DEFAULT_INIT_LEN;
    }

    assertPositiveInteger(args.height, "height");
    assertPositiveInteger(args.width, "width");
    assertPositiveInteger(args.initLen, "initLen");

    this.height_ = args.height;
    this.width_ = args.width;
    this.initLen_ = args.initLen;

    this.reset();
  }

  public height_: number;
  public width_: number;
  public initLen_: number;

  /**
   * Reset the state of the game.
   *
   * @return {object} Initial state of the game.
   *   See the documentation of `getState()` for details.
   */
  reset() {
    this.initializeChess();
    return this.getState();
  }

  /**
   * Perform a step of the game.
   *
   * @param {0 | 1 | 2 | 3} action The action to take in the current step.
   *   The meaning of the possible values:
   *     0 - left
   *     1 - top
   *     2 - right
   *     3 - bottom
   * @return {object} Object with the following keys:
   *   - `reward` {number} the reward value.
   *     - 0 if no fruit is eaten in this step
   *     - 1 if a fruit is eaten in this step
   *   - `state` New state of the game after the step.
   *   - `done` {boolean} whether the game has ended after this step.
   *     A game ends when the head of the snake goes off the board or goes
   *     over its own body.
   */
  public agentColor: string;
  step(action: any, agent_color: string) {
    this.agentColor = agent_color;
    // Calculate the coordinates of the new head and check whether it has
    // gone off the board, in which case the game will end.
    let done: boolean = false;
    let invalid = false;
    const [fromY, fromX, toY, toX] = ALL_ACTIONS[action];
    const prevTurns = this.board.turns.length;

    this.board.move(
      {
        x: fromX,
        y: fromY,
      },
      {
        x: toX,
        y: toY,
      }
    );

    done = this.board.isOver;

    if (this.board.isOver && this.board.winner !== agent_color) {
      return { reward: DEATH_REWARD, done, invalid };
    }

    if (this.board.isOver && this.board.winner === agent_color) {
      return { reward: WIN_REWARD, done, invalid };
    }

    if (prevTurns === this.board.turns.length) {
      invalid = true;
      return { reward: INVALID_MOVE_REWARD, done: true, invalid };
    }

    let reward = NO_CAPTURE_REWARD;
    if (this.board.turns[this.board.turns.length - 1].tookPiece) {
      const lastTurn = this.board.turns[this.board.turns.length - 1];
      if (lastTurn.toPiece instanceof King) {
        reward += CAPTURE_REWARD * 3;
      } else if (lastTurn.toPiece instanceof Queen) {
        reward += CAPTURE_REWARD * 3;
      } else {
        reward += CAPTURE_REWARD;
      }
    }

    const state = this.getState();
    return { reward, state, done, invalid };
  }

  public board: Board;

  initializeChess() {
    this.board = new Board();
  }

  get height() {
    return this.height_;
  }

  get width() {
    return this.width_;
  }

  /**
   * Get plain JavaScript representation of the game state.
   *
   * @return An object with two keys:
   *   - s: {Array<[number, number]>} representing the squares occupied by
   *        the snake. The array is ordered in such a way that the first
   *        element corresponds to the head of the snake and the last
   *        element corresponds to the tail.
   *   - f: {Array<[number, number]>} representing the squares occupied by
   *        the fruit(s).
   */
  getState(): any {
    return {
      p: this.board.pieces.map((piece) => {
        let i = piece.color === "black" ? -1 : 1;

        return [piece.position.y, piece.position.x, piece.value * i];
      }),
      c: this.agentColor,
      r: this.board.prisons.map((piece) => {
        if (piece) {
          let i = piece.color === "black" ? -1 : 1;

          return piece.value * i;
        }

        return 0;
      }),
    };
  }
}

/**
 * Get the current state of the game as an image tensor.
 *
 * @param {object | object[]} state The state object as returned by
 *   `SnakeGame.getState()`, consisting of two keys: `s` for the snake and
 *   `f` for the fruit(s). Can also be an array of such state objects.
 * @param {number} h Height.
 * @param {number} w With.
 * @return {tf.Tensor} A tensor of shape [numExamples, height, width, 2] and
 *   dtype 'float32'
 *   - The first channel uses 0-1-2 values to mark the snake.
 *     - 0 means an empty square.
 *     - 1 means the body of the snake.
 *     - 2 means the haed of the snake.
 *   - The second channel uses 0-1 values to mark the fruits.
 *   - `numExamples` is 1 if `state` argument is a single object or an
 *     array of a single object. Otherwise, it will be equal to the length
 *     of the state-object array.
 */

export function getStateTensor(state: any, h: number, w: number) {
  if (!Array.isArray(state)) {
    state = [state];
  }
  const numExamples = state.length;
  // TODO(cais): Maintain only a single buffer for efficiency.
  const buffer = tf.buffer([numExamples, h, w, 2]);

  for (let n = 0; n < numExamples; ++n) {
    if (state[n] == null) {
      continue;
    }
    // mark the pieces?
    state[n].p.forEach((yxp: any, i: number) => {
      buffer.set(1, n, yxp[0], yxp[1], yxp[2]);
    });
  }
  return buffer.toTensor();
}
