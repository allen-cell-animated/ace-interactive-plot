function ACEScatterView(spec){
    function handleMouseOver(d) {
        d3.select('#cell-previewer-im').attr('src', 'modeling/images/' + d.im_ids + '.ome.tif_flat.png');
        d.highlight = true;
        scatter.update(1);
    };
    function handleMouseOut(d) {
        d.highlight = false;
        scatter.update(1);
    }
    var model = {
        controls: spec.controlsParent,
        parent: spec.chartParent,
        dataFile: spec.dataFile,
        xAxisDomain: spec.xAxisDomain,
        yAxisDomain: spec.yAxisDomain,
        domainOptions: spec.domainOptions,
        handleClick: spec.handleClick,
        handleMouseOver: handleMouseOver,
        handleMouseOut: handleMouseOut
    };
    var scatter = AICSScatter(model);
    //building select controls async because model needs to be populated with options/filters
    scatter.init(function () {
        var xAxisSelect = d3.select('#x-axis-options');
        var yAxisSelect = d3.select('#y-axis-options');

        xAxisSelect.on('change', function () {
            model.xAxisDomain = xAxisSelect.property('value');
            scatter.update()
        })
        .selectAll('option')
        .data(model.domainOptions).enter()
        .append('option')
        .text(function (d) { return d; });

        yAxisSelect.on('change', function () {
            model.yAxisDomain = yAxisSelect.property('value');
            scatter.update()
        })
        .selectAll('option')
        .data(model.domainOptions).enter()
        .append('option')
        .text(function (d) { return d; });

        yAxisSelect.property('value', model.yAxisDomain);
        xAxisSelect.property('value', model.xAxisDomain);

        d3.select("#class-filter-checkboxes")
        .selectAll("input")
        .data(Object.keys(model.filterClasses))
        .enter()
        .append('div')
        .attr('class', 'filter-checkbox')
        .append('label')
        // .attr('for',function(d,i){ return 'a'+i; })
        .text(function(d) { return d; })
        .append("input")
        .attr('id', function (d, i) {
            return 'class-filter-checkbox-' + i;
        })
        .attr("checked", function (d) {
            return model.filterClasses[d];
        })
        .attr("type", "checkbox")
        .on("change", function (d, i) {
            model.filterClasses[d] = d3.select('#class-filter-checkbox-' + i).property('checked');
            scatter.update();
        });
    });
};
