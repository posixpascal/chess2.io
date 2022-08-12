<script lang="ts">
	import { Piece } from '../../../lib/pieces/Piece';
	import { mousePosition } from '~/stores/mouseposition';

	export let small;
	export let piece: Piece;
	export let selected;

	$: image = '/pieces/' + piece?.color + '/' + piece?.imageKey + '.png';
</script>

<div class:selected>
	<img alt="" src={image} width={small ? 28 : 58} height={small ? 28 : 58} />
</div>
