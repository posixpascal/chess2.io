// import Board from "./Board";
// import {King} from "./pieces/King";
// import {Queen} from "./pieces/Queen";
// import {Crow} from "./pieces/Crow";
// import {Monkey} from "./pieces/Monkey";
// import {Elephant} from "./pieces/Elephant";
// import {Fish} from "./pieces/Fish";
// import {searchBestMoves} from "./utils";
// import {ScoreSettings} from "./evaluation/ScoreSettings";
// import {listOrderedMoves} from "./evaluation/listOrderedMoves";
// import {scoreBoard} from "./evaluation/scoreBoard";
//
// export class ChessBot {
//     static #settings: any = {
//         Material: {
//             "King": 20000,
//             "Queen": 1200,
//             "Crow": 500,
//             "Monkey": 800,
//             "Elephant": 500,
//             "Fish": 100,
//         },
//         Mobility: {
//             "King": 900,
//             "Queen": 900,
//             "Crow": 1000,
//             "Monkey": 1000,
//             "Elephant": 300,
//             "Fish": 200,
//         },
//         PawnCenter: 40,
//         PawnCenterAttack: 10,
//         MinorCenter: 20,
//         QueenCenter: 30,
//         PieceCenterAttack: 10,
//         PieceOuterCenter: 10,
//         KingPrison: -1000,
//         QueenPrison: -1000
//     };
//
//
//     public color: string;
//
//     constructor(private board: Board) {
//         this.color = 'black'; // will change soon.
//     }
//
//     get ownPieces() {
//         return this.board.pieces.filter(p => {
//             return p.color === this.color
//         });
//     }
//
//     move() {
//         const copyBoard = Board.fromServerState(this.board.toServerState());
//         const best = searchBestMoves(
//             copyBoard,
//             2,
//             (board: Board) => listOrderedMoves(ChessBot.#settings, board),
//             (board: Board) => scoreBoard(board, ChessBot.#settings),
//         );
//         this.board.move(best.move.from, best.move.to);
//     }
//
//     performMove() {
//
//     }
// }
