"use strict";
describe("Nav bar", function() {
   it("should have a Contribute dropdown box", function () {
        var div = document.createElement("DIV");
        Blaze.render(Template.navBar, div);

        expect($(div).find("#contribute-dropdown")[0]).toBeDefined();
    });
});

/*describe("displayDate", function() {
    it("When given a negative year, should return a string containing BCE", function() {
        var year = -1000;
        expect(displayDate(year)).toMatch("BCE");
    });
});*/

/*describe("show listing", function() {
    it("When a show has a negative starting year, should list that year as BCE", function() {
        var data = {startYear: -1000};
        var div = document.createElement("DIV");
        Blaze.renderWithData(Template.show, data, div);

        expect($(div).html.toMatch("BCE");
    })
});*/