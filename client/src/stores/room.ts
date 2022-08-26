import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { io } from 'socket.io-client';
import type { Room } from '../../../shared/types';
import * as events from '../../../shared/events';

export const rooms: Writable<Record<string, Room>> = writable({});

//export const socket = io(`${window.location.protocol}//${window.location.host}`);
export const socket = io(`${window.location.protocol}//${window.location.hostname}:3000`);


export const SOUNDS = {
	capture: new Audio('/sounds/capture.mp3'),
	move: new Audio('/sounds/move.mp3'),
	prisoner: new Audio('/sounds/prisoner.mp3'),
	release: new Audio('/sounds/release.mp3'),
	dropped: new Audio('/sounds/dropped.mp3'),
	victory: new Audio('/sounds/victory.mp3'),
	defeat: new Audio('/sounds/defeat.mp3')
};

export const createRoom = async () => {
	return new Promise((resolve) => {
		socket.once(events.ROOM_CREATED, (data) => {
			rooms.update((r) => {
				r[data.id] = data;
				return r;
			});
			resolve(data);
		});
		socket.emit(events.ROOM_CREATE);
	});
};

export const subscribeRoom = async (room: any, callback: (data: any) => {}) => {
	socket.on(events.ROOM_UPDATED, (data) => {
		if (data.id === room.id) {
			callback(data);
		}
	});

	socket.on(events.PLAY_SOUND, (data: any) => {
		(SOUNDS as any)[data].play();
	});
};

export const play = (name: string) => {
	return (SOUNDS as any)[name].play();
}

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
