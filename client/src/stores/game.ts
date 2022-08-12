import Board from '../../../lib/Board';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import type { Piece } from '../../../lib/pieces/Piece';
import type { BoardPosition } from '../../../lib/types';
import type { Socket } from 'socket.io-client';
import { BEAR_MOVE, REMATCH, RELEASE_PRISONER_MOVE, PIECE_MOVE } from '../../../shared/events';
import { socket } from './room';

export interface GameState {
	id: string;
	mouse: { x: number; y: number };
	selectedPiece: null | Piece;
	selectedDefaultBear: boolean;
	board: any;
}

interface Room {
	id: string;
}

export interface GameStore extends Writable<GameState> {
	board: Writable<Board>;
	updateMousePosition: (event: MouseEvent) => void;
	selectDefaultBear: (piece: Piece) => void;
	selectPiece: (piece: Piece) => void;
	selectPrisonCell: (cell: number) => void;
	moveBear: (toPosition: BoardPosition) => void;
	moveSelectedPiece: (toPosition: BoardPosition) => void;
	rematch: () => void;
}

export const createGameStore = (
	gameId: string,
	managedBoard = null,
	room: Room | null = null,
	computer: boolean = false
): GameStore => {
	const board = writable(managedBoard ? managedBoard : new Board(computer));

	const game = writable<GameState>({
		id: gameId,
		mouse: { x: 0, y: 0 },
		selectedPiece: null,
		board,
		selectedDefaultBear: false
	});

	return {
		...game,
		board,
		updateMousePosition: (event: MouseEvent) => {
			return game.update((n) => ({
				...n,
				mouse: {
					x: event.clientX,
					y: event.clientY
				}
			}));
		},
		moveSelectedPiece: (toPosition: BoardPosition) => {
			game.update((g) => {
				if (!g.selectedPiece) {
					return g;
				}

				// Perform the move internally.
				if (room) {
					socket.emit(PIECE_MOVE, {
						roomId: room.id,
						from: g.selectedPiece!.position,
						to: toPosition
					});
				} else {
					// local
					g.board.update((board: Board) => {
						return board.move(g.selectedPiece!.position, toPosition);
					});
				}

				return { ...g, selectedPiece: null };
			});
		},
		rematch: () => {
			game.update((g) => {
				if (room) {
					socket.emit(REMATCH, {
						roomId: room.id
					});
				} else {
				}

				return { ...g };
			});
		},
		selectPrisonCell: (cellIndex) => {
			game.update((g) => {
				if (room) {
					socket.emit(RELEASE_PRISONER_MOVE, {
						roomId: room.id,
						position: g.selectedPiece!.position,
						cellIndex
					});
				} else {
					g.board.update((board: Board) => {
						return board.releasePrisoner(g.selectedPiece!.position, cellIndex);
					});
				}

				return { ...g, selectedPiece: null };
			});
		},
		selectDefaultBear: () =>
			game.update((n) => {
				return {
					...n,
					selectedDefaultBear: true,
					selectedPiece: null
				};
			}),
		moveBear: (pos: BoardPosition) =>
			game.update((g) => {
				if (room) {
					socket.emit(BEAR_MOVE, {
						roomId: room.id,
						to: pos
					});
				} else {
					g.board.update((board: Board) => {
						return board.moveBear(pos);
					});
				}
				return { ...g, selectedPiece: null, selectedDefaultBear: false };
			}),

		selectPiece: (piece: Piece) =>
			game.update((n) => {
				if (n.selectedPiece && n.selectedPiece.at(piece.position)) {
					return {
						...n,
						selectedPiece: null
					};
				}

				return {
					...n,
					selectedPiece: piece,
					selectedDefaultBear: false
				};
			})
	};
};
