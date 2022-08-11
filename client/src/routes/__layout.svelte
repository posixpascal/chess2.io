<script>
	import '../app.css';
	import Footer from '~/elements/Footer.svelte';
	import AvatarPicker from '../elements/AvatarPicker.svelte';
</script>

<svelte:head>
	<script async="false" src="http://localhost:3000/socket.io/socket.io.js"></script>
</svelte:head>
<nav class="p-5 px-10 bg-slate-800 text-blue-300 shadow-lg flex justify-between">
	<a href="/" class="flex gap-2">
		<img width="40px" class="object-contain" src="/pieces/other/Banana.png" />
		<h1>Chess2</h1>
	</a>

	<ul class="flex space-x-10">
		<AvatarPicker />
		<li>
			<a href="/create"> Play vs Friends </a>
		</li>
		<li>
			<a href="/ai"> Play vs Computer </a>
		</li>
		<li>
			<a href="//github.com/posixpascal/chess2"> GitHub </a>
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
