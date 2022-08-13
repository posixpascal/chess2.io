<script lang="ts">
	import { createGameStore } from '../stores/game';
	import ChessBoard from './ChessBoard.svelte';
	import GameOverview from './GameOverview.svelte';

	export let gameId: string;
	export let computer: boolean;

	const game = createGameStore(gameId, null, null, computer);
</script>

<div class="flex gap-10">
	<div>
		<ChessBoard {game} board={game.board} />
	</div>
	<GameOverview {game} board={game.board} />
</div>

<style>
</style>
