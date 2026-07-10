(function(ns){
  var forbidden=/(javascript:|<script|\beval\s*\(|买入|卖出|抄底|稳赚|最佳买点|自动交易)/i;
  ns.safetyPolicy=Object.freeze({validateInput:function(value){var text=String(value||'').trim();if(!text)return {ok:false,code:'empty_input'};if(text.length>500)return {ok:false,code:'input_too_long'};if(forbidden.test(text))return {ok:false,code:'unsafe_input'};return {ok:true,text:text};},sanitize:function(value){return String(value||'').replace(/[<>]/g,'').slice(0,500);}});
})(window.ShikeAgentModules);
