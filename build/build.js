$(document).ready(function(){function a(a){var b={};b.fileDirectory=a,f=void 0;var c=new XMLHttpRequest;return c.open("GET",b.fileDirectory,!0),c.responseType="arraybuffer",c.onload=function(){e.decodeAudioData(c.response,function(a){b.soundToPlay=a})},c.send(),b.play=function(){f=e.createBufferSource(),f.buffer=b.soundToPlay,f.playbackRate.value=Math.random()*(1.04-.96)+.96,f.connect(e.destination),f.start(e.currentTime)},b.stop=function(){f.stop(e.currentTime)},b}function b(b){for(prop in b)b[prop]=a(b[prop]);return b}function c(){var a=Math.floor(3*Math.random());return a}function d(a,b,d,f){var g=[a,b,d],h=c();null!==b&&null!==d?(g[h].play(e.currentTime),f.addClass("hit")):(a.play(e.currentTime),f.addClass("hit"))}var e=new(window.AudioContext||window.webkitAudioContext),f=void 0,g=b({});$(".trigger").mousedown(function(){$(this).hasClass("boom")?d(g.boom,null,null,$(".boom")):$(this).hasClass("smack")?d(g.smack1,g.smack2,g.smack3,$(".smack")):$(this).hasClass("tsst")?d(g.tsst1,g.tsst2,g.tsst3,$(".tsst")):console.log("ERROR")}),$(".trigger").mouseup(function(){$(".trigger").removeClass("hit")}),$(document).keydown(function(a){66==a.which?d(g.boom,null,null,$(".boom")):78==a.which?d(g.smack1,g.smack2,g.smack3,$(".smack")):77==a.which?d(g.tsst1,g.tsst2,g.tsst3,$(".tsst")):console.log("ERROR")})});