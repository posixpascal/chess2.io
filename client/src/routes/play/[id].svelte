<script>
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { joinRoom, subscribeRoom } from '../../stores/room';
	import ChessBoard from '../../elements/ChessBoard.svelte';
	import GameOverview from '../../elements/GameOverview.svelte';
	import { createGameStore } from '../../stores/game';
	import { rooms } from '../../stores/room';
	import Board from '../../../../lib/Board';
	import { socket } from '../../stores/room';

	let room;
	let board;
	let game;

	let player1;
	let player2;

	onMount(async () => {
		if ($rooms[$page.params.id]) {
			room = $rooms[$page.params.id];
			board = Board.fromServerState(room.board);
			game = createGameStore($page.params.id, board, room);
			player1 = room.player1;
			player2 = room.player2;
		} else {
			room = await joinRoom($page.params.id);
			board = Board.fromServerState(room.board);
			game = createGameStore($page.params.id, board, room);
			player1 = room.player1;
			player2 = room.player2;
		}

		await subscribeRoom(room, (change) => {
			player1 = change.player1;
			player2 = change.player2;
			room = change;
			board = Board.fromServerState(change.board);
			game.board.set(board);
		});
	});

	$: canMove = room && room.playerToMove === socket.id;
	$: flipBoard = room && room.playerWhite !== socket.id;
</script>

{#if room}
	<div class="p-10 flex flex-col items-center justify-center">
		<div class="flex gap-10 divide-amber-200 divide-x-2">
			<div class="text-left">
				<h2 class="mb-1 text-3xl flex items-center gap-2">
					<span class="text-gray-400 uppercase text-[20px]"> Room </span>
					<span class="font-mono  text-blue-300 uppercase text-[20px]">
						{room.id}
					</span>
				</h2>
				<p>
					<code>{`${window.location.protocol}//${window.location.host}/play/` + room.id}</code>
					Share this link to invite your friends.
				</p>
			</div>
			<div class="pl-10">
				{#each room.messages.reverse().slice(0, 5) as message}
					<div class="text-gray-600" transition:slide|local>
						{message}
					</div>
				{/each}
			</div>
		</div>
		{#if game}
			<div class:inactive-wrapper={!room.isReady}>
				{#if !room.isReady}
					<h2 class="text-center mt-20">Waiting for people to join...</h2>
				{/if}
				<div
					class:inactive={!room.isReady}
					class="transition-all ease-in-out duration-500 flex my-20 gap-10"
				>
					<ChessBoard flipped={flipBoard} {canMove} {game} board={game.board} />
					<GameOverview {player1} {player2} {game} board={game.board} />
				</div>
			</div>
		{:else}
			<div class="flex items-center justify-center my-20 flex-col">
				<h2>Setting up board...</h2>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex items-center justify-center my-20 flex-col">
		<h2>Connecting...</h2>
	</div>
{/if}

<style>
	p {
		@apply text-gray-400 uppercase text-sm;
	}

	code {
		@apply bg-slate-700 text-blue-300 p-2 px-3 rounded-xl my-2 flex;
		text-transform: none;
	}

	.inactive {
		@apply opacity-40;
	}
</style>
