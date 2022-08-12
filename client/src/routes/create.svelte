<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/env';
	import { createRoom } from '../stores/room';
	async function connect() {
		const room = await createRoom();
		await goto('/play/' + room.id);
	}

	onMount(() => {
		if (browser) connect();
	});
</script>

<div class="flex items-center justify-center my-20 flex-col">
	<h2>Creating Lobby...</h2>
</div>
