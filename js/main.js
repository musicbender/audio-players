$(document).ready(function(){

    /*******Web Audio API*******/
    var context = new (window.AudioContext || window.webkitAudioContext)();
    var currentTrack = 1;

    function audioFileLoader(fileDirectory) {
        var soundObj = {};
        soundObj.audio = fileDirectory.audio;
        soundObj.num = fileDirectory.num;
        soundObj.path = 'sound.track' + soundObj.num;
//        playSound = {};
        var getSound = new XMLHttpRequest();
        getSound.open("GET", soundObj.audio, true);
        getSound.responseType = "arraybuffer";
        getSound.onload = function() {
            context.decodeAudioData(getSound.response, function(buffer) {
                //after file is loaded into the memory buffer do these things
                console.log('file loaded: ' + JSON.stringify(fileDirectory));
                soundObj.soundToPlay = buffer;
                playSound = context.createBufferSource();
                playSound.buffer = soundObj.soundToPlay;
                soundObj.duration = Math.round(playSound.buffer.duration); 
                
                newTrack(fileDirectory, soundObj.path);
                showTracks();
            });
        }
        getSound.send();
        //play sound
        soundObj.play = function(startTime) { 
            playSound = context.createBufferSource();
            playSound.buffer = soundObj.soundToPlay; 
            soundObj.duration = Math.round(playSound.buffer.duration); 
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
        track1: {
            num: 1,
            audio: 'audio/track1.mp3'
        },
        track2: {
            num: 2,
            audio: 'audio/track2.mp3'
        }
    });

    /*******Audio Track Factory Function*******/

    var newTrack = function(obj, path) {
        
        var track = {};

        track.audio = eval(path);
        track.num = obj.num;
        
        track.playInit = false;
        track.clickState = false;
        track.playState = false;
        track.vDiv = $('.volume-slider-div-' + track.num);
        track.pDiv = $('.progress-div-' + track.num);
        
        console.log(obj);
        console.log(track.audio);
        
        track.play = function() {
            if (currentTrack !== track.num) {
                console.log(currentTrack);
                var oldTrack = 'sound.track' + currentTrack;
                eval(oldTrack).stop();
                currentTrack = track.num;
            }
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
                playSound.connect(this.gain);
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
                    max: track.audio.duration,
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
                    var play = $('.control-play-' + track.num),
                        pause = $('.control-pause-' + track.num);
                    
                    if (!track.playState) {
                        play.hide();
                        pause.show();
                        track.play();
                        track.playState = true;
                    } else {
                        pause.hide();
                        play.show();
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
        
        track.volume.init();
        track.slider.init();
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


