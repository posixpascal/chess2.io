<script lang="ts">
	import PieceHandler from '~/elements/PieceHandler.svelte';
	import Cell from './Cell.svelte';
	import { mousePosition } from '~/stores/mouseposition';
	import BearHandler from './BearHandler.svelte';

	export let small = false;
	export let game: any;
	export let board: any;
	export let flipped: any;
	export let canMove = true;

	$: selectablePrisonCell = $game.selectedPiece && $game.selectedPiece.selectablePrisonCell;

	const updateMousePosition = (event: MouseEvent) => {
		mousePosition.update((n) => ({
			x: event.clientX,
			y: event.clientY
		}));
	};

	const selectPrisonCell = () => {
		if (!canMove) {
			return;
		}

		if (!$game.selectedPiece || selectablePrisonCell < 0) {
			return;
		}

		game.selectPrisonCell(selectablePrisonCell);
	};

	const rematch = () => {
		game.rematch();
	};

	$: pieceImage = $game.selectedPiece
		? '/pieces/' + $game.selectedPiece.color + '/' + $game.selectedPiece.imageKey + '.png'
		: null;
	$: bearImage = $game.selectedDefaultBear ? '/pieces/other/Bear.png' : null;
</script>

{#if pieceImage || bearImage}
	<img
		alt=""
		class="clone"
		src={pieceImage || bearImage}
		width={small ? 28 : 58}
		height={small ? 28 : 58}
		style="
            top: {$mousePosition ? $mousePosition.y : 0}px;
            left: {$mousePosition ? $mousePosition.x : 0}px;
        "
	/>
{/if}

<div class="board" class:flipped on:mousemove={updateMousePosition} class:small>
	{#if $board.isOver}
		<div class="gameover">
			<h2 class="text-center">
				GAME OVER<br />
				{$board.winner} wins<br />
			</h2>
			<button class="cta" on:click={rematch}>Rematch</button>
		</div>
	{/if}
	{#if $board.hasDefaultBear}
		<BearHandler {game} {canMove} />
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
							<PieceHandler {canMove} {board} {small} piece={$board.prisons[2 + rowIndex - 3]} />
						{/if}
					</div>
				{/if}
				{#each row as piece, cellIndex (cellIndex)}
					<Cell {canMove} {small} {piece} position={{ y: rowIndex, x: cellIndex }} {game} {board} />
				{/each}
				{#if rowIndex === 3 || rowIndex === 4}
					<div
						on:click={() => selectPrisonCell()}
						class="cell prison right"
						class:movable={selectablePrisonCell === rowIndex - 3}
					>
						{#if $board.prisons[rowIndex - 3]}
							<PieceHandler {canMove} {small} piece={$board.prisons[rowIndex - 3]} />
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	@media (max-width: 760px){
		.board {
			transform: scale(0.8);
		}
	}

	@media (max-width: 480px){
		.board {
			transform: scale(0.7);
		}
	}

	@media (max-width: 420px){
		.board {
			transform: scale(0.61);
		}
	}
	.clone {
		z-index: 20;
		display: flex;
		transform: scale(0.9) translateX(-24px) translateY(-10px);
		opacity: 0.8;
		position: fixed;
		pointer-events: none;
	}

	.board.flipped :global(.bear) {
		transform: scaleY(-1) translateY(30px);
	}

	.board.flipped {
		transform: scaleY(-1);
	}

	.board.flipped .row {
		transform: scaleY(-1);
	}

	.board.flipped .gameover {
		transform: scaleY(-1);
	}

	.gameover {
		position: absolute;
		inset: 0;
		gap: 10px;
		z-index: 20;
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
