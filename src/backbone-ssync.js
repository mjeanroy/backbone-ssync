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

/* global _ */
/* global Backbone */

// Keep original sync method
var $$sync = Backbone.sync;

// Constants defining mode values
var modes = {
  'PREVENT': 'prevent',
  'FORCE': 'force',
  'ABORT': 'abort'
};

// Default mode defined by sync method
var opModes = {
  'read': modes.ABORT,
  'update': modes.PREVENT,
  'create': modes.PREVENT,
  'patch': modes.PREVENT,
  'delete': modes.PREVENT
};

var ERROR_ABORT = '[ssync] Abort because of new incoming request';

var onDone = function(method, model, options) {
  return function() {
    var pendings = model.$xhr[method];
    var idx = _.indexOf(pendings, options.xhr);

    // Remove pending xhr
    if (idx > -1) {
      pendings.splice(idx, 1);
    }

    // Free memory
    method = model = options = null;
  };
};

var wrap = function(orig, fn) {
  if (!_.isFunction(orig)) {
    return fn;
  }

  return _.wrap(orig, function(f, jqXhr, statusText) {
    var args = _.rest(arguments);
    fn.apply(this, args);

    // Need to fix this if user want to abort
    if (statusText !== ERROR_ABORT) {
      f.apply(this, args);
    }

    // Free memory
    orig = fn = null;
  });
};

var operations = {};

operations[modes.FORCE] = function(method, model, opts) {
  var done = onDone(method, model, opts);
  opts.success = wrap(opts.success, done);
  opts.error = wrap(opts.error, done);

  var pendings = model.$xhr[method];
  var xhr = $$sync.apply(this, [method, model, opts]);

  // Add pending jqXhr
  pendings.push(xhr);

  // Free memory
  done = null;

  return xhr;
};

operations[modes.PREVENT] = function(method, model) {
  return _.isEmpty(model.$xhr[method]) ?
    operations[modes.FORCE].apply(this, arguments) :
    null;
};

operations[modes.ABORT] = function(method, model) {
  _.each(model.$xhr[method], function(jqXhr) {
    jqXhr.abort(ERROR_ABORT);
  });

  return operations[modes.FORCE].apply(this, arguments);
};

Backbone.ssync = Backbone.sync = function(method, model, options) {
  var opts = options || opts;
  var xhr = model.$xhr = model.$xhr || {};
  var ssync = opts.ssync = opts.ssync || {};
  var mode = ssync.mode = ssync.mode || opModes[method];

  // Create array of pending requests if needed
  if (!xhr[method]) {
    xhr[method] = [];
  }

  return operations[mode].apply(this, [method, model, opts]);
};

// Available modes
Backbone.ssync.modes = modes;
Backbone.ssync.opModes = opModes;
