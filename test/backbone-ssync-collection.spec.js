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

describe('Backbone-Ssync Model', function() {

  var success;
  var error;
  var options;

  var rsp200;
  var rsp404;

  var Collection;
  var collection;

  beforeEach(function() {
    Collection = Backbone.Collection.extend({
      url: '/foo'
    });

    collection = new Collection([]);

    success = jasmine.createSpy('success');
    error = jasmine.createSpy('error');
    options = {
      success: success,
      error: error
    };

    rsp200 = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify([{
        id: 1,
        name: 'foo'
      }])
    };

    rsp404 = {
      status: 404
    };

    var $ajax = $.ajax;
    spyOn($, 'ajax').and.callFake(function() {
      var xhr = $ajax.apply($, arguments);
      spyOn(xhr, 'abort').and.callThrough();
      spyOn(xhr, 'done').and.callThrough();
      spyOn(xhr, 'fail').and.callThrough();
      return xhr;
    });

    jasmine.Ajax.install();
  });

  afterEach(function() {
    jasmine.Ajax.uninstall();
  });

  it('should fetch collection', function() {
    var opt1 = _.clone(options);
    var xhr = collection.fetch(opt1);

    expect(collection.$xhr).toEqual({
      'read': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('GET');
    expect(request.url).toBe('/foo');

    request.respondWith(rsp200);

    expect(collection.$xhr).toEqual({
      'read': []
    });

    expect(success).toHaveBeenCalledWith(collection, jasmine.any(Object), jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should fetch collection and trigger error', function() {
    var opt1 = _.clone(options);
    var xhr = collection.fetch(opt1);

    expect(collection.$xhr).toEqual({
      'read': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('GET');
    expect(request.url).toBe('/foo');

    request.respondWith(rsp404);

    expect(collection.$xhr).toEqual({
      'read': []
    });

    expect(success).not.toHaveBeenCalledWith();
    expect(error).toHaveBeenCalledWith(collection, jasmine.any(Object), jasmine.any(Object));
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should abort previous fetch', function() {
    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = collection.fetch(opt1);

    expect(collection.$xhr).toEqual({
      'read': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('GET');
    expect(r1.url).toBe('/foo');

    // Next fetch
    var xhr2 = collection.fetch(opt1);
    expect(xhr2).toBeDefined();

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2.method).toBe('GET');
    expect(r2.url).toBe('/foo');

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    expect(collection.$xhr).toEqual({
      'read': [xhr2]
    });

    r2.respondWith(rsp200);

    expect(success).toHaveBeenCalledWith(collection, jasmine.any(Object), jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();
  });

  it('should force next fetch', function() {
    var opt1 = _.extend(_.clone(options), {
      ssync: {
        mode: 'force'
      }
    });

    var opt2 = _.extend(_.clone(options), {
      ssync: {
        mode: 'force'
      }
    });

    var xhr1 = collection.fetch(opt1);

    expect(collection.$xhr).toEqual({
      'read': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('GET');
    expect(r1.url).toBe('/foo');

    // Next fetch
    var xhr2 = collection.fetch(opt1);
    expect(xhr2).toBeDefined();

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2.method).toBe('GET');
    expect(r2.url).toBe('/foo');

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    expect(collection.$xhr).toEqual({
      'read': [xhr1, xhr2]
    });

    // Trigger first request
    r1.respondWith(rsp200);

    expect(success).toHaveBeenCalledWith(collection, jasmine.any(Object), jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    expect(collection.$xhr).toEqual({
      'read': [xhr2]
    });

    success.calls.reset();

    // Trigger second request
    r2.respondWith(rsp200);

    expect(success).toHaveBeenCalledWith(collection, jasmine.any(Object), jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    expect(collection.$xhr).toEqual({
      'read': []
    });
  });
});
