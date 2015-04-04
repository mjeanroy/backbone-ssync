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

  var rsp204;
  var rsp200;
  var rsp404;

  var Model;
  var model;

  beforeEach(function() {
    Model = Backbone.Model.extend({
      urlRoot: '/foo'
    });

    model = new Model({
      id: 1
    });

    success = jasmine.createSpy('success');
    error = jasmine.createSpy('error');
    options = {
      success: success,
      error: error
    };

    rsp200 = {
      status: 200,
      contentType: 'application/json',
      responseText: JSON.stringify({
        id: 1,
        name: 'foo'
      })
    };

    rsp204 = {
      status: 204
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

  it('should fetch model', function() {
    var opt1 = _.clone(options);
    var xhr = model.fetch(opt1);

    expect(model.$xhr).toEqual({
      'read': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('GET');
    expect(request.url).toBe('/foo/1');

    request.respondWith(rsp200);

    expect(model.$xhr).toEqual({
      'read': []
    });

    expect(success).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should fetch model and trigger error', function() {
    var opt1 = _.clone(options);
    var xhr = model.fetch(opt1);

    expect(model.$xhr).toEqual({
      'read': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('GET');
    expect(request.url).toBe('/foo/1');

    request.respondWith(rsp404);

    expect(model.$xhr).toEqual({
      'read': []
    });

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should create model', function() {
    model.unset('id');

    var opt1 = _.clone(options);
    var xhr = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'create': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('POST');
    expect(request.url).toBe('/foo');

    request.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'create': []
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should create model and trigger error', function() {
    model.unset('id');

    var opt1 = _.clone(options);
    var xhr = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'create': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('POST');
    expect(request.url).toBe('/foo');

    request.respondWith(rsp404);

    expect(model.$xhr).toEqual({
      'create': []
    });

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should patch model', function() {
    model.set('foo', 'bar');

    var opt1 = _.clone(options);
    var xhr = model.save({}, _.extend(opt1, {
      patch: true
    }));

    expect(model.$xhr).toEqual({
      'patch': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('PATCH');
    expect(request.url).toBe('/foo/1');

    request.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'patch': []
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should patch model and trigger error', function() {
    model.set('foo', 'bar');

    var opt1 = _.clone(options);
    var xhr = model.save({}, _.extend(opt1, {
      patch: true
    }));

    expect(model.$xhr).toEqual({
      'patch': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('PATCH');
    expect(request.url).toBe('/foo/1');

    request.respondWith(rsp404);

    expect(model.$xhr).toEqual({
      'patch': []
    });

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should save model', function() {
    var opt1 = _.clone(options);
    var xhr = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'update': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('PUT');
    expect(request.url).toBe('/foo/1');

    request.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'update': []
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should save model and trigger error', function() {
    var opt1 = _.clone(options);
    var xhr = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'update': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('PUT');
    expect(request.url).toBe('/foo/1');

    request.respondWith(rsp404);

    expect(model.$xhr).toEqual({
      'update': []
    });

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should delete model', function() {
    var opt1 = _.clone(options);
    var xhr = model.destroy(opt1);

    expect(model.$xhr).toEqual({
      'delete': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('DELETE');
    expect(request.url).toBe('/foo/1');

    request.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'delete': []
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should delete model and trigger error', function() {
    var opt1 = _.clone(options);
    var xhr = model.destroy(opt1);

    expect(model.$xhr).toEqual({
      'delete': [xhr]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr.abort).not.toHaveBeenCalled();

    var request = jasmine.Ajax.requests.mostRecent();

    expect(request.method).toBe('DELETE');
    expect(request.url).toBe('/foo/1');

    request.respondWith(rsp404);

    expect(model.$xhr).toEqual({
      'delete': []
    });

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr.abort).not.toHaveBeenCalled();
  });

  it('should abort previous fetch', function() {
    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = model.fetch(opt1);

    expect(model.$xhr).toEqual({
      'read': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('GET');
    expect(r1.url).toBe('/foo/1');

    var xhr2 = model.fetch(opt2);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).not.toBe(r1);
    expect(r2.method).toBe('GET');
    expect(r2.url).toBe('/foo/1');

    expect(model.$xhr).toEqual({
      'read': [xhr2]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    r2.respondWith(rsp200);

    expect(error).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
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

    var xhr1 = model.fetch(opt1);

    expect(model.$xhr).toEqual({
      'read': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('GET');
    expect(r1.url).toBe('/foo/1');

    var xhr2 = model.fetch(opt2);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).not.toBe(r1);
    expect(r2.method).toBe('GET');
    expect(r2.url).toBe('/foo/1');

    expect(model.$xhr).toEqual({
      'read': [xhr1, xhr2]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    r2.respondWith(rsp200);

    expect(error).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    expect(model.$xhr).toEqual({
      'read': [xhr1]
    });

    success.calls.reset();

    r1.respondWith(rsp200);

    expect(error).not.toHaveBeenCalled();
    expect(success).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    expect(model.$xhr).toEqual({
      'read': []
    });
  });

  it('should abort previous fetch and trigger error of second request', function() {
    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = model.fetch(opt1);

    expect(model.$xhr).toEqual({
      'read': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('GET');
    expect(r1.url).toBe('/foo/1');

    var xhr2 = model.fetch(opt2);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).not.toBe(r1);
    expect(r2.method).toBe('GET');
    expect(r2.url).toBe('/foo/1');

    expect(model.$xhr).toEqual({
      'read': [xhr2]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    r2.respondWith(rsp404);

    expect(error).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(success).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();
  });

  it('should prevent next patch', function() {
    model.set('foo', 'bar');

    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = model.save({}, _.extend(opt1, {
      patch: true
    }));

    expect(model.$xhr).toEqual({
      'patch': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('PATCH');
    expect(r1.url).toBe('/foo/1');

    // Trigger second creation
    var xhr2 = model.save({}, _.extend(opt2, {
      patch: true
    }));
    expect(xhr2).toBe(null);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).toBe(r1);

    expect(model.$xhr).toEqual({
      'patch': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'patch': []
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
  });

  it('should force next patch', function() {
    model.set('foo', 'bar');

    var opt1 = _.extend(_.clone(options), {
      patch: true,
      ssync: {
        mode: 'force'
      }
    });

    var opt2 = _.extend(_.clone(options), {
      patch: true,
      ssync: {
        mode: 'force'
      }
    });

    var xhr1 = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'patch': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('PATCH');
    expect(r1.url).toBe('/foo/1');

    // Trigger second creation
    var xhr2 = model.save({}, opt2);

    expect(xhr2).toBeDefined();
    expect(xhr2).not.toBe(xhr1);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).not.toBe(r1);
    expect(r2.method).toBe('PATCH')
    expect(r2.url).toBe('/foo/1');

    expect(model.$xhr).toEqual({
      'patch': [xhr1, xhr2]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'patch': [xhr2]
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    success.calls.reset();

    // Flush second request
    r2.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'patch': []
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
  });

  it('should prevent next patch and trigger error', function() {
    model.set('foo', 'bar');

    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = model.save({}, _.extend(opt1, {
      patch: true
    }));

    expect(model.$xhr).toEqual({
      'patch': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('PATCH');
    expect(r1.url).toBe('/foo/1');

    // Trigger second creation
    var xhr2 = model.save({}, _.extend(opt2, {
      patch: true
    }));
    expect(xhr2).toBe(null);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).toBe(r1);

    expect(model.$xhr).toEqual({
      'patch': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp404);

    expect(model.$xhr).toEqual({
      'patch': []
    });

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr1.abort).not.toHaveBeenCalled();
  });

  it('should prevent next creation', function() {
    model.unset('id');

    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'create': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('POST');
    expect(r1.url).toBe('/foo');

    // Trigger second creation
    var xhr2 = model.save({}, opt2);
    expect(xhr2).toBe(null);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).toBe(r1);

    expect(model.$xhr).toEqual({
      'create': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'create': []
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
  });

  it('should force next creation', function() {
    model.unset('id');

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

    var xhr1 = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'create': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('POST');
    expect(r1.url).toBe('/foo');

    // Trigger second creation
    var xhr2 = model.save({}, opt2);
    expect(xhr2).toBeDefined();
    expect(xhr2).not.toBe(xhr1);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).not.toBe(r1);
    expect(r2.method).toBe('POST');
    expect(r2.url).toBe('/foo');

    expect(model.$xhr).toEqual({
      'create': [xhr1, xhr2]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'create': [xhr2]
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    success.calls.reset();

    // Flush second request
    r2.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'create': []
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();
  });

  it('should prevent next creation and trigger error of first request', function() {
    model.unset('id');

    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'create': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('POST');
    expect(r1.url).toBe('/foo');

    // Trigger second creation
    var xhr2 = model.save({}, opt2);
    expect(xhr2).toBe(null);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).toBe(r1);

    expect(model.$xhr).toEqual({
      'create': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp404);

    expect(model.$xhr).toEqual({
      'create': []
    });

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr1.abort).not.toHaveBeenCalled();
  });

  it('should prevent next update', function() {
    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'update': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('PUT');
    expect(r1.url).toBe('/foo/1');

    // Trigger second update
    var xhr2 = model.save({}, opt2);
    expect(xhr2).toBe(null);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).toBe(r1);

    expect(model.$xhr).toEqual({
      'update': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp204);

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    expect(model.$xhr).toEqual({
      'update': []
    });
  });

  it('should force next update', function() {
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

    var xhr1 = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'update': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('PUT');
    expect(r1.url).toBe('/foo/1');

    // Trigger second update
    var xhr2 = model.save({}, opt2);
    expect(xhr2).toBeDefined();

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).not.toBe(r1);
    expect(r2.method).toBe('PUT');
    expect(r2.url).toBe('/foo/1');

    expect(model.$xhr).toEqual({
      'update': [xhr1, xhr2]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    // Flush second request
    r2.respondWith(rsp204);

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    expect(model.$xhr).toEqual({
      'update': [xhr1]
    });

    success.calls.reset();

    // Flush first request
    r1.respondWith(rsp204);

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    expect(model.$xhr).toEqual({
      'update': []
    });
  });

  it('should prevent next update and trigger error of first request', function() {
    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = model.save({}, opt1);

    expect(model.$xhr).toEqual({
      'update': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('PUT');
    expect(r1.url).toBe('/foo/1');

    // Trigger second update
    var xhr2 = model.save({}, opt2);
    expect(xhr2).toBe(null);

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).toBe(r1);

    expect(model.$xhr).toEqual({
      'update': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp404);

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr1.abort).not.toHaveBeenCalled();

    expect(model.$xhr).toEqual({
      'update': []
    });
  });

  it('should prevent next delete', function() {
    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = model.destroy(opt1);

    expect(model.$xhr).toEqual({
      'delete': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('DELETE');
    expect(r1.url).toBe('/foo/1');

    // Trigger second delete
    var xhr2 = model.destroy(opt2);
    expect(xhr2).toBe(null);

    expect(model.$xhr).toEqual({
      'delete': [xhr1]
    });

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).toBe(r1);

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'delete': []
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
  });

  it('should force next delete', function() {
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

    var xhr1 = model.destroy(opt1);

    expect(model.$xhr).toEqual({
      'delete': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('DELETE');
    expect(r1.url).toBe('/foo/1');

    // Trigger second delete
    var xhr2 = model.destroy(opt2);
    expect(xhr2).toBeDefined();

    expect(model.$xhr).toEqual({
      'delete': [xhr1, xhr2]
    });

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).not.toBe(r1);
    expect(r2.method).toBe('DELETE');
    expect(r2.url).toBe('/foo/1');

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'delete': [xhr2]
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();

    success.calls.reset();

    // Flush request
    r2.respondWith(rsp204);

    expect(model.$xhr).toEqual({
      'delete': []
    });

    expect(success).toHaveBeenCalledWith(model, undefined, jasmine.any(Object));
    expect(error).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();
    expect(xhr2.abort).not.toHaveBeenCalled();
  });

  it('should prevent next delete and trigger error of next request', function() {
    var opt1 = _.clone(options);
    var opt2 = _.clone(options);

    var xhr1 = model.destroy(opt1);

    expect(model.$xhr).toEqual({
      'delete': [xhr1]
    });

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    var r1 = jasmine.Ajax.requests.mostRecent();
    expect(r1.method).toBe('DELETE');
    expect(r1.url).toBe('/foo/1');

    // Trigger second delete
    var xhr2 = model.destroy(opt2);
    expect(xhr2).toBe(null);

    expect(model.$xhr).toEqual({
      'delete': [xhr1]
    });

    var r2 = jasmine.Ajax.requests.mostRecent();
    expect(r2).toBe(r1);

    expect(error).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(xhr1.abort).not.toHaveBeenCalled();

    // Flush request
    r1.respondWith(rsp404);

    expect(model.$xhr).toEqual({
      'delete': []
    });

    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
    expect(xhr1.abort).not.toHaveBeenCalled();
  });
});
