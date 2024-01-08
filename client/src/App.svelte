<script>
  import 'bootstrap/dist/css/bootstrap.min.css';
  import 'bootstrap/dist/js/bootstrap.min.js';
  //import 'bootstrap-icons/font/bootstrap-icons.css'
  import { onMount } from 'svelte';
  import {working} from './store'
  import Working from './Working.svelte';

  let url = import.meta.env.VITE_PUBLIC_BASE_URL;
  let data = {}
  let error;

  onMount(async () => {
        await getData();
  });


  export const getData = async () => {
    try {
        $working = true;
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
        $working = false;
    }
  }
</script>

<div class="full">
<div class="header">
  =
</div>
  
<div class="scrollable main">
  <h1>Indice de Arrenamiento Mensual</h1>
  <div class="container">
    
    {#if $working}
      <div class="center">
      <Working message=""/>
      </div>
    {:else}
    <div class="center">
      <div class="period">
        {data.period}
      </div>
      <div class="value">
        ARS {data.value}
      </div>
    </div>
    <br>
    <br>
    <div class="notes">
      Indice novillo mensual para arrendamientos rurales. 
      Mercado de Cañuelas. 
      Datos sumistrados por 
      <a href="{data.url}">Mercado Agroganadero</a>
    </div>
    {/if}
  </div>
</div>

<div class="footer">
  v1.0.1
</div>
</div>



<style>
  .main {
    padding: 0;
  }
  .container {
    padding: 40px;
  }
  .center {
    text-align: center;
  }
  h1 {
    background-color: darkgreen;
    color: white;
    padding: 20px;
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
</style>
