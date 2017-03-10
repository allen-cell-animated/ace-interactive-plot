
function AICSChart(spec, my){

    my = my || {};

    var that = {};

    spec.parent = spec.parent || 'body';
    spec.margin = spec.margin || {top: 20, right: 150, bottom: 150, left: 60};

    my.chartWidth = $( window ).width() - spec.margin.left - spec.margin.right;
    my.chartHeight = $( window ).height() - spec.margin.top - spec.margin.bottom;

    my.init = my.init || function () {;};
    my.build = my.build || function () {;};
    my.update = my.update || function () {;};

    function build(data) {
        my.build(data);
    };

    function update(data) {
        my.chartWidth = $( window ).width() - spec.margin.left - spec.margin.right;
        my.chartHeight = $( window ).height() - spec.margin.top - spec.margin.bottom;
        my.update(data);
    };

    function init () {
        if(undefined === spec.dataFile){
            console.log("Do data file provided in spec.");
            return;
        }
        d3.csv(spec.dataFile, function(data) {
            var chart = d3.select('#' + spec.parent)
                .append('svg')
                .attr('width', my.chartWidth + spec.margin.right + spec.margin.left)
                .attr('height', my.chartHeight + spec.margin.top + spec.margin.bottom)
                .attr('class', 'chart');
            var main = chart.append('g')
                .attr('transform', 'translate(' + spec.margin.left + ',' + spec.margin.top + ')')
                .attr('width', my.chartWidth)
                .attr('height', my.chartHeight)
                .attr('class', 'main');
            data  = data.slice(0, 1000);
            my.init(data, main);
            build(data);
            window.addEventListener("resize", function () {
                update(data);
            });
        });
    };

    that.init = init;

    return that;
};