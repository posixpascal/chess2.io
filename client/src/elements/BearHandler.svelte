<script lang="ts">
	import { Piece } from '../../../lib/pieces/Piece';
	import { mousePosition } from '~/stores/mouseposition';

	export let game;
	export let small;
	export let selected;

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
	<img src={image} width={small ? 28 : 64} height={small ? 28 : 64} />
	<img
		class="clone"
		src={image}
		width={small ? 28 : 58}
		height={small ? 28 : 58}
		style="
            top: {$mousePosition ? $mousePosition.y : 0}px;
            left: {$mousePosition ? $mousePosition.x : 0}px;
        "
	/>
</div>

<style>
	.bear {
		position: absolute;
	}

	.bear.selected {
		@apply pointer-events-none;
	}

	.bear:not(.selected) {
		top: 50%;
		transform: translateY(-32px);
	}

	.clone {
		display: none;
	}

	.selected .clone {
		display: flex;
		transform: scale(0.9) translateX(-24px);
		opacity: 0.8;
		position: fixed;
		pointer-events: none;
	}
</style>
