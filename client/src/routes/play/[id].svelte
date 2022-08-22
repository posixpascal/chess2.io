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

	onMount(async () => {
		if ($rooms[$page.params.id]) {
			room = $rooms[$page.params.id];
			board = Board.fromServerState(room.board);
			game = createGameStore($page.params.id, board, room);
		} else {
			room = await joinRoom($page.params.id);
			board = Board.fromServerState(room.board);
			game = createGameStore($page.params.id, board, room);
		}

		await subscribeRoom(room, (change) => {
			room = change;
			board = Board.fromServerState(change.board);
			game.board.set(board);
		});
	});

	$: canMove = room && room.playerToMove === socket.id;
	$: flipped = room && room.playerWhite !== socket.id;
	$: player1 = room ? room.player1 : null;
	$: player2 = room ? room.player2 : null;
</script>

{#if room}
	<div class="p-10 flex flex-col items-center justify-center">
		<div class="flex flex-col md:flex-row gap-10 divide-amber-200 divide-y-2 md:divide-y-0 md:divide-x-2">
			<div class="text-center md:text-left">
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
			<div class="pt-10 md:pt-0 md:pl-10">
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
					<h2 class="text-center text-xl md:text-3xl mt-20">Waiting for people to join...</h2>
				{/if}

				<div
					class:inactive={!room.isReady}
					class="transition-all ease-in-out duration-500 flex flex-col md:flex-row my-20 gap-10"
				>
					<ChessBoard flipped={flipped} {canMove} {game} board={game.board} />
					<div class="hidden md:block">
						<GameOverview players={flipped ? [player1, player2] : [player2, player1]} {game} board={game.board} />
					</div>
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
