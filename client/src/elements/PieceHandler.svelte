<script lang="ts">
	import { Piece } from '../../../lib/pieces/Piece';
	import { mousePosition } from '~/stores/mouseposition';

	export let small;
	export let piece: Piece;
	export let selected;

	$: image = '/pieces/' + piece?.color + '/' + piece?.imageKey + '.png';
</script>

<div class:selected>
	<img src={image} width={small ? 28 : 58} height={small ? 28 : 58} />
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
	.clone {
		display: none;
	}

	.selected .clone {
		display: flex;
		transform: scale(0.9) translateX(-24px) translateY(-10px);
		opacity: 0.8;
		position: fixed;
		pointer-events: none;
	}
</style>
