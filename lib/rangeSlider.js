$.fn.RangeSlider = function(cfg){
    this.sliderCfg = {
        min: cfg && !isNaN(parseFloat(cfg.min)) ? Number(cfg.min) : null,
        max: cfg && !isNaN(parseFloat(cfg.max)) ? Number(cfg.max) : null,
        step: cfg && Number(cfg.step) ? cfg.step : 1,
        callback: cfg && cfg.callback ? cfg.callback : null
    };

    var $input = $(this);
    var min = this.sliderCfg.min;
    var max = this.sliderCfg.max;
    var step = this.sliderCfg.step;
    var callback = this.sliderCfg.callback;
    $input.parent().find(".range-value").text($input.attr('value'));
    $input.attr('min', min)
        .attr('max', max)
        .attr('step', step);

    $input.bind("input", function(e){  //监听input事件
        $input.attr('value', this.value);
        $input.css( 'background', 'linear-gradient(to right, #059CFA, white ' + this.value + '%, white)' );
        //填写后面的数值

        if ($.isFunction(callback)) {
            $input.parent().find(".range-value").text(this.value);
            callback(this);
        }
    });
};