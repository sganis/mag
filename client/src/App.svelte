<script>
  import { onMount } from 'svelte';
  
  let url = import.meta.env.VITE_PUBLIC_BASE_URL;
  let data = {}
  let error;

  onMount(async () => {
        await getData();
  });


  export const getData = async () => {
    try {
        //$working = true;
        let api = `${url}api`;
        
        const r = await fetch(api, {
            headers: {
                //'Authorization': 'Bearer '+$state.token
            }
        });
        const js = await r.json();
        //console.log(js);
        if (r.status === 200) {
            data = js;
        } else {
            error = js.detail;
        }
    }
    catch (err) {
        console.log(err)
    }
    finally {
        //$working = false;
    }
  }
</script>

<main>

{JSON.stringify(data)}

</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
