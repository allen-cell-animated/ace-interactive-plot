function ACEScatterView(spec){
    $.blockUI({
        overlayCSS: { backgroundColor: 'white' },
        message: '<img src="spinning5.gif" height="100%" width="100%"/>'
    });

    var model = {
        cirleRadius: spec.cirleRadius,
        cellName: spec.cellName,
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
        filterClasses: spec.filterClasses,
        unselectedCircleOpacity: spec.unselectedCircleOpacity,
        imagePath: _imagePath
    };

    var previewerImage = d3.select('#ace-scatter-cell-previewer-im');
    var previewerName = d3.select('#ace-scatter-cell-previewer-name .value');
    var previewerTaggedProtein = d3.select('#ace-scatter-cell-previewer-tagged-protein .value');
    var previewerxKey = d3.select('#ace-scatter-cell-previewer-x .key');
    var previeweryKey = d3.select('#ace-scatter-cell-previewer-y .key');
    var previewerxValue = d3.select('#ace-scatter-cell-previewer-x .value');
    var previeweryValue = d3.select('#ace-scatter-cell-previewer-y .value');

    function buildFilterCheckBoxes(filterCheckBoxesParent, filterClasses) {
        var filtersChunk = filterCheckBoxesParent.append('div')
            .attr('class', 'ace-scatter-auto');


        var filter = filtersChunk.selectAll("input")
            .data(filterClasses)
            .enter()
            .append('div')
            .attr('class', 'form-check form-check-inline');

        var label = filter
            .append('label')
            .attr('class', 'form-check-label');

        label
            .insert("input")
            .attr('class', 'form-check-input')
            .attr("checked", function (d) {
                return model.filterClasses[d.name].selected;
            })
            .attr("type", "checkbox")
            .on("change", function (d) {
                model.filterClasses[d.name].selected = d3.select(this).property('checked');
                scatter.update();
            });

        var labelName = label
            .append('div')
            .attr('class', 'circle')
            .style('background-color', function(d){
              return d.color;
          });

        label
            .append('span')
            .text(function (d) {
              return d.name;
            });
    }

    var scatter = AICSScatter(model);
    //building select controls async because model needs to be populated with options/filters
    scatter.init(function () {
        var xAxisSelect = d3.select('#ace-scatter-x-axis-options');
        var yAxisSelect = d3.select('#ace-scatter-y-axis-options');

        xAxisSelect.on('change', function () {
            model.xAxisDomain = model.domainOptions[document.getElementById('ace-scatter-x-axis-options').selectedIndex];
            scatter.update()
        })
            .selectAll('option')
            .data(model.domainOptions).enter()
            .append('option')
            .html(function (d) { return d; });

        yAxisSelect.on('change', function () {
            model.yAxisDomain = model.domainOptions[document.getElementById('ace-scatter-y-axis-options').selectedIndex];
            scatter.update()
        })
            .selectAll('option')
            .data(model.domainOptions).enter()
            .append('option')
            .html(function (d) { return d; });

        document.getElementById("ace-scatter-x-axis-options").selectedIndex = model.domainOptions.indexOf(model.xAxisDomain);
        document.getElementById("ace-scatter-y-axis-options").selectedIndex = model.domainOptions.indexOf(model.yAxisDomain);

        var filterCheckBoxesParent = d3.select("#ace-scatter-class-filter-checkboxes");
        var filterClassConfigs = [];
        for(filterClass in model.filterClasses){
            filterClassConfigs.push({name: filterClass, color: model.filterClasses[filterClass].color});
        }
        buildFilterCheckBoxes(filterCheckBoxesParent, filterClassConfigs);

        d3.select('#ace-scatter-select-all-filters')
            .on("click", function () {
                filterCheckBoxesParent.selectAll("input").property('checked', true);
                for(filterClass in model.filterClasses){
                    model.filterClasses[filterClass].selected = true;
                }
                scatter.update();
            });

        d3.select('#ace-scatter-deselect-all-filters')
            .on("click", function (d, i) {
                filterCheckBoxesParent.selectAll("input").property('checked', false);
                for(filterClass in model.filterClasses){
                    model.filterClasses[filterClass].selected = false;
                }
                scatter.update();
            });

        setTimeout(function(){
            scatter.initDefaultState();
            _updatePreview(model.imageDs[model.imageDs.length - 1]);
            scatter.update();
            $('#ace-scatter-blocker').hide();
            $.unblockUI();
        }, 1000);
    });

    function _imagePath(d) {
        return model.imagesDir + '/' + d[model.cellName].split('_')[0] + '/' + d[model.cellName] + '.png';
    }

    function _updatePreview(d) {
        previewerImage.attr('src', _imagePath(d));
        previewerName.html(function () {
            return d[model.cellName];
        });
        previewerTaggedProtein.html(function () {
            return d.classes;
        });
        previewerxKey.html(function () {
            return model.xAxisDomain + ':';
        });
        previewerxValue.html(function () {
            return d[model.xAxisDomain];
        });
        previeweryKey.html(function () {
            return model.yAxisDomain + ': ';
        });
        previeweryValue.html(function () {
            return d[model.yAxisDomain];
        });
    };

};

ACEScatterView({
    cellName: 'Cell ID',
    chartParent: 'ace-scatter-chart',
    dataFile: 'js/AICS_Cell-feature-analysis_v1.5.csv',
    imagesDir: 'http://cellviewer.allencell.org/aics/thumbnails/2017_03_08_Struct_First_Pass_Seg',
    xAxisDomain: 'Cellular volume (fL)',
    yAxisDomain: 'Cellular surface area (&micro;m&sup2;)',
    domainOptions: ['Apical proximity (unitless)', 'Cellular surface area (&micro;m&sup2;)',
        'Cellular volume (fL)', 'Nuclear surface area (&micro;m&sup2;)', 'Nuclear volume (fL)',
        'Radial proximity (unitless)'],
    filterClasses: {
        "Tom20":{
            selected: true,
            color:'#6a3d9a',
        },
        "Alpha tubulin":{
            selected: true,
            color:'#cab2d6',
        },
        "Sec61 beta":{
            selected: true,
            color:'#838689',
        },
        "Alpha actinin":{
            selected: true,
            color:'#1f78b4',
        },
        "Desmoplakin":{
            selected: true,
            color:'#33a02c',
        },
        "Lamin B1":{
            selected: true,
            color:'#fb9a99',
        },
        "Fibrillarin":{
            selected: true,
            color:'#e31a1c',
        },
        "Beta actin":{
            selected: true,
            color:'#a6cee3',
        },
        "ZO1":{
            selected: true,
            color:'#ff7f00',
        },
        "Myosin IIB":{
            selected: true,
            color:'#fdbf6f',
        }
    },
    unselectedCircleOpacity: .3,
    cirleRadius: 4,
    margin: {top: 20, right: 50, bottom: 50, left: 80},
});
