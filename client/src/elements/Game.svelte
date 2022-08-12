<script lang="ts">
	import { createGameStore } from '../stores/game';
	import ChessBoard from './ChessBoard.svelte';
	import GameOverview from './GameOverview.svelte';

	export let gameId: string;
	export let computer: boolean;

	const game = createGameStore(gameId, null, null, computer);
</script>

<div class="flex gap-10">
	<ChessBoard {game} board={game.board} />
	<GameOverview {game} board={game.board} />
</div>

<style>
</style>
