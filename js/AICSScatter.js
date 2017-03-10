
function AICSScatter(spec, my){

    my = my || {};

    var TIP_WIDTH = 150;
    var TIP_HEIGHT = 150;

    var that = AICSChart(spec, my);

    var xScale = d3.scaleLinear();
    var yScale = d3.scaleLinear();

    var dotsG = undefined;
    var dots = undefined;

    var mouseOverTooltip = undefined;

    function _yScaleAccessor(elem) {
        return Number(elem.Nuclear_volume);
    };

    function _xScaleAccesor(elem) {
        return Number(elem.Cellular_volume);
    };

    function _handleMouseOver(d, i) {
        // d3.select(this).attr('r', '6').attr('opacity', 1.0).attr('fill', 'red');
        mouseOverTooltip = _createToolTip(d);
        _setToolTip(mouseOverTooltip, d);
    };

    function _handleMouseOut(d, i) {
        // d3.select(this).attr('r', '3').attr('opacity', .5).attr('fill', 'blue');
        _removeToolTip(mouseOverTooltip);
    };

    spec.handleClick = spec.handleClick || function (d, i){
        tip = _createToolTip(d);
        _setToolTip(tip, d);
        tip.div.on('click', function () {
            _removeToolTip(tip);
            d.tip = false;
        });
        d.tip = true;
    };

    function _createToolTip(d) {
        // d3.select(this).attr('r', '6').attr('fill', 'red').attr('opacity', 1.0).on("mouseover", undefined).on("mouseout", undefined);
        var tipDiv = d3.select('body')
            .append('div')
            .attr('class', 'tip')
            .style('position', 'absolute')
            .style('display', 'none');

        var tipImage = tipDiv.append('img').attr('width', TIP_WIDTH).attr('height', TIP_HEIGHT);
        return {div: tipDiv, image: tipImage};
    }

    function _removeToolTip(tip) {
        tip.div.remove();
    }

    function _setToolTip(tip, d){
        tip.div.transition().duration(0);
        tip.div.style('left', (spec.margin.left + xScale(d.Cellular_volume) - (TIP_WIDTH / 2)) + 'px');
        tip.div.style('top', (spec.margin.top + yScale(d.Nuclear_volume) - (TIP_HEIGHT / 2)) + 'px');
        tip.div.style('display', 'block');
        tip.image.attr('src', "modeling/images/" + d.im_ids + ".ome.tif_flat.png");
    }

    my.init = function(data, main){
        _updateScales(data);
        var xAxis = d3.axisBottom()
            .scale(xScale);
        main.append('g')
            .attr('transform', 'translate(0,' + my.chartHeight + ')')
            .attr('class', 'main axis date')
            .call(xAxis);
        var yAxis = d3.axisLeft()
            .scale(yScale);
        main.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'main axis date')
            .call(yAxis);
        dotsG = main.append("svg:g");
    };

    function _updateScales(data) {
        xScale.domain([d3.min(data, _xScaleAccesor), d3.max(data, _xScaleAccesor)])
            .range([ 0, my.chartWidth ]);
        yScale.domain([d3.min(data, _yScaleAccessor), d3.max(data, _yScaleAccessor)])
            .range([ my.chartHeight, 0 ]);
    };

    function _updateDots(){
        dots.transition()
            .duration(2500)
            .attr("cx", function (d){
                return xScale(d.Cellular_volume);
            })
            .attr("cy", function (d) {
                return yScale(d.Nuclear_volume);
            });
    }

    my.update = function (data) {
        _updateScales(data);
        _updateDots();
    };

    my.build = function (data) {
        dots = dotsG.selectAll("scatter-dots")
            .data(data)
            .enter().append("circle")
            .attr('r', 7)
            .attr('width', 20)
            .attr('height', 24)
            .attr('opacity', .3)
            .attr('fill', 'blue')
            .attr("cx", my.chartWidth/2)
            .attr("cy", my.chartHeight/2)
            .on('click', spec.handleClick)
            .on("mouseover", _handleMouseOver)
            .on("mouseout", _handleMouseOut);

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