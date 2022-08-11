<script lang="ts">
	import { createGameStore } from '../stores/game';
	import ChessBoard from './ChessBoard.svelte';
	import GameOverview from './GameOverview.svelte';

	export let gameId: string;

	const game = createGameStore(gameId);
</script>

<div class="flex gap-10">
	<ChessBoard {game} board={game.board} />
	<GameOverview {game} board={game.board} />
</div>

<style>
	.board {
		@apply inline-flex justify-center flex-col items-center relative;
		--cell-black: #748bbd;
		--cell-white: #ecf4f7;
	}

	.row {
		@apply flex justify-center;
	}

	:global(.cell) {
		@apply flex items-center justify-center;
		height: 64px;
		width: 64px;
		box-shadow: 0 0 20px 5px rgba(0, 0, 0, 0.2);
		background: var(--cell-black);
	}

	.row:nth-child(odd) :global(.cell:nth-child(odd)) {
		background: var(--cell-white);
	}

	.row:nth-child(even) :global(.cell:nth-child(odd)) {
		background: var(--cell-black);
	}

	.row:nth-child(even) :global(.cell:nth-child(even)) {
		background: var(--cell-white);
	}

	/** ------------- */
	/** prison row 1 */
	.row.with-prison:nth-child(even) :global(.cell:nth-child(odd)) {
		background: var(--cell-white);
	}

	.row.with-prison:nth-child(even) :global(.cell:nth-child(even)) {
		background: var(--cell-black);
	}

	/** prison row 2 */
	.row.with-prison:nth-child(odd) :global(.cell:nth-child(odd)) {
		background: var(--cell-black);
	}

	.row.with-prison:nth-child(odd) :global(.cell:nth-child(even)) {
		background: var(--cell-white);
	}

	:global(.cell.prison.left) {
		border-right: 14px solid black;
	}

	:global(.cell.prison.right) {
		border-left: 14px solid black;
	}

	.small :global(.cell) {
		width: 36px;
		height: 36px;
	}

	.small :global(.cell.prison.right) {
		border-left-width: 3px;
	}

	.small :global(.cell.prison.left) {
		border-right-width: 3px;
	}
</style>
