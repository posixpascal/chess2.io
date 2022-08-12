<script lang="ts">
	import { Piece } from '../../../lib/pieces/Piece';
	import PieceHandler from './PieceHandler.svelte';
	import { onMount } from 'svelte';
	import type { GameStore } from '../stores/game';

	export let piece!: Piece;
	export let small: boolean = false;
	//export let board;
	export let game: GameStore;
	export let board;
	export let position;
	export let canMove;

	let movable = false;

	const selectPiece = () => {
		if (!canMove) {
			return;
		}

		if ($game.selectedDefaultBear) {
			return game.moveBear(position);
		}

		if ($game.selectedPiece) {
			return game.moveSelectedPiece(position);
		}

		if (piece.color !== 'other' && piece.color !== $board.playerToMove) {
			return;
		}

		game.selectPiece(piece);
	};

	game.subscribe((n) => {
		// Deactivate fields
		if (!$game.selectedPiece) {
			movable = false;
			return;
		}

		// Highlight movable/clickable fields.
		movable = !!$game.selectedPiece.possibleMoves.find((pos) => {
			return pos.x === position.x && pos.y === position.y;
		});
	});

	// $state.selectedPiece && ($state.selectedPiece.y === rowIndex && $state.selectedPiece.x === cellIndex)
	$: previousTurn = $board.turns[$board.turns.length - 1];
	$: moving = $game.selectedPiece && $game.selectedPiece.at(piece.position);
	$: selectedBear =
		$game.selectedDefaultBear &&
		(position.x === 3 || position.x === 4) &&
		(position.y === 3 || position.y === 4) &&
		!piece;
</script>

<div
	class="cell"
	class:moving
	class:piece
	class:fromPieceMove={previousTurn &&
		previousTurn.from &&
		previousTurn.from.y === position.y &&
		previousTurn.from.x === position.x}
	class:toPieceMove={previousTurn &&
		previousTurn.to &&
		previousTurn.to.y === position.y &&
		previousTurn.to.x === position.x}
	class:movable={movable || selectedBear}
	on:click={() => selectPiece()}
>
	{#if piece}
		<div>
			<PieceHandler {piece} selected={moving} {small} />
		</div>
	{:else}
		<!-- blanko field -->
	{/if}
</div>

<style>
	.cell.movable.movable {
		background: #e1fabd !important;
	}

	.cell.movable.movable:hover {
		@apply cursor-pointer;
		background: #a8cc82 !important;
	}

	.cell.movable.piece {
		background: #c74343 !important;
	}

	.cell.moving {
		background: #fcd34d !important;
	}

	.cell.fromPieceMove {
		background: #ffecb0 !important;
	}

	.cell.toPieceMove {
		background: #fcd34d !important;
	}
</style>
