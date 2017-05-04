d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

function AICSScatter(model){

    var my = {};

    var TRANSITION_DURATION_DEFAULT = 3000;
    var NUM_SELECTED_CIRCLES_ON_START = 8;
    var SELECTED_CIRCLE_COLOR = 'black';
    var SELECTED_CIRCLE_OPACITY = 1.0;
    var CIRCLE_RADIUS = 5;

    var that = AICSChart(model, my);

    var xScale = d3.scaleLinear();
    var yScale = d3.scaleLinear();

    var dataG = undefined;
    var circlesG = undefined;
    var imagesG = undefined;
    var xaxisG = undefined;
    var yaxisG = undefined;

    var xAxisLabel = undefined;
    var yAxisLabel = undefined;

    var xAxis = d3.axisBottom();
    var yAxis = d3.axisLeft();

    my.init = function(){
        model.imageDs = [];
        _initDefaultMouseHandlers();
        model.data.forEach(function (d) {
            d.showToolTip = false;
        });
        xScale.domain([d3.min(model.data, _xScaleAccessor), d3.max(model.data, _xScaleAccessor)])
            .range([ 0, model.chartWidth ]);
        yScale.domain([d3.min(model.data, _yScaleAccessor), d3.max(model.data, _yScaleAccessor)])
            .range([ model.chartHeight, 0 ]);
        xAxis.scale(xScale);
        yAxis.scale(yScale);
    };

    my.update = function (transitionDuration) {
        _updateScales(1);
        _updateCircles(1);
        _updateImages(1)
    };

    my.build = function (mainG) {
        dataG = mainG.append('g');
        circlesG = dataG.append('g');
        imagesG = dataG.append('g');  //images on top of circles
        xaxisG = mainG.append('g');
        yaxisG = mainG.append('g');
        xAxisLabel = mainG.append("text")
            .attr("id", "xaxis-label")
            .attr("transform", "translate(" + (model.chartWidth/2) + " ," + (model.chartHeight + model.margin.top + 20)+")")
            .style("text-anchor", "middle")
            .html(model.xAxisDomain.split('_').join(' '));
        yAxisLabel = mainG.append("text")
            .attr("id", "yaxis-label")
            .attr("transform", "translate(-60 ," + (model.chartHeight/2 + model.margin.top) + ") rotate(-90)")
            .style("text-anchor", "middle")
            .html(model.yAxisDomain.split('_').join(' '));

        xaxisG.attr("id", "xaxis")
            .attr('transform', 'translate(0,' + model.chartHeight + ')')
            .attr('class', 'axis')
            .call(xAxis);
        yaxisG.attr('id', 'yaxis')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'axis')
            .call(yAxis);

        circlesG.selectAll('circles')
            .data(model.data)
            .enter()
            .append('circle')
            .attr('id', function(d){
                return 'circle-' + d[model.cellName];
            })
            .attr('r', model.cirleRadius)
            .attr('opacity', function(d){
                return d.showToolTip ? SELECTED_CIRCLE_OPACITY : model.unselectedCircleOpacity
            })
            .attr('fill', function(d){
                return model.filterClasses[d.classes].color;
            })
            .attr('cx', model.chartWidth/2)
            .attr('cy', model.chartHeight/2)
            .on('mouseover', function(d){
                var self = this;
                model.mouseOverHandlers.forEach(function (handler) {
                    handler.apply(self, [d]);
                });
            })
            .on('mouseout', function(d){
                var self = this;
                model.mouseOutHandlers.forEach(function (handler) {
                    handler.apply(self, [d]);
                });
            })
            .on('click', function(d){
                var self = this;
                model.clickHandlers.forEach(function (handler) {
                    handler.apply(self, [d]);
                });
            });
    };

    my.ready = function () {
        model.data.forEach(function (elem) {
            if(elem.tip){
                model.handleClick(elem)
            }
        });
    };

    function _initDefaultMouseHandlers(){
        model.mouseOverHandlers = (model.mouseOverHandlers || []).concat(
            function (d) {
                d3.select(this)
                    .moveToFront()
                    .attr('opacity', SELECTED_CIRCLE_OPACITY)
                    .attr('stroke', SELECTED_CIRCLE_COLOR);
            }
        );
        model.mouseOutHandlers = (model.mouseOutHandlers || []).concat(
            function (d) {
                d3.select(this)
                    .attr('opacity', function(d){
                        return (d.showToolTip || d.highlight) ? SELECTED_CIRCLE_OPACITY : model.unselectedCircleOpacity
                    })
                    .attr('stroke', function(d){
                        return (d.showToolTip || d.highlight) ? SELECTED_CIRCLE_COLOR : model.filterClasses[d.classes].color;
                    })
            }
        );
        model.clickHandlers = (model.clickHandlers || []).concat(
            function (d) {
                d.showToolTip = !d.showToolTip;
                d3.select(this)
                    .attr('opacity', function(d){
                        return d.showToolTip ? SELECTED_CIRCLE_OPACITY : model.unselectedCircleOpacity;
                    })
                    .attr('stroke', function(d){
                        return (d.showToolTip || d.highlight) ? SELECTED_CIRCLE_COLOR : model.filterClasses[d.classes].color;
                    });
                if(d.showToolTip){
                    model.imageDs.push(d);
                }else {
                    model.imageDs.splice(model.imageDs.indexOf(d), 1);
                }
                _updateImages(1);
            }
        );
    };

    function _initDefaultState(){
        while(model.imageDs.length < NUM_SELECTED_CIRCLES_ON_START){
            var rand = Math.floor(Math.random() * model.data.length);
            if(model.data.indexOf(rand) > -1) continue;
            model.data[rand].showToolTip = true;
            model.imageDs.push(model.data[rand]);
        }
    };

    function _updateScales(transitionDuration) {
        xScale.domain([d3.min(model.data, _xScaleAccessor), d3.max(model.data, _xScaleAccessor)])
            .range([ 0, model.chartWidth ]);
        yScale.domain([d3.min(model.data, _yScaleAccessor), d3.max(model.data, _yScaleAccessor)])
            .range([ model.chartHeight, 0 ]);

        xaxisG
            .transition()
            .duration(transitionDuration || TRANSITION_DURATION_DEFAULT)
            .attr('transform', 'translate(0,' + model.chartHeight + ')')
            .call(xAxis);
        yaxisG
            .transition()
            .duration(transitionDuration || TRANSITION_DURATION_DEFAULT)
            .attr('transform', 'translate(0,0)')
            .call(yAxis);

        xAxisLabel
            .html(model.xAxisDomain)
            .attr("transform", "translate(" + (model.chartWidth/2) + " ," + (model.chartHeight + model.margin.top + 20)+")");
        yAxisLabel
            .html(model.yAxisDomain)
            .attr("transform", "translate(-60 ," + (model.chartHeight/2 + model.margin.top) + ") rotate(-90)");
    };

    function _updateCircles(transitionDuration){
        dataG.selectAll('circle')
            .transition()
            .duration(transitionDuration || TRANSITION_DURATION_DEFAULT)
            .attr('cx', function (d){
                return xScale(d[model.xAxisDomain]);
            })
            .attr('cy', function (d) {
                return yScale(d[model.yAxisDomain]);
            })
            .attr('opacity', function(d){
                return d.showToolTip ? SELECTED_CIRCLE_OPACITY : model.unselectedCircleOpacity
            })
            .attr('stroke', function(d){
                if(d.showToolTip){
                    d3.select(this).moveToFront();
                    return SELECTED_CIRCLE_COLOR;
                } else {
                    return model.filterClasses[d.classes].color;
                }
            })
            .attr('visibility', function (d) {
                return model.filterClasses[d.classes].selected ? 'visible' : 'hidden';
            });

    };

    function _updateImages(transitionDuration){
        var images = imagesG.selectAll('image').data(model.imageDs, function (d) {
            return d[model.cellName];
        });

        var newImages = images.enter()
            .append("image")
            .attr('id', function (d) {
                return d[model.cellName];
            })
            .attr('x', function (d){
                return xScale(d[model.xAxisDomain]);
            })
            .attr('y', function (d) {
                return yScale(d[model.yAxisDomain]);
            })
            .attr('opacity', '0')
            .attr('width', 50)
            .attr('height', 50)
            .attr("xlink:href", function (d) {
                return d.showToolTip ? model.imagePath(d) : '';
            })
            .on('click', function (d, i) {
                d.showToolTip = false;
                d3.select('#circle-' + d[model.cellName])
                    .attr('opacity', model.unselectedCircleOpacity)
                    .attr('stroke', model.filterClasses[d.classes].color);
                model.imageDs.splice(model.imageDs.indexOf(d), 1);
                _updateImages(1);
            });

        newImages
            .transition()
            .duration(transitionDuration || TRANSITION_DURATION_DEFAULT)
            .attr('opacity', '1')
            .attr('stroke', 'white');


        images.exit().remove();

        images
            .transition()
            .duration(transitionDuration || TRANSITION_DURATION_DEFAULT)
            .attr('x', function (d){
                return xScale(d[model.xAxisDomain]);
            })
            .attr('y', function (d) {
                return yScale(d[model.yAxisDomain]);
            })
            .attr('visibility', function (d) {
                return model.filterClasses[d.classes].selected ? 'visible' : 'hidden';
            });
    };

    function _yScaleAccessor(elem) {
        return Number(elem[model.yAxisDomain]);
    };

    function _xScaleAccessor(elem) {
        return Number(elem[model.xAxisDomain]);
    };

    that.updateCircles = _updateCircles;
    that.updateImages = _updateImages;
    that.updateScales = _updateScales;
    that.initDefaultState = _initDefaultState;

    return that;
};


ACEScatterView({
    cellName: 'Cell ID',
    chartParent: 'ace-scatter-chart',
    dataFile: 'js/AICS_Cell-feature-analysis_v1.5.csv',
    imagesDir: 'http://cellviewer.allencell.org/aics/thumbnails/2017_03_08_Struct_First_Pass_Seg',
    xAxisDomain: 'Cellular volume (fL)',
    yAxisDomain: 'Cellular surface area (&micro;m&sup2;)',
    domainOptions: ['Apical proximity (unitless)', 'Cellular surface area (&micro;m&sup2;)',
        'Cellular volume (fL)', 'Nuclear surface area (&micro;m&sup2;)', 'Nuclear volume (fL)',
        'Radial proximity (unitless)'],
    filterClasses: {
        "Tom20":{
            selected: true,
            color:'#6a3d9a',
        },
        "Alpha tubulin":{
            selected: true,
            color:'#cab2d6',
        },
        "Sec61 beta":{
            selected: true,
            color:'#838689',
        },
        "Alpha actinin":{
            selected: true,
            color:'#1f78b4',
        },
        "Desmoplakin":{
            selected: true,
            color:'#33a02c',
        },
        "Lamin B1":{
            selected: true,
            color:'#fb9a99',
        },
        "Fibrillarin":{
            selected: true,
            color:'#e31a1c',
        },
        "Beta actin":{
            selected: true,
            color:'#a6cee3',
        },
        "ZO1":{
            selected: true,
            color:'#ff7f00',
        },
        "Myosin IIB":{
            selected: true,
            color:'#fdbf6f',
        }
    },
    unselectedCircleOpacity: .3,
    cirleRadius: 4,
    margin: {top: 20, right: 50, bottom: 50, left: 80},
});
