function ACEScatterView(spec){
    var that = {};
    var scatter = AICSScatter({
        parent: spec.chartParent,
        dataFile: spec.dataFile
    });
    scatter.init();
    return that;
};
