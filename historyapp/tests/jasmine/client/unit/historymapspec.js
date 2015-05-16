"use strict";
describe("Nav bar", function() {
   it("should have a Contribute dropdown box", function () {
        var div = document.createElement("DIV");
        Blaze.render(Template.navBar, div);
        expect($(div).find("#contribute-dropdown")[0]).toBeDefined();
    });
});