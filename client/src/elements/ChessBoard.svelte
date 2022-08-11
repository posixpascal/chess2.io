<script lang="ts">
	import PieceHandler from '~/elements/PieceHandler.svelte';
	import Cell from './Cell.svelte';
	import { mousePosition } from '~/stores/mouseposition';
	import BearHandler from './BearHandler.svelte';

	export let small = false;
	export let game: any;
	export let board: any;

	$: selectablePrisonCell = $game.selectedPiece && $game.selectedPiece.selectablePrisonCell;

	const updateMousePosition = (event: MouseEvent) => {
		mousePosition.update((n) => ({
			x: event.clientX,
			y: event.clientY
		}));
	};

	const selectPrisonCell = () => {
		if (!$game.selectedPiece || selectablePrisonCell < 0) {
			return;
		}
		game.selectPrisonCell(selectablePrisonCell);
	};
</script>

<div class="board" on:mousemove={updateMousePosition} class:small>
	{#if $board.isOver}
		<div class="gameover">
			<h2>
				GAME OVER<br />
				{$board.winner} wins<br />
			</h2>
			<button class="cta">Quickmatch</button>
		</div>
	{/if}
	{#if $board.hasDefaultBear}
		<BearHandler {game} />
	{/if}
	<div class="inner">
		{#each $board.field as row, rowIndex (rowIndex)}
			<div class="row" class:with-prison={rowIndex === 3 || rowIndex === 4}>
				{#if rowIndex === 3 || rowIndex === 4}
					<div
						on:click={() => selectPrisonCell()}
						class="cell prison left"
						class:movable={selectablePrisonCell === 2 + rowIndex - 3}
					>
						{#if $board.prisons[2 + rowIndex - 3]}
							<PieceHandler {board} {small} piece={$board.prisons[2 + rowIndex - 3]} />
						{/if}
					</div>
				{/if}
				{#each row as piece, cellIndex (cellIndex)}
					<Cell {small} {piece} position={{ y: rowIndex, x: cellIndex }} {game} {board} />
				{/each}
				{#if rowIndex === 3 || rowIndex === 4}
					<div
						on:click={() => selectPrisonCell()}
						class="cell prison right"
						class:movable={selectablePrisonCell === rowIndex - 3}
					>
						{#if $board.prisons[rowIndex - 3]}
							<PieceHandler {small} piece={$board.prisons[rowIndex - 3]} />
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.gameover {
		position: absolute;
		inset: 0;
		gap: 10px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: rgba(0, 0, 0, 0.5);
	}
	.gameover h2 {
		@apply uppercase;
		line-height: 60px;
		font-size: 64px;
		width: 100%;
		z-index: 10;
		font-weight: bold;
		color: #fff;
		text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.3);
	}
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

	.cell.movable {
		background: lightsalmon !important;
	}
</style>
