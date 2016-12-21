// ==UserScript==
// @name       Arbetsförmedlingen Filter New
// @version    3.0.0
// @author     Mogle
// @namespace  https://github.com/MeeperMogle
// @match      https://www.arbetsformedlingen.se/*
// @grant      none
// @require    https://code.jquery.com/jquery-3.1.1.min.js
// @require    https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// ==/UserScript==

// TODO: Paste settings string;
// - Valid JSON?
// - Check for known values. One doesn't exist? Set to default (WARNING ABOUT THIS!)
//      Start with a copy of the default-object
//      Loop all of the keys! If a key in the new one exists, overwrite the default value

// ON AD-PAGE
// TODO: Make colours appear
// TODO: Address(es)? Link to Google Maps!
// TODO: Hide/opacity in left sidebar
// TODO: Next/previous: Keep pressing while it should/would be Hidden... or fetch "next" from the left?

// FUTURE?
// - Multilang support
// - extension for Chrome / Firefox
// - database of default marketing-pitches to hide/mark in some way

(function() {
    'use strict';

    // Custom, easy log function
    function log(msg) {
        console.log('Af Filter: ' + msg);
    }

    // Add <style>-tag with css that cannot be inline or would then be cumbersome
    {
        const customStyles = '#filterIconDiv:hover {background-color:#EEEEEE; border-radius:10px;} ' +
              '.ui-tabs-tab {display:inline-block; margin:5px; color:white; background-color:#06769f; border-radius:10px;}' +
              '#filterMenuDiv .ma-menu-footer-switch__item.ui-tabs-anchor {padding:10px; min-width:100px; text-align:center;}' +
              '#filterMenuDiv .ma-menu-footer-switch__item.ui-tabs-anchor:hover {height:39px;}' +
              '#filterMenuDiv .ma-menu-footer-switch__item.ui-tabs-anchor:focus {outline:none; color:white;}' +
              '#filterMenuDiv div a {color:#333; text-decoration:underline;} #filterMenuDiv div a:hover {text-decoration: underline dotted black; -webkit-text-decoration: underline dotted black;}' +
              '.ui-tooltip {background-color:#36C3E0; z-index:999; display:inline-block; padding:10px; border-radius:20px;}' +
              '#filterMenuDiv .btn-primary {box-shadow: 1px 1px 1px 1px rgba(0,0,0,0.75);}' +
              '.choiceDiv {width:45%; display:inline-block; margin-right:25px;}' +
              '.saveButton {visibility:hidden; padding:5px;}'
        ;
        $('head').append('<style type="text/css">'+customStyles+'</style>');
    }

    // Add div for the ICON; put image icon inside of it
    {
        const filterIconDivHtml = '<div style="position:absolute; top:25px; cursor:pointer;" id="filterIconDiv"></div>';

        $('#svid10_6503351515497e4b738d032a').append(filterIconDivHtml);
        $('#filterIconDiv').html('<img src="https://icons.iconarchive.com/icons/iconsmind/outline/128/Filter-2-icon.png" style="height:25px; width:25px;">');

        // Add small div for the "water" trickling down/moving up on toggle
        $('#filterIconDiv').append('<div id="trickleDown" style=""></div>');
        $('#trickleDown').css({position:'absolute', width:'3px', height:'20px', backgroundColor:'#2b4455',
                               left: $('#filterIconDiv').position().left - 4, borderRadius:'10px', display:'none'});

        // Toggle menu icon-image-click
        // Fancy filter animation using div after/before hide/show of menu itself
        {
            $('#filterIconDiv > img').click(function() {
                if($('#filterMenuDiv').is(':visible')){
                    $('#filterMenuDiv').slideUp(300, function(){ $('#trickleDown').slideUp(200); });
                } else {
                    $('#trickleDown').slideDown(200, function(){ $('#filterMenuDiv').slideDown(300); });
                }
            });
        }
    }

    // Add div with filter settings, give it css
    {
        $('#filterIconDiv').parent().parent().parent().append('<div id="filterMenuDiv" style="position:absolute; top:71px; left:1px; width:99%; height:500px; border:1px solid black; display:none;"></div>');
        $('#filterMenuDiv').css({backgroundColor: '#2b4455', boxShadow: '0 10px 25px -6px rgba(0,0,0,.47)', borderBottomRightRadius: '4px', borderBottomLeftRadius: '4px', padding:'25px'});
    }

    // Tabs
    {
        // Tab links
        {
            $('#filterMenuDiv').html(
                '<ul>' +
                '<li><a class="ma-menu-footer-switch__item" href="#tabs1">Sökresultat</a></li>' +
                //'<li><a href="#tabs2" class="ma-menu-footer-switch__item">Annons</a></li>' +
                '<li><a href="#tabs4" class="ma-menu-footer-switch__item">Övrigt</a></li>' +
                '<li><a href="#tabs3" class="ma-menu-footer-switch__item">Om</a></li>' +
                '</ul>'
            );
        }

        // Tab content
        {
            let tabSearchResultsHtml = '<div id=tabs1>';
            {
                tabSearchResultsHtml += "<h2>Sökresultat</h2>";

                tabSearchResultsHtml += "<div class='choiceDiv'><h3 title='Visa inte jobb med Rubriker som innehåller dessa ord/fraser. 1 per rad.'>Ointressanta annons-namn</h3>";
                tabSearchResultsHtml += "<textarea style='width:100%;height:100px;resize:vertical;' id=unwantedTitles></textarea>";
                tabSearchResultsHtml += "<br><input type=submit value=Spara class='btn btn-primary saveButton' id=saveUnwantedTitles>";
                tabSearchResultsHtml += " <input type=submit value=Ångra class='btn btn-primary saveButton' style='margin-left:40px;' id=resetUnwantedTitles>";
                tabSearchResultsHtml += "<span style='float:right';><input type=checkbox id=regexTitles> Avancerat <span class=regexInfo>(regex)</span></span></div>";

                tabSearchResultsHtml += "<div class='choiceDiv'><h3 title='Visa inte jobb som kommer från Arbetsgivare med dessa ord i namnet. 1 per rad.'>Ointressanta företag</h3>";
                tabSearchResultsHtml += "<textarea style='width:100%;height:100px;resize:vertical;' id=unwantedCompanies></textarea>";
                tabSearchResultsHtml += "<br><input type=submit value=Spara class='btn btn-primary saveButton' id=saveUnwantedCompanies>";
                tabSearchResultsHtml += " <input type=submit value=Ångra class='btn btn-primary saveButton' style='margin-left:40px;' id=resetUnwantedCompanies>";
                tabSearchResultsHtml += "<span style='float:right';><input type=checkbox id=regexCompanies> Avancerat <span class=regexInfo>(regex)</span></span></div>";

                tabSearchResultsHtml += "<div class='choiceDiv'><h3 title='Visa inte jobb som är på Arbetsorter med dessa ord i namnet. 1 per rad.'>Ointressanta kommuner</h3>";
                tabSearchResultsHtml += "<textarea style='width:100%;height:100px;resize:vertical;' id=unwantedMunicipitalities></textarea>";
                tabSearchResultsHtml += "<br><input type=submit value=Spara class='btn btn-primary saveButton' id=saveUnwantedMunicipitalities>";
                tabSearchResultsHtml += " <input type=submit value=Ångra class='btn btn-primary saveButton' style='margin-left:40px;' id=resetUnwantedMunicipitalities>";
                tabSearchResultsHtml += "<span style='float:right';><input type=checkbox id=regexMunicipitalities> Avancerat <span class=regexInfo>(regex)</span></span></div>";

                tabSearchResultsHtml += "<div class='choiceDiv'><h3 title='Visa inte jobb Publicerade dessa datum (eller Idag, Igår, ...). 1 per rad.'>Inte dessa Publiceringsdatum</h3>";
                tabSearchResultsHtml += "<textarea style='width:100%;height:100px;resize:vertical;' id=unwantedDates></textarea>";
                tabSearchResultsHtml += "<br><input type=submit value=Spara class='btn btn-primary saveButton' id=saveUnwantedDates>";
                tabSearchResultsHtml += " <input type=submit value=Ångra class='btn btn-primary saveButton' style='margin-left:40px;' id=resetUnwantedDates>";
                tabSearchResultsHtml += "<span style='float:right';><input type=checkbox id=regexDates> Avancerat <span class=regexInfo>(regex)</span></span></div>";

                tabSearchResultsHtml += '</div>';
            }
/*
            let tabAdTextHtml = '<div id=tabs2>';
            {
                tabAdTextHtml += '<h2>Annons</h2>';

                tabAdTextHtml += "<h3 title='Markera alla hittade ord i en annons i en färg. 1 per rad.'>Färgmarkeringar</h3>";

                // Floating-text when hovering
                const fargTitle = "Färgen de angivna orden ska ha i annonser. Ordet till vänster visar färgen.";
                const ordBoxTitle = "Ord att färga. 1 per rad.";

                // Generate rows for inputting custom colours.
                var allowedCustomColourings = 10;
                for(var i=0; i<allowedCustomColourings; i++){
                    tabAdTextHtml +=
                        "<div style='margin-right:30px; margin-bottom:15px; display:inline-block;'><span id='colourNameSpan"+i+"'>Färg</span> <input id='colourName"+i+"' "+
                        "size=7 maxlength=7 title='"+fargTitle+"' style='text-align:center;'>"+
                        "&nbsp;&nbsp;&nbsp;Ord <textarea id='colourWords"+i+"' rows=2 style='margin-bottom:-17px;resize:both;' "+
                        "title='"+ordBoxTitle+"'></textarea></div>";
                }
                tabAdTextHtml += "<br><input style='margin-top:10px;' type=submit value=Spara id=saveColourings class='btn btn-primary saveButton'>";
                tabAdTextHtml += " <input style='margin:10px 0 0 40px;' type=submit value=Ångra id=resetColourings class='btn btn-primary saveButton'>";
                tabAdTextHtml += "</div>";
            }
*/
            let tabOtherHtml = '<div id=tabs4>';
            {
                tabOtherHtml += '<h2>Övrigt</h2>';

                /*
                tabOtherHtml += '<hr><h3>Spara inställningar</h3>';
                tabOtherHtml += '<button id="copySettingsText" class="btn btn-primary btn-sm" title="Kopiera alla inställningar i textformat. Kan sedan klistras in för att återställas.">Kopiera inställningar</button>';
                tabOtherHtml += '<input type="text" id="copyableSettingsText" style="width:65%; margin-left:20px; margin-top:5px; visibility:hidden;">';
                tabOtherHtml += '<br><br><button id="pasteSettingsText" class="btn btn-primary btn-sm" title="Klistra in inställningar i textformat.">Klistra in inställningar</button>';
*/
                tabOtherHtml += '<br>';
                tabOtherHtml += '<button style="float:right;" class="btn btn-primary btn-sm" id="resetAllSettings" title="' +
                    'Ta bort alla inställningar. VARNING: Kan ej ångras! Tips: Du kan kopiera och spara dina inställningar i textformat.">Ta bort inställningar (!)</button>';

                tabOtherHtml += '</div>';
            }

            let tabAboutHtml = '<div id=tabs3>';
            {
                tabAboutHtml += '<h2>Om Arbetsförmedlingen Filter</h2>';
                tabAboutHtml += 'Dessa filter har ingen anknytning till Arbetsförmedlingen eller dess anställda utan skapades av en privatperson för att lägga till extra möjligheter att filtrera för jobbsökare.';
                tabAboutHtml += '';

                tabAboutHtml += '<h3>Kontakt</h3>';
                tabAboutHtml += '<a href="https://github.com/MeeperMogle/Arbetsformedlingen-Filter/" target="_afGithub">GitHub</a> - ';
                tabAboutHtml += '<a href="mailto:contact@meeper.se?subject=Arbetsformedlingen%20Filter">contact@meeper.se</a>';

                tabAboutHtml += '<h3>Tredjepartsmaterial</h3>';
                tabAboutHtml += '<a href="http://www.iconsmind.com/" target=_iconsMind>icons mind</a>: <img src="https://icons.iconarchive.com/icons/iconsmind/outline/128/Filter-2-icon.png" style="height:25px; width:25px;"><br>';
                tabAboutHtml += '<a href="https://jquery.com/" target=_jquery>jQuery</a>: Dynamiskt innehåll, animationer etc.<br>';
                tabAboutHtml += '<a href="https://jqueryui.com/" target=_jqueryUI>jQuery UI</a>: Flikar, hjälpmeddelanden.<br>';
                tabAboutHtml += '';

                tabAboutHtml += '</div>';
            }

            $('#filterMenuDiv').append('<div style="background-color:#06769f; border-radius:10px; width:99%; height:85%; padding: 0 25px 25px 25px; overflow-y:scroll;">' +
                                       tabSearchResultsHtml +
                                       //tabAdTextHtml +
                                       tabOtherHtml + tabAboutHtml +
                                       '</div>'
                                      );
        }

        // Generate tabs
        $('#filterMenuDiv').tabs();
    }

    // One-off global styling things on added elements
    {
        // Apply CSS and click-event to Regex-info
        $('.regexInfo').css({textDecoration:'underline', cursor:'pointer'}).attr('title','Avancerad filtrering. Klicka för mer information (Engelska).');
        $('.regexInfo').click(function(){
            window.open("https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions","_whatIsRegex");
        });

        // Make the top-nav follow as the page scrolls
        $('.container-fluid.huvudnavigation').css('position', 'fixed');

        // Apply CSS and click-event to Colour-info
        $('span[id*=colourNameSpan]').css({textDecoration:'underline', fontWeight:'bold', cursor:'pointer'});
        $('span[id*=colourNameSpan]').click(function(){
            window.open("https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Getting_started/Color","_colours");
        });

        // Update colours when typing
        $('input[id*=colourName]').keyup(function(){
            const number = $(this).attr('id').replace("colourName","");
            $('#colourNameSpan'+number).css("color",$(this).val());
        });
    }

    // Activate jQuery UI tooltip function
    $( '#filterMenuDiv' ).tooltip();



    // Settings JSON default structure
    const abfSettingsDefault = {
        no: {
            Titles: {
                contains: ['arbetslös', 'sjukskriven'],
                regex: false,
            },
            Companies: {
                contains: ['elakt företag', 'dåliga villkor ab'],
                regex: false,
            },
            Municipitalities: {
                contains: ['månen', 'mars'],
                regex: false,
            },
            Dates: {
                contains: ['1900-01-01'],
                regex: false,
            },
        },
        colourings : {red: ['ingen lön', 'ingen lunch'], aqua: ['bara jobb', 'ingen vila']},
    };

    const localStorageKey = 'abfFilters3.0';

    function saveSettings(settingsObject) {
        console.log('Af Filter: Saving settings, ', settingsObject);
        localStorage.setItem(localStorageKey, JSON.stringify(settingsObject));
    }
    function getSettings() {
        let storedSettings = JSON.parse(localStorage.getItem(localStorageKey));
        if (!storedSettings || storedSettings === 'null') {
            log('No Settings found, setting default.');
            storedSettings = abfSettingsDefault;
            saveSettings(storedSettings);
        }
        return storedSettings;
    }

    let currentSettings = getSettings();

    // Hold the current stored content in easy-to-compare format,
    // to determine whether changes have been made and, thus,
    // Save-button should be visible.
    let memoryContents = {};

    // Loop all inputs for colourings, checking if any has changed.
    // If it has, display Save and Restore-buttons.
    function showOrHideColouringButtons() {
        const settingsObject = currentSettings;
        let shouldShow = false;

        // For every colour,
        Object.keys(settingsObject.colourings).forEach(
            colour => {
                // fetch the one stored in memory
                const colourName = memoryContents.colourings[colour].elems.name.val();
                const colourWords = memoryContents.colourings[colour].elems.words.val();

                // If the content does not correspond to the stored one for the colour,
                // the Save- and Reset-buttons should be shown
                if (!((colourName === colour) && (colourWords === memoryContents.colourings[colour].text))) {
                    shouldShow = true;
                }
            }
        );

        // Apply whether to show/hide Save- and Reset-buttons
        $('#saveColourings, #resetColourings').css('visibility', shouldShow ? 'visible' : 'hidden');
    }

    // Mirror the loaded settings in the visible text fields and checkboxes
    function populateSettings() {
        const settingsObject = currentSettings;

        // For every filter-list for the Search Results-page...
        Object.keys(settingsObject.no).forEach(
            noThing => {
                // Remove any existing event-handlers (prevents duplicates)
                $('#unwanted' + noThing + ', ' + '#resetUnwanted' + noThing + ', ' + '#saveUnwanted' + noThing).unbind();

                // Add list to the text box on new lines, check box, based on stored settings
                $('#unwanted' + noThing).val(settingsObject.no[noThing].contains.join('\n') + '\n');
                $('#regex' + noThing).prop('checked', settingsObject.no[noThing].regex);

                // Store contents in memory for future comparisons
                memoryContents[noThing] = $('#unwanted' + noThing).val() + $('#regex' + noThing).prop('checked');

                // When changing the text or un/ticking the checkbox, show Save/Reset-buttons if contents no longer correspond to memory
                // i.e if changes have been made these buttons are visible, if there are no changes they are not visible.
                $('#unwanted' + noThing).keyup(function() {
                    $('#saveUnwanted' + noThing + ', #resetUnwanted' + noThing).css('visibility', $('#unwanted' + noThing).val() + $('#regex' + noThing).prop('checked') === memoryContents[noThing] ? 'hidden' : 'visible');
                });
                $('#regex' + noThing).click(function() {
                    $('#unwanted' + noThing).keyup();
                });

                // Clicking reset-button will restore text-box contents
                $('#resetUnwanted' + noThing).click(function() {
                    $('#unwanted' + noThing).val(memoryContents[noThing]);
                    $('#unwanted' + noThing).keyup();
                });
                // Clicking save-button will store the current content permanently
                $('#saveUnwanted' + noThing).click(function() {
                    // Update memory, save in settings object - ignoring empty lines
                    memoryContents[noThing] = $('#unwanted' + noThing).val();
                    settingsObject.no[noThing].contains = memoryContents[noThing].split('\n').filter(function(word){ return word !== ''; });

                    // Add regex-ticked-box to memory, save in settings object
                    memoryContents[noThing] += $('#regex' + noThing).prop('checked');
                    settingsObject.no[noThing].regex = $('#regex' + noThing).prop('checked');

                    // Store settings object, update settings in the script, update everything
                    saveSettings(settingsObject);
                    currentSettings = getSettings();
                    $('#unwanted' + noThing).keyup();
                    applyFilters();
                });
            }
        );

        let colourIndex = 0;

        // Memory representation of current text- and checkbox contents
        memoryContents.colourings = {};

        // For every colour,
        Object.keys(settingsObject.colourings).forEach(
            colour => {
                // put the colour in the colour-box, words in the word-box
                $('#colourName' + colourIndex).val(colour);
                $('#colourWords' + colourIndex).val(settingsObject.colourings[colour].join('\n') + '\n');

                // Bind typing to function determining whether changes have been made
                // i.e whether to display Save/Reset-buttons or not
                $('#colourName' + colourIndex + ', #colourWords' + colourIndex).keyup(showOrHideColouringButtons);

                // Store representation in memory, for the ability to compare current against memory.
                // Include a reference to their storage object for easy manipulation with Reset and such
                memoryContents.colourings[colour] = {
                    text: settingsObject.colourings[colour].join('\n') + '\n',
                    elems: {
                        name: $('#colourName' + colourIndex),
                        words: $('#colourWords' + colourIndex),
                    },
                };

                // Increment counter (move on to the next set of textboxes)
                colourIndex++;
            }
        );
        $('input[id^=colourName]').keyup();
    }
    // Pressing reset button for colours...
    $('#resetColourings').click(function() {
        console.log('Af Filter: Resetting colourings: ', memoryContents.colourings);

        // ... takes each of the remembered colour-entries...
        Object.keys(memoryContents.colourings).forEach(function(colour) {
            // ... and puts their values in the text boxes
            memoryContents.colourings[colour].elems.name.val(colour);
            memoryContents.colourings[colour].elems.words.val(memoryContents.colourings[colour].text);
        });
        $('input[id^=colourName]').keyup();
    });

    // Pressing save button for colours...
    $('#saveColourings').click(function() {
        // Fetch current settings to work against
        const settingsObject = currentSettings;

        // Reset colour-objects in settings and memory for clean work
        settingsObject.colourings = {};
        memoryContents.colourings = {};

        // For each set of colour-text-boxes...
        $('input[id^=colourName]').each(function() {
            // Fetch ID, colour-value and adjacent textbox-words
            const id = $(this).attr('id');
            const colour = $(this).val();
            const text = $('#colourWords' + id.replace('colourName', '')).val();

            // If everything needed is present,
            // add contents (and textbox-element-references) to memory
            if (colour && colour.length > 0 && text && text.length > 0) {
                memoryContents.colourings[colour] = {
                    text: text,
                    elems: {
                        name: $(this),
                        words: $('#colourWords' + id.replace('colourName', '')),
                    },
                };
                // Add non-empty lines to the settings-object, with the current colour as the key
                settingsObject.colourings[colour] = text.split('\n').filter(function(word) { return word !== ''; });
            }
        });
        // Save and update settings
        saveSettings(settingsObject);
        currentSettings = getSettings();
        $('input[id^=colourName]').keyup();
    });
    populateSettings();

    // Easier transfer of settings between computers: Copy the settings as text
    $('#copyableSettingsText').focus(function() { $(this).select(); } );
    $('#copyableSettingsText').blur(function(){$(this).css('visibility','hidden');});
    $('#copyableSettingsText').keyup(function(){if($(this).val() === ""){$(this).blur();}});
    $('#copySettingsText').click(function(){
        $('#copyableSettingsText').val( JSON.stringify(currentSettings) );
        $('#copyableSettingsText').css('visibility','visible');
        $('#copyableSettingsText').focus();
    });

    // Case-insensitive :contains selector
    $.expr[":"].Contains = $.expr.createPseudo(function(arg) {
        return function( elem ) { return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0; };
    });

    // Recursively find (and return) the first parent that matches the given selector
    function findParentElement(element, targetSelector) {
        return element.is(targetSelector) || element.is('body') ? element : findParentElement(element.parent(), targetSelector);
    }
    // Recursively find the n:th parent
    function parent(element, n) {
        return n === 0 ? element : parent(element.parent(), n - 1);
    }

    // Apply all of the filters that have been stored in the settings
    function applyFilters() {
        const settings = currentSettings;

        // Show all results (otherwise it's impossible to "unhide" by changing settings)
        $('.resultatrad').show();

        // Selector which captures all of the fields which contain the text of the thing
        const targetSelectors = {
            Titles: 'a.rubrik',
            Companies: '.arbetsgivarenamn > span.ng-binding',
            Municipitalities: '.rekryteringsbehov-kommun',
            Dates: '.publiceringsdatum',
        };

        // For each thing to filter on text,
        Object.keys(settings.no).forEach(function(thing) {
            // go through their list of filtered words
            settings.no[thing].contains.forEach(function(word) {
                // If regex is checked
                if (settings.no[thing].regex) {
                    const hideRe = new RegExp(word, 'i');

                    // Loop all of the selector-items, match against regex
                    $(targetSelectors[thing]).each(function() {
                        if ($(this).text().match(hideRe) !== null) {
                            // Find and hide entire parent-row
                            findParentElement($(this), '.resultatrad').hide();
                        }
                    });
                } else {
                    // Hide right off; case-insensitive
                    // Find all of the "selector for this thing" with the filtered word
                    $(targetSelectors[thing] + ':Contains('+word+')').each(function() {
                        // Find and hide entire parent-row
                        findParentElement($(this), '.resultatrad').hide();
                    });
                }
            });
        });
    }
    setTimeout(applyFilters, 1000);

    // Functionality to reset all settings, after a confirm-check
    $('#resetAllSettings').click(function(){
        // After confirmation,
        if( confirm("Detta kommer att ta bort ALLA inställningar du har lagt till.\nDet går inte att ångra.") ){
            // save the basic placeholder object as the actual settings, reload the settings and update the graphics
            saveSettings(abfSettingsDefault);
            currentSettings = getSettings();
            populateSettings();
            applyFilters();
        }
    });

    // When pressing "Show more"-button, apply the filters once the new results are loaded to apply to them as well
    $('.visa-fler').click(function() {
        setTimeout(applyFilters, 1000);
    });
})();
