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

describe('Backbone-Ssync', function() {

  var success;
  var error;
  var options;

  beforeEach(function() {
    success = jasmine.createSpy('success');
    error = jasmine.createSpy('error');
    options = {
      success: success,
      error: error
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

  it('should define mode constants', function() {
    expect(Backbone.ssync.modes).toEqual({
      'PREVENT': 'prevent',
      'ABORT': 'abort',
      'FORCE': 'force'
    });
  });

  it('should define mode for request methods', function() {
    expect(Backbone.ssync.opModes).toEqual({
      'read': 'abort',
      'create': 'prevent',
      'update': 'prevent',
      'patch': 'prevent',
      'delete': 'prevent'
    });
  });

  describe('with models', function() {
    var Model;
    var model;

    beforeEach(function() {
      Model = Backbone.Model.extend({
        urlRoot: '/foo'
      });

      model = new Model({
        id: 1
      });
    });

    it('should fetch model', function() {
      var opt1 = _.clone(options);
      var xhr = model.fetch(opt1);

      expect(error).not.toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();

      var request = jasmine.Ajax.requests.mostRecent();

      expect(request.method).toBe('GET');
      expect(request.url).toBe('/foo/1');

      request.respondWith({
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify({
          id: 1,
          name: 'foo'
        })
      });

      expect(success).toHaveBeenCalledWith(model, jasmine.any(Object), jasmine.any(Object));
      expect(error).not.toHaveBeenCalled();
      expect(xhr.abort).not.toHaveBeenCalled();
    });

    it('should abort previous fetch', function() {
      var opt1 = _.clone(options);
      var opt2 = _.clone(options);

      var xhr1 = model.fetch(opt1);

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

      expect(error).not.toHaveBeenCalled();
      expect(success).not.toHaveBeenCalled();
      expect(xhr1.abort).toHaveBeenCalled();
      expect(xhr2.abort).not.toHaveBeenCalled();
    });
  });
});