$(document).ready(function(){

    /*******Web Audio API*******/
    var context = new (window.AudioContext || window.webkitAudioContext)();

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
                soundObj.soundToPlay = buffer;
                playSound = context.createBufferSource();
                playSound.buffer = soundObj.soundToPlay;
                playSound.duration = Math.round(playSound.buffer.duration); 
                showTracks();
                var track1 = newTrack(1, sound.track1);
                track1.volume.init();
                track1.slider.init();
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
    }

    //loop through list of audio files
    function audioBatchLoader(obj) {
        for (prop in obj) {
            obj[prop] = audioFileLoader(obj[prop])
        }
        return obj;
    }

    //batch audio loader
    var sound = audioBatchLoader({
        track1: 'audio/track1.mp3'
    });

    /*******Audio Tracks*******/
    
//    var audioPlayers = playerLoader({
//        track1: newTrack(1, sound.track1)
//    });
    
    
    /*******Audio Track Factory Function*******/

    var newTrack = function(n, t) {
        
        var track = {};

        track.audio = t;
        track.num = n || 1;
        track.playInit = false;
        track.clickState = false;
        track.playState = false;
        track.vDiv = $('.volume-slider-div-' + track.num);
        track.pDiv = $('.progress-div-' + track.num);

        track.play = function() {
            track.slider.play(); 
            if (!track.playInit) {
                track.audio.play(track.slider.getValue());
                track.playInit = true;
                track.volume.gainNodeInit();
            } else {
                track.audio.resume();
            }   
        };

        track.stop = function() {
            track.slider.stop();
            if (!track.playInit) {
                track.audio.stop();

            } else {
                track.audio.suspend();
            }
        };

        track.volume = {
            init: function() {
                track.vDiv.slider({
                    max: 100,
                    value: 75,
                    range: 'min',
                    step: 1
                });
            },
            gain: 0,
            gainNodeInit: function() {
                var value = track.volume.getValue() / 10;
                this.gain = context.createGain();
                playSound.connect(track.volume.gain);
                this.gain.connect(context.destination);
                this.gain.gain.value = value;
            },
            getValue: function() {
                return track.vDiv.slider('value');
            },
            setValue: function(v) {
                track.vDiv.slider('value', v);
            }
        };

        track.slider = {
            init: function() {
                track.pDiv.slider({
                    max: playSound.duration,
                    range: 'min',
                    step: 0.25
                });
            },
            progress: 0,
            getValue: function() {
                return track.pDiv.slider('value');
            },
            setValue: function(v) {
                track.pDiv.slider('value', v);
            },
            play: function() {
                var value = track.slider.getValue();
                track.slider.progress = setInterval(function(){
                    value += 0.25;
                    track.slider.setValue(value);
                }, 250);
            },
            stop: function() {
                clearInterval(track.slider.progress);
            }
        };

        track.onEvent = {
            clickPlay: function() {
                $('.play-' + track.num).on('click', function(e) {
                    e.preventDefault();
                    if (!track.playState) {
                        $('.ti-control-play').hide();
                        $('.ti-control-pause').show();
                        track.play();
                        track.playState = true;
                    } else {
                        $('.ti-control-pause').hide();
                        $('.ti-control-play').show();
                        track.stop();
                        track.playState = false;
                    }    
                });
            },
            onScrub: function() {
                track.pDiv.on('slidestart', function(event, ui) {
                    track.playInit = false; 
                    track.stop();
                });
                track.pDiv.on('slidestop', function(event, ui) {
                    if (track.playState) {
                        track.play();
                    }
                });
            },
            showVolume: function() {
                $('.volume-div-' + track.num).on('click', function(e) {
                    e.preventDefault();
                    if (!track.clickState) {
                        track.vDiv.addClass('volume-shown-' + track.num).removeClass('volume-hidden-' + track.num);
                        track.clickState = true;
                    } else {
                        track.vDiv.addClass('volume-hidden-' + track.num).removeClass('volume-shown-' + track.num);
                        track.clickState = false;
                    }  
                });
            },
            slideVolume: function() {
                track.vDiv.on('slide', function(event, ui) {
                    track.volume.gain.gain.value = (ui.value / 10) - 1;
                });
                $('.volume-btn').on('mouseenter', function() {
                    track.vDiv.slider('disable');
                });
                $('.volume-btn').on('mouseleave', function() {
                    track.vDiv.slider('enable');
                });

            },
            clickVolume: function() {
                $('.plus-' + track.num).on('click', function(e) {
                    if (track.volume.getValue() < 100) {
                        track.volume.setValue(track.volume.getValue() + 5);
                        track.volume.gain.gain.value = (track.volume.getValue() / 10) - 1;
                    } 
                });
                $('.minus-' + track.num).on('click', function(e) {
                    if (track.volume.getValue() > 0) {
                        track.volume.setValue(track.volume.getValue() - 5);
                        track.volume.gain.gain.value = (track.volume.getValue() / 10) - 1;
                    } 
                }); 
            }
        }

        track.onEvent.clickPlay();
        track.onEvent.onScrub();
        track.onEvent.showVolume();
        track.onEvent.slideVolume();
        track.onEvent.clickVolume();
        
        return track;
    }
    
    /*******General Stuff*******/

    //turn seconds into minutes/seconds format
    function getMinutesSeconds(time) {
        var minutes = Math.floor(time / 60),
            seconds = time - minutes * 60;

        return minutes + ':' + seconds;
    }

    function showTracks() {
        $('.loading-placeholder').hide();
        $('.player').show();
    }
});







/*


///classes///

.progress-div-1 
.play-1 
---->.ti-control-play 
---->.ti-control-pause 
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
