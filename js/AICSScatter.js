
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
        d3.select(this).attr({
            r: 6,
            opacity: 1.0
        });
    };

    function _handleMouseOut(d, i) {
        d3.select(this).attr({
            r: 3,
            opacity: .5
        });
    };

    spec.handleClick = spec.handleClick || function (d, i){
        var tip = d3.select('body')
            .append('div')
            .attr('class', 'tip')
            .style('padding', '5px')
            .style('position', 'absolute')
            .style('display', 'none')
            .on('click', function () {
                tip.remove();
                d.tip = false;
            });

        var tipImage = tip.append('img').attr('width', 150).attr('height', 150);

        tip.transition().duration(0);
        tip.style('top', y(d.nuclear_sphericity) - 20 + 'px');
        tip.style('left', x(d.nuclear_volume) + 'px');
        tip.style('display', 'block');

        tipImage.attr('src', d.url);
        d.tip = true;
    };

    my.init = function(data, main){
        _updateScales(data);

        // draw the x axis
        var xAxis = d3.axisBottom()
            .scale(xScale);
            // .orient('bottom');

        main.append('g')
            .attr('transform', 'translate(0,' + my.chartHeight + ')')
            .attr('class', 'main axis date')
            .call(xAxis);

        // draw the y axis
        var yAxis = d3.axisLeft()
            .scale(yScale);
            // .orient('left');

        main.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'main axis date')
            .call(yAxis);

        dotsG = main.append("svg:g");

        // dots = dotsG.selectAll("scatter-dots")
        //     .data(data)
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