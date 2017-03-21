d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

function AICSChart(model, my){

    my = my || {};

    var that = {};

    var CHART_MIN_HEIGHT = 300;

    model.parent = model.parent || 'body';
    model.margin = model.margin || {top: 20, right: 150, bottom: 150, left: 60};

    my.init = my.init || function () {;};
    my.build = my.build || function () {;};
    my.update = my.update || function () {;};

    function build(main) {
        my.build(main);
    };

    function update(transitionDuration) {
        updateDimensions();
        my.update(transitionDuration);
    };

    function updateDimensions(){
        var nonScrollSpace = $(window).height() - $('#controls-container').height() - 80;
        $('#chart-container').height(Math.max(nonScrollSpace, CHART_MIN_HEIGHT));                //hack
        model.chartWidth = $('#chart-svg').width() -
            model.margin.left -
            model.margin.right;
        model.chartHeight = $('#chart-svg').height() -
            // ($('#filters-label').height() + $('#cell-previewer-row').height() + $('#class-filter-checkboxes').height())) -
            model.margin.top -
            model.margin.bottom;
    };

    function init (viewCallback) {
        if(undefined === model.dataFile){
            console.log("Do data file provided in spec.");
            return;
        }
        queue()
            .defer(d3.json, model.dataFile)
            .await(function(error, data) {
                var chart = d3.select('#' + model.parent)
                    .append('svg')
                    .attr('id', 'chart-svg')
                    .attr('width', '100%')//model.chartWidth + model.margin.right + model.margin.left)
                    .attr('height', '100%')//model.chartHeight + model.margin.top + model.margin.bottom)
                    .attr('class', 'chart');

                updateDimensions();

                var main = chart.append('g')
                    .attr('transform', 'translate(' + model.margin.left + ',' + model.margin.top + ')')
                    .attr('width', model.chartWidth)
                    .attr('height', model.chartHeight)
                    .attr('class', 'main');

                model.data = data;
                my.init();
                build(main);
                if(viewCallback){viewCallback();}
                window.addEventListener("resize", function () {
                    update(1);
                });
            });
    };

    that.init = init;
    that.update = update;

    return that;
};