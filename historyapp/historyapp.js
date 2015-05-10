Shows = new Mongo.Collection("show");

if (Meteor.isClient) {
    Template.historyShows.helpers({
        activeYear: function() {
            return Session.get("activeYear");
        },
        timeUnits: function() {
            return [
                {title: "century", start: "-40", end: "59"},
                {title: "year", start: "0", end: "99"}
            ]
        }, 
        shows: function() {
            var activeYear = parseInt(Session.get("activeYear"));
            shows = Shows.find({
              startYear: {$lte: activeYear}, 
              endYear: {$gte: activeYear}
            });
            return shows;
        }
    });

    Template.timeSlider.helpers({
        century: function() {
            return parseInt(Session.get("activeYear")/100);
        },
        year: function() {
            var year = Math.abs(Session.get("activeYear") % 100);
            if (year < 10)
                year = "0" + String(year);

            return year;
        },
        isCentury: function() {
            return this.title == 'century';
        }
    });

    Template.show.helpers({
        isYoutube: function() {
            return (this.type == 'youtube');
        },
        expanded: function() {
            return Session.get("expanded")[this.title];
        },
        trimmedId: function() {
          return this._id.substring(this._id.lastIndexOf("(")+1,this._id.lastIndexOf(")"));
        }
    });

  Template.show.rendered = function(){
      $(document).foundation();
      $(document).foundation('#####', 'reflow');      
  };

    Template.historyShows.events({
      "change.fndtn.slider":function(event, template) {
          sliderCentury = parseInt($('#centurySlider').attr('data-slider'));
          sliderYear = parseInt($('#yearSlider').attr('data-slider'));
          activeYear = parseInt((sliderCentury*100) + (sliderYear*1));
          Session.set("year", sliderYear);
          Session.set("century", sliderCentury);
          Session.set("activeYear", activeYear);      
      }
   });
}