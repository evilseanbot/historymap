Shows = new Mongo.Collection("show");

if (Meteor.isClient) {
    Template.historyShows.helpers({
        countries: function() {
            var activeYear = parseInt(Session.get("activeYear"));
            showsInYear = Shows.find({startYear: {$lte: activeYear}, endYear: {$gte: activeYear} }).fetch();
            countries = _.uniq(_.pluck(showsInYear, 'country'));
            countries.sort();
            return countries;
        },
        activeYear: function() {
            return Session.get("activeYear");
        },
        timeUnits: function() {
            return [
                {name: "century"},
                {name: "decade"},
                {name: "year"}
            ]
        }  
    });

    Template.country.helpers({
        shows: function() {
            var activeYear = parseInt(Session.get("activeYear"));
            shows = Shows.find({
              startYear: {$lte: activeYear}, 
              endYear: {$gte: activeYear},
              country: this.valueOf() 
            });
            return shows;
        }
    });    

    Template.show.helpers({
        isYoutube: function() {
            console.log(this.type);
            console.log(this.type == 'youtube');
            return (this.type == 'youtube');
        }
    });


    Template.historyShows.events({
      "change.fndtn.slider":function(event, template) {
          //years = [-13800000000, -59000, -500, -100, 1500, 1620, 1710, 1750, 1800, 2101]
          activeMillenium = parseInt($('#milleniumSlider').attr('data-slider'));          
          activeCentury = parseInt($('#centurySlider').attr('data-slider'));
          activeDecade = parseInt($('#decadeSlider').attr('data-slider'));
          sliderYear = parseInt($('#yearSlider').attr('data-slider'));
          activeYear = parseInt((activeMillenium*100) + (activeCentury*10) + (activeDecade*1) + (sliderYear*0.1));
          Session.set("activeYear", activeYear);      
      }
   });
}