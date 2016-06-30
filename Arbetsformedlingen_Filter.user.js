// ==UserScript==
// @name       Arbetsförmedlingen Filter
// @version    2.2.0
// @author     Mogle
// @namespace  https://github.com/MeeperMogle
// @match      http*://www.arbetsformedlingen.se/*
// @grant      none
// @require    http://code.jquery.com/jquery-2.1.4.min.js
// @require    http://code.jquery.com/ui/1.11.4/jquery-ui.min.js
// @resource   uiCSS http://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css
// @grant      GM_addStyle
// @grant      GM_getResourceText
// ==/UserScript==

// Name of this project
var projectName = "Arbetsförmedlingen filter";

// Case-insensitive :contains selector
$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

// Add jQuery UI-stylesheet to the page
//var uiCSS = GM_getResourceText ("uiCSS");
//GM_addStyle (uiCSS);

// Add button to the page for showing the filter-settings
var settingsButton = "<input type=button value='Filter' id=filterButton>";
$('#svid12_30f22bf0149c30b5a7e5de9 ul').prepend("<li style='display:inline;'>"+settingsButton+"</li>");

// Add the popup-dialog which will be used
$('#svid12_30f22bf0149c30b5a7e5de9').append('<div id="settingsDialog" title="'+projectName+' - Inställningar"></div>');

// Activate tooltips (hover-text) on the settings
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
settingsHtml += "<br><br>";
settingsHtml += "<button id=copySettingsText style=float:left;>Copy settings</button>";
settingsHtml += "<button id=pasteSettingsText style=float:right;>Paste settings</button>";
$('#settingsDialog').append(settingsHtml);

$('.regexInfo').css('text-decoration','underline').attr('title','Avancerad filtrering. Klicka för mer information.');
$('.regexInfo').click(function(){
    window.open("https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions","_whatIsRegex");
});



// Set the structure for the stored information
var abfSettings;

// Use local storage to make the settings persistent
function saveSettings(){
    localStorage.setItem("abfFilterSettings", JSON.stringify(abfSettings));
}
function loadSettings(){
    abfSettings = localStorage.getItem("abfFilterSettings");

    if(abfSettings === null){
        abfSettings = {
            noTitles: ["arbetslös","sjukskriven"],
            noCompanies: ["elakt företag","dåliga villkor ab"],
            noCities: ["månen","mars"],
            noDates: ["1900-01-01"],
            regexTitles: false,
            regexCompanies: false,
            regexCities: false,
            regexDates: false
        };
        saveSettings();
    } else {
        abfSettings = JSON.parse(abfSettings);
    }
}
loadSettings();

// Populate the Settings with the correct values
function populateSettings(thingName, theArray){
    $('#unwanted'+thingName).text("");
    for(var i=0; i<theArray.length;i++){
        $('#unwanted'+thingName).append(theArray[i] + "\n");
    }
}
populateSettings('Titles', abfSettings.noTitles);
populateSettings('Companies', abfSettings.noCompanies);
populateSettings('Cities', abfSettings.noCities);
populateSettings('Dates', abfSettings.noDates);


$('#regexTitles').attr('checked',abfSettings.regexTitles);
$('#regexCompanies').attr('checked',abfSettings.regexCompanies);
$('#regexCities').attr('checked',abfSettings.regexCities);
$('#regexDates').attr('checked',abfSettings.regexDates);



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

    switch(thing){
        case "Titles":
            abfSettings.noTitles = cleanArray;
            break;
        case "Companies":
            abfSettings.noCompanies = cleanArray;
            break;
        case "Cities":
            abfSettings.noCities = cleanArray;
            break;
        case "Dates":
            abfSettings.noDates = cleanArray;
            break;
    }

    saveSettings();
    applyAllFilters();
}

$('#saveUnwantedTitles, #saveUnwantedCompanies, #saveUnwantedCities, #saveUnwantedDates').click(saveButtonClickFunction);


// Make it possible to apply the Regex-settings by checking them
function flipRegexCheckBox(){
    var thing = $(this).attr('id').replace('regex','');

    switch(thing){
        case "Titles":
            abfSettings.regexTitles = $(this).is(':checked');
            break;
        case "Companies":
            abfSettings.regexCompanies = $(this).is(':checked');
            break;
        case "Cities":
            abfSettings.regexCities = $(this).is(':checked');
            break;
        case "Dates":
            abfSettings.regexDates = $(this).is(':checked');
            break;
    }

    saveSettings();
    applyAllFilters();
}

$('#regexDates, #regexTitles, #regexCompanies, #regexCities').click(flipRegexCheckBox);


// Test the validity of the settings in the given JSON-object
function validSettings(jsonSettings){
    return (
        jsonSettings.noTitles instanceof Array && jsonSettings.regexTitles !== undefined &&
        jsonSettings.noCompanies instanceof Array && jsonSettings.regexCompanies !== undefined &&
        jsonSettings.noCities instanceof Array && jsonSettings.regexCities !== undefined &&
        jsonSettings.noDates instanceof Array && jsonSettings.regexDates !== undefined
    );
}


// Easier transfer of settings between computers: Copy the settings as text
$('#copySettingsText').click(function(){
    alert( JSON.stringify(abfSettings) );
});


// Easier transfer of settings between computers: Paste the settings as text
$('#pasteSettingsText').click(function(){
    var supposedSettings = prompt("Paste settings copied from the script...");

    try{
        var jsonIfied = JSON.parse(supposedSettings);

        if(validSettings(jsonIfied)){
            abfSettings = jsonIfied;
            saveSettings();

            populateSettings('Titles', abfSettings.noTitles);
            populateSettings('Companies', abfSettings.noCompanies);
            populateSettings('Cities', abfSettings.noCities);
            populateSettings('Dates', abfSettings.noDates);

            $('#regexTitles').attr('checked',abfSettings.regexTitles);
            $('#regexCompanies').attr('checked',abfSettings.regexCompanies);
            $('#regexCities').attr('checked',abfSettings.regexCities);
            $('#regexDates').attr('checked',abfSettings.regexDates);

            applyAllFilters();
        } else {
            throw "meep";
        }
    } catch(e){
        alert("This does not look like the correct format for settings.\nPlease only use directly copied settings-strings.");
    }
});
