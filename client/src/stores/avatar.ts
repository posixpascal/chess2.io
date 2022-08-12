import Board from '../../../lib/Board';
import { writable } from 'svelte/store';
import type { Piece } from '../../../lib/pieces/Piece';
import { socket } from './room';
import { UPDATE_AVATAR } from '../../../shared/events';

export const avatar = writable({
	color: localStorage.color || '#ccc',
	emoji: localStorage.emoji || '🐵'
});

avatar.subscribe(({ color, emoji }) => {
	localStorage.setItem('color', color);
	localStorage.setItem('emoji', emoji);
	socket.emit(UPDATE_AVATAR, {
		color,
		emoji
	});
});

socket.emit(UPDATE_AVATAR, {
	color: localStorage.color || '#ccc',
	emoji: parseInt(localStorage.emoji, 10) || 1
});
