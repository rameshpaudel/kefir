var Kefir = require('../../dist/kefir.js');
var helpers = require('../test-helpers');



describe(".delay()", function(){


  beforeEach(function() {
    jasmine.Clock.useMock();
  });

  it("stream.delay()", function(){

    var stream = new Kefir.Stream();
    var delayed = stream.delay(100);

    expect(delayed).toEqual(jasmine.any(Kefir.Stream));

    var result = helpers.getOutput(delayed);

    expect(result.xs).toEqual([]);

    stream.__sendValue(1);
    expect(result.xs).toEqual([]);

    jasmine.Clock.tick(50);
    expect(result.xs).toEqual([]);

    jasmine.Clock.tick(51);
    expect(result.xs).toEqual([1]);

    stream.__sendValue(2);
    jasmine.Clock.tick(20);
    stream.__sendValue(3);

    expect(result.xs).toEqual([1]);

    jasmine.Clock.tick(81);
    expect(result.xs).toEqual([1, 2]);

    jasmine.Clock.tick(20);
    expect(result.xs).toEqual([1, 2, 3]);

    stream.__sendEnd();
    expect(result.ended).toBe(false);

    jasmine.Clock.tick(101);
    expect(result.ended).toBe(true);

  });




  it("property.delay()", function(){

    var property = new Kefir.Property(null, null, 0);
    var delayed = property.delay(100);

    expect(delayed).toEqual(jasmine.any(Kefir.Property));
    expect(delayed.hasValue()).toBe(true);
    expect(delayed.getValue()).toBe(0);

    var result = helpers.getOutput(delayed);

    expect(result.xs).toEqual([0]);

    property.__sendValue(1);
    expect(result.xs).toEqual([0]);

    jasmine.Clock.tick(50);
    expect(result.xs).toEqual([0]);

    jasmine.Clock.tick(51);
    expect(result.xs).toEqual([0, 1]);

    property.__sendValue(2);
    jasmine.Clock.tick(20);
    property.__sendValue(3);

    expect(result.xs).toEqual([0, 1]);

    jasmine.Clock.tick(81);
    expect(result.xs).toEqual([0, 1, 2]);

    jasmine.Clock.tick(20);
    expect(result.xs).toEqual([0, 1, 2, 3]);

    property.__sendEnd();
    expect(result.ended).toBe(false);

    jasmine.Clock.tick(101);
    expect(result.ended).toBe(true);

  });




  it("errors not delayed", function(){

    var stream = new Kefir.Stream();
    var delayed = stream.delay(100);

    var result = helpers.getOutputAndErrors(delayed);

    stream.__sendError('e');

    expect(result.errors).toEqual(['e']);

  });


});
