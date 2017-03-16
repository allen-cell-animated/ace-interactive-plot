d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

function ACEScatterView(spec){
    $.blockUI({ message: '<img src="loading.gif" />' });

    function _imagePath(cellName) {
        return model.imagesDir + '/' + cellName.split('_')[0] + '/' + cellName + '.png';
    }

    var previewerImage = d3.select('#cell-previewer-im');
    var previewerName = d3.select('#cell-previewer-name');
    var previewerTaggedProtein = d3.select('#cell-previewer-tagged-protein');
    var previewerxValue = d3.select('#cell-previewer-x-value');
    var previeweryValue = d3.select('#cell-previewer-y-value');

    var _updatePreview = function(d) {
        previewerImage.attr('src', _imagePath(d.cellName));
        previewerName.text(function () {
            return 'Cell Name: ' + d.cellName;
        });
        previewerTaggedProtein.text(function () {
            return 'Tagged Protein: ' + d.classes;
        });
        previewerxValue.text(function () {
            return model.xAxisDomain + ': ' + d[model.xAxisDomain];
        });
        previeweryValue.text(function () {
            return model.yAxisDomain + ': ' + d[model.yAxisDomain];
        });
    };
    var model = {
        margin: spec.margin,
        controls: spec.controlsParent,
        parent: spec.chartParent,
        dataFile: spec.dataFile,
        imageDataFile: spec.imageDataFile,
        imagesDir: spec.imagesDir,
        xAxisDomain: spec.xAxisDomain,
        yAxisDomain: spec.yAxisDomain,
        domainOptions: spec.domainOptions,
        clickHandlers: spec.clickHandlers,
        mouseOverHandlers: (spec.mouseOverHandlers || []).concat(_updatePreview),
        imagePath: _imagePath
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

        _updatePreview(model.imageDs[model.imageDs.length - 1]);
        setTimeout(function(){
            $('#viz').show();
            $.unblockUI();
        }, 1000);
    });
};
