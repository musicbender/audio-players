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
            playSound = context.createBufferSource();
            playSound.buffer = soundObj.soundToPlay; 
            playSound.duration = Math.round(playSound.buffer.duration); 
            playSound.connect(context.destination);
            playSound.start(0, startTime);
            context.suspend();
            context.resume();
        }

        soundObj.resume = function() {
            context.resume();
        }

        //stop sound
        soundObj.stop = function() {
            playSound.stop();
        }

        soundObj.suspend = function() {
            context.suspend();
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

    /*******Audio Track Constructor*******/

    var Track = function(track) {
        var _this = this;
        _this.track = track,
            _this.playInit = false,
            _this.clickState = false,
            _this.playState = false;

        _this.play = function() {
            slider.play(); 
            if (!_this.playInit) {
                _this.track.play(_this.slider.getValue());
                _this.playInit = true;
                _this.volume.gainNodeInit();
            } else {
                track.resume();
            }   
        };

        _this.stop = function() {
            slider.stop();
            if (!playInit) {
                track.stop();
            } else {
                track.suspend();
            }
        };

        _this.volume = {
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
            },
            onClick: function() {
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
            }
        };
        volume.onClick();

        _this.slider = {
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
                }, 250);
            },
            stop: function() {
                clearInterval(slider.progress);
            }
        };

        

    }

    /*******Slider Stuff*******/

    /*((( .progress-div-1 )))*/
    /*((( playSound.duration )))*/


    /*******Volume Slider*******/

    /*((( .volume-slider-div-1 )))*/
    /*((( .volume-div-1 )))*/
    /*((( volume-shown-1 )))*/
    /*((( volume-hidden-1 )))*/
    /*((( context.createGain() )))*/
    /*((( playSound.connect() )))*/
    /*((( context.destination )))*/
    /*((( clickState )))*/


    /*******Player 1*******/

    //play and pause track
    /*((( .play-1 )))*/
    /*((( .ti-control-play )))*/
    /*((( .ti-control-pause )))*/
    /*((( sound.track1 )))*/
    /*((( slider.getValue() )))*/
    /*((( playState )))*/
    $('.play-1').on('click', function(e) {
        e.preventDefault();
        if (!playState) {
            $('.ti-control-play').hide();
            $('.ti-control-pause').show();
            playTest(sound.track1);
            playState = true;
        } else {
            $('.ti-control-pause').hide();
            $('.ti-control-play').show();
            sound.track1.stop();
            playState = false;
        }    
    });

    //scrub slider events
    /*((( .progress-div-1 )))*/
    /*((( sound.track1 )))*/
    /*((( playInit )))*/
    /*((( playState )))*/
    /*((( slider (object) )))*/
    $('.progress-div-1').on('slidestart', function(event, ui) {
        playInit = false; 
        sound.track1.stop(); 
    });
    $('.progress-div-1').on('slidestop', function(event, ui) {
        if (playState) {
            playTest(sound.track1);
        }
    });

    //volume slider events
    /*((( .volume-slider-div-1 )))*/
    /*((( volume (object) )))*/
    $('.volume-slider-div-1').on('slide', function(event, ui) {
        volume.gain.gain.value = (ui.value / 10) - 1;
    });

    //use volume buttons to increase/decrease gain
    /*((( .plus-1 )))*/
    /*((( .minus-1 )))*/
    /*((( volume (object) )))*/
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
    /*(((  .volume-btn )))*/
    /*(((  .volume-slider-div-1 )))*/
    $('.volume-btn').on('mouseenter', function() {
        $('.volume-slider-div-1').slider('disable');
    });
    $('.volume-btn').on('mouseleave', function() {
        $('.volume-slider-div-1').slider('enable');
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

    //    function playTest(track) {
    //            slider.play(); 
    //            if (!playInit) {
    //                track.play(slider.getValue());
    //                playInit = true;
    //                volume.gainNodeInit();
    //            } else {
    //                track.resume();
    //            }   
    //        }
});

/*


///classes///

.progress-div-1 
.play-1 
.ti-control-play 
.ti-control-pause 
.volume-btn 
.volume-slider-div-1 
.volume-div-1 
volume-shown-1 
volume-hidden-1 
.plus-1
.minus-1


///web audio api///

sound.track1 
playSound.duration
playSound.connect() 
context.destination 
context.createGain() 


///variables///

clickState 
playState
playInit 


///objects///

slider (object)
volume (object) 


*/
