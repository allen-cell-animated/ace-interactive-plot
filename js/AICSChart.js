d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

function AICSChart(model, my){

    my = my || {};

    var that = {};

    var CONTROLS_HEIGHT = 220;

    model.parent = model.parent || 'body';
    model.margin = model.margin || {top: 20, right: 150, bottom: 150, left: 60};

    model.chartWidth = $( window ).width() - model.margin.left - model.margin.right;
    model.chartHeight = $( window ).height() - model.margin.top - model.margin.bottom - CONTROLS_HEIGHT;

    my.init = my.init || function () {;};
    my.build = my.build || function () {;};
    my.update = my.update || function () {;};

    function build(main) {
        my.build(main);
    };

    function update(transitionDuration) {
        model.chartWidth = $( window ).width() - model.margin.left - model.margin.right;
        model.chartHeight = $( window ).height() - model.margin.top - model.margin.bottom - CONTROLS_HEIGHT;
        my.update(transitionDuration);
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
                    .attr('width', model.chartWidth + model.margin.right + model.margin.left)
                    .attr('height', model.chartHeight + model.margin.top + model.margin.bottom)
                    .attr('class', 'chart');
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