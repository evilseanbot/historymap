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
        timeUnits: function() {
            return [
                {title: "century", start: "-40", end: "59"},
                {title: "year", start: "0", end: "99"}
            ]
        }, 
        shows: function() {
            var activeYear = parseInt(Session.get("activeYear"));
            var activeRegion = Session.get("activeRegion");
            
            if (activeRegion == "world") {

                var shows = Shows.find({
                    startYear: {$lte: activeYear}, 
                    endYear: {$gte: activeYear}
                }).fetch();
            }
            else {
                var shows = Shows.find({
                    startYear: {$lte: activeYear}, 
                    endYear: {$gte: activeYear},
                    regions: {$in: [activeRegion, 'world']}
                }).fetch();
            }

            var sortedShows = _.sortBy(shows, function(show){return show.endYear - show.startYear});
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
            //console.log(event.target.parentElement.attributes.id.value);
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
            suggestedName = $("#suggestedName").val();
            suggestedType = $("#suggestedType").val();
            suggestedStartYear = $("#suggestedStartYear").val();
            suggestedEndYear = $("#suggestedEndYear").val();
   
            Meteor.call("addSuggestion", {name: suggestedName, type: suggestedType, startYear: suggestedStartYear, endYear: suggestedEndYear})
            $('#modalTitle').foundation('reveal', 'close');            
        }
    });

    Template.show.helpers({
        displayStartYear: function() {
            return displayDate(this.startYear);
        },
        displayEndYear: function(year) {
            return displayDate(this.endYear);
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

Meteor.methods({
  addSuggestion: function (data) {
      Suggestions.insert({name: data.name, type: data.type, startYear: data.startYear, endYear: data.endYear});
  }
});