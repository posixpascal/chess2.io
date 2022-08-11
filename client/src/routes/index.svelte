<script>
	import ChessBoard from '~/elements/ChessBoard.svelte';
	import Game from '../elements/Game.svelte';
</script>

<div class="container mx-auto text-center">
	<div class="p-10 flex flex-col items-center justify-center">
		<h2 class="mb-1">Play Chess2 in your browser</h2>
		<p>
			Chess2 by <a target="_blank" href="https://www.youtube.com/watch?v=mcivL8u176Y"
				>Oats Jenkins</a
			>. Play for free.
		</p>
		<div class="flex gap-5 my-8 mb-20">
			<button class="cta primary"> Play with Friends </button>
			<button class="cta"> Quickmatch </button>
		</div>
		<Game gameId="1234" />
	</div>

	<div class="mt-10 mb-20">
		<h2 class="mb-2">Rules & Gameplay</h2>
		<p>Instructions & gameplay mechanic within the video.</p>

		<div class="mt-5 flex justify-center">
			<iframe
				width="560"
				height="315"
				src="https://www.youtube-nocookie.com/embed/mcivL8u176Y"
				title="YouTube video player"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			/>
		</div>
	</div>

	<div class="mb-20">
		<h2 class="mb-2">Currently playing</h2>
		<p>View how other people play Chess 2. Live & in Realtime.</p>

		<!--        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-center flex-wrap gap-10 my-10 mx-auto">-->
		<!--            <div class="card">-->
		<!--                <ChessBoard small={1} />-->
		<!--                <h5>Game #12332</h5>-->
		<!--            </div>-->
		<!--            <div class="card">-->
		<!--                <ChessBoard small={1} />-->
		<!--                <h5>Game #12332</h5>-->
		<!--            </div>-->
		<!--            <div class="card">-->
		<!--                <ChessBoard small={1} />-->
		<!--                <h5>Game #12332</h5>-->
		<!--            </div>-->
		<!--            <div class="card">-->
		<!--                <ChessBoard small={1} />-->
		<!--                <h5>Game #12332</h5>-->
		<!--            </div>-->
		<!--            <div class="card">-->
		<!--                <ChessBoard small={1} />-->
		<!--                <h5>Game #12332</h5>-->
		<!--            </div>-->
		<!--        </div>-->
	</div>
</div>

<style>
	.card {
		@apply bg-slate-800 p-5 pt-10 rounded-xl hover:shadow-xl cursor-pointer;
	}
</style>
