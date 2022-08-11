import * as tf from "@tensorflow/tfjs";

import { createDeepQNetwork } from "./dqn";
import { ReplayMemory } from "./replay_memory";
import { assertPositiveInteger } from "./utils";
import {
  ALL_ACTIONS,
  ChessGame,
  getRandomAction,
  getStateTensor,
  NUM_ACTIONS,
} from "./game";
import { King } from "../lib/pieces/King";
import { Queen } from "../lib/pieces/Queen";
import { Fish } from "../lib/pieces/Fish";
import { Monkey } from "../lib/pieces/Monkey";
import { Crow } from "../lib/pieces/Crow";
import { Elephant } from "../lib/pieces/Elephant";

export class Agent {
  public frameCount = 0;
  public replayMemory: ReplayMemory;
  public replayBufferSize: number;
  public optimizer: tf.AdamOptimizer;
  public game: ChessGame;
  public targetNetwork: any;
  public onlineNetwork: any;
  public epsilon: number;
  public epsilonInit: number;
  public epsilonFinal: number;
  public epsilonDecayFrames: number;
  public epsilonIncrement_: number;
  public cumulativeReward_ = 0;
  /**
   * Constructor of .
   *
   * @param {Board} game A game object.
   * @param {object} config The configuration object with the following keys:
   *   - `replayBufferSize` {number} Size of the replay memory. Must be a
   *     positive integer.
   *   - `epsilonInit` {number} Initial value of epsilon (for the epsilon-
   *     greedy algorithm). Must be >= 0 and <= 1.
   *   - `epsilonFinal` {number} The final value of epsilon. Must be >= 0 and
   *     <= 1.
   *   - `epsilonDecayFrames` {number} The # of frames over which the value of
   *     `epsilon` decreases from `episloInit` to `epsilonFinal`, via a linear
   *     schedule.
   *   - `learningRate` {number} The learning rate to use during training.
   */
  constructor(game: ChessGame, config: Record<string, any>) {
    assertPositiveInteger(config.epsilonDecayFrames);

    this.game = game;

    this.epsilonInit = config.epsilonInit;
    this.epsilonFinal = config.epsilonFinal;
    this.epsilonDecayFrames = config.epsilonDecayFrames;
    this.epsilonIncrement_ =
      (this.epsilonFinal - this.epsilonInit) / this.epsilonDecayFrames;

    this.optimizer = tf.train.adam(config.learningRate);

    this.replayBufferSize = config.replayBufferSize;
    this.replayMemory = new ReplayMemory(config.replayBufferSize);
    this.frameCount = 0;
    this.reset();
  }
  async setupNetwork() {
    this.onlineNetwork = await createDeepQNetwork(
      this.game.height,
      this.game.width,
      NUM_ACTIONS
    );
    this.targetNetwork = await createDeepQNetwork(
      this.game.height,
      this.game.width,
      NUM_ACTIONS
    );

    // Freeze taget network: it's weights are updated only through copying from
    // the online network.
    this.targetNetwork.trainable = false;
  }

  public color: string;
  reset() {
    this.cumulativeReward_ = 0;
    this.game.reset();
    this.color = Math.random() > 0.5 ? "white" : "black";
  }

  /**
   * Play one step of the game.
   *
   * @returns {number | null} If this step leads to the end of the game,
   *   the total reward from the game as a plain number. Else, `null`.
   */
  makeEnemyMove() {
    let action;
    const state = this.game.getState();
    if (Math.random() < this.epsilon) {
      // Pick an action at random.
      action = getRandomAction();
    } else {
      // Greedily pick an action based on online DQN output.
      tf.tidy(() => {
        const stateTensor = getStateTensor(
          state,
          this.game.height,
          this.game.width
        );
        action = (this.onlineNetwork.predict(stateTensor) as any)
          .argMax(-1)
          .dataSync()[0];
      });
    }

    let result = this.game.step(action, this.color);
    while (result.invalid) {
      if (Math.random() < this.epsilon) {
        // Pick an action at random.
        action = getRandomAction();
      } else {
        // Greedily pick an action based on online DQN output.
        tf.tidy(() => {
          const stateTensor = getStateTensor(
            state,
            this.game.height,
            this.game.width
          );
          action = (this.onlineNetwork.predict(stateTensor) as any)
            .argMax(-1)
            .dataSync()[0];
        });
      }
      result = this.game.step(action, this.color);
    }
  }

  playStep() {
    this.epsilon =
      this.frameCount >= this.epsilonDecayFrames
        ? this.epsilonFinal
        : this.epsilonInit + this.epsilonIncrement_ * this.frameCount;
    this.frameCount++;

    if (this.color !== this.game.board.playerToMove) {
      this.makeEnemyMove();
    }

    // The epsilon-greedy algorithm.
    let action;
    const state = this.game.getState();
    if (Math.random() < this.epsilon) {
      // Pick an action at random.
      action = getRandomAction();
    } else {
      // Greedily pick an action based on online DQN output.
      tf.tidy(() => {
        const stateTensor = getStateTensor(
          state,
          this.game.height,
          this.game.width
        );
        action = (this.onlineNetwork.predict(stateTensor) as any)
          .argMax(-1)
          .dataSync()[0];
      });
    }

    const {
      state: nextState,
      reward,
      done,
    } = this.game.step(action, this.color);
    this.replayMemory.append([state, action, reward, done, nextState]);

    this.cumulativeReward_ += reward;

    const output = {
      action,
      cumulativeReward: this.cumulativeReward_,
      done: done,
    };

    this.logBoard();

    if (done) {
      this.reset();
    }

    return output;
  }

  logBoard() {
    console.clear();
    const board = this.game.board;
    let cellCount = 0;
    const field = board.field.map((row, index) => {
      return row.map((c) => {
        cellCount += 1;
        if (!c) {
          return cellCount % 2 !== index % 2 ? "⬜️" : "⬛️";
        }
        if (c instanceof King) {
          return c.color === "white" ? "🤴" : "☕️";
        }
        if (c instanceof Queen) {
          return c.color === "white" ? "👸" : "🐝";
        }
        if (c instanceof Fish) {
          return c.color === "white" ? "🐠" : "🐟";
        }
        if (c instanceof Monkey) {
          return c.color === "white" ? "🙉" : "🙈";
        }
        if (c instanceof Crow) {
          return c.color === "white" ? "🐥" : "🐣";
        }
        if (c instanceof Elephant) {
          return c.color === "white" ? "🐘" : "🐴";
        }

        return c.value;
      });
    });

    field.map((row) => {
      console.log(row.join(" "));
    });

    console.log(
      "#" + board.turns.length,
      "Over: ",
      board.isOver,
      "Color",
      this.color,
      "Winner: ",
      board.winner
    );
    console.log("Cumulative Reward", this.cumulativeReward_);
    console.log("Frames", this.frameCount, "E: ", this.epsilon);
  }

  /**
   * Perform training on a randomly sampled batch from the replay buffer.
   *
   * @param {number} batchSize Batch size.
   * @param {number} gamma Reward discount rate. Must be >= 0 and <= 1.
   * @param {tf.train.Optimizer} optimizer The optimizer object used to update
   *   the weights of the online network.
   */
  trainOnReplayBatch(
    batchSize: number,
    gamma: number,
    optimizer: tf.Optimizer
  ) {
    //https://github.com/deepmind/open_spiel/blob/master/open_spiel/python/algorithms/dqn.py#L319
    const batch = this.replayMemory.sample(batchSize);
    const lossFunction = () =>
      tf.tidy(() => {
        const stateTensor = getStateTensor(
          batch.map((example) => example[0]),
          this.game.height,
          this.game.width
        );
        const actionTensor = tf.tensor1d(
          batch.map((example) => example[1]),
          "int32"
        );
        const qs = this.onlineNetwork
          .apply(stateTensor, { training: true })
          .mul(tf.oneHot(actionTensor, NUM_ACTIONS))
          .sum(-1);

        const rewardTensor = tf.tensor1d(batch.map((example) => example[2]));
        const nextStateTensor = getStateTensor(
          batch.map((example) => example[4]),
          this.game.height,
          this.game.width
        );
        const nextMaxQTensor = (
          this.targetNetwork.predict(nextStateTensor) as any
        ).max(-1);
        const doneMask = tf
          .scalar(1)
          .sub(
            tf.tensor1d(batch.map((example) => example[3])).asType("float32")
          );
        const targetQs = rewardTensor.add(
          nextMaxQTensor.mul(doneMask).mul(gamma)
        );
        return tf.losses.meanSquaredError(targetQs, qs);
      });

    // Calculate the gradients of the loss function with repsect to the weights
    // of the online DQN.
    const grads = tf.variableGrads(lossFunction as any);
    // Use the gradients to update the online DQN's weights.
    optimizer.applyGradients(grads.grads);
    tf.dispose(grads);
    // TODO(cais): Return the loss value here?
  }
}
