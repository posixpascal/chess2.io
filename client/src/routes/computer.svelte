<script>
	import ChessBoard from '~/elements/ChessBoard.svelte';
	import Game from '../elements/Game.svelte';
</script>

<div class="container mx-auto text-center">
	<div class="p-10 flex flex-col items-center justify-center">
		<h2 class="mb-1">Computer</h2>
		<p>Play the machine</p>
		<div class="mt-10">
			<Game computer={true} gameId="1234" />
		</div>
	</div>
</div>

<style>
</style>
