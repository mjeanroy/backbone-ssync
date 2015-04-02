/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Mickael Jeanroy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Keep original sync method
var $$sync = Backbone.sync;

var modes = {
  'PREVENT': 'prevent',
  'FORCE': 'force',
  'ABORT': 'abort'
};

var opModes = {
  'read': modes.ABORT,
  'update': modes.PREVENT,
  'create': modes.PREVENT,
  'patch': modes.PREVENT,
  'delete': modes.PREVENT
};

var onDone = function(model, response, options) {
  var method = options.method;
  var xhr = options.xhr;
  var pendings = model.$xhr[method];
  var idx = _.indexOf(pendings, options.xhr);

  // Remove pending xhr
  if (idx > -1) {
    pendings.splice(idx, 1);
  }
};

var wrap = function(orig, fn) {
  if (!_.isFunction(orig)) {
    return fn;
  }

  return _.wrap(orig, function(f) {
    var args = _.rest(arguments);
    fn.apply(this, args);
    return f.apply(this, args);
  });
};

var operations = {};

operations[modes.FORCE] = function(method, model, opts) {
  var success = opts.success;
  var error = opts.error;

  opts.success = wrap(opts.success, onDone);
  opts.error = wrap(opts.error, onDone);

  var pendings = model.$xhr[method];
  var xhr = $$sync.apply(this, arguments);
  pendings.push(xhr);
  return xhr;
};

operations[modes.PREVENT] = function(method, model) {
  return _.isEmpty(model.$xhr[method]) ?
    this[modes.FORCE].apply(this, arguments) :
    null;
};

operations[modes.ABORT] = function(method, model) {
  _.invoke(model.$xhr[method], 'abort');
  return this[modes.FORCE].apply(this, arguments);
};

Backbone.ssync = Backbone.sync = function(method, model, options) {
  var opts = options || opts;
  var xhr = model.$xhr = model.$xhr || {};
  var mode = opts.ssync = opts.ssync || opModes[method];

  // Add method to options object
  opts.method = method;

  // Create array of pending requests if needed
  if (!xhr[method]) {
    xhr[method] = [];
  }

  return operations.apply(this, [method, model, opts]);
};

// Available modes
Backbone.ssync.modes = modes;
Backbone.ssync.opModes = opModes;
