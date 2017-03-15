
function AICSScatter(model, my){

    my = my || {};

    var TRANSITION_DURATION = 3000;

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

    model.filterClasses = {};
    model.imageDs = [];
    model.handleClick = model.handleClick || function (d) {
        d3.event.stopPropagation();
        d.showToolTip = !d.showToolTip;
        d3.select(this).attr('opacity', function(d){
            return d.showToolTip ? 1.0 : .3
        })
        .attr('fill', function(d){
            return (d.showToolTip || d.highlight) ? 'red' : 'blue'
        });
        if(d.showToolTip){
            model.imageDs.push(d);
        }else {
            model.imageDs.splice(model.imageDs.indexOf(d), 1);
        }
        _updateImages();
    };
    model.handleMouseOver = model.handleMouseOver || function (d) {
        ;
    };
    model.handleMouseOut = model.handleMouseOut || function (d) {
        ;
    };

    my.init = function(){
        model.data.forEach(function (d) {
            model.filterClasses[d.classes] = true;
            d.showToolTip = false;
        });

        xScale.domain([d3.min(model.data, _xScaleAccesor), d3.max(model.data, _xScaleAccesor)])
            .range([ 0, model.chartWidth ]);
        yScale.domain([d3.min(model.data, _yScaleAccessor), d3.max(model.data, _yScaleAccessor)])
            .range([ model.chartHeight, 0 ]);

        xAxis.scale(xScale);
        yAxis.scale(yScale);
    };

    my.update = function (transitionDuration) {
        _updateScales(transitionDuration);
        _updateDots(transitionDuration);
        _updateImages(transitionDuration)
    };

    my.build = function (main) {
        dataG = main.append('g');
        circlesG = dataG.append('g');
        imagesG = dataG.append('g');
        xaxisG = main.append('g');
        yaxisG = main.append('g');
        xAxisLabel = main.append("text")
            .attr("id", "xaxis-label")
            .attr("transform", "translate(" + (model.chartWidth/2) + " ," + (model.chartHeight + model.margin.top + 20)+")")
            .style("text-anchor", "middle")
            .text(model.xAxisDomain);
        yAxisLabel = main.append("text")
            .attr("id", "yaxis-label")
            .attr("transform", "translate(-60 ," + (model.chartHeight/2 + model.margin.top) + ") rotate(-90)")
            .style("text-anchor", "middle")
            .text(model.yAxisDomain);

        xaxisG.attr("id", "xaxis")
            .attr('transform', 'translate(0,' + model.chartHeight + ')')
            .attr('class', 'axis')
            .call(xAxis);
        yaxisG.attr('id', 'yaxis')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'axis')
            .call(yAxis);

        circlesG.selectAll('scatter-circles')
            .data(model.data)
            .enter()
            .append('circle')
            .attr('id', function(d){
                return 'circle-' + d.im_ids;
            })
            .attr('r', 5)
            .attr('width', 20)
            .attr('height', 24)
            .attr('opacity', .3)
            .attr('fill', 'blue')
            .attr('stroke','black')
            .attr('stroke-width',0)
            .attr('cx', model.chartWidth/2)
            .attr('cy', model.chartHeight/2)
            .on('mouseover', model.handleMouseOver)
            .on('mouseout', model.handleMouseOut)
            .on('click', model.handleClick);

        _updateDots();
    };

    my.ready = function () {
        model.data.forEach(function (elem) {
            if(elem.tip){
                model.handleClick(elem)
            }
        });
    };

    function _updateScales(transitionDuration) {
        xScale.domain([d3.min(model.data, _xScaleAccesor), d3.max(model.data, _xScaleAccesor)])
            .range([ 0, model.chartWidth ]);
        yScale.domain([d3.min(model.data, _yScaleAccessor), d3.max(model.data, _yScaleAccessor)])
            .range([ model.chartHeight, 0 ]);

        xaxisG
            .transition()
            .duration(transitionDuration || TRANSITION_DURATION)
            .attr('transform', 'translate(0,' + model.chartHeight + ')')
            .call(xAxis);
        yaxisG
            .transition()
            .duration(transitionDuration || TRANSITION_DURATION)
            .attr('transform', 'translate(0,0)')
            .call(yAxis);

        xAxisLabel
            .text(model.xAxisDomain)
            .attr("transform", "translate(" + (model.chartWidth/2) + " ," + (model.chartHeight + model.margin.top + 20)+")");
        yAxisLabel
            .text(model.yAxisDomain)
            .attr("transform", "translate(-60 ," + (model.chartHeight/2 + model.margin.top) + ") rotate(-90)");
    };

    function _updateDots(transitionDuration){
        dataG.selectAll('circle')
            .transition()
            .duration(transitionDuration || TRANSITION_DURATION)
            .attr('opacity', function(d){
                return d.showToolTip ? 1.0 : .3
            })
            .attr('fill', function(d){
                return (d.showToolTip || d.highlight) ? 'red' : 'blue'
            })
            .attr('cx', function (d){
                return xScale(d[model.xAxisDomain]);
            })
            .attr('cy', function (d) {
                return yScale(d[model.yAxisDomain]);
            })
            .attr('visibility', function (d) {
                return model.filterClasses[d.classes] ? 'visible' : 'hidden';
            });

    };

    function _updateImages(transitionDuration){
        var images = imagesG.selectAll('image').data(model.imageDs, function (d) {
            return d.im_ids;
        });

        images.enter()
            .append("image")
            .attr('id', function (d) {
                return d.im_ids;
            })
            .attr('x', function (d){
                return xScale(d[model.xAxisDomain]);
            })
            .attr('y', function (d) {
                return yScale(d[model.yAxisDomain]);
            })
            .attr('width', 50)
            .attr('height', 50)
            .attr("xlink:href", function (d) {
                return d.showToolTip ? d.imageFilePath : '';
            })
            .on('click', function (d, i) {
                d3.event.stopPropagation();
                d.showToolTip = false;
                d3.select('#circle-' + d.im_ids)
                    .attr('opacity', .3)
                    .attr('fill', 'blue');
                model.imageDs.splice(model.imageDs.indexOf(d), 1);
                _updateImages();
            });

        images.exit().remove();

        images
            .transition()
            .duration(transitionDuration || TRANSITION_DURATION)
            .attr('x', function (d){
                return xScale(d[model.xAxisDomain]);
            })
            .attr('y', function (d) {
                return yScale(d[model.yAxisDomain]);
            })
            .attr('visibility', function (d) {
                return model.filterClasses[d.classes] ? 'visible' : 'hidden';
            });
    };

    function _yScaleAccessor(elem) {
        return Number(elem[model.yAxisDomain]);
    };

    function _xScaleAccesor(elem) {
        return Number(elem[model.xAxisDomain]);
    };

    return that;
};