// TODO
//
// observable.delay(wait)
// observable.throttle(wait, leading, trailing)
// observable.debounce(wait, immediate)
// http://underscorejs.org/#defer





// Kefir.later()

Kefir.LaterStream = function LaterStream(wait, value) {
  Stream.call(this);
  this.__value = value;
  this.__wait = wait;
}

inherit(Kefir.LaterStream, Stream, {

  __ClassName: 'LaterStream',

  __onFirstIn: function(){
    var _this = this;
    setTimeout(function(){
      _this.__sendAny(_this.__value);
      _this.__sendEnd();
    }, this.__wait);
  },

  __clear: function(){
    Stream.prototype.__clear.call(this);
    this.__value = null;
    this.__wait = null;
  }

});

Kefir.later = function(wait, value) {
  return new Kefir.LaterStream(wait, value);
}





// .delay()

var DelayedMixin = {
  __Constructor: function(source, wait) {
    this.__source = source;
    this.__wait = wait;
    source.onEnd(this.__sendEndLater, this);
  },
  __sendLater: function(x){
    var _this = this;
    setTimeout(function(){  _this.__sendValue(x)  }, this.__wait);
  },
  __sendEndLater: function(){
    var _this = this;
    setTimeout(function(){  _this.__sendEnd()  }, this.__wait);
  },
  __onFirstIn: function(){
    this.__source.onNewValue('__sendLater', this);
    this.__source.onError('__sendError', this);
  },
  __onLastOut: function(){
    this.__source.offValue('__sendLater', this);
    this.__source.offError('__sendError', this);
  },
  __clear: function(){
    Observable.prototype.__clear.call(this);
    this.__source = null;
    this.__wait = null;
  }
}


Kefir.DelayedStream = function DelayedStream(source, wait) {
  Stream.call(this);
  DelayedMixin.__Constructor.call(this, source, wait);
}

inherit(Kefir.DelayedStream, Stream, DelayedMixin, {
  __ClassName: 'DelayedStream'
});

Stream.prototype.delay = function(wait) {
  return new Kefir.DelayedStream(this, wait);
}


Kefir.DelayedProperty = function DelayedProperty(source, wait) {
  Property.call(this);
  DelayedMixin.__Constructor.call(this, source, wait);
  if (source.hasValue()) {
    this.__sendValue(source.getValue());
  }
}

inherit(Kefir.DelayedProperty, Property, DelayedMixin, {
  __ClassName: 'DelayedProperty'
});

Property.prototype.delay = function(wait) {
  return new Kefir.DelayedProperty(this, wait);
}








// FromPoll

var FromPollStream = Kefir.FromPollStream = function FromPollStream(interval, sourceFnMeta){
  Stream.call(this);
  this.__interval = interval;
  this.__intervalId = null;
  var _this = this;
  sourceFnMeta = normFnMeta(sourceFnMeta);
  this.__bindedSend = function(){  _this.__sendAny(callFn(sourceFnMeta))  }
}

inherit(FromPollStream, Stream, {

  __ClassName: 'FromPollStream',
  __onFirstIn: function(){
    this.__intervalId = setInterval(this.__bindedSend, this.__interval);
  },
  __onLastOut: function(){
    if (this.__intervalId !== null){
      clearInterval(this.__intervalId);
      this.__intervalId = null;
    }
  },
  __clear: function(){
    Stream.prototype.__clear.call(this);
    this.__bindedSend = null;
  }

});

Kefir.fromPoll = function(interval/*, fn[, context[, arg1, arg2, ...]]*/){
  return new FromPollStream(interval, restArgs(arguments, 1));
}



// Interval

Kefir.interval = function(interval, x){
  return new FromPollStream(interval, [id, null, x]);
}



// Sequentially

var sequentiallyHelperFn = function(){
  if (this.xs.length === 0) {
    return END;
  }
  if (this.xs.length === 1){
    return Kefir.bunch(this.xs[0], END);
  }
  return this.xs.shift();
}

Kefir.sequentially = function(interval, xs){
  return new FromPollStream(interval, [sequentiallyHelperFn, {xs: xs.slice(0)}]);
}



// Repeatedly

var repeatedlyHelperFn = function(){
  this.i = (this.i + 1) % this.xs.length;
  return this.xs[this.i];
}

Kefir.repeatedly = function(interval, xs){
  return new FromPollStream(interval, [repeatedlyHelperFn, {i: -1, xs: xs}]);
}
