<script>
	import '../app.css';
	import Footer from '~/elements/Footer.svelte';
</script>

<nav class="p-5 px-10 text-blue-300 flex items-center justify-between">
	<a href="/" class="flex gap-2">
		<img alt="" width="40px" class="object-contain" src="/pieces/other/Banana.png" />
		<h1>Chess2</h1>
	</a>

	<ul class="flex space-x-10 items-center">
		<li>
			<a href="/">
			🏠
			</a>
		</li>
		<li>
			<a href="//github.com/posixpascal/chess2.io"> 🐙 </a>
		</li>
	</ul>
</nav>
<div class="min-h-screen">
	<slot />
</div>
<audio data-key="move">
	<source src="/static/sounds/move.mp3" type="audio/mp3" />
	<source src="/static/sounds/move.oga" type="audio/ogg" />
</audio>
<audio data-key="capture">
	<source src="/static/sounds/capture.mp3" type="audio/mp3" />
	<source src="/static/sounds/capture.oga" type="audio/ogg" />
</audio>

<Footer />
