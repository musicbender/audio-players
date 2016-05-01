$(document).ready(function(){

    var context = new (window.AudioContext || window.webkitAudioContext)(),
        playSound = undefined;
    
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
  
    function audioFileLoader(fileDirectory) {
        var soundObj = {};
        soundObj.fileDirectory = fileDirectory;
/*var*/ playSound = undefined;
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
            playSound.playbackRate.value = (Math.random() * (1.04 - 0.96) + 0.96); //random pitch
            playSound.connect(context.destination)
            playSound.start(context.currentTime)
        }

        soundObj.stop = function() {
            playSound.stop(context.currentTime)
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
       //audio files here
     });
    
    //Random number between 1 and 3 for Round Robin
    function randomNum () {
        var num = Math.floor(Math.random() * 3);
        return num;
    }

    //Play sound with Round Robin
    function roundRobinPlay (sound1, sound2, sound3, trigger) {
        var sounds = [sound1, sound2, sound3],
            rr = randomNum();
        
        if ((sound2 !== null) && (sound3 !== null)){
            sounds[rr].play(context.currentTime);
            trigger.addClass('hit');
        } else {
            sound1.play(context.currentTime);
            trigger.addClass('hit');
        }
    }
    
    /*-----Trigger sounds-----*/
    
   
}); 