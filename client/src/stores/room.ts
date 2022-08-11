import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { io } from 'socket.io-client';
import type { Room } from '../../../shared/types';
import * as events from '../../../shared/events';

export const rooms: Writable<Record<string, Room>> = writable({});

export const socket = io('http://localhost:3000');

export const createRoom = async () => {
	return new Promise((resolve) => {
		socket.once(events.ROOM_CREATED, (data) => {
			console.log(data);
			rooms.update((r) => {
				r[data.id] = data;
				return r;
			});
			resolve(data);
		});
		socket.emit(events.ROOM_CREATE);
	});
};

export const subscribeRoom = async (room, callback) => {
	socket.on(events.BOARD_UPDATED, (data) => {
		if (data.id === room.id) {
			console.log('changed', data, room);
			callback(data);
		}
	});
};

export const joinRoom = async (id: string) => {
	return new Promise((resolve) => {
		socket.once(events.ROOM_JOINED, (data) => {
			console.log('join', data);
			rooms.update((r) => {
				r[data.id] = data;
				return r;
			});
			resolve(data);
		});

		socket.emit(events.ROOM_JOIN, id);
	});
};
