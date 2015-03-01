/*global window, $, document */
(function () {

  function AlignMe(el, options) {
    var that = this;
    that.$el = $(el);
    that.$container = $(options.container) || $(document.body);
    that.$relateTo = $(options.relateTo) || null;
    if (!that.relateTo) {
      throw new Error('`relateTo` option is required');
    }
  }

  AlignMe.prototype.align = function () {
    var that = this;

    console.log(that.$relateTo.position());
    console.log(that.$el.position());

  };

  window.AlignMe = AlignMe;

}());
