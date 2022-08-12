<script lang="ts">
	import { Piece } from '../../../lib/pieces/Piece';
	import { mousePosition } from '~/stores/mouseposition';

	export let game;
	export let small;

	const selectBear = () => {
		if ($game.selectedDefaultBear) {
			return;
		}

		game.selectDefaultBear();
	};

	$: hasOtherPieceInHand = $game.selectedPiece;
	$: image = '/pieces/other/Bear.png';
</script>

<div
	class="bear"
	on:click={selectBear}
	class:pointer-events-none={hasOtherPieceInHand}
	class:selected={$game.selectedDefaultBear}
>
	<img alt={'piece'} src={image} width={small ? 28 : 64} height={small ? 28 : 64} />
</div>

<style>
	.bear {
		z-index: 10;
		position: absolute;
	}

	.bear.selected {
		@apply pointer-events-none;
	}

	.bear:not(.selected) {
		top: 50%;
		transform: translateY(-32px);
	}
</style>
