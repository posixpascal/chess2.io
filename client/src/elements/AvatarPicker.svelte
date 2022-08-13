<script lang="ts">
	import { avatar } from '~/stores/avatar';
	import { colors, emojis } from '../../../shared/avatars.js';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let color = '#ccc';
	const handle = () => {
		dispatch('message', 'close');
	};

	const setColor = (color) => {
		avatar.set({
			color: color,
			emoji: $avatar.emoji
		});
	};

	const changeEmoji = (emoji) => {
		console.log(emoji);
		avatar.set({
			color: $avatar.color,
			emoji: emojis.findIndex((e) => e === emoji)
		});
	};

	$: selectedEmoji = $avatar.emoji;
</script>

<div class="relative">
	<div on:click={handle} class="avatar" style:background={$avatar.color}>
		{$avatar.emoji}
	</div>
</div>

<div class="z-20 backdrop backdrop-blur fixed w-full h-full left-0 top-0" on:click={handle}>
	<div
		on:click={handle}
		class="close absolute top-[18px] right-[38px] cursor-pointer text-[50px] text-blue-200"
	>
		&cross;
	</div>
	<div class="menu" on:click|stopPropagation={() => {}}>
		<div class="menu-inner">
			<h3>Select your color</h3>
			<div class="flex flex-wrap justify-evenly gap-2 mb-2">
				{#each colors as color}
					<div
						class:selected={$avatar.color === color}
						on:click|stopPropagation={() => setColor(color)}
						class="emote"
						style:background={color}
					/>
				{/each}
			</div>

			<h3>Select your avatar</h3>
			<div class="flex flex-wrap justify-evenly gap-2 mb-2">
				{#each emojis as emoji, i}
					<div
						class:selected={$avatar.emoji === i}
						on:click|stopPropagation={() => changeEmoji(emoji)}
						class="emote"
						style:background={$avatar.color}
					>
						{emoji}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.menu {
		@apply z-[50] fixed rounded max-h-[500px] bg-slate-500 inset-0  max-w-[350px] shadow-lg;
		top: 50%;
		left: 50%;
		transform: translateX(-50%) translateY(-50%);
	}

	.menu-inner {
		overflow: auto;
		@apply max-h-[442px] w-full p-3;
	}

	.emote {
		@apply cursor-pointer rounded-full p-4 h-[60px] w-[60px] items-center flex justify-center;
		font-size: 28px;
	}

	.avatar {
		@apply cursor-pointer rounded-full p-4 h-[48px] w-[48px] items-center flex justify-center;
		font-size: 28px;
	}

	.selected {
		outline: 3px solid #edf0f8;
	}

	.close {
		background: #555;
		height: 50px;
		font-size: 24px;
		display: flex;
		align-items: center;
		width: 50px;
		justify-content: center;
		border-radius: 50%;
	}

	h3 {
		@apply text-lg mb-3 text-center mt-4 text-gray-100;
	}
</style>
