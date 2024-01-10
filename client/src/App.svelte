<script>
  import 'bootstrap/dist/css/bootstrap.min.css';
  import 'bootstrap/dist/js/bootstrap.min.js';
  import 'bootstrap-icons/font/bootstrap-icons.css'
  import { onMount } from 'svelte';
  import {working} from './store'
  import Working from './Working.svelte';
  //import { registerSW } from 'virtual:pwa-register'
  //import ReloadPrompt from './ReloadPrompt.svelte';


  let url = import.meta.env.VITE_PUBLIC_BASE_URL;
  let version = import.meta.env.VITE_PUBLIC_VERSION||'-dev';
  let serverVersion;
  let data = {}
  let error;
  let last_update;
  let source;
  let offline = false;
  
  const intervalMS = 60 * 60 * 1000

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }

  onMount(async () => {
    //console.log('onMount...');
    checkVersion();
    await getData(true);      
  });

  const getMonthKey = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).substring(-2);
    const key = [year, month].join('');
    //console.log(key);
    return key;
  }

  window.addEventListener("offline", (e) => {
    console.log('app is offline');
    offline = true;
  });

  window.addEventListener("online", (e) => {
    console.log('back online');
    offline = false;
  });

  const getData = async (cache) => {
    const key = getMonthKey();

    if (cache) {
      data = JSON.parse(localStorage.getItem(key));    
      if (data) {
        source = "Cache";
        last_update = data.last_update ? 
           new Date(data.last_update).toString(): 'n/a'; 
        //console.log('data from local storge');
        return;
      }
    }
    try {
        $working = true;
        let api = `${url}api?cache=${cache}`;
        
        const r = await fetch(api, {
            headers: {
                //'Authorization': 'Bearer '+$state.token
            }
        });
        const js = await r.json();
        //console.log(js);
        if (r.status === 200) {
            data = js;
            if (data.cache) {
              source = 'API';
            } else {
              source = 'MAG';
            }
            last_update = data.last_update ? 
              new Date(data.last_update).toString(): 'n/a';
            
              localStorage.setItem(key, JSON.stringify(data));

        } else {
            error = js.detail;
        }
    }
    catch (err) {
        console.log(err)
    }
    finally {
        $working = false;
    }
  }

  const checkVersion = async () => {
    try {
        //$working = true;
        let api = `${url}api/version`;        
        const r = await fetch(api, {
            headers: {
                //'Authorization': 'Bearer '+$state.token
            }
        });
        const js = await r.json();
        if (r.status === 200) {
            serverVersion = js;
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
  const updateNow = async () => {
    window.location.reload();
  }

</script>

<div class="full">
<div class="header">
  {#if version !== serverVersion}
  <div class="d-flex justify-content-between">
  New version available: {version} =&gt; {serverVersion}
  <button class="btn btn-sm btn-success"
    on:click={updateNow}
    >Update Now</button>
  </div>
  {:else}
  v{version}
  {/if}
</div>

<h1>Indice de Arrenamiento Mensual</h1>
<div class="scrollable"> 
  <div class="content">  
    {#if $working}
      <div class="center">
        <Working message=""/>
      </div>
    {:else}
      <div class="center shadow">
        <div class="period">
          {data.period}
        </div>
        <div class="value selectable">
          $ {data.value?.toFixed(2).toLocaleString('fr-FR')}
        </div>
      </div>
      <div class="row">
        <br><br>
      </div>
      <div class="center m-1 mt-4">
        <div class="notes">
            Indice novillo mensual para arrendamientos rurales en Pesos Argentinos.
            Mercado de Cañuelas. 
            Datos sumistrados por 
            <a href="{data.url}" target="_blank">Mercado Agroganadero</a>. 
            <br>
            Actualizado: {last_update}.
            <br>
            Origen: {source}.
        </div>
      </div>
    {/if}
  </div>
</div><!--scrollable-->

<div class="row center m-2">
  <div class="col">    
    {#if offline}
    <div class="alert alert-danger d-flex align-items-center"
       role="alert">
      <i class="bi-exclamation-triangle" />
      <div>&nbsp;
        No internet detected, working offline.
      </div>
    </div>
    {:else}
    <button 
        class="btn btn-light btn-lg w100 mb-3"
        aria-label="Refresh"
        on:click={()=>getData(false)}>
        <i class="bi-arrow-repeat"/>
    </button>
    {/if}
  </div>
</div>

<!-- <ReloadPrompt /> -->

<div class="footer">
  =
</div>

</div><!--full-->



<style>
  .content {
    padding: 40px;
    padding-top: 20px;
  }
  .center {
    text-align: center;
  }
  .shadow {
    box-shadow: 20px 20px 10px grey;
  }
  h1 {
    background-color: darkgreen;
    color: white;
    padding: 20px;
    margin: 0;
    text-align: center;
  }
  .period {
    font-size: x-large;
    font-weight: bold;
    padding: 10px;
    padding-bottom: 0;
  }
  .value {
    font-size: x-large;
    font-weight: bold;
    background-color: whitesmoke;
    color: darkblue;
    padding: 10px;
  }
  .header {
    background-color: black;
    color: gainsboro;
    padding: 10px;
  }
  .footer {
    background-color: black;
    color: gainsboro;
    padding: 10px;
    height: 60px;
  }
  .notes {
    text-align: left;
    font-size: small;
  }
  .w100 {
    width: 100px;
  }
</style>
