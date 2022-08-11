import Board from '../../../lib/Board';
import { writable } from 'svelte/store';
import type { Piece } from '../../../lib/pieces/Piece';

export const avatar = writable({
	color: '#ccc',
	emoji: '🐵'
});
