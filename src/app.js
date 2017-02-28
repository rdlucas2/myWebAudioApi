var App = (function() {
    function App() {}

    //private

    // create web audio api context
    var audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    var gainNode = audioCtx.createGain();
    gainNode.gain.value = 1;
    gainNode.connect(audioCtx.destination);
    var oscillators = [];

    var pressedKeys = [];

    var subscriptions = [{
            "Name": "playSound",
            "Subscription": events.subscribe('playSound', function(frequency) {
                addOscillator(frequency);
            })
        },
        {
            "Name": "stopSound",
            "Subscription": events.subscribe('stopSound', function(obj) {
                var oscillator = oscillators.find(function(item) { return item.frequency.value === obj.frequency });
                if (oscillator.length > 1) {
                    for (var osc in oscillator) {
                        removeOscillator(osc);
                    }
                }
                if (oscillator) {
                    removeOscillator(oscillator);
                }
            })
        }
    ];

    function updateOscillatorsWaveType(waveType) {
        for (var i = 0; i < oscillators.length; i++) {
            var oscillator = oscillators[i];
            oscillator.type = waveType;
        }
    }

    function detuneOscillators(cents) {
        for (var i = 0; i < oscillators.length; i++) {
            var oscillator = oscillators[i];
            oscillator.detune.value = cents;
        }
    }

    function createOscillator(waveType, frequency) {
        var oscillator = audioCtx.createOscillator();
        oscillator.type = waveType;
        oscillator.frequency.value = frequency;
        oscillator.start();
        oscillator.connect(gainNode);
        return oscillator;
    }

    function getWaveType() {
        var waveTypeSelect = document.getElementById('waveType');
        return waveTypeSelect.value;
    }

    function addOscillator(obj) {
        var waveType = getWaveType();
        var oscillator = createOscillator(waveType, obj.frequency);
        oscillators.push(oscillator);
    }

    function removeOscillator(oscillator) {
        try {
            oscillator.disconnect(gainNode);
        } catch (err) {
            console.log(err);
            return;
        }
        var index = oscillators.indexOf(oscillator);
        if (index > -1) {
            oscillators[index].stop();
            oscillators.splice(index, 1);
        }
    }

    function toggleActive(noteName, index) {
        var isActive = document.getElementsByClassName(noteName)[index].classList.contains('active');
        if (isActive) {
            document.getElementsByClassName(noteName)[index].classList.remove('active');
        } else {
            document.getElementsByClassName(noteName)[index].classList.add('active');
        }
    }

    function getFrequencyFromKey(key) {
        switch (key) {
            case 'z':
                toggleActive('c', 0);
                return 131; //c below middle c
                break;
            case 's':
                toggleActive('cd', 0);
                return 139; //cd
                break;
            case 'x':
                toggleActive('d', 0);
                return 147; //d ...
                break;
            case 'd':
                toggleActive('de', 0);
                return 156; //de
                break;
            case 'c':
                toggleActive('e', 0);
                return 165; //e
                break;
            case 'v':
                toggleActive('f', 0);
                return 175; //f
                break;
            case 'g':
                toggleActive('fg', 0);
                return 185; //fg
                break;
            case 'b':
                toggleActive('g', 0);
                return 196; //g
                break;
            case 'h':
                toggleActive('ga', 0);
                return 208; //ga
                break;
            case 'n':
                toggleActive('a', 0);
                return 220; //a
                break;
            case 'j':
                toggleActive('ab', 0);
                return 233; //ab
                break;
            case 'm':
                toggleActive('b', 0);
                return 247; //b
                break;
            case ',':
                toggleActive('c', 1);
                return 262; // middle c -> at this point - use the same frequencies above, but multiply by 2 for the octave shift
                break;
            case 'q':
                toggleActive('c', 1);
                return 262; // middle c -> at this point - use the same frequencies above, but multiply by 2 for the octave shift
                break;
            case '2':
                toggleActive('cd', 1);
                return 278;
                break;
            case 'w':
                toggleActive('d', 1);
                return 294;
                break;
            case '3':
                toggleActive('de', 1);
                return 312;
                break;
            case 'e':
                toggleActive('e', 1);
                return 330;
                break;
            case 'r':
                toggleActive('f', 1);
                return 350;
                break;
            case '5':
                toggleActive('fg', 1);
                return 370;
                break;
            case 't':
                toggleActive('g', 1);
                return 392;
                break;
            case '6':
                toggleActive('ga', 1);
                return 416;
                break;
            case 'y':
                toggleActive('a', 1);
                return 440;
                break;
            case '7':
                toggleActive('ab', 1);
                return 466;
                break;
            case 'u':
                toggleActive('b', 1);
                return 494;
                break;
            case 'i':
                toggleActive('c', 2);
                return 524; // c above middle c -> at this point - use the same frequencies above, but multiply by 4 for the octave shift
                break;
        }
    }

    function changeGainNodeVolume(input) {
        gainNode.gain.value = input; // number between 0 and 1
    }

    //end private

    //public
    App.prototype.init = function() {
        //listen for keyboard events
        document.addEventListener("keydown", function(event) {
            var keyExists = pressedKeys.indexOf(event.key) > -1;
            if (!keyExists) {
                pressedKeys.push(event.key);
                var frequency = getFrequencyFromKey(event.key);
                if (frequency) {
                    events.publish('playSound', {
                        frequency: frequency
                    });
                }
            }
        });

        document.addEventListener("keyup", function(event) {
            var index = pressedKeys.indexOf(event.key);
            if (index < 0) {
                return;
            } else {
                pressedKeys.splice(index, 1);
                var frequency = getFrequencyFromKey(event.key);
                events.publish('stopSound', {
                    frequency: frequency
                });
            }
        });

        //keyboard controls
        var volumeSlider = document.getElementById('volume');
        volumeSlider.addEventListener('input', function(input) {
            changeGainNodeVolume(input.target.value / 100);
        });

        var detuneSlider = document.getElementById('detune');
        detuneSlider.addEventListener('input', function(input) {
            detuneOscillators(input.target.value);
        });

        var waveTypeSelect = document.getElementById('waveType');
        waveTypeSelect.addEventListener('change', function(input) {
            updateOscillatorsWaveType(input.target.value);
        });
    }

    return App;
})();

var app = new App();
app.init();