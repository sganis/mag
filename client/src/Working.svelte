<script>
    import {working} from './store'
    export let message;
</script>

{#if $working}
<div>
    <div class="spinner-border text-success" aria-hidden="true"></div>
    &nbsp;
    {message}
</div>
{/if}
