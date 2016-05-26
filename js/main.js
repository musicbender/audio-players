
$(document).ready(function(){

    /*******Web Audio API*******/
    
    var context = new (window.AudioContext || window.webkitAudioContext)(),
    playSound = undefined;

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
            });
        }

        getSound.send();

        soundObj.play = function() {
            playSound = context.createBufferSource();
            playSound.buffer = soundObj.soundToPlay;
            playSound.connect(context.destination);
            playSound.start(context.currentTime);
            context.resume();
        }

        soundObj.stop = function() {
            playSound.stop(context.currentTime);
            context.suspend();
            console.log(context.currentTime);
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


    //Play sound 
    function playGo (sound) {
            sound.play(context.currentTime);
    }

    /*******Player 1*******/
    var clickState1 = false,
        playState1 = false;
    
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
    
    $('.play-1').on('click', function(e) {
        e.preventDefault();
        if(!playState1) {
            $('.ti-control-play').hide();
            $('.ti-control-pause').show();
            playState1 = true;
        } else {
            $('.ti-control-pause').hide();
            $('.ti-control-play').show();
            playState1 = false;
        }    
    })
    
    /*-----Trigger sounds-----*/
    
    $('.ti-control-play').on('click', function(e) {
        e.preventDefault();
        sound.track1.play(context.currentTime);
    });
    $('.ti-control-pause').on('click', function(e) {
        e.preventDefault();
        sound.track1.stop();
    })
     
}); 