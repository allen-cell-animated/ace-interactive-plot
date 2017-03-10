
function AICSScatter(spec, my){

    my = my || {};

    var TIP_WIDTH = 150;
    var TIP_HEIGHT = 150;

    var that = AICSChart(spec, my);

    var xScale = d3.scaleLinear();
    var yScale = d3.scaleLinear();

    var dotsG = undefined;
    var dots = undefined;

    spec.handleClick = spec.handleClick || function (d, tipDiv){
        d.showToolTip = !d.showToolTip;
        tipDiv.on('mouseout', d.showToolTip ? undefined : function () {
            _handleMouseOut(d);
        });
        if(!d.showToolTip){
            d.mouseOverTooltip.div.style('visibility', 'hidden');
        }
    };

    function _yScaleAccessor(elem) {
        return Number(elem.Nuclear_volume);
    };

    function _xScaleAccesor(elem) {
        return Number(elem.Cellular_volume);
    };

    function _handleMouseOver(d) {
        var that = this;
        if(!d.mouseOverTooltip){
            d.mouseOverTooltip = _createToolTip(d, that);
        }
        d.mouseOverTooltip.div.style('visibility', 'visible');
    };

    function _handleMouseOut(d) {
        d.mouseOverTooltip.div.style('visibility', 'hidden');
    };

    function _createToolTip(circleD) {
        var tipDiv = d3.select('body')
            .append('div')
            .attr('class', 'tip')
            .style('position', 'absolute')
            .style('left', (spec.margin.left + xScale(circleD.Cellular_volume) - (TIP_WIDTH / 2)) + 'px')
            .style('top', (spec.margin.top + yScale(circleD.Nuclear_volume) - (TIP_HEIGHT / 2)) + 'px')
            .on('click', function () {
                spec.handleClick(circleD, tipDiv);
            })
            .on('mouseout', function () {
                _handleMouseOut(circleD)
            });
        var tipImage = tipDiv.append('img')
            .attr('width', TIP_WIDTH)
            .attr('height', TIP_HEIGHT);
        tipImage.attr('src', 'modeling/images/' + circleD.im_ids + '.ome.tif_flat.png');
        tipDiv.append("xhtml:br");
        tipDiv.append("xhtml:span").style('font-weight', 'bold').text(function (d) {
            return 'Nuclear volume: ' + circleD.Nuclear_volume;
        });
        tipDiv.append("xhtml:br");
        tipDiv.append("xhtml:span").style('font-weight', 'bold').text(function (d) {
            return 'Cellular Volume: ' + circleD.Cellular_volume;
        });
        return {div: tipDiv, image: tipImage};
    }
    var xAxis = d3.axisBottom();
    var yAxis = d3.axisLeft();

    my.init = function(data, main){
        var filterClasses = {}
        data.forEach(function (d) {
            filterClasses[d.classes] = undefined;
            d.showToolTip = false;
        });
        xScale.domain([d3.min(data, _xScaleAccesor), d3.max(data, _xScaleAccesor)])
            .range([ 0, my.chartWidth ]);
        yScale.domain([d3.min(data, _yScaleAccessor), d3.max(data, _yScaleAccessor)])
            .range([ my.chartHeight, 0 ]);
        xAxis.scale(xScale);
        yAxis.scale(yScale);
        main.append('g')
            .attr("id", "xaxis")
            .attr('transform', 'translate(0,' + my.chartHeight + ')')
            .attr('class', 'axis')
            .call(xAxis);
        main.append('g')
            .attr('id', 'yaxis')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'axis')
            .call(yAxis);
        dotsG = main.append('svg:g');
    };

    function _updateScales(data) {
        xScale.domain([d3.min(data, _xScaleAccesor), d3.max(data, _xScaleAccesor)])
            .range([ 0, my.chartWidth ]);
        yScale.domain([d3.min(data, _yScaleAccessor), d3.max(data, _yScaleAccessor)])
            .range([ my.chartHeight, 0 ]);
        d3.select('#xaxis')
            .transition()
            .duration(2500)
            .attr('transform', 'translate(0,' + my.chartHeight + ')')
            .call(xAxis);
        d3.select('#yaxis')
            .transition()
            .duration(2500)
            .attr('transform', 'translate(0,0)')
            .call(yAxis);
    };

    function _updateDots(){
        dots.transition()
            .duration(2500)
            .attr('cx', function (d){
                return xScale(d.Cellular_volume);
            })
            .attr('cy', function (d) {
                return yScale(d.Nuclear_volume);
            });
    }

    my.update = function (data) {
        _updateScales(data);
        _updateDots();
    };

    my.build = function (data) {
        dots = dotsG.selectAll('scatter-dots')
            .data(data)
            .enter().append('circle')
            .attr('r', 7)
            .attr('width', 20)
            .attr('height', 24)
            .attr('opacity', .3)
            .attr('fill', 'blue')
            .attr('stroke','black')
            .attr('stroke-width',0)
            .attr('cx', my.chartWidth/2)
            .attr('cy', my.chartHeight/2)
            .on('mouseover',function(d) {
                _handleMouseOver(d);
            });
        _updateDots();
    };

    my.ready = function () {
        data.forEach(function (elem) {
            if(elem.tip){
                handleClick(elem)
            }
        });
    };

    return that;
};