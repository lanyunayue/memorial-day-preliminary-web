(function(global){
  function locationFrom(query){return String(query||'').replace(/(今天|明天|现在|最近|未来|的|天气|气温|温度|多少|怎么样|如何|？|\?)/g,' ').replace(/\s+/g,' ').trim()||'北京';}
  function weather(code){if(code===0)return'晴';if(code<=3)return'多云';if(code<=48)return'雾';if(code<=67)return'有雨';if(code<=77)return'有雪';if(code<=82)return'阵雨';if(code<=99)return'雷雨';return'天气状况未知';}
  global.ShikeRetrievalProviders.register({
    id:'open-meteo',name:'Open-Meteo',supports:function(c){return c.kind==='network'&&c.domain==='weather';},
    search:async function(query,context){
      var place=locationFrom(query);var geoUrl='https://geocoding-api.open-meteo.com/v1/search?count=1&language=zh&format=json&name='+encodeURIComponent(place);
      var geoResponse=await fetch(geoUrl,{signal:context.signal});if(!geoResponse.ok)throw new Error('open_meteo_geo_http_'+geoResponse.status);var geo=await geoResponse.json();var location=geo.results&&geo.results[0];if(!location)return[];
      var forecastUrl='https://api.open-meteo.com/v1/forecast?latitude='+encodeURIComponent(location.latitude)+'&longitude='+encodeURIComponent(location.longitude)+'&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto';
      var response=await fetch(forecastUrl,{signal:context.signal});if(!response.ok)throw new Error('open_meteo_http_'+response.status);var data=await response.json(),current=data.current||{},units=data.current_units||{};
      return[{id:'open-meteo:'+location.id,title:(location.name||place)+'当前天气',url:'https://open-meteo.com/',snippet:weather(current.weather_code)+'，气温 '+current.temperature_2m+(units.temperature_2m||'°C')+'，体感 '+current.apparent_temperature+(units.apparent_temperature||'°C')+'，风速 '+current.wind_speed_10m+(units.wind_speed_10m||'km/h')+'。数据时间：'+(current.time||'未提供')+'。天气数据由 Open-Meteo 提供。',source:'Open-Meteo（CC BY 4.0）',sourceType:'open-meteo',publishedAt:current.time||null}];
    }
  });
})(window);
