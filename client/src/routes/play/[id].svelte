<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { joinRoom, subscribeRoom } from '../../stores/room';
	import ChessBoard from '../../elements/ChessBoard.svelte';
	import GameOverview from '../../elements/GameOverview.svelte';
	import { createGameStore } from '../../stores/game';
	import { rooms } from '../../stores/room';
	import Board from '../../../../lib/Board';

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
			console.log('room changed');
			board = Board.fromServerState(change.board);
			game.board.set(board);
		});
	});
</script>

{#if room}
	<div class="p-10 flex flex-col items-center justify-center">
		<div class="text-center">
			<h2 class="mb-1 font-mono text-3xl">Chess2@{room.id}</h2>
			<p>
				<code>{'http://localhost/play/' + room.id}</code>
				Invite your friend using this link.
			</p>
		</div>
		{#if game}
			<div class="flex my-20 gap-10">
				<ChessBoard {game} board={game.board} />
				<GameOverview {game} board={game.board} />
			</div>
		{:else}
			<div class="flex items-center justify-center my-20 flex-col">
				<h2>Setting up board...</h2>
				<iframe src="https://embed.lottiefiles.com/animation/97930" />
			</div>
		{/if}
	</div>
{:else}
	<div class="flex items-center justify-center my-20 flex-col">
		<h2>Connecting...</h2>
		<iframe src="https://embed.lottiefiles.com/animation/97930" />
	</div>
{/if}

<style>
	p {
		@apply text-gray-400 uppercase text-sm;
	}

	code {
		@apply bg-slate-700 text-blue-300 p-2 px-3 rounded-xl my-2 flex;
	}
</style>
