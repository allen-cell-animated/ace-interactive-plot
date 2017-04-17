d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

function AICSChart(model, my){

    my = my || {};

    var that = {};

    var CHART_MIN_HEIGHT = 300;
    var FORCE_NO_SCROLL_PADDING = 40;             //hack

    model.parent = model.parent || 'body';
    model.margin = model.margin || {top: 40, right: 150, bottom: 150, left: 60};

    my.init = my.init || function () {;};
    my.build = my.build || function () {;};
    my.update = my.update || function () {;};

    function build(mainG) {
        my.build(mainG);
    };

    function update(transitionDuration) {
        updateDimensions();
        my.update(transitionDuration);
    };

    function updateDimensions(){
        var nonScrollSpace = $(window).height() - $('#ace-scatter-controls-container').height() - FORCE_NO_SCROLL_PADDING - 60;
        $('#ace-scatter-chart-container').height(Math.max(nonScrollSpace, CHART_MIN_HEIGHT));
        model.chartWidth = $('#ace-scatter-chart-svg').width() -
            model.margin.left -
            model.margin.right;
        model.chartHeight = $('#ace-scatter-chart-svg').height() -
            model.margin.top -
            model.margin.bottom;
    };

    function init (viewCallback) {
        if(undefined === model.dataFile){
            console.log("Do data file provided in spec.");
            return;
        }
        queue()
            .defer(d3.csv, model.dataFile)
            .await(function(error, data) {
                var chart = d3.select('#' + model.parent)
                    .append('svg')
                    .attr('id', 'ace-scatter-chart-svg')
                    .attr('width', '100%')
                    .attr('height', '100%');

                updateDimensions();

                var mainG = chart.append('g')
                    .attr('transform', 'translate(' + model.margin.left + ',' + model.margin.top + ')')
                    .attr('width', model.chartWidth)
                    .attr('height', model.chartHeight);

                model.data = data;
                my.init();
                build(mainG);
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
