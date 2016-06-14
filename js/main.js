
$(document).ready(function(){

    /*******Web Audio API*******/
    
    var context = new (window.AudioContext || window.webkitAudioContext)(),
        playSound = undefined,
        playInit = false,
        clickState = false,
        playState = false,
        progressSlider;
    
    function audioFileLoader(fileDirectory) {
        var soundObj = {};
        soundObj.fileDirectory = fileDirectory;
        playSound = undefined;
        var getSound = new XMLHttpRequest();
        getSound.open("GET", soundObj.fileDirectory, true);
        getSound.responseType = "arraybuffer";
        getSound.onload = function() {
            context.decodeAudioData(getSound.response, function(buffer) {
                //after file is loaded into the memory buffer do these things
                console.log('TEST: file loaded');
                soundObj.soundToPlay = buffer;
                playSound = context.createBufferSource();
                playSound.buffer = soundObj.soundToPlay;
                playSound.duration = Math.round(playSound.buffer.duration); 
                sliderInit();
            });
        }

        getSound.send();

        soundObj.play = function(startTime) {
            sliderPlay();
            if (!playInit) {
                playSound = context.createBufferSource();
                playSound.buffer = soundObj.soundToPlay; 
                playSound.duration = Math.round(playSound.buffer.duration); 
                playSound.connect(context.destination);
                playSound.start(0, startTime);
                playInit = true;
                context.suspend();
                context.resume();
            } else {
                context.resume();
            }
        }

        soundObj.stop = function() {
            sliderStop();
            if (!playInit) {
                playSound.stop();
            } else {
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
    
    //progress-slider initialization 
    function sliderInit() {
        $('.progress-div-1').slider({
            max: playSound.duration,
            range: 'min',
            step: 0.25
        });
    }
    
    function getSliderValue() {
        return $('.progress-div-1').slider('value');
    }
                
    //turn seconds into minutes/seconds format
    function getMinutesSeconds(time) {
        var minutes = Math.floor(time / 60),
            seconds = time - minutes * 60;
        
        return minutes + ':' + seconds;
    }
    
    function sliderPlay () {
        var value = getSliderValue();
        progressSlider = setInterval(function(){
            value += 0.25;
            $('.progress-div-1').slider('value', value);
            console.log(value);
        }, 250);
    }
        
    function sliderStop () {
        clearInterval(progressSlider);
    }
    
    /*******Player 1*******/
    
    //volume slider
    $('.volume-div-1').on('click', function(e) {
        e.preventDefault();
        if (!clickState) {
            $('.volume-slider-div-1').addClass('volume-shown-1').removeClass('volume-hidden-1');
            clickState = true;
        } else {
            $('.volume-slider-div-1').addClass('volume-hidden-1').removeClass('volume-shown-1');
            clickState = false;
        }  
    });
    
    //play and pause track
    $('.play-1').on('click', function(e) {
        e.preventDefault();
        if (!playState) {
            $('.ti-control-play').hide();
            $('.ti-control-pause').show();
            sound.track1.play(getSliderValue());
            playState = true;
        } else {
            $('.ti-control-pause').hide();
            $('.ti-control-play').show();
            sound.track1.stop();
            playState = false;
        }    
    });   
    
    //slider events
    $('.progress-div-1').on('slidestart', function(event, ui) {
        playInit = false; 
        sound.track1.stop(); 
    });
    $('.progress-div-1').on('slidestop', function(event, ui) {
        if (playState) {
            sound.track1.play(getSliderValue());
        }
    });
}); 