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
        track1: 'audio/track1.mp3',
        track2: 'audio/track1.mp3'
    });

    /*******Audio Track Constructor*******/

    var Track = function(n, t) {
        var _this = this;

        _this.track = t,
            _this.num = n || 1;
        _this.playInit = false;
        _this.clickState = false;
        _this.playState = false;
        _this.vDiv = $('.volume-slider-div-' + _this.num);
        _this.pDiv = $('.progress-div-' + _this.num);

        _this.play = function() {
            _this.slider.play(); 
            if (!_this.playInit) {
                _this.track.play(_this.slider.getValue());
                _this.playInit = true;
                _this.volume.gainNodeInit();
            } else {
                _this.track.resume();
            }   
        };

        _this.stop = function() {
            _this.slider.stop();
            if (!playInit) {
                _this.track.stop();
            } else {
                _this.track.suspend();
            }
        };

        _this.volume = {
            init: function() {
                _this.vDiv.slider({
                    max: 100,
                    value: 75,
                    range: 'min',
                    step: 1
                });
            },
            gain: undefined,
            gainNodeInit: function() {
                var value = _this.volume.getValue() / 10;
                this.gain = context.createGain();
                playSound.connect(_this.volume.gain);
                this.gain.connect(context.destination);
                this.gain.gain.value = value;
            },
            getValue: function() {
                return _this.vDiv.slider('value');
            },
            setValue: function(v) {
                _this.vDiv.slider('value', v);
            }
        }

        _this.slider = {
            init: function() {
                _this.pDiv.slider({
                    max: playSound.duration,
                    range: 'min',
                    step: 0.25
                });
            },
            progress: undefined,
            getValue: function() {
                return _this.pDiv.slider('value');
            },
            setValue: function(v) {
                _this.pDiv.slider('value', v);
            },
            play: function() {
                var value = slider.getValue();
                _this.slider.progress = setInterval(function(){
                    value += 0.25;
                    _this.slider.setValue(value);
                }, 250);
            },
            stop: function() {
                clearInterval(_this.slider.progress);
            }
        }

        _this.onEvent = {
            clickPlay: function() {
                $('.play-' + _this.num).on('click', function(e) {
                    e.preventDefault();
                    if (!_this.playState) {
                        $('.ti-control-play').hide();
                        $('.ti-control-pause').show();
                        _this.play();
                        _this.playState = true;
                    } else {
                        $('.ti-control-pause').hide();
                        $('.ti-control-play').show();
                        _this.stop();
                        _this.playState = false;
                    }    
                });
            },
            onScrub: function() {
                _this.pDiv.on('slidestart', function(event, ui) {
                    _this.playInit = false; 
                    _this.stop();
                });
                _this.pDiv.on('slidestop', function(event, ui) {
                    if (_this.playState) {
                        _this.play();
                    }
                });
            },
            showVolume: function() {
                $('.volume-div-' + _this.num).on('click', function(e) {
                    e.preventDefault();
                    if (!_this.clickState) {
                        _this.vDiv.addClass('volume-shown-' + _this.num).removeClass('volume-hidden-' + _this.num);
                        _this.clickState = true;
                    } else {
                        _this.vDiv.addClass('volume-hidden-' + _this.num).removeClass('volume-shown-' + _this.num);
                        _this.clickState = false;
                    }  
                });
            },
            slideVolume: function() {
                _this.vDiv.on('slide', function(event, ui) {
                    volume.gain.gain.value = (ui.value / 10) - 1;
                });
                $('.volume-btn').on('mouseenter', function() {
                    _this.vDiv.slider('disable');
                });
                $('.volume-btn').on('mouseleave', function() {
                    _this.vDiv.slider('enable');
                });

            },
            clickVolume: function() {
                $('.plus-' + _this.num).on('click', function(e) {
                    if (volume.getValue() < 100) {
                        volume.setValue(volume.getValue() + 5);
                        volume.gain.gain.value = (volume.getValue() / 10) - 1;
                    } 
                });
                $('.minus-' + _this.num).on('click', function(e) {
                    if (volume.getValue() > 0) {
                        volume.setValue(volume.getValue() - 5);
                        volume.gain.gain.value = (volume.getValue() / 10) - 1;
                    } 
                }); 
            }
        }
        _this.onEvent.clickPlay();
        _this.onEvent.onScrub();
        _this.onEvent.showVolume();
        _this.onEvent.slideVolume();
        _this.onEvent.clickVolume();
    }
    
    var track1 = new Track(1, sound.track1);

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
