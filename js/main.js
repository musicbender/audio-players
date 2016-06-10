
$(document).ready(function(){

    
    /*******Web Audio API*******/
    
    var context = new (window.AudioContext || window.webkitAudioContext)(),
    playSound = undefined,
    playInit = false;
    
    console.log('Start CT: ' + context.currentTime);
    

    function audioFileLoader(fileDirectory) {
        var soundObj = {};
        soundObj.fileDirectory = fileDirectory;
        playSound = undefined;
        var getSound = new XMLHttpRequest();
        getSound.open("GET", soundObj.fileDirectory, true);
        getSound.responseType = "arraybuffer";
        getSound.onload = function() {
            context.decodeAudioData(getSound.response, function(buffer) {
                soundObj.soundToPlay = buffer;
                console.log('TEST: file loaded');
                
                playSound = context.createBufferSource();
                playSound.buffer = soundObj.soundToPlay;
                playSound.duration = Math.round(playSound.buffer.duration); 
                
                //progress-slider initialization 
                $('.progress-div-1').slider({
                    max: playSound.duration,
                    range: 'min'
                });
            });
        }

        getSound.send();

        soundObj.play = function() {
            if (!playInit) {
                playSound = context.createBufferSource();
                playSound.buffer = soundObj.soundToPlay; 
                playSound.duration = Math.round(playSound.buffer.duration); 
                playSound.connect(context.destination);
                playSound.start(0);
                console.log('TEST: playing');
                playInit = true;
                context.suspend();
                context.resume();
            } else {
                console.log('TEST: resume');
                context.resume();
            }
        }

        soundObj.stop = function() {
            if (!playInit) {
                playSound.stop();
                console.log('TEST: stopped');
            } else {
                console.log('TEST: suspended');
                context.suspend();
            }
        }
        return soundObj;
    };

    //loop through list of audio files
    function audioBatchLoader(obj) {
        for (prop in obj) {
            obj[prop] = audioFileLoader(obj[prop])
        }
        return obj
    }

    //batch audio loader
     var sound = audioBatchLoader({
       track1: 'audio/track1.mp3'
     });
    
    
    /*******General Player Stuff*******/
    
    //turn seconds into minutes/seconds format
    function getMinutesSeconds(time) {
        var minutes = Math.floor(time / 60),
            seconds = time - minutes * 60;
        
        return minutes + ':' + seconds;
    }

    /*******Player 1*******/
    
    var clickState1 = false,
        playState1 = false;
    
    //volume slider
    $('.volume-div-1').on('click', function(e) {
        e.preventDefault();
        if (!clickState1) {
            $('.volume-slider-div-1').addClass('volume-shown-1').removeClass('volume-hidden-1');
            clickState1 = true;
        } else {
            $('.volume-slider-div-1').addClass('volume-hidden-1').removeClass('volume-shown-1');
            clickState1 = false;
        }  
    });
    
    //play and pause track
    $('.play-1').on('click', function(e) {
        e.preventDefault();
        if(!playState1) {
            $('.ti-control-play').hide();
            $('.ti-control-pause').show();
            sound.track1.play();
            playState1 = true;
            
            console.log('CT Play: ' + context.currentTime);
        } else {
            $('.ti-control-pause').hide();
            $('.ti-control-play').show();
            sound.track1.stop();
            playState1 = false;
            
            console.log('CT Pause: ' + context.currentTime);
            console.log('Total Track Time: ' + playSound.duration); 
        }    
    });   
    
    //slider events
    $('.progress-div-1').on('slidestart', function(event, ui) {
        playInit = false; 
        sound.track1.stop(); 
    });
    $('.progress-div-1').on('slidestop', function(event, ui) {
        var value = $(this).slider('value');
        console.log('VALUE: ' + value + ' PLAYSTATE: ' + playState1);
        
        if (playState1) {
            sound.track1.play(0, 100);
        }
    });
    
   
}); 