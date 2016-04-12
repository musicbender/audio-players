
var main = function () {

   //FORM VALIDATION----------------------------------------------------
   function validate(input1, input2, input3, input4, button, formClass) {
       //runs valid() function when arrows are clicked
       formClass.change(function() {
           valid();
       });
       //runs valid() function when anything is typed into the form
       formClass.keyup(function() {
           valid();
       });
       //validation function
       function valid() {
           if ((input3 == null) && (input4 == null)) {
               if ((input1.val() == "") || (input2.val() == "")) {
                    button.removeAttr("disabled");
                    button.attr("disabled", true);
               } else {
                   button.removeAttr("disabled");
               }
           } else if ((input3 !== null) && (input4 == null)) {
               if ((input1.val() == "") || (input2.val() == "") || (input3.val() == "")) {
                    button.removeAttr("disabled");
                    button.attr("disabled", true);
               } else {
                   button.removeAttr("disabled");
               }
           } else {
               if ((input1.val() == "") || (input2.val() == "") || (input3.val() == "") || (input4.val() == "")) {
                    button.removeAttr("disabled");
                    button.attr("disabled", true);
               } else {
                   button.removeAttr("disabled");
               }
           }
       }
   }

    //running each validate() function for each form section when page opens
    validate($('#coffeeDose'), $('#waterDose'), null, null, $('#submitBrewCal'), $('.brew-form'));
    validate($('#tdsPercent'), $('#dryMass'), $('#brewMass'), null, $('#submitExtCal'), $('.ext-form'));
    validate($('#preWeight'), $('#postWeight'), null, null, $('#submitLossCal'), $('.loss-form'));
    validate($('#devMin'), $('#devSec'), $('#totalMin'), $('#totalSec'), $('#submitDevCal'), $('.dev-form'));

    //DISABLE COPY/PASTE------------------------------------------------
    $('.form-control').bind('cut copy paste taphold contextmenu', function(e) {
    e.preventDefault();
    });

    //UNITS AND UNITCONVERSION-------------------------------------------

    //FIND UNIT OF NEARBY INPUT BOX
    function findUnitFromInput(id) {
        return $(id).siblings().children(".dropdown-toggle:first-child").text();
    }

    //UNIT CONVERSION
    function unitConvert(value, unit, prev) {
        unit = unit.trim();
        prev = prev.trim();
        if (prev === "grams") {
            if (unit === "grams") {
                return value;
            } else if (unit === "ounces") {
                return Math.round((parseFloat(value) * 0.035274) * 100) / 100;
            } else if (unit === "tbsp.") {
                return Math.round((parseFloat(value) * 0.18867925) * 100) / 100;
            } else if (unit === "lbs.") {
                return Math.round((parseFloat(value) / 453.592) * 100) / 100;
            } else {
                return 000;
            }
        } else if (prev === "ounces") {
            if (unit === "grams") {
                return Math.round((parseFloat(value) / 0.035274) * 100) / 100;
            } else if (unit === "ounces") {
                return value;
            } else if (unit === "tbsp.") {
                return Math.round((parseFloat(value) / 0.19000570) * 100) / 100;
            } else if (unit === "lbs.") {
                return Math.round((parseFloat(value) / 16) * 100) / 100;
            } else {
                return 000;
            }
        } else if (prev === "tbsp."){
            if (unit === "grams") {
                return Math.round((parseFloat(value) / 0.18867925) * 100) / 100;
            } else if (unit === "ounces") {
                return Math.round((parseFloat(value) * 0.19000570) * 100) / 100;
            } else if (unit === "tbsp.") {
                return value;
            } else {
                return 000;
            }
        } else if (prev === "lbs.") {
            if (unit === "grams") {
                return Math.round((parseFloat(value) * 453.592) * 100) / 100;
            } else if (unit === "ounces") {
                return Math.round((parseFloat(value) * 16) * 100) / 100;
            } else if (unit === "lbs.") {
                return value;
            }
        } else {
            return 000;
        }
    }

    //RECONVERTS BACK TO GRAMS
    function reconvertGrams(unit, value){
        unit = unit.trim();
        if (unit === "grams") {
            return value;
        } else if (unit === "ounces") {
            return Math.round((parseFloat(value) / 0.035274) * 100) / 100;
        } else if (unit === "tbsp.") {
            return Math.round((parseFloat(value) / 0.18867925) * 100) / 100;
        } else if (unit === "lbs.") {
            return Math.round((parseFloat(value) * 453.592) * 100) / 100;
        } else {
            return 000;
        }
    }

    //STORE PREVIOUS UNIT
            //will always happen before clicking on a dropdown item.
    $('.dropdown-toggle').click(function(){
        $(this).data("prev", $(this).text());
    });

    //DROPDOWN BUTTON ADDON--------------------------------
    $(".dropdown-menu li a").click(function(e) {
        e.preventDefault();
        //changes button text to whatever unit you clicked on
        $(this).parent().parent().siblings(".dropdown-toggle:first-child").html($(this).text()+' <span class="caret"></span>');
        $(this).parent().parent().siblings(".dropdown-toggle:first-child").val($(this).text());

        var currentUnit = $(this).text(),
            currentValue = $(this).parent().parent().parent().siblings().val(), //value in box
            oldUnit = $(this).parent().parent().siblings().data("prev"), //previous button value
            convert = unitConvert(currentValue, currentUnit, oldUnit); //converts the value of the textbox

        $(this).parent().parent().parent().siblings().val(convert);
    });

    //CALCULATORS-------------------------------------------------

    //BREW CALCULATOR
    $('#brewCalForm').submit(function() {
        var coffeeValue = reconvertGrams(findUnitFromInput('#coffeeDose'), $('#coffeeDose').val()),
            waterValue = reconvertGrams(findUnitFromInput('#waterDose'), $('#waterDose').val());

        function findRatio (coffee, water) {
            return Math.round((parseFloat(water) / parseFloat(coffee)) * 10) / 10;
        }

        $('.answerBrew').text('1 : ' + findRatio(coffeeValue, waterValue) + ' Ratio');
        return false;
    });

    //EXTRACTION YIELD CALCULATOR
    $('#extCalForm').submit(function(){
        var tdsValue = $('#tdsPercent').val(),
            dryMassValue = $('#dryMass').val(),
            brewMassValue = $('#brewMass').val();

        function findExtPercent(tds, dry, brew) {
//            return brew * (tds / dry);
            return Math.round((brew * (tds / dry)) * 100) / 100;
        }

        $('.answerExt').text(findExtPercent(tdsValue, dryMassValue, brewMassValue) + '%');
        return false;
    });

    //LOSS CALCULATOR
    $('#lossCalForm').submit(function(){
        var preWeightValue = reconvertGrams(findUnitFromInput('#preWeight'), $('#preWeight').val()),
            postWeightValue = reconvertGrams(findUnitFromInput('#postWeight'), $('#postWeight').val());

        function findLossPercent(pre, post) {
            return Math.round((100 - ((post / pre) * 100)) * 10) / 10;
        }

        $('.answerLoss').text(findLossPercent(preWeightValue, postWeightValue) + '%');
        return false;
    });

    //DEV CALCULATOR
    $('#devCalForm').submit(function(){
        var totalMinValue = $('#totalMin').val(),
            totalSecValue = $('#totalSec').val(),
            devMinValue = $('#devMin').val(),
            devSecValue = $('#devSec').val(),
            totalTime = findSeconds(totalMinValue, totalSecValue),
            totalDev = findSeconds(devMinValue, devSecValue);

        function findSeconds (min, sec) {
            return (parseFloat(min) * 60) + parseFloat(sec);
        }

        function findPercent (total, dev){
            return Math.round((100 - ((dev / total) * 100)) * 10) / 10;
        }

        $('.answerDev').text(findPercent(totalTime, totalDev) + '%');
        return false;
    });

    //TOOLTIP
    $('.popover-div').popover();

    setTimeout(function() {
        var goat = {
            hooves: 4,
            eyes: 'weird',
            sound: 'bahhh',
            attack: 'jump kick',
            food: ['cans', 'bananas', 'grass', 'shirts']
        }
    }, 10000);

    var banana = 'monkey hambone dishwasher dog';
    $('.banana').click(function(){
        console.log('go bananas' + banana);
    })

}

$(document).ready(main);
