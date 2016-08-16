$(document).ready(function(){

    
    ///////*******GLOBALS*******///////
    
    var context = new (window.AudioContext || window.webkitAudioContext)(),
        currentTrack = 0,
        trackList = {};

    
    ///////*******WEB AUDIO API FACTORY FUNCTION*******///////
    
    function audioFileLoader(fileDirectory) {
        var soundObj = {};
        soundObj.audio = fileDirectory.audio;
        soundObj.num = fileDirectory.num;
        soundObj.path = 'sound.track' + soundObj.num;
        var getSound = new XMLHttpRequest();
        getSound.open("GET", soundObj.audio, true);
        getSound.responseType = "arraybuffer";
        getSound.onload = function() {
            context.decodeAudioData(getSound.response, function(buffer) {
                
                //after file is loaded into the memory buffer, do these things
                soundObj.soundToPlay = buffer;
                playSound = context.createBufferSource();
                playSound.buffer = soundObj.soundToPlay;
                soundObj.duration = Math.round(playSound.buffer.duration); 

                //add new track to list object
                trackList[soundObj.num] = newTrack(fileDirectory, soundObj.path);

                //show tracks after audio files load into memory
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
        //resume from pause
        soundObj.resume = function() {
            context.resume();
        }

        //stop sound
        soundObj.stop = function() {
            playSound.stop();
        }

        //pause
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

    //batch audio and track loader. add all tracks you want loaded here
    var sound = audioBatchLoader({
        track1: {
            num: 1,
            audio: 'audio/track1.mp3'
        },
        track2: {
            num: 2,
            audio: 'audio/track2.mp3'
        },
        track3: {
            num: 3,
            audio: 'audio/track3.mp3'
        }
    });

    
    ///////*******AUDIO PLAYER FACTORY FUNCTION*******////////

    var newTrack = function(obj, path) {

        var track = {};

        //properties
        track.audio = eval(path);
        track.num = obj.num; 
        track.playInit = false;
        track.clickState = false;
        track.playState = false;

        //DOM selectors
        track.vDiv = $('.volume-slider-div-' + track.num);
        track.pDiv = $('.progress-div-' + track.num);
        track.playBtn = $('.control-play-' + track.num);
        track.pauseBtn = $('.control-pause-' + track.num);

        //functions
        track.play = function() {
            if (currentTrack !== track.num && currentTrack !== 0) {
                //if switching to another track
                track.switchTracks();
            }
            track.slider.play(); 
            if (!track.playInit) {
                currentTrack = track.num;
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

        track.switchTracks = function() {
            var oldTrack = 'sound.track' + currentTrack,
                oldPlayBtn = trackList[currentTrack]["playBtn"],
                oldPauseBtn = trackList[currentTrack]["pauseBtn"];

            //stop previous track
            eval(oldTrack).stop();
            trackList[currentTrack]["playInit"] = false;
            trackList[currentTrack]["playState"] = false;
            trackList[currentTrack]["slider"]["stop"]();
            oldPlayBtn.show();
            oldPauseBtn.hide();

            //put the now current track in stop-mode in cause it was paused
            track.playInit = false;
            track.audio.stop();
        };

        //objects
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
                var value = this.getValue();
                this.progress = setInterval(function(){
                    value += 0.25;
                    track.slider.setValue(value);
                }, 250);
            },
            stop: function() {
                clearInterval(track.slider.progress);
            }
        };

        //event listener function declarations
        track.onEvent = {
            //when clicking play/pause button
            clickPlay: function() {
                $('.play-' + track.num).on('click', function(e) {
                    e.preventDefault();
                    var $a = $('.play-svg-a-2');
                    var $b = $('.play-svg-b-2');
                    
                    if (!track.playState) {
                        if (track.num === 2) {
                            $a.removeClass('to-play-a-2');
                            $b.removeClass('to-play-b-2');
                            $a.addClass('to-pause-a-2');
                            $b.addClass('to-pause-b-2');         
                        } else {
                            track.playBtn.hide();
                            track.pauseBtn.show();
                        }
                        track.play();
                        track.playState = true;
                    } else {
                        if (track.num === 2) {
                            $a.removeClass('to-pause-a-2');
                            $b.removeClass('to-pause-b-2');
                            $a.addClass('to-play-a-2');
                            $b.addClass('to-play-b-2');
                        } else {
                            track.pauseBtn.hide();
                            track.playBtn.show();
                        }
                        track.stop();
                        track.playState = false;
                    }    
                });
            }, 
            //when scrubbing audio
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
            //when clicking show volume button. 
            //---!!!some players don't have this!!!
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
            //when scrubbing volume slider
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
            //when clicking plus/minus volume buttons
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

        //calling event listener and initializing functions
        track.volume.init();
        track.slider.init();
        track.onEvent.clickPlay();
        track.onEvent.onScrub();
        track.onEvent.showVolume();
        track.onEvent.slideVolume();
        track.onEvent.clickVolume();

        //return this entire track object
        return track;
    }

    
    ///////*******PLAYER SPECIFIC EVENTS*******///////
    
    //player 2 show volume
//    $('.volume-slider-div-2').on('mouseenter', function(e) {
//        e.preventDefault();
//        $('.plus-2').addClass('js-show-volume-2');
//        $('.minus-2').addClass('js-show-volume-2');
//    });
//    $('.volume-slider-div-2').on('mouseleave', function(e) {
//        e.preventDefault();
//        $('.plus-2').removeClass('js-show-volume-2');
//        $('.minus-2').removeClass('js-show-volume-2');
//    });
    
    
    
    ///////*******OTHER FUNCTIONS*******///////

    //turn seconds into minutes/seconds format
    function getMinutesSeconds(time) {
        var minutes = Math.floor(time / 60),
            seconds = time - minutes * 60;

        return minutes + ':' + seconds;
    }

    //shows tracks while hiding the loading placeholder
    function showTracks() {
        $('.loading-placeholder').hide();
        $('.player').show();
    }
});