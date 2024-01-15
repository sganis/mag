import os
from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import json
import requests
import bs4
import calendar
from datetime import date, datetime
from dateutil.relativedelta import relativedelta

DIR = os.path.dirname(os.path.abspath(__file__))

URL = 'https://www.mercadoagroganadero.com.ar/dll/hacienda2.dll/haciinfo000013'
MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
          'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
CACHE = {}

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins = [
        "http://localhost",
        "http://localhost:8000",
        "http://localhost:5173",
    ],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@app.get("/api/version")
def get_version():
    try:
        with open(f'{DIR}/../client/.env.production') as r:
            for line in r:
                if 'VERSION' in line:
                    return line.split('=')[1].strip().strip('"')
    except:
        return '1.0.0'


@app.get("/api")
def f(cache: bool = True):
    if not cache:
        CACHE.clear()
    date = datetime.today()
    y = date.year
    m = date.month
    date = datetime.strptime(f'01/{m}/{y}','%d/%m/%Y')        
    return get_data(date)    

@app.get("/api/hist")
def f():
    date = datetime.today()
    y = date.year
    m = date.month
    date = datetime.strptime(f'01/{m}/{y}','%d/%m/%Y')
    hist = []
    for _ in range(6):
        prev_month = date-relativedelta(months=1)
        h = get_data(prev_month)
        hist.append(h)
        date = prev_month
    return hist

@app.get("/api/month/{month}")
def f(month: str):
    if len(month) != 7:
        return {'detail': 'invalid month, format must be yyyy-mm'}        
    y = month[:4]
    m = month[5:]
    date = datetime.strptime(f'01/{m}/{y}','%d/%m/%Y')
    return get_data(date)  



def get_data(date):
    prev_month = date-relativedelta(months=1)
    y = prev_month.year
    m = prev_month.month
    start = f'1/{m}/{y}'
    end = f'{calendar.monthrange(y, m)[1]}/{m}/{y}'
    next_month = datetime.strptime(start, '%d/%m/%Y') + relativedelta(months=1)
    period = f'{MONTHS[next_month.month-1]} {next_month.year}'
    
    if period in CACHE:
        data =  CACHE[period]
        data['cache'] = True
        return data                
    url = f'{URL}?txtFechaIni={start}&txtFechaFin={end}'
    try:
        r = requests.get(url)
        html = bs4.BeautifulSoup(r.text, features='html.parser')
        value = int(html.body.find_all('td')[-2].text.replace('.','').replace(',',''))/1000
    except:
        value = 'n/a'
    data = {}
    data['start'] = start
    data['end'] = end
    data['period'] = period
    data['value'] = value
    data['cache'] = False
    data['url'] = url
    data['last_update'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    
    CACHE[period] = data
    return data 


app.mount('/', StaticFiles(directory=f'{DIR}/../client/dist', html=True), name='client')


if __name__ == '__main__':
    import uvicorn
    uvicorn.run("main:app", 
                host="127.0.0.1",
                port=8000, 
                log_level="info", 
                reload=True)
