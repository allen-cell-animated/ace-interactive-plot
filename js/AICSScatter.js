d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

function AICSScatter(model){

    var my = {};

    var TRANSITION_DURATION_DEFAULT = 3000;
    var NUM_SELECTED_CIRCLES_ON_START = 8;
    var UNSELECTED_CIRCLE_COLOR = 'blue';
    var SELECTED_CIRCLE_COLOR = 'red';
    var SELECTED_CIRCLE_OPACITY = 1.0;
    var UNSELECTED_CIRCLE_OPACITY = .25;
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
            .attr('r', CIRCLE_RADIUS)
            .attr('opacity', function(d){
                return d.showToolTip ? SELECTED_CIRCLE_OPACITY : UNSELECTED_CIRCLE_OPACITY
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
                    .attr('fill', SELECTED_CIRCLE_COLOR);
            }
        );
        model.mouseOutHandlers = (model.mouseOutHandlers || []).concat(
            function (d) {
                d3.select(this)
                    .attr('opacity', function(d){
                        return (d.showToolTip || d.highlight) ? SELECTED_CIRCLE_OPACITY : UNSELECTED_CIRCLE_OPACITY
                    })
                    .attr('fill', function(d){
                        return (d.showToolTip || d.highlight) ? SELECTED_CIRCLE_COLOR : model.filterClasses[d.classes].color;
                    })
            }
        );
        model.clickHandlers = (model.clickHandlers || []).concat(
            function (d) {
                d.showToolTip = !d.showToolTip;
                d3.select(this)
                    .attr('opacity', function(d){
                        return d.showToolTip ? SELECTED_CIRCLE_OPACITY : UNSELECTED_CIRCLE_OPACITY;
                    })
                    .attr('fill', function(d){
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
                return d.showToolTip ? SELECTED_CIRCLE_OPACITY : UNSELECTED_CIRCLE_OPACITY
            })
            .attr('fill', function(d){
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
                    .attr('opacity', UNSELECTED_CIRCLE_OPACITY)
                    .attr('fill', model.filterClasses[d.classes].color);
                model.imageDs.splice(model.imageDs.indexOf(d), 1);
                _updateImages(1);
            });

        newImages
            .transition()
            .duration(transitionDuration || TRANSITION_DURATION_DEFAULT)
            .attr('opacity', '1');

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