<script lang="ts">

    export let board;
    export let players;
    export let flipped;

    const letters = 'ABCDEFGH';
    $: player1 = players ? players[1] : false;
    $: player2 = players ? players[0] : false;
</script>

<div class="card">
    <div class:active-turn={player2 ? player2.hasTurn : $board.playerToMove === 'black'}
         class="player-black flex items-center gap-5 text-blue-300 text-left player ">
        Player 2
    </div>
    <div class="game-log">
        <div class="overflow-auto max-w-[375px] flex-wrap flex max-h-[450px]">
            {#each $board.turns as turn, i}
                <div class="turn" class:odd={i % 2 !== 0}>
                    <span class="turn-no">#{turn.no}</span>
                    {#if turn.isBear}
                        <img alt="" height="24px" width="24px" src={'/pieces/other/Bear.png'}/>
                        {letters[turn.to.x]}{8 - turn.to.y}
                    {/if}
                    {#if turn.fromPiece}
                        <img
                                alt=""
                                height="24px"
                                width="24px"
                                src={'/pieces/' + turn.fromPiece.color + '/' + turn.fromPiece.imageKey + '.png'}
                        />
                    {/if}
                    {#if turn.tookPiece}
                        {letters[turn.from.x]}{8 - turn.from.y} x {letters[turn.to.x]}{8 - turn.to.y}
                        {#if turn.toPiece}
                            <img
                                    alt=""
                                    height="24px"
                                    width="24px"
                                    src={'/pieces/' + turn.toPiece.color + '/' + turn.toPiece.imageKey + '.png'}
                            />
                        {/if}
                    {:else if turn.from}
                        {letters[turn.from.x]}{8 - turn.from.y}...{letters[turn.to.x]}{8 - turn.to.y}
                    {/if}

                    {#if turn.droppedKing}
                        (King dropped)
                    {/if}

                    {#if turn.rescuedKing}
                        (King rescued)
                    {/if}
                </div>
            {/each}
        </div>
    </div>
    <div class:active-turn={player1 ? player1.hasTurn : $board.playerToMove === 'white'}
         class="player player-white flex-row-reverse flex items-center gap-5 text-right">
        Player 1
    </div>
</div>

<style>
    .card {
        @apply flex flex-col bg-slate-700 rounded;
        min-width: 400px;
    }

    .game-log {
        @apply bg-slate-800 text-left p-3 flex-grow overflow-auto;
    }

    .player {
        @apply p-4 px-5;
    }

    .turn {
        @apply flex items-center mr-3;
        font-size: 16px;
    }

    .turn.odd {
        @apply text-blue-300;
    }

    .turn img {
        width: 28px;
        height: 28px;
    }

    .turn-no {
        font-family: monospace;
        color: #666;
        padding-right: 5px;
    }

    .active-turn {
        @apply bg-blue-300 text-blue-900;
    }
</style>
