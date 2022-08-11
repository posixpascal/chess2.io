import Board from '../../../lib/Board';
import { writable } from 'svelte/store';
import type { Piece } from '../../../lib/pieces/Piece';

export const mousePosition = writable({
	x: 0,
	y: 0
});
