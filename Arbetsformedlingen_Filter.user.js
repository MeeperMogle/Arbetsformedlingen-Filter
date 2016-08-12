// ==UserScript==
// @name       Arbetsförmedlingen Filter
// @version    2.4.0
// @author     Mogle
// @namespace  https://github.com/MeeperMogle
// @match      http*://www.arbetsformedlingen.se/*
// @grant      none
// @require    http://code.jquery.com/jquery-2.1.4.min.js
// @require    http://code.jquery.com/ui/1.11.4/jquery-ui.min.js
// ==/UserScript==

// Name of this project
var projectName = "Arbetsförmedlingen filter";

// Case-insensitive :contains selector
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

// Add CSS for jQuery UI
var jqueryUIcss = "http://code.jquery.com/ui/1.9.1/themes/smoothness/jquery-ui.css";
$("head").append ( '<link href="' + jqueryUIcss + '" rel="stylesheet" type="text/css">' );

// Add button to the page for showing the filter-settings
var settingsButton = "<input type=button value='Filter' id=filterButton>";
$('#svid12_30f22bf0149c30b5a7e5de9 ul').prepend("<li style='display:inline;'>"+settingsButton+"</li>");

// Add the popup-dialog which will be used
$('#svid12_30f22bf0149c30b5a7e5de9').append('<div id="settingsDialog" title="'+projectName+' - Inställningar"></div>');

// Activate tooltips (hover-text) inside the settings-dialog
$(function() {
    $( '#settingsDialog' ).tooltip();
});

// Set the options for the dialog box
$(function() {
    $( "#settingsDialog" ).dialog(
        {
            autoOpen: false,
            width: 650,
            height: 540,
            resizable: true,
            position: {my: "top", at: "bottom", of: $('#svid10_30f22bf0149c30b5a7e5ddc')}
        }
    );

    $('#settingsDialog').tabs();
    $('.ui-tabs-anchor').css('min-width','150px');
});

// Use the Filter-button to toggle the settings-dialog
$('#filterButton').click(function(){
    if($("#settingsDialog").dialog("isOpen")){
        $("#settingsDialog").dialog("close");
    } else {
        $("#settingsDialog").dialog("open");
    }
});

// Make sure the dialog with the settings is hidden by default,
// or it will flash for half a second on each page reload. Not ideal!
$('#settingsDialog').hide();

// Create the HTML that holds the settings
var settingsHtml = "";

settingsHtml += "<button id=copySettingsText style=float:left;>Copy settings</button>";
settingsHtml += "<input type=text id=copyableSettingsText style=float:left;width:65%;margin-left:10px;margin-top:5px;visibility:hidden;>";
settingsHtml += "<button id=pasteSettingsText style=float:right;>Paste settings</button>";
settingsHtml += "<br><br>";

// Tab menu
settingsHtml += "<ul><li><a href='#tabs1'>Sökresultat</a></li><li><a href='#tabs2'>Annons-text</a></li></ul>";

// First tab: Search results html
settingsHtml += "<div id=tabs1>";
settingsHtml += "<h3 title='Visa inte jobb med Rubriker som innehåller dessa ord. En per rad.'>Inte dessa Rubriker</h3>";
settingsHtml += "<textarea style='width:100%;height:100px;resize:both;' id=unwantedTitles></textarea>";
settingsHtml += "<br><input type=submit value=Spara id=saveUnwantedTitles>";
settingsHtml += "<span style='float:right';><input type=checkbox id=regexTitles> Regex <span class=regexInfo>(avancerat)</span></span>";
settingsHtml += "<br><hr><br>";
settingsHtml += "<h3 title='Visa inte jobb som kommer från Arbetsgivare med dessa ord i namnet. En per rad.'>Inte dessa Arbetsgivare</h3>";
settingsHtml += "<textarea style='width:100%;height:100px;resize:both;' id=unwantedCompanies></textarea>";
settingsHtml += "<br><input type=submit value=Spara id=saveUnwantedCompanies>";
settingsHtml += "<span style='float:right';><input type=checkbox id=regexCompanies> Regex <span class=regexInfo>(avancerat)</span></span>";
settingsHtml += "<br><hr><br>";
settingsHtml += "<h3 title='Visa inte jobb som är på Arbetsorter med dessa ord i namnet. En per rad.'>Inte dessa Arbetsorter</h3>";
settingsHtml += "<textarea style='width:100%;height:100px;resize:both;' id=unwantedCities></textarea>";
settingsHtml += "<br><input type=submit value=Spara id=saveUnwantedCities>";
settingsHtml += "<span style='float:right';><input type=checkbox id=regexCities> Regex <span class=regexInfo>(avancerat)</span></span>";
settingsHtml += "<br><hr><br>";
settingsHtml += "<h3 title='Visa inte jobb Publicerade dessa datum. En per rad.'>Inte dessa Publiceringsdatum</h3>";
settingsHtml += "<textarea style='width:100%;height:100px;resize:both;' id=unwantedDates></textarea>";
settingsHtml += "<br><input type=submit value=Spara id=saveUnwantedDates>";
settingsHtml += "<span style='float:right';><input type=checkbox id=regexDates> Regex <span class=regexInfo>(avancerat)</span></span>";
settingsHtml += "</div>";


// Second tab: Ad-text things, mainly word/phrase colouring
settingsHtml += "<div id=tabs2>";
settingsHtml += "<h3 title='Markera alla hittade ord i en annons i en färg. En per rad.'>Färgmarkeringar</h3>";

// Floating-text when hovering
var fargTitle = "Färgen de angivna orden ska ha i annonstexter. Ordet till vänster visar färgen.";
var ordBoxTitle = "Ord att färga. Ett per rad.";

// Generate rows for inputting custom colours.
var allowedCustomColourings = 10;
for(var i=0; i<allowedCustomColourings; i++){
    settingsHtml += "<br>"+
        "<span id='colourNameSpan"+i+"'>Färg</span> <input id='colourName"+i+"' "+
        "size=7 maxlength=7 title='"+fargTitle+"'>"+
        "&nbsp;&nbsp;&nbsp;Ord <textarea id='colourWords"+i+"' rows=2 style='margin-bottom:-7px;resize:both;width:400px;' "+
        "title='"+ordBoxTitle+"'></textarea> ";
}
settingsHtml += "<br><input style='margin-top:10px;' type=submit value=Spara id=saveColourings>";

settingsHtml += "</div>";

// Footer: Reset ALL settings button
settingsHtml += "<br>";
settingsHtml += "<div style='text-align:center;'><input type=submit value='Ta bort ALLA inställningar' id=resetAllSettings></div>";

settingsHtml += "</div>";

// Add all of the HTML
$('#settingsDialog').append("<div>" + settingsHtml + "</div>");

// Apply CSS and click-event to Regex-info
$('.regexInfo').css('text-decoration','underline').attr('title','Avancerad filtrering. Klicka för mer information.');
$('.regexInfo').click(function(){
    window.open("https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions","_whatIsRegex");
});

// Apply CSS and click-event to Colour-info
$('span[id*=colourNameSpan]').css({textDecoration:'underline',fontWeight:'bold'});
$('span[id*=colourNameSpan]').click(function(){
    window.open("https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Color","_colours");
});

// Update colours when typing
$('input[id*=colourName]').keyup(function(){
    var number = $(this).attr('id').replace("colourName","");
    $('#colourNameSpan'+number).css("color",$(this).val());
});


// Set the structure for the stored information
var abfSettings;

// Use local storage to make the settings persistent
function saveSettings(){
    localStorage.setItem("abfFilterSettings", JSON.stringify(abfSettings));
}
function loadSettings(resetSettings){
    abfSettings = localStorage.getItem("abfFilterSettings");

    if(abfSettings == "null" || resetSettings){
        abfSettings = {
            noTitles: ["arbetslös","sjukskriven"],
            noCompanies: ["elakt företag","dåliga villkor ab"],
            noCities: ["månen","mars"],
            noDates: ["1900-01-01"],
            regexTitles: false,
            regexCompanies: false,
            regexCities: false,
            regexDates: false,
            colourings : {}
        };
        saveSettings();
    } else {
        abfSettings = JSON.parse(abfSettings);
    }
}
loadSettings();

// Populate the Settings with the correct values
function populateSettings(thingName, theArray){
    var completeText = "";

    for(var i=0; i<theArray.length;i++){
        completeText += theArray[i] + "\n";
    }

    $('#unwanted'+thingName).text(completeText);
    $('#unwanted'+thingName).val(completeText);
}

function mirrorAllSettings(){
    populateSettings('Titles', abfSettings.noTitles);
    populateSettings('Companies', abfSettings.noCompanies);
    populateSettings('Cities', abfSettings.noCities);
    populateSettings('Dates', abfSettings.noDates);

    $('#regexTitles').attr('checked',abfSettings.regexTitles);
    $('#regexCompanies').attr('checked',abfSettings.regexCompanies);
    $('#regexCities').attr('checked',abfSettings.regexCities);
    $('#regexDates').attr('checked',abfSettings.regexDates);

    // Use a loop for the colours, as they are dynamic
    // First, clear all of it
    $('[id*=colourName').val("");
    $('[id*=colourName').keyup();
    $('[id*=colourWords').val("");
    $('[id*=colourRegex').attr('checked',false);

    var i = 0;
    for(var colour in abfSettings.colourings){
        $('#colourName'+i).val(colour);
        $('#colourName'+i).keyup();
        $('#colourWords'+i).val(abfSettings.colourings[colour].join("\n"));
        i++;
    }
}
mirrorAllSettings();


// When clicking to save the Ad-text colourings, they get dynamically added to the settings
function updateColouringsObject(){
    abfSettings.colourings = {};

    $('input[id*=colourName]').each(function(){
        var currentValue = $(this).val();
        if(currentValue !== ""){
            var number = $(this).attr('id').replace("colourName","");
            abfSettings.colourings[currentValue] = [];
            abfSettings.colourings[currentValue] = $('#colourWords'+number).val().split('\n');
        }
    });

    saveSettings();
}



// General function for filtering out results.
// Enter these parameters: Filter array, css selector for the object inside the TD, boolean of whether to use Regex
function filterOut(terms, aSelector, usingRegex){
    // Want to use regex?
    if(usingRegex){
        // For each of the select:ed objects...
        $(aSelector).each(function(){
            // Fetch the text - only once, for better performance
            var targetText = $(this).html();

            // Loop through the filter-terms
            for(var i=0; i<terms.length;i++){
                // Generate a regular expression from it
                var re = new RegExp(terms[i],"i");

                // Check if it matches the current target.
                // If it does, hide the target and move on to the next target.
                if( targetText.match(re) !== null ){
                    $(this).parent().parent().hide();
                    break;
                }
            }
        });
    } else { // Not using regex?
        // Just find all places where the term is written, as-is, and hide that.
        for(var i=0; i<terms.length;i++){
            $(aSelector + ":contains("+terms[i]+")").parent().parent().hide();
        }
    }
}
function applyAllFilters(){
    // Show everything by default
    $("a[id*=Rubrik]").parent().parent().show();

    // Then filter out based on Rubrik, Arbetsgivare, Arbetsort
    filterOut(abfSettings.noTitles,"a[id*=Rubrik]",abfSettings.regexTitles);
    filterOut(abfSettings.noCompanies,"span[id*=Arbetsgivare]",abfSettings.regexCompanies);
    filterOut(abfSettings.noCities,"span[id*=Arbetsort]",abfSettings.regexCities);
    filterOut(abfSettings.noDates,"span[id*=Publiceringsdatum]",abfSettings.regexDates);
}
applyAllFilters();



// Functionality to reset all settings, after a confirm-check
$('#resetAllSettings').click(function(){
    if( confirm("Detta kommer att ta bort ALLA inställningar du har lagt till.\nBåde på Sökresultat och Annons-text.") ){
        loadSettings(true);
        mirrorAllSettings();
        applyAllFilters();

        colourAllWords();
    }
});


// Make it possible to save settings based on what is manually typed into the textareas.
// Empty lines are ignored.
function saveButtonClickFunction(){
    var thing = $(this).attr('id').replace('saveUnwanted','');

    var newArray = $('#unwanted'+thing).val().split("\n");
    var cleanArray = [];
    for(var i=0; i<newArray.length; i++){
        if(newArray[i] !== ""){
            cleanArray.push(newArray[i]);
        }
    }
    cleanArray.sort();

    abfSettings["no"+thing] = cleanArray;

    saveSettings();
    applyAllFilters();
}

$('#saveUnwantedTitles, #saveUnwantedCompanies, #saveUnwantedCities, #saveUnwantedDates').click(saveButtonClickFunction);


// Make it possible to apply the Regex-settings by checking them
function flipRegexCheckBox(){
    var thing = $(this).attr('id').replace('regex','');

    abfSettings["regex"+thing] = $(this).is(':checked');

    saveSettings();
    applyAllFilters();
}

$('#regexDates, #regexTitles, #regexCompanies, #regexCities').click(flipRegexCheckBox);


// Test the validity of the settings in the given JSON-object
function validSettings(jsonSettings){
    var allGood = true;

    for(var key in jsonSettings){
        // Textarea-content are stored inside objects of type Array
        if(key.startsWith("no")){
            allGood = jsonSettings[key] instanceof Array;
            if(!allGood){
                console.log("Invalid JSON @ " + jsonSettings[key]);
            }
        }
        // Checkbox-flag values cannot be "undefined"
        else if(key.startsWith("regex")){
            allGood = jsonSettings[key] !== undefined;
            if(!allGood){
                console.log("Invalid JSON @ " + jsonSettings[key]);
            }
        }
        // Colourings
        else if(key === "colourings"){
            for(var inner in jsonSettings[key]){
                allGood = jsonSettings[key][inner] instanceof Array;
                if(!allGood){
                    console.log("Invalid JSON @ " + jsonSettings[key][inner]);
                    break;
                }
            }
        }

        // Force stop if something is amiss
        if(!allGood){
            break;
        }
    }

    return allGood;
}


// Easier transfer of settings between computers: Copy the settings as text
$('#copyableSettingsText').focus(function() { $(this).select(); } );
$('#copyableSettingsText').blur(function(){$(this).css('visibility','hidden');});
$('#copyableSettingsText').keyup(function(){if($(this).val() === ""){$(this).blur();}});
$('#copySettingsText').click(function(){
    //prompt( "This text can be copied, saved and later pasted to restore your settings.", JSON.stringify(abfSettings) );
    $('#copyableSettingsText').val( JSON.stringify(abfSettings) );
    $('#copyableSettingsText').css('visibility','visible');
    $('#copyableSettingsText').focus();
});


// Easier transfer of settings between computers: Paste the settings as text
$('#pasteSettingsText').click(function(){
    var supposedSettings = prompt("Paste settings-text to restore settings.\nWARNING: Deletes current settings!");

    try{
        var jsonIfied = JSON.parse(supposedSettings);

        if(validSettings(jsonIfied)){
            abfSettings = jsonIfied;
            saveSettings();

            mirrorAllSettings();

            applyAllFilters();

            colourAllWords();
        } else {
            throw "meep";
        }
    } catch(e){
        alert("This does not look like the correct format for settings.\nPlease only use directly copied settings-strings.");
        console.log(e);
    }
});




function resetColored(){
    // Remove previously existing colored ones, to mirror removed colourings
    var coloredOnes = $('.colored').get();
    var amountColored = coloredOnes.length;
    for(var j=0; j<amountColored; j++){
        coloredOnes[j].outerHTML = coloredOnes[j].innerHTML;
    }

    $('#rightcolumn').html("");
}

function colourWords(colour, regexesArray, isRegex){
    var arrayLength = regexesArray.length;
    for(var i=0; i<arrayLength; i++){
        var originalHtml = $('.showJobPosting-text').html();

        var currentRegexp = new RegExp(regexesArray[i],"gi");

        var matches = currentRegexp.exec(originalHtml);

        if(matches !== null){
            var matchesLength = matches.length;

            for(var j=0; j<matchesLength; j++){
                originalHtml = $('.showJobPosting-text').html();

                if(matches[j] == undefined)
                    continue;

                var newShow = "<span class='colored "+colour+"'>"+matches[j]+"</span>";

                $('#rightcolumn').append(newShow+"<br>");

                $('.showJobPosting-text').html(
                    originalHtml.replace(new RegExp(matches[j],"gi"), newShow)
                );

                // Since global regex flag is used, it's enough to do the first run
                break;
            }
        }
    }

    $('#rightcolumn').append("<p>");
    $('.'+colour+'').css("color",colour);
}

function colourAllWords(){
    resetColored();

    $('.application-date').css("color","black");

    for(var currentColour in abfSettings.colourings){
        colourWords(currentColour, abfSettings.colourings[currentColour]);
    }

    $('.colored').css({fontWeight: "bold", textDecoration: "underline"});
}


colourAllWords();


$('#saveColourings').click(function(){
    updateColouringsObject();
    colourAllWords();
});
