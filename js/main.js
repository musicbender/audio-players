
$(document).ready(function(){

    /*******Web Audio API*******/
    
    var context = new (window.AudioContext || window.webkitAudioContext)(),
        playInit = false,
        clickState = false,
        playState = false;
    
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
                slider.init();
                volume.init();
            });
        }

        getSound.send();

        soundObj.play = function(startTime) {
            slider.play();
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
            slider.stop();
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
    
    
    /*******Slider Stuff*******/
    
    var slider = {};
    
    slider.init = function() {
        $('.progress-div-1').slider({
            max: playSound.duration,
            range: 'min',
            step: 0.25
        });
    }
    
    slider.progress;
    
    slider.getValue = function() {
        return $('.progress-div-1').slider('value');
    }
    
    slider.play = function() {
        var value = slider.getValue();
        slider.progress = setInterval(function(){
            value += 0.25;
            $('.progress-div-1').slider('value', value);
        }, 250);
    }
        
    slider.stop = function() {
        clearInterval(slider.progress);
    }
    
    /*******Volume Slider*******/
    
    var volume = {
        init: function() {
            $('.volume-slider-div-1').slider({
                max: 100,
                range: 'min',
                step: 1
            });
        }
    }
    
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
    
    /*******General Stuff*******/
    
    //turn seconds into minutes/seconds format
    function getMinutesSeconds(time) {
        var minutes = Math.floor(time / 60),
            seconds = time - minutes * 60;
        
        return minutes + ':' + seconds;
    }
    
    /*******Player*******/
    
    
    
    //play and pause track
    $('.play-1').on('click', function(e) {
        e.preventDefault();
        if (!playState) {
            $('.ti-control-play').hide();
            $('.ti-control-pause').show();
            sound.track1.play(slider.getValue());
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
            sound.track1.play(slider.getValue());
        }
    });
}); 