<script>
	import { fade } from 'svelte/transition';

	const colors = [
		'#f39696',
		'#fad1ac',
		'#d9ffbf',
		'#c8f7f8',
		'#f5d0ff',
		'#fff6ba',
		'#ffd1d1',
		'#abffd5'
	];

	const emojis = [
		'🐥',
		'🐠',
		'💪',
		'😅',
		'🥰',
		'😂',
		'😋',
		'🥳',
		'😰',
		'😴',
		'🥶',
		'😺',
		'👀',
		'👨‍🎓',
		'👩‍🚀',
		'👕',
		'🐛',
		'🐶',
		'🐭',
		'🦊',
		'🐼',
		'🐨',
		'🦅',
		'🦋',
		'🐔',
		'🪲',
		'🦄',
		'🐗',
		'🐞',
		'🐵'
	];

	let visible = true;
	let color = '#ccc';
	const handle = () => {
		visible = !visible;
	};

	const setColor = (_color) => {
		color = _color;
	};
</script>

<div class="relative">
	<button on:click={handle}> Avatar </button>
	{#if visible}
		<div class="menu">
			Select your color
			<div class="flex flex-wrap justify-evenly gap-2 mb-2">
				{#each colors as color}
					<div on:click={() => setColor(color)} class="emote" style:background={color} />
				{/each}
			</div>
			Select your avatar
			<div class="flex flex-wrap justify-evenly gap-2 mb-2">
				{#each emojis as emoji}
					<div class="emote" style:background={color}>
						{emoji}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.menu {
		@apply absolute rounded max-h-[500px] bg-slate-500 top-[50px] -translate-x-[40%] p-3 min-h-[400px] shadow-lg;
		position: absolute;
		min-width: 350px;
		overflow: auto;
	}

	.menu::after {
		@apply absolute;
		top: -20px;
		left: 50%;
		transform: translateX(-5px);
		content: '';
		border-bottom: 10px solid rgb(100, 116, 139);
		border-left: 10px solid transparent;
		border-right: 10px solid transparent;
		border-top: 10px solid transparent;
	}

	.emote {
		@apply cursor-pointer rounded-full p-4 h-[60px] w-[60px] items-center flex justify-center;
		font-size: 28px;
	}
</style>
