d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

function ACEScatterView(spec){
    $.blockUI({ message: '<img src="loading.gif" />' });

    var model = {
        margin: spec.margin,
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

    var previewerImage = d3.select('#ace-scatter-cell-previewer-im');
    var previewerName = d3.select('#ace-scatter-cell-previewer-name');
    var previewerTaggedProtein = d3.select('#ace-scatter-cell-previewer-tagged-protein');
    var previewerxValue = d3.select('#ace-scatter-cell-previewer-x-value');
    var previeweryValue = d3.select('#ace-scatter-cell-previewer-y-value');

    function buildFilterCheckBoxes(filterCheckBoxesParent, filterClasses) {
        var filtersChunk = filterCheckBoxesParent.append('div')
            .attr('class', 'col-md-1 ace-scatter-auto');

        var filter = filtersChunk.selectAll("input")
            .data(filterClasses)
            .enter()
            .append('div');

        filter
            .append("input")
            .attr("checked", function (d) {
                return model.filterClasses[d];
            })
            .attr("type", "checkbox")
            .on("change", function (d, i) {
                model.filterClasses[d] = d3.select(this).property('checked');
                scatter.update();
            });

        filter
            .append('label')
            .text(function (d) {
                return d;
            });
    }

    var scatter = AICSScatter(model);
    //building select controls async because model needs to be populated with options/filters
    scatter.init(function () {
        var xAxisSelect = d3.select('#ace-scatter-x-axis-options');
        var yAxisSelect = d3.select('#ace-scatter-y-axis-options');

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

        var filterCheckBoxesParent = d3.select("#ace-scatter-class-filter-checkboxes");
        var chunkSize = 4, chunkCount = 0, totalCount = 0, chunk = [];
        for(filterClass in model.filterClasses){
            if(chunkCount == chunkSize || totalCount == (Object.keys(model.filterClasses).length - 1)){
                buildFilterCheckBoxes(filterCheckBoxesParent, chunk);
                chunk = [];
                chunkCount = 0;
            }
            chunk.push(filterClass);
            chunkCount++;
            totalCount++;
        }

        d3.select('#ace-scatter-select-all-filters')
            .on("click", function () {
                filterCheckBoxesParent.selectAll("input").property('checked', true);
                for(filterClass in model.filterClasses){
                    model.filterClasses[filterClass] = true;
                }
                scatter.update();
            });

        d3.select('#ace-scatter-deselect-all-filters')
            .on("click", function (d, i) {
                filterCheckBoxesParent.selectAll("input").property('checked', false);
                for(filterClass in model.filterClasses){
                    model.filterClasses[filterClass] = false;
                }
                scatter.update();
            });

        _updatePreview(model.imageDs[model.imageDs.length - 1]);
        setTimeout(function(){
            $('#ace-scatter-blocker').hide();
            $.unblockUI();
        }, 1000);
    });

    function _imagePath(cellName) {
        return model.imagesDir + '/' + cellName.split('_')[0] + '/' + cellName + '.png';
    }

    function _updatePreview(d) {
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

};
