Shows = new Mongo.Collection("show");
Suggestions = new Mongo.Collection("suggestion");

if (Meteor.isClient) {

    Session.set("expandedElements", {});
    Session.set("activeRegion", "world");
    Meteor.subscribe("show");

    Template.historyShows.helpers({
        displayActiveYear: function() {
            return displayDate(Session.get('activeYear'));
        },
        displayHalfCenturyBeforeActiveYear: function() {
            return displayDate(Session.get('activeYear')-50);
        }, 
        displayHalfCenturyAfterActiveYear: function() {
            return displayDate(Session.get('activeYear')+50);
        },               
        timeUnits: function() {
            return [
                {title: "century", start: "-40", end: "59"},
                {title: "year", start: "0", end: "99"}
            ]
        }, 
        shows: function() {

            if (!isDbReady()) {
                return defaultShows();
            }

            var activeYear = parseInt(Session.get("activeYear"));
            var activeRegion = Session.get("activeRegion");

            var unsortedShows = getUnsortedShows(activeYear, activeRegion);
            var sortedShows = _.sortBy(unsortedShows, function(show){
                return (show.endYear - show.startYear) + (timeDistance(show.startYear, show.endYear, activeYear)*10); 
            });
            return sortedShows;
        },
        activeRegion: function() {
            return Session.get("activeRegion");
        }
    });

    Template.timeSlider.helpers({
        century: function() {
            return Math.abs(parseInt(Session.get("activeYear")/100));
        },
        year: function() {
            var year = Math.abs(Session.get("activeYear") % 100);
            if (year < 10)
                year = "0" + String(year);

            return year;
        },
        isCentury: function() {
            return this.title == 'century';
        },
        calendarEra: function() {
            var year = Session.get("activeYear");
            if (year < 0)
                return "BCE";
            else
                return "CE";
        }

    });

    Template.youtube.helpers({
        isYoutube: function() {
            return (this.type == 'youtube');
        },
        expanded: function() {
          var expandedElements = Session.get("expandedElements");
          if ( _.has(expandedElements, "e" + this._id._str) )
              return true;
          else
              return false;
        }
    });

    Template.youtube.events({
        "click .expand": function(event, template) {
            var expandedElements = Session.get("expandedElements");
            expandedElements["e" + this._id._str] = true;
            Session.set("expandedElements", expandedElements);          
        }
    });

    Template.historyShows.events({
        "change.fndtn.slider":function(event, template) {
            sliderCentury = parseInt($('#centurySlider').attr('data-slider'));
            sliderYear = parseInt($('#yearSlider').attr('data-slider'));
            activeYear = parseInt((sliderCentury*100) + (sliderYear*1));
            Session.set("year", sliderYear);
            Session.set("century", sliderCentury);
            Session.set("activeYear", activeYear);      
        },
        "click .map-menu": function() {
            Session.set("activeRegion", 'world');
        }
   });

    Template.svgmap.events({
        "click":function(event, template) {
            console.log(event.target.attributes.id.value);
            var region = event.target.parentElement.attributes.id.value;

            if (region == "india_region")
                region = "india";
            if (region == "middle_east")
                region = "middle east";
            if (region == "svg2")
                region = "world";

            Session.set("activeRegion", region);
        }
    });  

    Template.suggestModal.events({
        "click #submitSuggestion":function(event, template) {
            Meteor.call("addSuggestion", {
                name: $("#suggestedName").val(), 
                type: $("#suggestedType").val(), 
                startYear: $("#suggestedStartYear").val(), 
                endYear: $("#suggestedEndYear").val()
            })
            $('#modalTitle').foundation('reveal', 'close');            
        }
    });

    Template.show.helpers({
        displayStartYear: function() {
            return displayDate(this.startYear);
        },
        displayEndYear: function(year) {
            return displayDate(this.endYear);
        },
        lengthOfBar: function() {
            startOfBar = Session.get("activeYear") - 50;
            startPoint = Math.max(startOfBar, this.startYear)
            endOfBar = Session.get("activeYear") + 50;
            endPoint = Math.min(endOfBar, this.endYear+1)
            return endPoint - startPoint;
        },
        startOfBar: function() {
            actualStartOfBar = 50 + this.startYear - Session.get("activeYear");
            displayStartOfBar = Math.max(actualStartOfBar, 0);
            return displayStartOfBar;
        }
    });
}

if (Meteor.isServer) {
    Meteor.publish("show", function () {
      return Shows.find();
    });
}

var displayDate = function (date) {
    var displayDate = String(Math.abs(parseInt(date)));
    if (date < 0)
        return displayDate + " BCE";
    else
        return displayDate + " CE";
}

var timeDistance = function(startYear, endYear, activeYear) {
    if (startYear <= activeYear) {
        if (endYear >= activeYear) {
            return 0;
        } else {
            return activeYear - endYear;
        }
    } else {
        return startYear - activeYear;
    }
}

var getUnsortedShows = function(activeYear, activeRegion) {
    if (activeRegion == "world") {
        return Shows.find({
            startYear: {$lte: activeYear+50}, 
            endYear: {$gte: activeYear-50}
        }).fetch();
    }
    else {
        return Shows.find({
            startYear: {$lte: activeYear+50}, 
            endYear: {$gte: activeYear-50},
            regions: {$in: [activeRegion, 'world']}
        }).fetch();
    }    
}

var isDbReady = function() {
    return (Shows.find({}).fetch().length > 0);
}

Meteor.methods({
    addSuggestion: function (data) {
        Suggestions.insert({name: data.name, type: data.type, startYear: data.startYear, endYear: data.endYear});
    }
});

