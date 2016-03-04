// ==UserScript==
// @name       Arbetsförmedlingen Filter
// @version    2.0.0
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
var uiCSS = GM_getResourceText ("uiCSS");
GM_addStyle (uiCSS);

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
            regexTitles: false,
            regexCompanies: false,
            regexCities: false
        };
        saveSettings();
    } else {
        abfSettings = JSON.parse(abfSettings);
    }
}
loadSettings();

// Populate the Settings with the correct values
for(var i=0; i<abfSettings.noTitles.length;i++){
    $('#unwantedTitles').append(abfSettings.noTitles[i] + "\n");
}
for(var i=0; i<abfSettings.noCompanies.length;i++){
    $('#unwantedCompanies').append(abfSettings.noCompanies[i] + "\n");
}
for(var i=0; i<abfSettings.noCities.length;i++){
    $('#unwantedCities').append(abfSettings.noCities[i] + "\n");
}

$('#regexTitles').attr('checked',abfSettings.regexTitles);
$('#regexCompanies').attr('checked',abfSettings.regexCompanies);
$('#regexCities').attr('checked',abfSettings.regexCities);



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
}
applyAllFilters();



// Make it possible to save settings based on what is manually typed into the textareas.
// Empty lines are ignored.
$('#saveUnwantedTitles').click(function(){
    var newArray = $('#unwantedTitles').val().split("\n");
    var cleanArray = [];
    for(var i=0; i<newArray.length; i++){
        if(newArray[i] !== ""){
            cleanArray.push(newArray[i]);
        }
    }
    cleanArray.sort();
    abfSettings.noTitles = cleanArray;
    saveSettings();
    applyAllFilters();
});
$('#saveUnwantedCompanies').click(function(){
    var newArray = $('#unwantedCompanies').val().split("\n");
    var cleanArray = [];
    for(var i=0; i<newArray.length; i++){
        if(newArray[i] !== ""){
            cleanArray.push(newArray[i]);
        }
    }
    cleanArray.sort();
    abfSettings.noCompanies = cleanArray;
    saveSettings();
    applyAllFilters();
});
$('#saveUnwantedCities').click(function(){
    var newArray = $('#unwantedCities').val().split("\n");
    var cleanArray = [];
    for(var i=0; i<newArray.length; i++){
        if(newArray[i] !== ""){
            cleanArray.push(newArray[i]);
        }
    }
    cleanArray.sort();
    abfSettings.noCities = cleanArray;
    saveSettings();
    applyAllFilters();
});

// Make it possible to apply the Regex-settings by checking them
$('#regexTitles').click(function(){
    abfSettings.regexTitles = $(this).is(':checked');
    saveSettings();
    applyAllFilters();
});
$('#regexCompanies').click(function(){
    abfSettings.regexCompanies = $(this).is(':checked');
    saveSettings();
    applyAllFilters();
});
$('#regexCities').click(function(){
    abfSettings.regexCities = $(this).is(':checked');
    saveSettings();
    applyAllFilters();
});
