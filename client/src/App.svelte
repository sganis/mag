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
  let updating = false;
  let gettingHistory = false;
  let history = [];
  let colors = ['darkgreen','darkblue','maroon'];
  let patch = version.split('.')[2];
  let colorIndex = Number(patch) % 3;
  let color = colors[colorIndex];
  
  const checkUpdateInterval = 60 * 60 * 1000; // 1h

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }

  onMount(async () => {
    await getData(true);      
    await getHistory();
    await checkVersion();
  });

  setInterval(async () => {
    console.log('checking for update');
    await checkVersion();
  }, checkUpdateInterval);

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
  
  document.addEventListener('visibilitychange', () => {
    console.log('visibility changed', document.visibilityState);
  });

  window.navigator.serviceWorker.addEventListener("controllerchange", e => {
   // The service worker controller has changed
   console.log('sw controller changed');
   //window.location.reload();
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

  const getHistory = async () => {
    history = [];
    try {
        gettingHistory = true;
        let api = `${url}api/hist`;
        const r = await fetch(api, { headers: {
                //'Authorization': 'Bearer '+$state.token
            }
        });
        const js = await r.json();
        //console.log(js);
        if (r.status === 200) {
            history = js;
        } else {
            error = js.detail;
        }
    }
    catch (err) {
        console.log(err)
    }
    finally {
        gettingHistory = false;
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
    $working = true;
    updating = true;
    console.log(await getCacheSize());
    console.log('clearing cache...');
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister()
        }
    })
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key.startsWith('mag-1.0'))
        .map(key => caches.delete(key))
      );      
    })
    console.log(await getCacheSize());
    window.location.reload();
  }

  const getCacheSize = async () => {
    // Note: opaque (i.e. cross-domain, without CORS) responses in the cache will return a size of 0.
    const cacheNames = await caches.keys();
    let total = 0;
    const sizePromises = cacheNames.map(async cacheName => {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      let cacheSize = 0;
      await Promise.all(keys.map(async key => {
        const response = await cache.match(key);
        const blob = await response.blob();
        total += blob.size;
        cacheSize += blob.size;
      }));
      console.log(`Cache ${cacheName}: ${cacheSize} bytes`);
    });
    await Promise.all(sizePromises);
    return `Total Cache Storage: ${total} bytes`;
  }


</script>

<div class="full">
<div class="header">
  <div class="d-flex justify-content-between">
  {#if serverVersion && version !== serverVersion}
  New version 
  <button class="btn btn-sm btn-success"
    on:click={updateNow}
    >Update Now</button>
  {:else}
  v{version}
  {/if}
  <div class="dropdown">
    <button class="btn btn-outline-light border-0 bg-transparent btn-dots" 
      type="button" data-bs-toggle="dropdown" 
      aria-expanded="false">
      <i class="bi-three-dots"/>
    </button>
    <ul class="dropdown-menu dropdown-menu-dark">
      <li><p class="ms-3 mb-0">Version: {version}</p></li>
      <li><hr class="dropdown-divider mb-0"></li>
      {#if serverVersion !== version}
      <li><a class="dropdown-item" href="#/" on:click={updateNow}>
        Get v{serverVersion} 
      </a></li>
      {/if}
    </ul>
  </div>
</div>
</div>

<h1 style="--theme-color: {color}" class:dimmed={updating}>Indice de Arrenamiento Mensual</h1>
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
      <div class="center">
        <h2>Meses anteriores</h2>
      </div>
      {#if gettingHistory}
        <div class="center">
          <Working message=""/>
        </div>
      {:else}
        {#each history as hist}
        <div class="row">
          <div class="col text-nowrap">
            {hist.period}
          </div>
          <div class="col text-end">
            $ {hist.value?.toFixed(2).toLocaleString('fr-FR')}
          </div>
        </div>
        {/each}
      {/if}
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
        class="btn btn-light btn-lg w100 mb-4"
        aria-label="Refresh"
        disabled={$working}
        on:click={()=>getData(false)}>
        <i class="bi-arrow-repeat"/>
    </button>
    <!-- <button 
        class="btn btn-light btn-lg w100 mb-3"
        aria-label="Refresh"
        disabled={$working}
        on:click={updateNow}>
        Reload
    </button> -->
    {/if}
  </div>
</div>

<!-- <ReloadPrompt /> -->

<div class="footer">
  &nbsp;
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
    background-color: var(--theme-color);
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
  .btn-dots{
    color: gainsboro;
  }
  .dimmed {
    opacity: 0.3;
  }
</style>
