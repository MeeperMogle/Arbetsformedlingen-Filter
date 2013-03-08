// ==UserScript==
// @name       Arbetsförmedlingen Filter
// @version    1.0.0
// @author     Mogle
// @namespace  https://github.com/MeeperMogle
// @include    http*://*.arbetsformedlingen.se/*
// @require    http://code.jquery.com/jquery-1.9.1.js
// ==/UserScript==

// Add case-insensitive search for Contains-matches
jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function(arg) {
    return function( elem ) {
        return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
    };
});

// If we're looking at an Annons, change the Tab <title> to the name of the Annons.
// Hard to keep track of multiple tabs if all are named "Arbetsförmedlingen"...
if($('html').html().indexOf("Annons-ID", 0) > -1){
    $('title').text( $('.showAd-head > h1').html() );
}
// Otherwise, we assume you're looking for Annonser.
// Load the settings and show the controllers!
else{
    // Get the settings from our local storage
    settings = localStorage.getItem('hiddenArbetsformedlingen');
    
    // If this didn't exist, create a default one.
    if(!settings){
        settings = {
            "hidden": ["2148404"],
            "hideTitles": ["kung", "drottning", "president", "annat konstigt jobb"],
            "hideEmployers": ["hitler ab", "stalin ab", "lurendrejare"],
            "hideCities": ['månen']
        };
        
        // Save the default one, so that we have one in the future.
        localStorage.setItem('hiddenArbetsformedlingen', JSON.stringify(settings));
    }
    else{
        // If we had one saved, it's a JSON structure saved as a string.
        // Parse it into JSON, and we're good to go.
        settings = JSON.parse(settings);
    }
    
    function hideAllCorrectStuff(){
        // Hide all manually hidden Annonser
        for (i = 0; i < settings.hidden.length; i++) {
            $('a[href*="&ids=' + settings.hidden[i] + '"]').parent().parent().hide();
        }
        
        // Loop through all Titles (same thing for Employers and Cities; only commenting this once...)
        for(var i=0; i<settings.hideTitles.length; i++) {
            // Create a selector pointing to:
            // All 3rd TDs which contains this Title
            // Hide the TR which contains thos, i.e remove that row from the table.
            selector = "td:nth-child(3):Contains('" + settings.hideTitles[i] + "')";
            $(selector).parent().hide();
            
            // Add this Title to the string which will go into the textbox
            unwantedJobs += settings.hideTitles[i];
            
            // If this isn't the last one, add a new line at the end.
            if( (i+1) < (settings.hideTitles.length ) )
            unwantedJobs += "\n";
        }
        for(var i=0; i<settings.hideEmployers.length; i++) {
            selector = "td:nth-child(4):Contains('" + settings.hideEmployers[i] + "')";
            $(selector).parent().hide();
            
            unwantedEmployers += settings.hideEmployers[i];
            
            if( (i+1) < (settings.hideEmployers.length ) )
            unwantedEmployers += "\n";
        }
        for(var i=0; i<settings.hideCities.length; i++) {
            selector = "td:nth-child(5):Contains('" + settings.hideCities[i] + "')";
            $(selector).parent().hide();
            
            unwantedCities += settings.hideCities[i];
            
            if( (i+1) < (settings.hideCities.length ) )
            unwantedCities += "\n";
        }
    }
    
    
    
    // Add X links to each Annons.
    // These can then be clicked to manually hide individual Annonsers.
    $('tr.odd').each(function(){
        var link = "<a class='hider' href='" + $(this).children('td').eq(0).children('input').eq(0).attr("value") + "'>X</a>";
        $(this).html( $(this).html() + "<td>" + link + "</td>");
    });
    $('tr.even').each(function(){
        var link = "<a class='hider' href='" + $(this).children('td').eq(0).children('input').eq(0).attr("value") + "'>X</a>";
        $(this).html( $(this).html() + "<td>" + link + "</td>");
    });
    
    // Once an X is clicked, hide that individual Annons manually.
    $('a.hider').click(function(){
        settings.hidden[settings.hidden.length] = $(this).attr("href");
        localStorage.setItem('hiddenArbetsformedlingen', JSON.stringify(settings));
        $(this).parent().parent().hide();
        return false;
    });
    
    // Change the functionality of less important buttons to
    // resetting the manually hidden Annonser.
    $('#ctl00_mainCPH_resultatLista_prenumereraButton').hide();
    $('#ctl00_mainCPH_resultatLista_visaValdaAnnonserBtn').attr("value","Visa manuellt gömda jobb");
    $('#ctl00_mainCPH_resultatLista_visaValdaAnnonserBtn').click(function(){      
        // Show all Annonser in the Hidden array
        for (i = 0; i < settings.hidden.length; i++) {
            $('a[href*="&ids=' + settings.hidden[i] + '"]').parent().parent().show();
        }
        
        // Reset the Hidden array
        settings.hidden = ["2148404"];
        localStorage.setItem('hiddenArbetsformedlingen', JSON.stringify(settings));
        
        return false;
    });
    
    // Variables for storing the text in the lists of unwanted stuff
    var selector;
    var unwantedJobs = "";
    var unwantedEmployers = "";
    var unwantedCities = "";
    
    // meepmeep
    hideAllCorrectStuff();
    
    // HTML for the controllers
    var controllerHTML = "<table id=hideControllers border=0 cellspacing=0 cellpadding=0>"
    +"<tr><td><br><h1>Göm jobb vars...</h1>"
    
    +"<p><b>Rubrik innehåller...</b>"
    +"<br><textarea id=jobbtitlarLista cols=30 rows=7>" + unwantedJobs + "</textarea>"
    
    +"<p><b>Arbetsgivare innehåller...</b>"
    +"<br><textarea id=arbetsgivareLista cols=30 rows=7>" + unwantedEmployers + "</textarea>"
    
    +"<p><b>Arbetsort innehåller...</b>"
    +"<br><textarea id=arbetsortLista cols=30 rows=7>" + unwantedCities + "</textarea>"
    
    +"<p><input type=button value=Spara id=saveHiddenSettings>"
    +"</td></tr></table>";
    $('#navigation').parent().html( $('#navigation').parent().html() + controllerHTML );
    
    $(".showAd-table-left").parent().show();
    
    // When the Save-button is pressed...
    $('#saveHiddenSettings').click(function(){
        // Fetch Titles, Employers and Cities into arrays,
        // from the textboxes,
        // using a New Line as a separator.
        var titles = $('#jobbtitlarLista').val().split("\n");
        var employers = $('#arbetsgivareLista').val().split("\n");
        var cities = $('#arbetsortLista').val().split("\n");
        
        // Update the Settings with these new values.
        settings.hideTitles = titles.slice();
        settings.hideEmployers = employers.slice();
        settings.hideCities = cities.slice();
        
        // Save the Settings.
        localStorage.setItem('hiddenArbetsformedlingen', JSON.stringify(settings));
        
        // To-Do:
        // - Re Show everything - CHECK!
        // - Re Hide what shall be hidden - CHECK!
        // - Stop infinite scroll-down - CHECK!
        
        // Un-Hide everything
        $('tr[style*="display: none;"]').show();
        
        // Re-Hide the stuff that should be hidden according to new rules
        hideAllCorrectStuff();
    });
    
    // Move the controllers along with you as you scroll
    window.onscroll = scrollHandler;
    function scrollHandler(){        
        if ( window.pageYOffset > 400 && (window.pageYOffset < document.body.offsetHeight - (416 + 380) ) ){
            $('#hideControllers').css("margin-top", (window.pageYOffset - 400) + "px");
        }
    }
}