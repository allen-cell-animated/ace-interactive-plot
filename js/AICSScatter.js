
function AICSScatter(spec, my){

    my = my || {};

    var that = AICSChart(spec, my);

    var xScale = d3.scaleLinear();
    var yScale = d3.scaleLinear();

    var dotsG = undefined;
    var dots = undefined;

    function _yScaleAccessor(elem) {
        return Number(elem.Nuclear_volume);
    };

    function _xScaleAccesor(elem) {
        return Number(elem.Cellular_volume);
    };

    function _handleMouseOver(d, i) {
        // d3.select(this).attr('fill', 'red');
        d3.select(this).attr('r', '6').attr('opacity', 1.0).attr('fill', 'red');
    };

    function _handleMouseOut(d, i) {
        d3.select(this).attr('r', '3').attr('opacity', .5).attr('fill', 'blue');
    };

    spec.handleClick = spec.handleClick || function (d, i){
        // d3.select(this).attr('r', '6').attr('fill', 'red').attr('opacity', 1.0).on("mouseover", undefined).on("mouseout", undefined);
        var tip = d3.select('body')
            .append('div')
            .attr('class', 'tip')
            .style('position', 'absolute')
            .style('display', 'none')
            .on('click', function () {
                tip.remove();
                d.tip = false;
                // d3.select(this).attr('r', '3').attr('fill', 'blue').attr('opacity', .5).on("mouseover", _handleMouseOver).on("mouseout", _handleMouseOut);
            });

        var tipWidth = 150;
        var tipHeight = 150;
        var tipImage = tip.append('img').attr('width', tipWidth).attr('height', tipHeight);

        tip.transition().duration(0);
        tip.style('left', (spec.margin.left + xScale(d.Cellular_volume) - (tipWidth / 2)) + 'px');
        tip.style('top', (spec.margin.top + yScale(d.Nuclear_volume) - (tipHeight / 2)) + 'px');
        tip.style('display', 'block');
        tipImage.attr('src', "modeling/images/" + d.im_ids + ".ome.tif_flat.png");
        d.tip = true;
    };

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
            .attr('r', 3)
            .attr('width', 20)
            .attr('height', 24)
            .attr('opacity', .5)
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