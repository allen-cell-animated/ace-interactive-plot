function ACEScatterView(spec){
    $.blockUI({ message: '<img src="loading.gif" />' });
    function handleMouseOver(d) {
        d3.select('#cell-previewer-im').attr('src', 'modeling/images/' + d.im_ids + '.ome.tif_flat.png');
        d3.select('#cell-previewer-name').text(function () {
            return model.xAxisDomain + ': ' + d[model.xAxisDomain];
        });
        d3.select('#circle-' + d.im_ids).attr('fill', 'red');
    };
    function handleMouseOut(d) {
        d3.select('#circle-' + d.im_ids).attr('fill', function(d){
            return (d.showToolTip || d.highlight) ? 'red' : 'blue'
        })
    };
    var model = {
        margin: spec.margin,
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

        var filterCheckBoxesParent = d3.select("#class-filter-checkboxes");
        filterCheckBoxesParent.selectAll("input")
            .data(Object.keys(model.filterClasses))
            .enter()
            .append('div')
            .attr('class', 'filter-checkbox')
            .append('label')
            .text(function(d) { return d; })
            .append("input")
            .attr('id', function (d, i) {
                return 'class-filter-checkbox-' + i;
            })
            .attr('class', 'class-filter-checkbox')
            .attr("checked", function (d) {
                return model.filterClasses[d];
            })
            .attr("type", "checkbox")
            .on("change", function (d, i) {
                model.filterClasses[d] = d3.select('#class-filter-checkbox-' + i).property('checked');
                scatter.update();
            });

        d3.select('#select-all-filters')
            .on("click", function () {
                filterCheckBoxesParent.selectAll("input").property('checked', true);
                for(filterClass in model.filterClasses){
                    model.filterClasses[filterClass] = true;
                }
                scatter.update();
            });

        d3.select('#deselect-all-filters')
            .on("click", function (d, i) {
                filterCheckBoxesParent.selectAll("input").property('checked', false);
                for(filterClass in model.filterClasses){
                    model.filterClasses[filterClass] = false;
                }
                scatter.update();
            });
        setTimeout(function(){$.unblockUI();}, 1000);
    });
};
