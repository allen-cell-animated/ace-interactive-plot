function ACEScatterView(spec){
    var model = {
        controls: spec.controlsParent,
        parent: spec.chartParent,
        dataFile: spec.dataFile,
        xAxisDomain: spec.xAxisDomain,
        yAxisDomain: spec.yAxisDomain,
        domainOptions: spec.domainOptions,
        handleClick: spec.handleClick
    };
    var scatter = AICSScatter(model);
    scatter.init(function () {
        var xAxisSelect = d3.select('#x-axis-options');
        var yAxisSelect = d3.select('#y-axis-options');

        xAxisSelect.on('change', function (d) {
            console.log(xAxisSelect.property('value'))
            model.xAxisDomain = xAxisSelect.property('value');
            scatter.update()
        })
        .selectAll('option')
        .data(model.domainOptions).enter()
        .append('option')
        .text(function (d) { return d; })

        yAxisSelect.on('change', function (d) {
            model.yAxisDomain = yAxisSelect.property('value');
            scatter.update()
        })
        .selectAll('option')
        .data(model.domainOptions).enter()
        .append('option')
        .text(function (d) { return d; });

        yAxisSelect.property('value', model.yAxisDomain);
        xAxisSelect.property('value', model.xAxisDomain);
    });
};
