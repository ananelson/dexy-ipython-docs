var casperDefaults = {
    viewportSize : {width : 800, height : 10000},
    verbose: true,
    logLevel: "debug"
};

var casper = require('casper').create(casperDefaults);

var rootUrl = "http://localhost:8888";

var hrefs;
var names;

casper.start(rootUrl, function() {
    this.waitForSelector("#notebook_list");
});

casper.then(function() {
    hrefs = this.getElementsAttribute('#notebook_list .list_item a.item_link', 'href');
    names = this.getElementsInfo('#notebook_list .list_item a.item_link .item_name');
});

function cellSelector(j) {
    return "#notebook-container>.cell:nth-child(" + (j+1) + ")";
}

function runCurrentCell(j) {
    var inputPromptSelector = cellSelector(j) + " .input_prompt";
    var cellMenuSelector = "ul#menus li.dropdown:nth-child(5)";
    var dropDown = cellMenuSelector + ">.dropdown-menu";

    casper.then(function() {
        this.test.assertSelectorHasText(cellMenuSelector, "Cell");
        this.test.assertNotVisible(dropDown);
        this.click(cellMenuSelector + " a");

        this.test.assertVisible(dropDown);
        this.test.assertSelectorHasText("#run_cell a", "Run");
        this.click("#run_cell a");

        this.test.assertNotVisible(dropDown);

        this.waitFor(function() {
//            return (this.getElementsInfo(cellSelector(j))[0].attributes['class'].indexOf("selected") < 0);
            return (this.getElementsInfo(cellSelector(j))[0].attributes['class'].indexOf("running") < 0);
        });
    });

    casper.then(function() {
        if (this.exists(inputPromptSelector)) {
            this.waitFor(function() {
                return (this.getElementsInfo(inputPromptSelector)[0].text.indexOf("[*]") < 0);
            });
        }
    });
}

function printObject(obj) {
    for (var attr in obj) {
        console.log(attr + ": " + obj[attr]);
    }
}

function openNotebook(name, href) {
    console.log("Calling openNotebook with " + name + ", " + href);

    casper.thenOpen(rootUrl + href, function() {
        casper.waitForSelector("#notebook-container");
    });

    casper.then(function() {
        cells = this.getElementsInfo('#notebook-container .cell');

        //var max = cells.length
        var max = 5; // temp use smaller number for development

        for (var j = 0; j < 5; j++) {
            console.log(j);
            runCurrentCell(j);
        }

        // Iterate over a second time to take screenshots - need to do in
        // separate loop to ensure that runCurrentCell finishes.
        for (j = 0; j < 5; j++) {
            console.log(j);
            var cell_image_name = name + "-cell-" + j + ".png";
            cell_image_name = cell_image_name.replace(" ", "-");
            this.captureSelector(cell_image_name, cellSelector(j));
        }

        this.capture(name + ".png");
    });
}

casper.then(function() {
    this.capture("notebook-list.png");

    for (var i = 0; i < names.length; i++) {
        openNotebook(names[i].text, hrefs[i]);
    }
});

// make a new notebook
casper.then(function() {
    //    this.click("#new_notebook");
    // detect new notebook in list of notebooks
    // open new notebook
    // do stuff with new notebook
});

casper.run();
