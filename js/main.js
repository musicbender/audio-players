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
                showTracks();
                slider.init();
                volume.init();
            });
        }
        getSound.send();
        //play sound
        soundObj.play = function(startTime) {
            slider.play();  
            if (!playInit) {
                playSound = context.createBufferSource();
                playSound.buffer = soundObj.soundToPlay; 
                playSound.duration = Math.round(playSound.buffer.duration); 
                playSound.connect(context.destination);
                playSound.start(0, startTime);
                playInit = true;
                volume.gainNodeInit();
                context.suspend();
                context.resume();
            } else {
                context.resume();
            }
        }
        //stop sound
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
    var slider = {
        init: function() {
            $('.progress-div-1').slider({
                max: playSound.duration,
                range: 'min',
                step: 0.25
            });
        },
        progress: undefined,
        getValue: function() {
            return $('.progress-div-1').slider('value');
        },
        setValue: function(v) {
            $('.progress-div-1').slider('value', v);
        },
        play: function() {
            var value = slider.getValue();
            slider.progress = setInterval(function(){
                value += 0.25;
                slider.setValue(value);
                console.log(value + '/' + playSound.duration);
            }, 250);
        },
        stop: function() {
            clearInterval(slider.progress);
        }
    };
    
/*******Volume Slider*******/
    var volume = {
        init: function() {
            $('.volume-slider-div-1').slider({
                max: 100,
                value: 75,
                range: 'min',
                step: 1
            });
        },
        gain: undefined,
        gainNodeInit: function() {
            var value = volume.getValue() / 10;
            this.gain = context.createGain();
            playSound.connect(volume.gain);
            this.gain.connect(context.destination);
            this.gain.gain.value = value;
        },
        getValue: function() {
            return $('.volume-slider-div-1').slider('value');
        },
        setValue: function(v) {
            $('.volume-slider-div-1').slider('value', v);
        }
    };
    
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
    
    function showTracks() {
        $('.loading-placeholder').hide();
        $('.player-1').show();
    }
    
    
/*******Player 1*******/
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
    
    //scrub slider events
    $('.progress-div-1').on('slidestart', function(event, ui) {
        playInit = false; 
        sound.track1.stop(); 
    });
    $('.progress-div-1').on('slidestop', function(event, ui) {
        if (playState) {
            sound.track1.play(slider.getValue());
        }
    });

    //volume slider events
    $('.volume-slider-div-1').on('slide', function(event, ui) {
        volume.gain.gain.value = (ui.value / 10) - 1;
    });

    //use volume buttons to increase/decrease gain
    $('.plus-1').on('click', function(e) {
        if (volume.getValue() < 100) {
            volume.setValue(volume.getValue() + 5);
            volume.gain.gain.value = (volume.getValue() / 10) - 1;
        } 
    });
    $('.minus-1').on('click', function(e) {
        if (volume.getValue() > 0) {
            volume.setValue(volume.getValue() - 5);
            volume.gain.gain.value = (volume.getValue() / 10) - 1;
        } 
    }); 

    //disables slider when hovering over volume buttons so they work
    $('.volume-btn').on('mouseenter', function() {
        $('.volume-slider-div-1').slider('disable');
    });
    $('.volume-btn').on('mouseleave', function() {
        $('.volume-slider-div-1').slider('enable');
    });
});