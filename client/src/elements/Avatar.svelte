<script lang="ts">
	import { emojis } from '../../../shared/avatars.js';

	export let avatar;
</script>

<div class="relative">
	<div class="avatar" style:background={avatar ? avatar.color : '#ccc'}>
		{emojis[avatar ? avatar.emoji : 0]}
	</div>
</div>

<style>
	.avatar {
		@apply cursor-pointer rounded-full p-4 h-[48px] w-[48px] items-center flex justify-center;
		font-size: 28px;
	}
</style>
