(function($, undefined) {

/**
 * Unobtrusive scripting adapter for jQuery
 *
 * Requires jQuery 1.6.0 or later.
 * https://github.com/rails/jquery-ujs

 * Uploading file using rails.js
 * =============================
 *
 * By default, browsers do not allow files to be uploaded via AJAX. As a result, if there are any non-blank file fields
 * in the remote form, this adapter aborts the AJAX submission and allows the form to submit through standard means.
 *
 * The `ajax:aborted:file` event allows you to bind your own handler to process the form submission however you wish.
 *
 * Ex:
 *     $('form').live('ajax:aborted:file', function(event, elements){
 *       // Implement own remote file-transfer handler here for non-blank file inputs passed in `elements`.
 *       // Returning false in this handler tells rails.js to disallow standard form submission
 *       return false;
 *     });
 *
 * The `ajax:aborted:file` event is fired when a file-type input is detected with a non-blank value.
 *
 * Third-party tools can use this hook to detect when an AJAX file upload is attempted, and then use
 * techniques like the iframe method to upload the file instead.
 *
 * Required fields in rails.js
 * ===========================
 *
 * If any blank required inputs (required="required") are detected in the remote form, the whole form submission
 * is canceled. Note that this is unlike file inputs, which still allow standard (non-AJAX) form submission.
 *
 * The `ajax:aborted:required` event allows you to bind your own handler to inform the user of blank required inputs.
 *
 * !! Note that Opera does not fire the form's submit event if there are blank required inputs, so this event may never
 *    get fired in Opera. This event is what causes other browsers to exhibit the same submit-aborting behavior.
 *
 * Ex:
 *     $('form').live('ajax:aborted:required', function(event, elements){
 *       // Returning false in this handler tells rails.js to submit the form anyway.
 *       // The blank required inputs are passed to this function in `elements`.
 *       return ! confirm("Would you like to submit the form with missing info?");
 *     });
 */

  // Cut down on the number if issues from people inadvertently including jquery_ujs twice
  // by detecting and raising an error when it happens.
  var alreadyInitialized = function() {
    var events = $._data(document, 'events');
    return events && events.click && $.grep(events.click, function(e) { return e.namespace === 'rails'; }).length;
  }

  if ( alreadyInitialized() ) {
    $.error('jquery-ujs has already been loaded!');
  }

  // Shorthand to make it a little easier to call public rails functions from within rails.js
  var rails;

  $.rails = rails = {
    // Link elements bound by jquery-ujs
    linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote], a[data-disable-with]',

    // Select elements bound by jquery-ujs
    inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',

    // Form elements bound by jquery-ujs
    formSubmitSelector: 'form',

    // Form input elements bound by jquery-ujs
    formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type])',

    // Form input elements disabled during form submission
    disableSelector: 'input[data-disable-with], button[data-disable-with], textarea[data-disable-with]',

    // Form input elements re-enabled after form submission
    enableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled',

    // Form required input elements
    requiredInputSelector: 'input[name][required]:not([disabled]),textarea[name][required]:not([disabled])',

    // Form file input elements
    fileInputSelector: 'input:file',

    // Link onClick disable selector with possible reenable after remote submission
    linkDisableSelector: 'a[data-disable-with]',

    // Make sure that every Ajax request sends the CSRF token
    CSRFProtection: function(xhr) {
      var token = $('meta[name="csrf-token"]').attr('content');
      if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    },

    // Triggers an event on an element and returns false if the event result is false
    fire: function(obj, name, data) {
      var event = $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    },

    // Default confirm dialog, may be overridden with custom confirm dialog in $.rails.confirm
    confirm: function(message) {
      return confirm(message);
    },

    // Default ajax function, may be overridden with custom function in $.rails.ajax
    ajax: function(options) {
      return $.ajax(options);
    },

    // Default way to get an element's href. May be overridden at $.rails.href.
    href: function(element) {
      return element.attr('href');
    },

    // Submits "remote" forms and links with ajax
    handleRemote: function(element) {
      var method, url, data, elCrossDomain, crossDomain, withCredentials, dataType, options;

      if (rails.fire(element, 'ajax:before')) {
        elCrossDomain = element.data('cross-domain');
        crossDomain = elCrossDomain === undefined ? null : elCrossDomain;
        withCredentials = element.data('with-credentials') || null;
        dataType = element.data('type') || ($.ajaxSettings && $.ajaxSettings.dataType);

        if (element.is('form')) {
          method = element.attr('method');
          url = element.attr('action');
          data = element.serializeArray();
          // memoized value from clicked submit button
          var button = element.data('ujs:submit-button');
          if (button) {
            data.push(button);
            element.data('ujs:submit-button', null);
          }
        } else if (element.is(rails.inputChangeSelector)) {
          method = element.data('method');
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + "&" + element.data('params');
        } else {
          method = element.data('method');
          url = rails.href(element);
          data = element.data('params') || null;
        }

        options = {
          type: method || 'GET', data: data, dataType: dataType,
          // stopping the "ajax:beforeSend" event will cancel the ajax request
          beforeSend: function(xhr, settings) {
            if (settings.dataType === undefined) {
              xhr.setRequestHeader('accept', '*/*;q=0.5, ' + settings.accepts.script);
            }
            return rails.fire(element, 'ajax:beforeSend', [xhr, settings]);
          },
          success: function(data, status, xhr) {
            element.trigger('ajax:success', [data, status, xhr]);
          },
          complete: function(xhr, status) {
            element.trigger('ajax:complete', [xhr, status]);
          },
          error: function(xhr, status, error) {
            element.trigger('ajax:error', [xhr, status, error]);
          },
          xhrFields: {
            withCredentials: withCredentials
          },
          crossDomain: crossDomain
        };
        // Only pass url to `ajax` options if not blank
        if (url) { options.url = url; }

        var jqxhr = rails.ajax(options);
        element.trigger('ajax:send', jqxhr);
        return jqxhr;
      } else {
        return false;
      }
    },

    // Handles "data-method" on links such as:
    // <a href="/users/5" data-method="delete" rel="nofollow" data-confirm="Are you sure?">Delete</a>
    handleMethod: function(link) {
      var href = rails.href(link),
        method = link.data('method'),
        target = link.attr('target'),
        csrf_token = $('meta[name=csrf-token]').attr('content'),
        csrf_param = $('meta[name=csrf-param]').attr('content'),
        form = $('<form method="post" action="' + href + '"></form>'),
        metadata_input = '<input name="_method" value="' + method + '" type="hidden" />';

      if (csrf_param !== undefined && csrf_token !== undefined) {
        metadata_input += '<input name="' + csrf_param + '" value="' + csrf_token + '" type="hidden" />';
      }

      if (target) { form.attr('target', target); }

      form.hide().append(metadata_input).appendTo('body');
      form.submit();
    },

    /* Disables form elements:
      - Caches element value in 'ujs:enable-with' data store
      - Replaces element text with value of 'data-disable-with' attribute
      - Sets disabled property to true
    */
    disableFormElements: function(form) {
      form.find(rails.disableSelector).each(function() {
        var element = $(this), method = element.is('button') ? 'html' : 'val';
        element.data('ujs:enable-with', element[method]());
        element[method](element.data('disable-with'));
        element.prop('disabled', true);
      });
    },

    /* Re-enables disabled form elements:
      - Replaces element text with cached value from 'ujs:enable-with' data store (created in `disableFormElements`)
      - Sets disabled property to false
    */
    enableFormElements: function(form) {
      form.find(rails.enableSelector).each(function() {
        var element = $(this), method = element.is('button') ? 'html' : 'val';
        if (element.data('ujs:enable-with')) element[method](element.data('ujs:enable-with'));
        element.prop('disabled', false);
      });
    },

   /* For 'data-confirm' attribute:
      - Fires `confirm` event
      - Shows the confirmation dialog
      - Fires the `confirm:complete` event

      Returns `true` if no function stops the chain and user chose yes; `false` otherwise.
      Attaching a handler to the element's `confirm` event that returns a `falsy` value cancels the confirmation dialog.
      Attaching a handler to the element's `confirm:complete` event that returns a `falsy` value makes this function
      return false. The `confirm:complete` event is fired whether or not the user answered true or false to the dialog.
   */
    allowAction: function(element) {
      var message = element.data('confirm'),
          answer = false, callback;
      if (!message) { return true; }

      if (rails.fire(element, 'confirm')) {
        answer = rails.confirm(message);
        callback = rails.fire(element, 'confirm:complete', [answer]);
      }
      return answer && callback;
    },

    // Helper function which checks for blank inputs in a form that match the specified CSS selector
    blankInputs: function(form, specifiedSelector, nonBlank) {
      var inputs = $(), input, valueToCheck,
          selector = specifiedSelector || 'input,textarea',
          allInputs = form.find(selector);

      allInputs.each(function() {
        input = $(this);
        valueToCheck = input.is(':checkbox,:radio') ? input.is(':checked') : input.val();
        // If nonBlank and valueToCheck are both truthy, or nonBlank and valueToCheck are both falsey
        if (!valueToCheck === !nonBlank) {

          // Don't count unchecked required radio if other radio with same name is checked
          if (input.is(':radio') && allInputs.filter('input:radio:checked[name="' + input.attr('name') + '"]').length) {
            return true; // Skip to next input
          }

          inputs = inputs.add(input);
        }
      });
      return inputs.length ? inputs : false;
    },

    // Helper function which checks for non-blank inputs in a form that match the specified CSS selector
    nonBlankInputs: function(form, specifiedSelector) {
      return rails.blankInputs(form, specifiedSelector, true); // true specifies nonBlank
    },

    // Helper function, needed to provide consistent behavior in IE
    stopEverything: function(e) {
      $(e.target).trigger('ujs:everythingStopped');
      e.stopImmediatePropagation();
      return false;
    },

    // find all the submit events directly bound to the form and
    // manually invoke them. If anyone returns false then stop the loop
    callFormSubmitBindings: function(form, event) {
      var events = form.data('events'), continuePropagation = true;
      if (events !== undefined && events['submit'] !== undefined) {
        $.each(events['submit'], function(i, obj){
          if (typeof obj.handler === 'function') return continuePropagation = obj.handler(event);
        });
      }
      return continuePropagation;
    },

    //  replace element's html with the 'data-disable-with' after storing original html
    //  and prevent clicking on it
    disableElement: function(element) {
      element.data('ujs:enable-with', element.html()); // store enabled state
      element.html(element.data('disable-with')); // set to disabled state
      element.bind('click.railsDisable', function(e) { // prevent further clicking
        return rails.stopEverything(e);
      });
    },

    // restore element to its original state which was disabled by 'disableElement' above
    enableElement: function(element) {
      if (element.data('ujs:enable-with') !== undefined) {
        element.html(element.data('ujs:enable-with')); // set to old enabled state
        // this should be element.removeData('ujs:enable-with')
        // but, there is currently a bug in jquery which makes hyphenated data attributes not get removed
        element.data('ujs:enable-with', false); // clean up cache
      }
      element.unbind('click.railsDisable'); // enable element
    }

  };

  if (rails.fire($(document), 'rails:attachBindings')) {

    $.ajaxPrefilter(function(options, originalOptions, xhr){ if ( !options.crossDomain ) { rails.CSRFProtection(xhr); }});

    $(document).delegate(rails.linkDisableSelector, 'ajax:complete', function() {
        rails.enableElement($(this));
    });

    $(document).delegate(rails.linkClickSelector, 'click.rails', function(e) {
      var link = $(this), method = link.data('method'), data = link.data('params');
      if (!rails.allowAction(link)) return rails.stopEverything(e);

      if (link.is(rails.linkDisableSelector)) rails.disableElement(link);

      if (link.data('remote') !== undefined) {
        if ( (e.metaKey || e.ctrlKey) && (!method || method === 'GET') && !data ) { return true; }

        var handleRemote = rails.handleRemote(link);
        // response from rails.handleRemote() will either be false or a deferred object promise.
        if (handleRemote === false) {
          rails.enableElement(link);
        } else {
          handleRemote.error( function() { rails.enableElement(link); } );
        }
        return false;

      } else if (link.data('method')) {
        rails.handleMethod(link);
        return false;
      }
    });

    $(document).delegate(rails.inputChangeSelector, 'change.rails', function(e) {
      var link = $(this);
      if (!rails.allowAction(link)) return rails.stopEverything(e);

      rails.handleRemote(link);
      return false;
    });

    $(document).delegate(rails.formSubmitSelector, 'submit.rails', function(e) {
      var form = $(this),
        remote = form.data('remote') !== undefined,
        blankRequiredInputs = rails.blankInputs(form, rails.requiredInputSelector),
        nonBlankFileInputs = rails.nonBlankInputs(form, rails.fileInputSelector);

      if (!rails.allowAction(form)) return rails.stopEverything(e);

      // skip other logic when required values are missing or file upload is present
      if (blankRequiredInputs && form.attr("novalidate") == undefined && rails.fire(form, 'ajax:aborted:required', [blankRequiredInputs])) {
        return rails.stopEverything(e);
      }

      if (remote) {
        if (nonBlankFileInputs) {
          // slight timeout so that the submit button gets properly serialized
          // (make it easy for event handler to serialize form without disabled values)
          setTimeout(function(){ rails.disableFormElements(form); }, 13);
          var aborted = rails.fire(form, 'ajax:aborted:file', [nonBlankFileInputs]);

          // re-enable form elements if event bindings return false (canceling normal form submission)
          if (!aborted) { setTimeout(function(){ rails.enableFormElements(form); }, 13); }

          return aborted;
        }

        // If browser does not support submit bubbling, then this live-binding will be called before direct
        // bindings. Therefore, we should directly call any direct bindings before remotely submitting form.
        if (!$.support.submitBubbles && $().jquery < '1.7' && rails.callFormSubmitBindings(form, e) === false) return rails.stopEverything(e);

        rails.handleRemote(form);
        return false;

      } else {
        // slight timeout so that the submit button gets properly serialized
        setTimeout(function(){ rails.disableFormElements(form); }, 13);
      }
    });

    $(document).delegate(rails.formInputClickSelector, 'click.rails', function(event) {
      var button = $(this);

      if (!rails.allowAction(button)) return rails.stopEverything(event);

      // register the pressed submit button
      var name = button.attr('name'),
        data = name ? {name:name, value:button.val()} : null;

      button.closest('form').data('ujs:submit-button', data);
    });

    $(document).delegate(rails.formSubmitSelector, 'ajax:beforeSend.rails', function(event) {
      if (this == event.target) rails.disableFormElements($(this));
    });

    $(document).delegate(rails.formSubmitSelector, 'ajax:complete.rails', function(event) {
      if (this == event.target) rails.enableFormElements($(this));
    });

    $(function(){
      // making sure that all forms have actual up-to-date token(cached forms contain old one)
      csrf_token = $('meta[name=csrf-token]').attr('content');
      csrf_param = $('meta[name=csrf-param]').attr('content');
      $('form input[name="' + csrf_param + '"]').val(csrf_token);
    });
  }

})( jQuery );
//     Underscore.js 1.4.3
//     http://underscorejs.org
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // with specific `key:value` pairs.
  _.where = function(obj, attrs) {
    if (_.isEmpty(attrs)) return [];
    return _.filter(obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function(func, context) {
    var args, bound;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + (0 | Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = '' + ++idCounter;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);
//     Backbone.js 0.9.10

//     (c) 2010-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(){

  // Initial Setup
  // -------------

  // Save a reference to the global object (`window` in the browser, `exports`
  // on the server).
  var root = this;

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create a local reference to array methods.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // The top-level namespace. All public Backbone classes and modules will
  // be attached to this. Exported for both CommonJS and the browser.
  var Backbone;
  if (typeof exports !== 'undefined') {
    Backbone = exports;
  } else {
    Backbone = root.Backbone = {};
  }

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '0.9.10';

  // Require Underscore, if we're on the server, and it's not already present.
  var _ = root._;
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore');

  // For Backbone's purposes, jQuery, Zepto, or Ender owns the `$` variable.
  Backbone.$ = root.jQuery || root.Zepto || root.ender;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
    } else if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
    } else {
      return true;
    }
  };

  // Optimized internal dispatch function for triggering events. Tries to
  // keep the usual cases speedy (most Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length;
    switch (args.length) {
    case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx);
    return;
    case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0]);
    return;
    case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0], args[1]);
    return;
    case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0], args[1], args[2]);
    return;
    default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
    }
  };

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind one or more space separated events, or an events map,
    // to a `callback` function. Passing `"all"` will bind the callback to
    // all events fired.
    on: function(name, callback, context) {
      if (!(eventsApi(this, 'on', name, [callback, context]) && callback)) return this;
      this._events || (this._events = {});
      var list = this._events[name] || (this._events[name] = []);
      list.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind events to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!(eventsApi(this, 'once', name, [callback, context]) && callback)) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      this.on(name, once, context);
      return this;
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var list, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = {};
        return this;
      }

      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (list = this._events[name]) {
          events = [];
          if (callback || context) {
            for (j = 0, k = list.length; j < k; j++) {
              ev = list[j];
              if ((callback && callback !== ev.callback &&
                               callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                events.push(ev);
              }
            }
          }
          this._events[name] = events;
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // An inversion-of-control version of `on`. Tell *this* object to listen to
    // an event in another object ... keeping track of what it's listening to.
    listenTo: function(obj, name, callback) {
      var listeners = this._listeners || (this._listeners = {});
      var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
      listeners[id] = obj;
      obj.on(name, typeof name === 'object' ? this : callback, this);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeners = this._listeners;
      if (!listeners) return;
      if (obj) {
        obj.off(name, typeof name === 'object' ? this : callback, this);
        if (!name && !callback) delete listeners[obj._listenerId];
      } else {
        if (typeof name === 'object') callback = this;
        for (var id in listeners) {
          listeners[id].off(name, callback, this);
        }
        this._listeners = {};
      }
      return this;
    }
  };

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Create a new model, with defined attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var defaults;
    var attrs = attributes || {};
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options && options.collection) this.collection = options.collection;
    if (options && options.parse) attrs = this.parse(attrs, options) || {};
    if (defaults = _.result(this, 'defaults')) {
      attrs = _.defaults({}, attrs, defaults);
    }
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // ----------------------------------------------------------------------

    // Set a hash of model attributes on the object, firing `"change"` unless
    // you choose to silence it.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = true;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"` unless you choose
    // to silence it. `unset` is a noop if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"` unless you choose
    // to silence it.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // ---------------------------------------------------------------------

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overriden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      options.success = function(model, resp, options) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
      };
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, success, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      // If we're not waiting and attributes exist, save acts as `set(attr).save(null, opts)`.
      if (attrs && (!options || !options.wait) && !this.set(attrs, options)) return false;

      options = _.extend({validate: true}, options);

      // Do not persist invalid models.
      if (!this._validate(attrs, options)) return false;

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      success = options.success;
      options.success = function(model, resp, options) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
      };

      // Finish configuring and sending the Ajax request.
      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(model, resp, options) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
      };

      if (this.isNew()) {
        options.success(this, null, options);
        return false;
      }

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return this.id == null;
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return !this.validate || !this.validate(this.attributes, options);
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire a general
    // `"error"` event and call the error callback, if specified.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, options || {});
      return false;
    }

  });

  // Backbone.Collection
  // -------------------

  // Provides a standard collection class for our sets of models, ordered
  // or unordered. If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this.models = [];
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      models = _.isArray(models) ? models.slice() : [models];
      options || (options = {});
      var i, l, model, attrs, existing, doSort, add, at, sort, sortAttr;
      add = [];
      at = options.at;
      sort = this.comparator && (at == null) && options.sort != false;
      sortAttr = _.isString(this.comparator) ? this.comparator : null;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        if (!(model = this._prepareModel(attrs = models[i], options))) {
          this.trigger('invalid', this, attrs, options);
          continue;
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(model)) {
          if (options.merge) {
            existing.set(attrs === model ? model.attributes : attrs, options);
            if (sort && !doSort && existing.hasChanged(sortAttr)) doSort = true;
          }
          continue;
        }

        // This is a new model, push it to the `add` list.
        add.push(model);

        // Listen to added models' events, and index models for lookup by
        // `id` and by `cid`.
        model.on('all', this._onModelEvent, this);
        this._byId[model.cid] = model;
        if (model.id != null) this._byId[model.id] = model;
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (add.length) {
        if (sort) doSort = true;
        this.length += add.length;
        if (at != null) {
          splice.apply(this.models, [at, 0].concat(add));
        } else {
          push.apply(this.models, add);
        }
      }

      // Silently sort the collection if appropriate.
      if (doSort) this.sort({silent: true});

      if (options.silent) return this;

      // Trigger `add` events.
      for (i = 0, l = add.length; i < l; i++) {
        (model = add[i]).trigger('add', model, this, options);
      }

      // Trigger `sort` if the collection was sorted.
      if (doSort) this.trigger('sort', this, options);

      return this;
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      models = _.isArray(models) ? models.slice() : [models];
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model);
      }
      return this;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: this.length}, options));
      return model;
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      model = this._prepareModel(model, options);
      this.add(model, _.extend({at: 0}, options));
      return model;
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function(begin, end) {
      return this.models.slice(begin, end);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      this._idAttr || (this._idAttr = this.model.prototype.idAttribute);
      return this._byId[obj.id || obj.cid || obj[this._idAttr] || obj];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of `filter`.
    where: function(attrs) {
      if (_.isEmpty(attrs)) return [];
      return this.filter(function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) {
        throw new Error('Cannot sort a set without a comparator');
      }
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Smartly update a collection with a change set of models, adding,
    // removing, and merging as necessary.
    update: function(models, options) {
      options = _.extend({add: true, merge: true, remove: true}, options);
      if (options.parse) models = this.parse(models, options);
      var model, i, l, existing;
      var add = [], remove = [], modelMap = {};

      // Allow a single model (or no argument) to be passed.
      if (!_.isArray(models)) models = models ? [models] : [];

      // Proxy to `add` for this case, no need to iterate...
      if (options.add && !options.remove) return this.add(models, options);

      // Determine which models to add and merge, and which to remove.
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i];
        existing = this.get(model);
        if (options.remove && existing) modelMap[existing.cid] = true;
        if ((options.add && !existing) || (options.merge && existing)) {
          add.push(model);
        }
      }
      if (options.remove) {
        for (i = 0, l = this.models.length; i < l; i++) {
          model = this.models[i];
          if (!modelMap[model.cid]) remove.push(model);
        }
      }

      // Remove models (if applicable) before we add and merge the rest.
      if (remove.length) this.remove(remove, options);
      if (add.length) this.add(add, options);
      return this;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any `add` or `remove` events. Fires `reset` when finished.
    reset: function(models, options) {
      options || (options = {});
      if (options.parse) models = this.parse(models, options);
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i]);
      }
      options.previousModels = this.models.slice();
      this._reset();
      if (models) this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return this;
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `update: true` is passed, the response
    // data will be passed through the `update` method instead of `reset`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      options.success = function(collection, resp, options) {
        var method = options.update ? 'update' : 'reset';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
      };
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp, options) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Reset all internal state. Called when the collection is reset.
    _reset: function() {
      this.length = 0;
      this.models.length = 0;
      this._byId  = {};
    },

    // Prepare a model or hash of attributes to be added to this collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) {
        if (!attrs.collection) attrs.collection = this;
        return attrs;
      }
      options || (options = {});
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model._validate(attrs, options)) return false;
      return model;
    },

    // Internal method to remove a model's ties to a collection.
    _removeReference: function(model) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    },

    sortedIndex: function (model, value, context) {
      value || (value = this.comparator);
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _.sortedIndex(this.models, model, iterator, context);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf',
    'isEmpty', 'chain'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (!callback) callback = this[name];
      Backbone.history.route(route, _.bind(function(fragment) {
        var args = this._extractParameters(route, fragment);
        callback && callback.apply(this, args);
        this.trigger.apply(this, ['route:' + name].concat(args));
        this.trigger('route', name, args);
        Backbone.history.trigger('route', this, name, args);
      }, this));
      return this;
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional){
                     return optional ? match : '([^\/]+)';
                   })
                   .replace(splatParam, '(.*?)');
      return new RegExp('^' + route + '$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted parameters.
    _extractParameters: function(route, fragment) {
      return route.exec(fragment).slice(1);
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on URL fragments. If the
  // browser does not support `onhashchange`, falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = this.location.pathname;
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.substr(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({}, {root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        this.iframe = Backbone.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;
      var atRoot = loc.pathname.replace(/[^\/]$/, '$&/') === this.root;

      // If we've started off with a route from a `pushState`-enabled browser,
      // but we're currently in a browser that doesn't support it...
      if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !atRoot) {
        this.fragment = this.getFragment(null, true);
        this.location.replace(this.root + this.location.search + '#' + this.fragment);
        // Return immediately as browser will do redirect to new url
        return true;

      // Or if we've started out with a hash-based route, but we're currently
      // in a browser where it could be `pushState`-based instead...
      } else if (this._wantsPushState && this._hasPushState && atRoot && loc.hash) {
        this.fragment = this.getHash().replace(routeStripper, '');
        this.history.replaceState({}, document.title, this.root + this.fragment + loc.search);
      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl() || this.loadUrl(this.getHash());
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragmentOverride) {
      var fragment = this.fragment = this.getFragment(fragmentOverride);
      var matched = _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
      return matched;
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: options};
      fragment = this.getFragment(fragment || '');
      if (this.fragment === fragment) return;
      this.fragment = fragment;
      var url = this.root + fragment;

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Backbone.View
  // -------------

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be prefered to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save'
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) throw new Error('Method "' + events[key] + '" does not exist');
        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
    },

    // Performs the initial configuration of a View with a set of options.
    // Keys with special meaning *(model, collection, id, className)*, are
    // attached directly to the view.
    _configure: function(options) {
      if (this.options) options = _.extend({}, _.result(this, 'options'), options);
      _.extend(this, _.pick(options, viewOptions));
      this.options = options;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    var success = options.success;
    options.success = function(resp) {
      if (success) success(model, resp, options);
      model.trigger('sync', model, resp, options);
    };

    var error = options.error;
    options.error = function(xhr) {
      if (error) error(model, xhr, options);
      model.trigger('error', model, xhr, options);
    };

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

}).call(this);
(function($) {
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'delete': 'DELETE',
    'read'  : 'GET'
  };
  
  var getUrl = function(object) {
    if (!(object && object.url)) return null;
    return _.isFunction(object.url) ? object.url() : object.url;
  };
  
  var urlError = function() {
    throw new Error("A 'url' property or function must be specified");
  };

  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default JSON-request options.
    var params = _.extend({
      type:         type,
      dataType:     'json',
      beforeSend: function( xhr ) {
        if (!options.noCSRF) {
          var token = $('meta[name="csrf-token"]').attr('content');
          if (token) xhr.setRequestHeader('X-CSRF-Token', token);  
        }
        model.trigger('sync:start');
      }
    }, options);

    if (!params.url) {
      params.url = getUrl(model) || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (!params.data && model && (method == 'create' || method == 'update')) {
      params.contentType = 'application/json';

      var data = {}

      if(model.paramRoot) {
        data[model.paramRoot] = model.toJSON();
      } else {
        data = model.toJSON();
      }

      params.data = JSON.stringify(data)
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET') {
      params.processData = false;
    }

    // Trigger the sync end event
    var complete = options.complete;
    params.complete = function(jqXHR, textStatus) {
      model.trigger('sync:end');
      if (complete) complete(jqXHR, textStatus);
    };
    
    var success = options.success;
    params.success = function(resp) {
      if (success) success(model, resp, options);
      model.trigger('sync', model, resp, options);
    };

    var error = options.error;
    params.error = function(xhr) {
      if (error) error(model, xhr, options);
      model.trigger('error', model, xhr, options);
    };
    
    // Make the request.
    return $.ajax(params);
  }
  
})(jQuery);
(function($) {
  return $.extend($.fn, {
    backboneLink: function(model) {
      return $(this).find(":input").each(function() {
        var el, name;
        el = $(this);
        name = el.attr("name");
        model.bind("change:" + name, function() {
          return el.val(model.get(name));
        });
        return $(this).bind("change", function() {
          var attrs;
          el = $(this);
          attrs = {};
          attrs[el.attr("name")] = el.val();
          return model.set(attrs);
        });
      });
    }
  });
})(jQuery);
(function() {
  window.Tasking = {
    Models: {},
    Collections: {},
    Routers: {},
    Views: {}
  };

}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/categories/category"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<a id="',  id ,'" href="#/',  id ,'">',  title ,'</a>\n\n<!--\n<td><a href="#/',  id ,'/edit">Edit</td>\n<td><a href="#/',  id ,'/destroy" class="destroy">Destroy</a></td>-->\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/categories/edit"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#start" data-icon="back">Back</a>\n        <h1>Edit Category</h1>\n  \t</div>\n  \t<div data-role="content">\n\t\t\n\t\t<form id="new-category" name="category">\n\t\t  <div class="field">\n\t\t    <input type="hidden" name="id" id="id" value="',  id ,'" >\n\t\t  </div>\n\t\t\n\t\t\n\t\t  <div class="field">\n\t\t    <label for="title"> Title:</label>\n\t\t    <input type="text" name="title" id="title" value="',  title ,'" required>\n\t\t  </div>\n\t\t\n\t\t  <div class="actions">\n\t\t    <input type="submit" value="Create Category" />\n\t\t  </div>\n\t\t\n\t\t</form>\n\t\t\t\t\n\t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/categories/index"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h2>Listing categories</h2>\n\n<ul data-role="listview" data-inset="true" class="ui-listview">\n</ul>\n\n<br/>\n\n<a href="#/new">New Category</a>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/categories/new"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#start" data-icon="back">Back</a>\n        <h1>New Category</h1>\n  \t</div>\n  \t<div data-role="content">\n\t\t\n\t\t<form id="new-category" name="category">\n\t\t  <div class="field">\n\t\t    <input type="hidden" name="id" id="id" value="',  id ,'" >\n\t\t  </div>\n\t\t\n\t\t\n\t\t  <div class="field">\n\t\t    <label for="title"> Title:</label>\n\t\t    <input type="text" name="title" id="title" value="',  title ,'" required>\n\t\t  </div>\n\t\t\n\t\t  <div class="actions">\n\t\t    <input type="submit" value="Create Category" />\n\t\t  </div>\n\t\t\n\t\t</form>\n\t\t\t\t\n\t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/categories/show"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<p>\n  <b>Title:</b>\n  ',  title ,'\n</p>\n\n\n<a href="#/index" data-icon="back" data-role="button">Back</a>\n<a href="#/',  id ,'/edit" data-icon="gear" data-role="button">Edit</a>\n<a href="#/',  id ,'/delete" data-icon="delete" data-role="button">Delete</a>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/static/start"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\n\t<div data-role="header">\n\t\n\t\t');  if (typeof id != "undefined") { ; __p.push('\n\t\t\t<a href="#logout" data-role="button" data-icon="delete">Logout</a>\n\t\t');  } ; __p.push('\n\t    <h1>Start</h1>\n  \t</div>\n  \t<div data-role="content">\n\t\t');  if (typeof id == "undefined") { ; __p.push('\n\t\t\t<a href="#login" data-role="button" data-icon="grid" data-iconpos="top">Login</a>\n\t\t\n\t\t\n\t\t');  } else { ; __p.push('\n\t\t\t<fieldset class="ui-grid-a">\n\t\t\t\t<div class="ui-block-a">\n\t\t\t\t\t<a href="#tasks" data-role="button" data-icon="info" data-iconpos="top">Open Tasks</a>\n\t\t\t\t\t<a href="#tasklists/detail" data-role="button" data-icon="arrow-d" data-iconpos="top">Your Lists</a>\n\t\t\t\t\t<a href="#users/ranking" data-role="button" data-icon="star" data-iconpos="top">Ranking</a>\n\t\t\t\t</div>\n\t\t\t\t<div class="ui-block-b">\n\t\t\t\t\t<a href="#tasks/get" data-role="button" data-icon="search" data-iconpos="top">Get Tasks</a>\n\t\t\t\t\t<a href="#tasklists" data-role="button" data-icon="plus" data-iconpos="top">Edit Lists</a>\n\t\t\t\t\t<a href="#history" data-role="button" data-icon="grid" data-iconpos="top">History</a>\n\t\t\t\t</div>\n\t\t\t</fieldset>\n\t\t\n\t\t\t\n\t\t\t\n\t\t\t<p>Angemeldet als ',  name ,'</p>\n\t\t');  } ; __p.push('\n\t\t\n\t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/statuses/edit"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h1>Edit status</h1>\n\n<form id="edit-status" name="status">\n  <div class="field">\n    <label for="title"> title:</label>\n    <input type="text" name="title" id="title" value="',  title ,'" >\n  </div>\n\n  <div class="actions">\n    <input type="submit" value="Update Status" />\n  </div>\n\n</form>\n\n<a href="#/index" data-role="button">Back</a>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/statuses/index"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h2>Listing statuses</h2>\n\n<ul data-role="listview" data-inset="true" class="ui-listview">\n</ul>\n\n<br/>\n\n<a href="#/new">New Status</a>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/statuses/new"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h1>New status</h1>\n\n<form id="new-status" name="status">\n  <div class="field">\n    <label for="title"> title:</label>\n    <input type="text" name="title" id="title" value="',  title ,'" >\n  </div>\n\n  <div class="actions">\n    <input type="submit" value="Create Status" />\n  </div>\n\n</form>\n\n<a href="#/index">Back</a>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/statuses/show"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<p>\n  <b>Title:</b>\n  ',  title ,'\n</p>\n\n\n<a href="#/index" data-icon="back" data-role="button">Back</a>\n<a href="#/',  id ,'/edit" data-icon="gear" data-role="button">Edit</a>\n<a href="#/',  id ,'/delete" data-icon="delete" data-role="button">Delete</a>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/statuses/status"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<a id="',  id ,'" href="#/',  id ,'">',  title ,'</a>\n\n<!--\n<td><a href="#/',  id ,'/edit">Edit</td>\n<td><a href="#/',  id ,'/destroy" class="destroy">Destroy</a></td>-->\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasklists/detail"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#start" data-icon="back">Start</a>\n        <h1>Your Tasklists</h1>\n\t\t<a href="#tasklists/new" data-icon="back">New</a>\n  \t</div>\n  \t<div data-role="content">\n\t\t<div id="tasklist-cont" data-role="collapsible-set"></div>\n\t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasklists/edit"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#tasklists" data-icon="back">Back</a>\n        <h1>Edit Tasklist</h1>\n\t\t<a href="#tasklists/',  id ,'/destroy" data-icon="delete" data-role="button">Delete</a>\n  \t</div>\n  \t<div data-role="content">\n\t\t<form id="edit-tasklist" name="tasklist">\n\t\t\n\t\t  <div class="field">\n\t\t    <label for="name">Name:</label>\n\t\t    <input type="text" name="name" id="name" value="',  name ,'" required>\n\t\t  </div>\n\t\t  \n\t\t  <div class="field">\n\t\t    <label for="closed">Close Tasklist:</label>\n\t\t\t<select name="closed" id="select-closed" data-role="slider"  >\n\t\t\t\t');  if (closed == 1) { ; __p.push('\n\t\t\t \t\t<option value="0">Open</option>\n\t\t\t\t\t<option value="1" selected>Closed</option>\n\t\t\t\t');  } else { ; __p.push('\n\t\t\t\t\t<option value="0" selected >Open</option>\n\t\t\t\t\t<option value="1">Closed</option>\n\t\t\t\t');  } ; __p.push('\n\t\t\t</select> \n\t\t  </div>\n\t\t\n\t\t  <div class="actions">\n\t\t    <input type="submit" value="Update Tasklist" />\n\t\t  </div>\n\t\t\n\t\t</form>\n\n\t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasklists/index"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\n\t<div data-role="header">\n\t\t<a href="#start" data-icon="back">Start</a>\n        <h1>Tasklists</h1>\n\t\t<a href="#tasklists/new" data-icon="new">New</a>\n  \t</div>\n  \t<div data-role="content">\n\t\t<ul data-role="listview" data-inset="true" class="ui-listview">\n\t\t  \n\t\t</ul>\n\t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasklists/new"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#tasklists" data-icon="back">Back</a>\n        <h1>New Tasklist</h1>\n  \t</div>\n  \t<div data-role="content">\n\t\t\n\t\t<form id="new-tasklist" name="tasklist">\n\t\t  <div class="field">\n\t\t    <input type="hidden" name="id" id="id" value="',  id ,'" >\n\t\t  </div>\n\t\t\n\t\t\n\t\t  <div class="field">\n\t\t    <label for="title"> Name:</label>\n\t\t    <input type="text" name="name" id="name" value="',  name ,'" required>\n\t\t  </div>\n\t\t\n\t\t  <div class="actions">\n\t\t    <input type="submit" value="Create Tasklist" />\n\t\t  </div>\n\t\t\n\t\t</form>\n\t\t\t\t\n\t</div>\n\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasklists/tasklist"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<a id="',  id ,'" href="#tasklists/',  id ,'/edit">',  name ,'</a>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasklists/tasklist_detail"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h3>',  name,'</h3>\n');  if (done_percentage >= 0) { ; __p.push('\n<div class="tasklist_done ui-grid-a ui-body-e">\n\t<p class="ui-block-a ui-btn-inner ui-corner-top ui-corner-bottom">',  done_text,'</p>\t\n\t<p class="tasklist_done_bar ui-block-b ui-body-a ui-btn-inner ui-corner-top ui-corner-bottom" style="width:',  done_percentage/2,'%">',  (done_percentage/2),' %</p>\n</div>\n<br/>\n');  } ; __p.push('\n<ul data-role="listview"></ul>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasklists/tasklist_detail_task"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<a href="#tasks/',  id,'" class="ui-grid-b">\n\t<div class="ui-block-a tasklistTaskA">',  title ,'</div>\n\t<div class="ui-block-b tasklistTaskB">',  pointvalue ,' pts.</div>\n\t<div class="ui-block-c tasklistTaskC">',  due_date_f ,'</div>\n</a>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/categories"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('',  title ,'\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/edit"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#tasks" data-icon="back">Back</a>\n        <h1>Edit Task</h1>\n  \t</div>\n  \t<div data-role="content">\n\t\t\n\t\t<form id="edit-task" name="task">\n\t\t  \n\t\t  \n\t\t  <div class="field">\n\t\t    <label for="title"> Title:</label>\n\t\t    <input type="text" name="title" id="title" value="',  title ,'" required>\n\t\t  </div>\n\t\t\n\t\t  <div class="field">\n\t\t    <label for="description"> Description:</label>\n\t\t    <input type="text" name="description" id="description" value="',  description ,'" >\n\t\t  </div>\n\t\t  \n\t\t  <div class="field">\n\t\t  \t<label for="category_id">Category:</label>\n\t\t  \t<select name="category_id" id="select-category" value="',  category_id ,'" required >\n\t\t  \t\t<option value="',  category_id ,'"> ',  category.title ,' </option>\n\t\t\t</select>\n\t\t  </div>\n\t\t  \n\t\t  \n\t\t  <div class="field">\n\t\t  \t<label for="status_id">Status:</label>\n\t\t  \t<select name="status_id" id="select-status" value="',  status_id ,'">\n\t\t  \t\t<option value="',  status_id ,'"> ',  status.title ,' </option>\n\t\t\t</select>\n\t\t  </div>\n\t\t  \n\t\t  \n\t\t  <div class="field">\n\t\t  \t<label for "assigned_to"> Task currently assigned to:</label>\n\t\t    <select name="assigned_to" id="select-friend" >\n\t\t\t</select>\n\t\t  </div>\n\t\t\n\t\t  <div data-role="field">\n\t\t\t<label for="select-pointvalue">Reward points:</label>\n\t\t\t<input type="range" name="pointvalue" id="select-pointvalue" value="',  pointvalue ,'" min="1" max="10" data-highlight="true" required/>\n\t\t  </div>\n\t\t\n    \t  \n    \t  <div data-role="field">\n\t\t\t<label for="select-etc">Estimated time consumption:</label>\n\t\t\t<input type="range" name="etc" id="select-etc" value="',  etc ,'" min="1" max="100" data-highlight="true" />\n\t\t  </div>\n\t\t\n\t\t\n\t\t  <div class="field">\n\t\t    <label for="due_date">Due date of Task:</label>\n\t\t    <input type="text" name="due_date" id="due_date" value="',  due_date ,'" >\n\t\t  </div>\n\t\t  \n\t\t  <div data-role="field">\n\t\t  \t<label for="select-due_date">Due Date: </label>\n\t\t  \t<input type="datetime-local" name="due_date" id="select-due_date" value="',  due_date ,'" required/>\n\t\t  </div>\n\t\t  \n\n\t\t  <div class="actions">\n\t\t    <input type="submit" value="Update Task" />\n\t\t  </div>\n  \n\n</form>\n</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/friends"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('',  name ,' \n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/get_show"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#tasks/get" data-icon="back">Back</a>\n        <h1>Get Task</h1>\n  \t</div>\n  \t<div data-role="content">\n\t\t\n\t\t<p>\n\t\t  <b>Title:</b>\n\t\t  '); console.log(obj); __p.push('\n\t\t  ',  title ,'\n\t\t</p>\n\t\t<p>\n\t\t\tOwned by ',  owner.name ,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>Status:</b>\n\t\t  ');  if(status == null) { ; __p.push('\n\t\t  no status \n\t\t  ');  } else { ; __p.push('\n\t\t  ',  status.title ,'\n\t\t  ');  } ; __p.push('\n\t\t</p>\n\t\t<p>\n\t\t  <b>Assigned to:</b>\n\t\t  ');  if(user == null) { ; __p.push('\n\t\t  not assigned\n\t\t  ');  } else { ; __p.push('\n\t\t  ',  user.name ,'\n\t\t  ');  } ; __p.push('\n\t\t</p>\n\t\t<p>\n\t\t  <b>Category:</b>\n\t\t  ',  category.title ,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>Desciption:</b>\n\t\t  ',  description ,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>Point value:</b>\n\t\t  ',  pointvalue ,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>Due:</b>\n\t\t  ',  due_date_f ,'\n\t\t</p>\t\t\n\t\t<p>\n\t\t  <b>Estimated Time Consumption:</b>\n\t\t  ',  etc ,'\n\t\t</p>\n\t</div>\n\t\t<div data-role="footer" align="center">\n\t\t<button data-icon="yes" data-role="button" id="assign-task">Assign task to me</button>\n  \t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/get_task"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<a id="',  id ,'" href="#tasks/get/',  id ,'">',  title ,'</a>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/index"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#start" data-icon="back">Start</a>\n        <h1>Tasks</h1>\n\t\t<a href="#tasks/new" data-icon="new">New</a>\n  \t</div>\n  \t<div data-role="content">\n\t\t<ul data-role="listview" data-inset="true" class="ui-listview">\t  \n\t\t</ul>\n\t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/new"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#tasks" data-icon="back">Back</a>\n        <h1>New Task</h1>\n  \t</div>\n  \t<div data-role="content">\n\t\t\n\t\t<form id="new-task" name="task">\n\t\t  <div class="field">\n\t\t    <input type="hidden" name="id" id="id" value="',  id ,'" >\n\t\t  </div>\n\t\t  \n\t\t  <div class="field">\n\t\t    <input type="hidden" name="pointvalue" id="pointvalue" value="',  pointvalue ,'" >\n\t\t  </div>\n\t\t\n\t\t  <div class="field">\n\t\t    <input type="text" name="title" id="title" value="',  title ,'" placeholder="Title" required>\n\t\t  </div>\n\t\t  \n\t\t  <div class="field">\n\t\t    <input type="text" name="description" id="description" value="',  description ,'" placeholder="Description">\n\t\t  </div>\n\t\t  \n\t\t\t<select name="category_id" id="select-category" required>\n   \t\t\t\t<option value="" style="display:none">Please select categroy</option>\n\t\t\t</select>\n\t  \n\t\t\t<select name="tasklist_id" id="select-tasklist" required>\n\t\t\t\t<option value="" style="display:none">Please select tasklist</option>\n\t\t\t</select>\n\t\t\t\n\t\t\t<select name="assigned_to" id="select-friend">\n\t\t\t\t<option value="" style="display:none">Assign task to</option>\n\t\t\t</select>\n\t\t\t\n\t\t\t<div data-role="fieldcontain">\n\t\t  \t<label for="select-due_date">Due Date: </label>\n\t\t  \t<input type="datetime-local" name"due_date" id="select-due_date" value="',  due_date ,'" required/>\n\t\t  </div>\n\t\t\t\n\t\t\t\n\t\t  <div data-role="fieldcontain">\n\t\t\t<label for="select-pointvalue">Reward points:</label>\n\t\t\t<input type="range" name="pointvalue" id="select-pointvalue" value="',  pointvalue ,'" min="1" max="10" data-highlight="true" required/>\n\t\t  </div>\n\t\t  \n\t\t  \n\t\t  <div data-role="fieldcontain">\n\t\t\t<label for="select-etc">Estimated time consumption:</label>\n\t\t\t<input type="range" name="etc" id="select-etc" value="',  etc ,'" min="1" max="100" data-highlight="true" />\n\t\t  </div>\n\t\n\t\t  <div class="actions">\n\t\t    <input type="submit" value="Create Task" />\n\t\t  </div>\n\t\t\n\t\t</form>\n\t\t\t\t\n\t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/show"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#tasks" data-icon="back">Back</a>\n        <h1>Tasks Detail</h1>\n        <a href="#tasks/',  id ,'/edit" data-icon="edit" data-role="button">Edit</a>\n  \t</div>\n  \t<div data-role="content">\n\t\t\n\t\t<p>\n\t\t  <b>Title:</b>\n\t\t  '); console.log(obj); __p.push('\n\t\t  ',  title ,'\n\t\t</p>\n\t\t<p>\n\t\t\tOwned by ',  owner.name ,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>Status:</b>\n\t\t  ');  if(status == null) { ; __p.push('\n\t\t  no status \n\t\t  ');  } else { ; __p.push('\n\t\t  ',  status.title ,'\n\t\t  ');  } ; __p.push('\n\t\t</p>\n\t\t<p>\n\t\t  <b>Assigned to:</b>\n\t\t  ');  if(user == null) { ; __p.push('\n\t\t  not assigned\n\t\t  ');  } else { ; __p.push('\n\t\t  ',  user.name ,'\n\t\t  ');  } ; __p.push('\n\t\t</p>\n\t\t<p>\n\t\t  <b>Category:</b>\n\t\t  ',  category.title ,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>Desciption:</b>\n\t\t  ',  description ,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>Point value:</b>\n\t\t  ',  pointvalue ,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>Due:</b>\n\t\t  ',  due_date_f ,'\n\t\t</p>\t\t\n\t\t<p>\n\t\t  <b>Estimated Time Consumption:</b>\n\t\t  ',  etc ,'\n\t\t</p>\n\t</div>\n\t\t<div data-role="footer" align="center">\n\t\t<a href="#tasks/',  id ,'/destroy" data-icon="delete" data-role="button">Delete</a>\n  \t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/statuses"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('',  title ,'\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/task"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<a id="',  id ,'" href="#tasks/',  id ,'">',  title ,'</a>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/tasks/tasklists"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('',  name ,'\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/users/friends"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<li> ',  name ,' </li>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/users/index"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div data-role="content">\n<p>\n<b>Welcome</b> ',  name ,'\n</p>\n</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/users/ranking"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('\t<div data-role="header">\n\t\t<a href="#start" data-icon="back">Start</a>\n        <h1>Ranking</h1>\n  \t</div>\n  \t<div data-role="content">\n\t\t<div data-role="collapsible-set">\n\t\t\t<div data-role="collapsible" data-collapsed="false">\n\t\t\t\t<h3>Ranking by Points</h3>\n\t\t\t\t<ol id="RBP" data-role="listview"></ol>\n\t\t\t</div>\n\t\t\t<div data-role="collapsible">\n\t\t\t\t<h3>Ranking by Crowns</h3>\n\t\t\t</div>\n\t\t\t\n\t\t\t<div data-role="collapsible">\n\t\t\t\t<h3>Ranking by Lists</h3>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n');}return __p.join('');};
}).call(this);
(function() { this.JST || (this.JST = {}); this.JST["backbone/templates/users/show"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div data-role="content">\n\t\t\n\t\t\n\t\t<p>\n\t\t  <b>Id:</b>\n\t\t  ',  id ,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>Name:</b>\n\t\t  ',  name ,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>UID</b>\n\t\t  ',  uid,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>OAUTH_TOKEN</b>\n\t\t  ',  oauth_token,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>created_at</b>\n\t\t  ',  created_at,'\n\t\t</p>\n\t\t<p>\n\t\t  <b>OAUTH_expires</b>\n\t\t  ',  oauth_expires_at,'\n\t\t</p>\n\t\t\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  var _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Tasking.Models.Category = (function(_super) {
    __extends(Category, _super);

    function Category() {
      _ref = Category.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Category.prototype.paramRoot = 'category';

    Category.prototype.defaults = {
      id: null,
      title: null
    };

    return Category;

  })(Backbone.Model);

  Tasking.Collections.CategoriesCollection = (function(_super) {
    __extends(CategoriesCollection, _super);

    function CategoriesCollection() {
      _ref1 = CategoriesCollection.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    CategoriesCollection.prototype.model = Tasking.Models.Category;

    CategoriesCollection.prototype.url = '/categories.json';

    return CategoriesCollection;

  })(Backbone.Collection);

}).call(this);
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Tasking.Models.CurrentUser = (function(_super) {
    __extends(CurrentUser, _super);

    function CurrentUser() {
      _ref = CurrentUser.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    CurrentUser.prototype.urlRoot = "/users/current.json";

    return CurrentUser;

  })(Backbone.Model);

}).call(this);
(function() {
  var _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Tasking.Models.Status = (function(_super) {
    __extends(Status, _super);

    function Status() {
      _ref = Status.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Status.prototype.paramRoot = 'status';

    Status.prototype.defaults = {
      id: null,
      title: null
    };

    return Status;

  })(Backbone.Model);

  Tasking.Collections.StatusesCollection = (function(_super) {
    __extends(StatusesCollection, _super);

    function StatusesCollection() {
      _ref1 = StatusesCollection.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    StatusesCollection.prototype.model = Tasking.Models.Status;

    StatusesCollection.prototype.url = '/statuses.json';

    return StatusesCollection;

  })(Backbone.Collection);

}).call(this);
(function() {
  var _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Tasking.Models.Task = (function(_super) {
    __extends(Task, _super);

    function Task() {
      _ref = Task.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Task.prototype.paramRoot = 'task';

    Task.prototype.defaults = {
      id: null,
      tasklist_id: null,
      category_id: null,
      status_id: "1",
      assigned_to: null,
      title: null,
      description: null,
      pointvalue: null,
      due_date: null,
      etc: null,
      categories: null,
      tasklists: null
    };

    return Task;

  })(Backbone.Model);

  Tasking.Collections.TasksCollection = (function(_super) {
    __extends(TasksCollection, _super);

    function TasksCollection() {
      _ref1 = TasksCollection.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    TasksCollection.prototype.model = Tasking.Models.Task;

    TasksCollection.prototype.url = '/tasks';

    return TasksCollection;

  })(Backbone.Collection);

}).call(this);
(function() {
  var _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Tasking.Models.Tasklist = (function(_super) {
    __extends(Tasklist, _super);

    function Tasklist() {
      _ref = Tasklist.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    Tasklist.prototype.paramRoot = 'tasklist';

    Tasklist.prototype.defaults = {
      id: null,
      user_id: null,
      name: null,
      closed: "0"
    };

    return Tasklist;

  })(Backbone.Model);

  Tasking.Collections.TasklistsCollection = (function(_super) {
    __extends(TasklistsCollection, _super);

    function TasklistsCollection() {
      _ref1 = TasklistsCollection.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    TasklistsCollection.prototype.model = Tasking.Models.Tasklist;

    TasklistsCollection.prototype.url = '/tasklists';

    return TasklistsCollection;

  })(Backbone.Collection);

}).call(this);
(function() {
  var _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Tasking.Models.User = (function(_super) {
    __extends(User, _super);

    function User() {
      _ref = User.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    User.prototype.paramRoot = 'user';

    User.prototype.defaults = {
      id: null,
      provider: null,
      uid: null,
      name: null,
      oauth_token: null,
      oauth_expires_at: null,
      friends: null
    };

    return User;

  })(Backbone.Model);

  Tasking.Collections.UserCollection = (function(_super) {
    __extends(UserCollection, _super);

    function UserCollection() {
      _ref1 = UserCollection.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    UserCollection.prototype.model = Tasking.Models.Tasklist;

    UserCollection.prototype.url = '/users';

    return UserCollection;

  })(Backbone.Collection);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Categories || (_base.Categories = {});

  Tasking.Views.Categories.CategoryView = (function(_super) {
    __extends(CategoryView, _super);

    function CategoryView() {
      _ref = CategoryView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    CategoryView.prototype.template = JST["backbone/templates/categories/category"];

    CategoryView.prototype.events = {
      "click .destroy": "destroy"
    };

    CategoryView.prototype.tagName = "li";

    CategoryView.prototype.className = "ui-li";

    CategoryView.prototype.destroy = function() {
      this.model.destroy();
      this.remove();
      return false;
    };

    CategoryView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    };

    return CategoryView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Categories || (_base.Categories = {});

  Tasking.Views.Categories.EditView = (function(_super) {
    __extends(EditView, _super);

    function EditView() {
      _ref = EditView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    EditView.prototype.template = JST["backbone/templates/categories/edit"];

    EditView.prototype.events = {
      "submit #edit-category": "update"
    };

    EditView.prototype.update = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      return this.model.save(null, {
        success: function(category) {
          _this.model = category;
          return window.location.hash = "/" + _this.model.id;
        }
      });
    };

    EditView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.$("form").backboneLink(this.model);
      return this;
    };

    return EditView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Categories || (_base.Categories = {});

  Tasking.Views.Categories.IndexView = (function(_super) {
    __extends(IndexView, _super);

    function IndexView() {
      this.render = __bind(this.render, this);
      this.addOne = __bind(this.addOne, this);
      this.addAll = __bind(this.addAll, this);
      _ref = IndexView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    IndexView.prototype.template = JST["backbone/templates/categories/index"];

    IndexView.prototype.initialize = function() {
      return this.options.categories.bind('reset', this.addAll);
    };

    IndexView.prototype.addAll = function() {
      return this.options.categories.each(this.addOne);
    };

    IndexView.prototype.addOne = function(category) {
      var view;
      view = new Tasking.Views.Categories.CategoryView({
        model: category
      });
      return this.$("ul").append(view.render().el);
    };

    IndexView.prototype.render = function() {
      $(this.el).html(this.template({
        categories: this.options.categories.toJSON()
      }));
      this.addAll();
      return this;
    };

    return IndexView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Categories || (_base.Categories = {});

  Tasking.Views.Categories.NewView = (function(_super) {
    __extends(NewView, _super);

    NewView.prototype.template = JST["backbone/templates/categories/new"];

    NewView.prototype.events = {
      "submit #new-category": "save"
    };

    function NewView(options) {
      var _this = this;
      NewView.__super__.constructor.call(this, options);
      this.model = new this.collection.model();
      this.model.bind("change:errors", function() {
        return _this.render();
      });
    }

    NewView.prototype.save = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      this.model.unset("errors");
      return this.collection.create(this.model.toJSON(), {
        success: function(category) {
          _this.model = category;
          return window.location.hash = "/" + _this.model.id;
        },
        error: function(category, jqXHR) {
          return _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
        }
      });
    };

    NewView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.$("form").backboneLink(this.model);
      return this;
    };

    return NewView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Categories || (_base.Categories = {});

  Tasking.Views.Categories.ShowView = (function(_super) {
    __extends(ShowView, _super);

    function ShowView() {
      _ref = ShowView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ShowView.prototype.template = JST["backbone/templates/categories/show"];

    ShowView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    };

    return ShowView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Static || (_base.Static = {});

  Tasking.Views.Static.StartView = (function(_super) {
    __extends(StartView, _super);

    function StartView() {
      this.render = __bind(this.render, this);
      _ref = StartView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    StartView.prototype.template = JST["backbone/templates/static/start"];

    StartView.prototype.initialize = function() {};

    StartView.prototype.render = function() {
      $(this.el).html(this.template(window.current_user.toJSON()));
      return this;
    };

    return StartView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Statuses || (_base.Statuses = {});

  Tasking.Views.Statuses.EditView = (function(_super) {
    __extends(EditView, _super);

    function EditView() {
      _ref = EditView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    EditView.prototype.template = JST["backbone/templates/statuses/edit"];

    EditView.prototype.events = {
      "submit #edit-status": "update"
    };

    EditView.prototype.update = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      return this.model.save(null, {
        success: function(status) {
          _this.model = status;
          return window.location.hash = "/" + _this.model.id;
        }
      });
    };

    EditView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.$("form").backboneLink(this.model);
      return this;
    };

    return EditView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Statuses || (_base.Statuses = {});

  Tasking.Views.Statuses.IndexView = (function(_super) {
    __extends(IndexView, _super);

    function IndexView() {
      this.render = __bind(this.render, this);
      this.addOne = __bind(this.addOne, this);
      this.addAll = __bind(this.addAll, this);
      _ref = IndexView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    IndexView.prototype.template = JST["backbone/templates/statuses/index"];

    IndexView.prototype.initialize = function() {
      return this.options.statuses.bind('reset', this.addAll);
    };

    IndexView.prototype.addAll = function() {
      return this.options.statuses.each(this.addOne);
    };

    IndexView.prototype.addOne = function(status) {
      var view;
      view = new Tasking.Views.Statuses.StatusView({
        model: status
      });
      return this.$("ul").append(view.render().el);
    };

    IndexView.prototype.render = function() {
      $(this.el).html(this.template({
        statuses: this.options.statuses.toJSON()
      }));
      this.addAll();
      return this;
    };

    return IndexView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Statuses || (_base.Statuses = {});

  Tasking.Views.Statuses.NewView = (function(_super) {
    __extends(NewView, _super);

    NewView.prototype.template = JST["backbone/templates/statuses/new"];

    NewView.prototype.events = {
      "submit #new-status": "save"
    };

    function NewView(options) {
      var _this = this;
      NewView.__super__.constructor.call(this, options);
      this.model = new this.collection.model();
      this.model.bind("change:errors", function() {
        return _this.render();
      });
    }

    NewView.prototype.save = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      this.model.unset("errors");
      return this.collection.create(this.model.toJSON(), {
        success: function(status) {
          _this.model = status;
          return window.location.hash = "";
        },
        error: function(status, jqXHR) {
          return _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
        }
      });
    };

    NewView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.$("form").backboneLink(this.model);
      return this;
    };

    return NewView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Statuses || (_base.Statuses = {});

  Tasking.Views.Statuses.ShowView = (function(_super) {
    __extends(ShowView, _super);

    function ShowView() {
      _ref = ShowView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ShowView.prototype.template = JST["backbone/templates/statuses/show"];

    ShowView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    };

    return ShowView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Statuses || (_base.Statuses = {});

  Tasking.Views.Statuses.StatusView = (function(_super) {
    __extends(StatusView, _super);

    function StatusView() {
      _ref = StatusView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    StatusView.prototype.template = JST["backbone/templates/statuses/status"];

    StatusView.prototype.events = {
      "click .destroy": "destroy"
    };

    StatusView.prototype.tagName = "li";

    StatusView.prototype.className = "ui-li";

    StatusView.prototype.destroy = function() {
      this.model.destroy();
      this.remove();
      return false;
    };

    StatusView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    };

    return StatusView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasklists || (_base.Tasklists = {});

  Tasking.Views.Tasklists.DetailView = (function(_super) {
    __extends(DetailView, _super);

    function DetailView() {
      this.render = __bind(this.render, this);
      this.addOne = __bind(this.addOne, this);
      this.addAll = __bind(this.addAll, this);
      _ref = DetailView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    DetailView.prototype.template = JST["backbone/templates/tasklists/detail"];

    DetailView.prototype.initialize = function(options) {
      this.tasklists = options.tasklists;
      return this.tasklists.bind('reset', this.addAll);
    };

    DetailView.prototype.addAll = function() {
      return this.tasklists.each(this.addOne);
    };

    DetailView.prototype.addOne = function(tasklist) {
      var view;
      view = new Tasking.Views.Tasklists.TasklistDetailView({
        model: tasklist
      });
      return this.$("#tasklist-cont").append(view.render().el);
    };

    DetailView.prototype.render = function() {
      $(this.el).html(this.template({
        tasklists: this.tasklists.toJSON()
      }));
      this.addAll();
      return this;
    };

    return DetailView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasklists || (_base.Tasklists = {});

  Tasking.Views.Tasklists.EditView = (function(_super) {
    __extends(EditView, _super);

    function EditView() {
      _ref = EditView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    EditView.prototype.template = JST["backbone/templates/tasklists/edit"];

    EditView.prototype.events = {
      "submit #edit-tasklist": "update"
    };

    EditView.prototype.update = function(e) {
      var _this = this;
      this.model.attributes.closed = $("#select-closed").val();
      e.preventDefault();
      e.stopPropagation();
      return this.model.save(null, {
        success: function(tasklist) {
          _this.model = tasklist;
          return window.location.hash = "tasklists";
        }
      });
    };

    EditView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.$("form").backboneLink(this.model);
      return this;
    };

    return EditView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasklists || (_base.Tasklists = {});

  Tasking.Views.Tasklists.IndexView = (function(_super) {
    __extends(IndexView, _super);

    function IndexView() {
      this.render = __bind(this.render, this);
      this.addOne = __bind(this.addOne, this);
      this.addAll = __bind(this.addAll, this);
      _ref = IndexView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    IndexView.prototype.template = JST["backbone/templates/tasklists/index"];

    IndexView.prototype.initialize = function(options) {
      this.tasklists = options.tasklists;
      return this.tasklists.bind('reset', this.addAll);
    };

    IndexView.prototype.addAll = function() {
      return this.tasklists.each(this.addOne);
    };

    IndexView.prototype.addOne = function(tasklist) {
      var view;
      view = new Tasking.Views.Tasklists.TasklistView({
        model: tasklist
      });
      return this.$("ul").append(view.render().el);
    };

    IndexView.prototype.render = function() {
      $(this.el).html(this.template({
        tasklists: this.tasklists.toJSON()
      }));
      this.addAll();
      return this;
    };

    return IndexView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasklists || (_base.Tasklists = {});

  Tasking.Views.Tasklists.NewView = (function(_super) {
    __extends(NewView, _super);

    NewView.prototype.template = JST["backbone/templates/tasklists/new"];

    NewView.prototype.events = {
      "submit #new-tasklist": "save"
    };

    function NewView(options) {
      var _this = this;
      NewView.__super__.constructor.call(this, options);
      this.model = new this.collection.model();
      this.model.bind("change:errors", function() {
        return _this.render();
      });
    }

    NewView.prototype.save = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      this.model.unset("errors");
      return this.collection.create(this.model.toJSON(), {
        success: function(tasklist) {
          _this.model = tasklist;
          window.location.hash = "tasklists";
          return window.location.reload();
        },
        error: function(tasklist, jqXHR) {
          return _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
        }
      });
    };

    NewView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.$("form").backboneLink(this.model);
      $("#app").trigger("create");
      return this;
    };

    return NewView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasklists || (_base.Tasklists = {});

  Tasking.Views.Tasklists.TasklistDetailTaskView = (function(_super) {
    __extends(TasklistDetailTaskView, _super);

    function TasklistDetailTaskView() {
      this.render = __bind(this.render, this);
      _ref = TasklistDetailTaskView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TasklistDetailTaskView.prototype.template = JST["backbone/templates/tasklists/tasklist_detail_task"];

    TasklistDetailTaskView.prototype.tagName = "li";

    TasklistDetailTaskView.prototype.initialize = function(options) {
      return this.task = options.task;
    };

    TasklistDetailTaskView.prototype.render = function() {
      $(this.el).html(this.template(this.task.toJSON()));
      return this;
    };

    return TasklistDetailTaskView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasklists || (_base.Tasklists = {});

  Tasking.Views.Tasklists.TasklistDetailView = (function(_super) {
    __extends(TasklistDetailView, _super);

    function TasklistDetailView() {
      this.render = __bind(this.render, this);
      this.addOne = __bind(this.addOne, this);
      this.addAll = __bind(this.addAll, this);
      _ref = TasklistDetailView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TasklistDetailView.prototype.template = JST["backbone/templates/tasklists/tasklist_detail"];

    TasklistDetailView.prototype.initialize = function(options) {
      return this.tasklist = options.model;
    };

    TasklistDetailView.prototype.addAll = function() {
      if (this.tasks.length > 0) {
        this.tasks.each(this.addOne);
      } else {
        this.$("ul").append("<li> No Task found</li>");
      }
      return this.$("ul").listview('refresh');
    };

    TasklistDetailView.prototype.addOne = function(task) {
      var view;
      view = new Tasking.Views.Tasklists.TasklistDetailTaskView({
        task: task
      });
      return this.$("ul").append(view.render().el);
    };

    TasklistDetailView.prototype.render = function() {
      this.tasks = new Tasking.Collections.TasksCollection();
      this.tasks.fetch({
        data: {
          tasklist_id: this.tasklist.attributes.id
        },
        success: this.addAll,
        async: true
      });
      $(this.el).html(this.template(this.tasklist.toJSON()));
      $(this.el).attr("data-role", "collapsible");
      $(this.el).attr("data-theme", "b");
      $(this.el).attr("data-content-theme", "c");
      return this;
    };

    return TasklistDetailView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasklists || (_base.Tasklists = {});

  Tasking.Views.Tasklists.TasklistView = (function(_super) {
    __extends(TasklistView, _super);

    function TasklistView() {
      _ref = TasklistView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TasklistView.prototype.template = JST["backbone/templates/tasklists/tasklist"];

    TasklistView.prototype.events = {
      "click .destroy": "destroy"
    };

    TasklistView.prototype.tagName = "li";

    TasklistView.prototype.className = "ui-li";

    TasklistView.prototype.destroy = function() {
      this.model.destroy();
      this.remove();
      return false;
    };

    TasklistView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $("#app").trigger("create");
      return this;
    };

    return TasklistView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasks || (_base.Tasks = {});

  Tasking.Views.Tasks.EditView = (function(_super) {
    __extends(EditView, _super);

    function EditView() {
      this.addOneCategory = __bind(this.addOneCategory, this);
      this.addAllCategoriesAfterFetch = __bind(this.addAllCategoriesAfterFetch, this);
      this.addAllCategories = __bind(this.addAllCategories, this);
      this.addOneStatus = __bind(this.addOneStatus, this);
      this.addAllStatusesAfterFetch = __bind(this.addAllStatusesAfterFetch, this);
      this.addAllStatuses = __bind(this.addAllStatuses, this);
      this.addOneFriend = __bind(this.addOneFriend, this);
      this.addAllFriends = __bind(this.addAllFriends, this);
      _ref = EditView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    EditView.prototype.template = JST["backbone/templates/tasks/edit"];

    EditView.prototype.events = {
      "submit #edit-task": "update"
    };

    EditView.prototype.update = function(e) {
      var _this = this;
      this.model.attributes.status_id = $("#select-status").val();
      this.model.attributes.category_id = $("#select-category").val();
      this.model.attributes.user_id = $("#select-friend").val();
      this.model.attributes.pointvalue = $("#select-pointvalue").val();
      this.model.attributes.due_date = $("#select-due_date").val();
      this.model.attributes.etc = $("#select-etc").val();
      e.preventDefault();
      e.stopPropagation();
      return this.model.save(null, {
        success: function(task) {
          _this.model = task;
          window.location.hash = "tasks";
          return window.location.reload();
        }
      });
    };

    EditView.prototype.addAllFriends = function() {
      var obj, _i, _len, _ref1, _results;
      this.addOneFriend(current_user.toJSON());
      _ref1 = window.current_user.attributes.friends;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        obj = _ref1[_i];
        _results.push(this.addOneFriend(obj));
      }
      return _results;
    };

    EditView.prototype.addOneFriend = function(friend) {
      var view;
      view = new Tasking.Views.Tasks.FriendsView({
        model: friend
      });
      return this.$("#select-friend").append(view.render().el);
    };

    EditView.prototype.addAllStatuses = function() {
      this.collectionStatus = new Tasking.Collections.StatusesCollection();
      return this.collectionStatus.fetch({
        success: this.addAllStatusesAfterFetch
      });
    };

    EditView.prototype.addAllStatusesAfterFetch = function() {
      return this.collectionStatus.each(this.addOneStatus);
    };

    EditView.prototype.addOneStatus = function(status) {
      var view;
      view = new Tasking.Views.Tasks.XStatusView({
        model: status
      });
      return this.$("#select-status").append(view.render().el);
    };

    EditView.prototype.addAllCategories = function() {
      this.collectionCategory = new Tasking.Collections.CategoriesCollection();
      return this.collectionCategory.fetch({
        success: this.addAllCategoriesAfterFetch
      });
    };

    EditView.prototype.addAllCategoriesAfterFetch = function() {
      return this.collectionCategory.each(this.addOneCategory);
    };

    EditView.prototype.addOneCategory = function(category) {
      var view;
      view = new Tasking.Views.Tasks.XCategoryView({
        model: category
      });
      return this.$("#select-category").append(view.render().el);
    };

    EditView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.addAllFriends();
      this.addAllCategories();
      this.addAllStatuses();
      this.$("form").backboneLink(this.model);
      return this;
    };

    return EditView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Friends || (_base.Friends = {});

  Tasking.Views.Tasks.FriendsView = (function(_super) {
    __extends(FriendsView, _super);

    function FriendsView() {
      _ref = FriendsView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    FriendsView.prototype.template = JST["backbone/templates/tasks/friends"];

    FriendsView.prototype.tagName = "option";

    FriendsView.prototype.initialize = function() {};

    FriendsView.prototype.render = function() {
      $(this.el).attr("value", this.model.id);
      $(this.el).html(this.template(this.model));
      return this;
    };

    return FriendsView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasks || (_base.Tasks = {});

  Tasking.Views.Tasks.GetShowView = (function(_super) {
    __extends(GetShowView, _super);

    function GetShowView() {
      _ref = GetShowView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    GetShowView.prototype.template = JST["backbone/templates/tasks/get_show"];

    GetShowView.prototype.events = {
      "click #assign-task": "assign"
    };

    GetShowView.prototype.assign = function(e) {
      var _this = this;
      this.model.attributes.assigned_to = window.current_user.id;
      e.preventDefault();
      e.stopPropagation();
      return this.model.save(null, {
        success: function(task) {
          _this.model = task;
          window.location.hash = "tasks";
          return window.location.reload();
        }
      });
    };

    GetShowView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $("#app").trigger("create");
      return this;
    };

    return GetShowView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasks || (_base.Tasks = {});

  Tasking.Views.Tasks.GetTaskView = (function(_super) {
    __extends(GetTaskView, _super);

    function GetTaskView() {
      _ref = GetTaskView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    GetTaskView.prototype.template = JST["backbone/templates/tasks/get_task"];

    GetTaskView.prototype.events = {
      "click .destroy": "destroy"
    };

    GetTaskView.prototype.tagName = "li";

    GetTaskView.prototype.className = "ui-li";

    GetTaskView.prototype.destroy = function() {
      this.model.destroy();
      this.remove();
      return false;
    };

    GetTaskView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $("#app").trigger("create");
      return this;
    };

    return GetTaskView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasks || (_base.Tasks = {});

  Tasking.Views.Tasks.GetView = (function(_super) {
    __extends(GetView, _super);

    function GetView() {
      this.render = __bind(this.render, this);
      this.addOne = __bind(this.addOne, this);
      this.addAll = __bind(this.addAll, this);
      _ref = GetView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    GetView.prototype.template = JST["backbone/templates/tasks/index"];

    GetView.prototype.initialize = function() {
      return this.options.tasks.bind('reset', this.addAll);
    };

    GetView.prototype.addAll = function() {
      return this.options.tasks.each(this.addOne);
    };

    GetView.prototype.addOne = function(task) {
      var view;
      view = new Tasking.Views.Tasks.GetTaskView({
        model: task
      });
      return this.$("ul").append(view.render().el);
    };

    GetView.prototype.render = function() {
      $(this.el).html(this.template({
        tasks: this.options.tasks.toJSON()
      }));
      this.addAll();
      return this;
    };

    return GetView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasks || (_base.Tasks = {});

  Tasking.Views.Tasks.IndexView = (function(_super) {
    __extends(IndexView, _super);

    function IndexView() {
      this.render = __bind(this.render, this);
      this.addOne = __bind(this.addOne, this);
      this.addAll = __bind(this.addAll, this);
      _ref = IndexView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    IndexView.prototype.template = JST["backbone/templates/tasks/index"];

    IndexView.prototype.initialize = function() {
      return this.options.tasks.bind('reset', this.addAll);
    };

    IndexView.prototype.addAll = function() {
      return this.options.tasks.each(this.addOne);
    };

    IndexView.prototype.addOne = function(task) {
      var view;
      if (task.attributes.assigned_to === window.current_user.id || task.attributes.tasklist.user_id === window.current_user.id) {
        view = new Tasking.Views.Tasks.TaskView({
          model: task
        });
        return this.$("ul").append(view.render().el);
      }
    };

    IndexView.prototype.render = function() {
      $(this.el).html(this.template({
        tasks: this.options.tasks.toJSON()
      }));
      this.addAll();
      return this;
    };

    return IndexView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasks || (_base.Tasks = {});

  Tasking.Views.Tasks.NewView = (function(_super) {
    __extends(NewView, _super);

    NewView.prototype.template = JST["backbone/templates/tasks/new"];

    NewView.prototype.events = {
      "submit #new-task": "save"
    };

    function NewView(options) {
      this.addOneTasklist = __bind(this.addOneTasklist, this);
      this.addAllTasklistsAfterFetch = __bind(this.addAllTasklistsAfterFetch, this);
      this.addAllTasklists = __bind(this.addAllTasklists, this);
      this.addOneFriend = __bind(this.addOneFriend, this);
      this.addAllFriends = __bind(this.addAllFriends, this);
      this.addOneCategory = __bind(this.addOneCategory, this);
      this.addAllCategoriesAfterFetch = __bind(this.addAllCategoriesAfterFetch, this);
      this.addAllCategories = __bind(this.addAllCategories, this);
      var _this = this;
      NewView.__super__.constructor.call(this, options);
      this.model = new this.collection.model();
      this.model.bind("change:errors", function() {
        return _this.render();
      });
    }

    NewView.prototype.save = function(e) {
      var _this = this;
      this.model.attributes.tasklist_id = $("#select-tasklist").val();
      this.model.attributes.category_id = $("#select-category").val();
      this.model.attributes.user_id = $("#select-friend").val();
      this.model.attributes.pointvalue = $("#select-pointvalue").val();
      this.model.attributes.due_date = $("#select-due_date").val();
      this.model.attributes.etc = $("#select-etc").val();
      e.preventDefault();
      e.stopPropagation();
      this.model.unset("errors");
      return this.collection.create(this.model.toJSON(), {
        success: function(task) {
          _this.model = task;
          window.location.hash = "tasks";
          return window.location.reload();
        },
        error: function(task, jqXHR) {
          return _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
        }
      });
    };

    NewView.prototype.addAllCategories = function() {
      this.collectionCategory = new Tasking.Collections.CategoriesCollection();
      return this.collectionCategory.fetch({
        success: this.addAllCategoriesAfterFetch
      });
    };

    NewView.prototype.addAllCategoriesAfterFetch = function() {
      return this.collectionCategory.each(this.addOneCategory);
    };

    NewView.prototype.addOneCategory = function(category) {
      var view;
      view = new Tasking.Views.Tasks.XCategoryView({
        model: category
      });
      return this.$("#select-category").append(view.render().el);
    };

    NewView.prototype.addAllFriends = function() {
      var obj, _i, _len, _ref, _results;
      this.addOneFriend(current_user.toJSON());
      _ref = window.current_user.attributes.friends;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        obj = _ref[_i];
        _results.push(this.addOneFriend(obj));
      }
      return _results;
    };

    NewView.prototype.addOneFriend = function(friend) {
      var view;
      view = new Tasking.Views.Tasks.FriendsView({
        model: friend
      });
      return this.$("#select-friend").append(view.render().el);
    };

    NewView.prototype.addAllTasklists = function() {
      this.collectionTasklist = new Tasking.Collections.TasklistsCollection();
      return this.collectionTasklist.fetch({
        success: this.addAllTasklistsAfterFetch
      });
    };

    NewView.prototype.addAllTasklistsAfterFetch = function() {
      return this.collectionTasklist.each(this.addOneTasklist);
    };

    NewView.prototype.addOneTasklist = function(tasklist) {
      var view;
      view = new Tasking.Views.Tasks.TasklistsView({
        model: tasklist
      });
      return this.$("#select-tasklist").append(view.render().el);
    };

    NewView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.addAllTasklists();
      this.addAllCategories();
      this.addAllFriends();
      $("#app").trigger("create");
      this.$("form").backboneLink(this.model);
      return this;
    };

    return NewView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasks || (_base.Tasks = {});

  Tasking.Views.Tasks.TaskView = (function(_super) {
    __extends(TaskView, _super);

    function TaskView() {
      _ref = TaskView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TaskView.prototype.template = JST["backbone/templates/tasks/task"];

    TaskView.prototype.events = {
      "click .destroy": "destroy"
    };

    TaskView.prototype.tagName = "li";

    TaskView.prototype.className = "ui-li";

    TaskView.prototype.destroy = function() {
      this.model.destroy();
      this.remove();
      return false;
    };

    TaskView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $("#app").trigger("create");
      return this;
    };

    return TaskView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasks || (_base.Tasks = {});

  Tasking.Views.Tasks.ShowView = (function(_super) {
    __extends(ShowView, _super);

    function ShowView() {
      _ref = ShowView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ShowView.prototype.template = JST["backbone/templates/tasks/show"];

    ShowView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $("#app").trigger("create");
      return this;
    };

    return ShowView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasks || (_base.Tasks = {});

  Tasking.Views.Tasks.TaskView = (function(_super) {
    __extends(TaskView, _super);

    function TaskView() {
      _ref = TaskView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TaskView.prototype.template = JST["backbone/templates/tasks/task"];

    TaskView.prototype.events = {
      "click .destroy": "destroy"
    };

    TaskView.prototype.tagName = "li";

    TaskView.prototype.className = "ui-li";

    TaskView.prototype.destroy = function() {
      this.model.destroy();
      this.remove();
      return false;
    };

    TaskView.prototype.render = function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $("#app").trigger("create");
      return this;
    };

    return TaskView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Tasklists || (_base.Tasklists = {});

  Tasking.Views.Tasks.TasklistsView = (function(_super) {
    __extends(TasklistsView, _super);

    function TasklistsView() {
      _ref = TasklistsView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    TasklistsView.prototype.template = JST["backbone/templates/tasks/tasklists"];

    TasklistsView.prototype.tagName = "option";

    TasklistsView.prototype.initialize = function() {};

    TasklistsView.prototype.render = function() {
      $(this.el).attr("value", this.model.attributes.id);
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    };

    return TasklistsView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).XCategories || (_base.XCategories = {});

  Tasking.Views.Tasks.XCategoryView = (function(_super) {
    __extends(XCategoryView, _super);

    function XCategoryView() {
      _ref = XCategoryView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    XCategoryView.prototype.template = JST["backbone/templates/tasks/categories"];

    XCategoryView.prototype.tagName = "option";

    XCategoryView.prototype.initialize = function() {};

    XCategoryView.prototype.render = function() {
      $(this.el).attr("value", this.model.attributes.id);
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    };

    return XCategoryView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).XStatuses || (_base.XStatuses = {});

  Tasking.Views.Tasks.XStatusView = (function(_super) {
    __extends(XStatusView, _super);

    function XStatusView() {
      _ref = XStatusView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    XStatusView.prototype.template = JST["backbone/templates/tasks/statuses"];

    XStatusView.prototype.tagName = "option";

    XStatusView.prototype.initialize = function() {};

    XStatusView.prototype.render = function() {
      $(this.el).attr("value", this.model.attributes.id);
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    };

    return XStatusView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Users || (_base.Users = {});

  Tasking.Views.Users.EditView = (function(_super) {
    __extends(EditView, _super);

    function EditView() {
      _ref = EditView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    EditView.prototype.template = JST["backbone/templates/users/edit"];

    EditView.prototype.events = {
      "submit #edit-user": "update"
    };

    EditView.prototype.update = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      return this.model.save(null, {
        success: function(user) {
          _this.model = user;
          return window.location.hash = "/" + _this.model.id;
        }
      });
    };

    EditView.prototype.render = function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$("form").backboneLink(this.model);
      return this;
    };

    return EditView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Friends || (_base.Friends = {});

  Tasking.Views.Users.FriendsView = (function(_super) {
    __extends(FriendsView, _super);

    function FriendsView() {
      _ref = FriendsView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    FriendsView.prototype.template = JST["backbone/templates/users/friends"];

    FriendsView.prototype.initialize = function() {};

    FriendsView.prototype.render = function() {
      this.$el.html(this.template(this.model));
      return this;
    };

    return FriendsView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Users || (_base.Users = {});

  Tasking.Views.Users.IndexView = (function(_super) {
    __extends(IndexView, _super);

    function IndexView() {
      this.render = __bind(this.render, this);
      this.addOne = __bind(this.addOne, this);
      this.addAll = __bind(this.addAll, this);
      _ref = IndexView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    IndexView.prototype.template = JST["backbone/templates/users/index"];

    IndexView.prototype.initialize = function() {
      return this.options.users.bind('reset', this.addAll);
    };

    IndexView.prototype.addAll = function() {
      return this.options.users.each(this.addOne);
    };

    IndexView.prototype.addOne = function(user) {
      var view;
      view = new Tasking.Views.Users.UserView({
        model: user
      });
      return this.$("ul").append(view.render().el);
    };

    IndexView.prototype.render = function() {
      $(this.el).html(this.template({
        users: this.options.users.toJSON()
      }));
      this.addAll();
      return this;
    };

    return IndexView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Users || (_base.Users = {});

  Tasking.Views.Users.NewView = (function(_super) {
    __extends(NewView, _super);

    NewView.prototype.template = JST["backbone/templates/users/new"];

    NewView.prototype.events = {
      "submit #new-user": "save"
    };

    function NewView(options) {
      var _this = this;
      NewView.__super__.constructor.call(this, options);
      this.model = new this.collection.model();
      this.model.bind("change:errors", function() {
        return _this.render();
      });
    }

    NewView.prototype.save = function(e) {
      var _this = this;
      e.preventDefault();
      e.stopPropagation();
      this.model.unset("errors");
      return this.collection.create(this.model.toJSON(), {
        success: function(user) {
          _this.model = user;
          return window.location.hash = "/" + _this.model.id;
        },
        error: function(user, jqXHR) {
          return _this.model.set({
            errors: $.parseJSON(jqXHR.responseText)
          });
        }
      });
    };

    NewView.prototype.render = function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$("form").backboneLink(this.model);
      return this;
    };

    return NewView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Users || (_base.Users = {});

  Tasking.Views.Users.RankingView = (function(_super) {
    __extends(RankingView, _super);

    function RankingView() {
      this.render = __bind(this.render, this);
      this.addOne = __bind(this.addOne, this);
      this.addAll = __bind(this.addAll, this);
      _ref = RankingView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    RankingView.prototype.template = JST["backbone/templates/users/ranking"];

    RankingView.prototype.initialize = function() {};

    RankingView.prototype.addAll = function() {
      if (this.RBP.length > 0) {
        this.RBP.each(this.addOne);
      } else {
        this.$("ul#RBP").append("<li> No Task found</li>");
      }
      return this.$("ol").listview('refresh');
    };

    RankingView.prototype.addOne = function(rbp) {
      return this.$("ol#RBP").append("<li>" + rbp.attributes.name + " " + rbp.attributes.points + "</li>");
    };

    RankingView.prototype.render = function() {
      $(this.el).html(this.template);
      this.RBP = new Tasking.Collections.UserCollection();
      this.RBP.url = "/users/ranking";
      this.RBP.fetch({
        success: this.addAll,
        async: true
      });
      return this;
    };

    return RankingView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Users || (_base.Users = {});

  Tasking.Views.Users.ShowView = (function(_super) {
    __extends(ShowView, _super);

    function ShowView() {
      this.addOneFriend = __bind(this.addOneFriend, this);
      this.addAllFriends = __bind(this.addAllFriends, this);
      _ref = ShowView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    ShowView.prototype.template = JST["backbone/templates/users/show"];

    ShowView.prototype.addAllFriends = function() {
      var obj, _i, _len, _ref1, _results;
      _ref1 = this.model.attributes.friends;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        obj = _ref1[_i];
        _results.push(this.addOneFriend(obj));
      }
      return _results;
    };

    ShowView.prototype.addOneFriend = function(friend) {
      var view;
      view = new Tasking.Views.Users.FriendsView({
        model: friend
      });
      return this.$("ul").append(view.render().el);
    };

    ShowView.prototype.render = function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.addAllFriends();
      return this;
    };

    return ShowView;

  })(Backbone.View);

}).call(this);
(function() {
  var _base, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (_base = Tasking.Views).Users || (_base.Users = {});

  Tasking.Views.Users.UserView = (function(_super) {
    __extends(UserView, _super);

    function UserView() {
      _ref = UserView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    UserView.prototype.template = JST["backbone/templates/users/user"];

    UserView.prototype.events = {
      "click .destroy": "destroy"
    };

    UserView.prototype.tagName = "tr";

    UserView.prototype.destroy = function() {
      this.model.destroy();
      this.remove();
      return false;
    };

    return UserView;

  })(Backbone.View);

}).call(this);
(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Tasking.Routers.AppRouter = (function(_super) {
    __extends(AppRouter, _super);

    function AppRouter() {
      _ref = AppRouter.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    AppRouter.prototype.initialize = function(options) {
      this.currentUserInitialize();
      this.tasksInitialize();
      return this.tasklistsInitialize();
    };

    AppRouter.prototype.routes = {
      "start": "start",
      ".*": "start",
      "login": "login",
      "logout": "logout",
      "close": "close",
      "users/ranking": "usersRanking",
      "tasks/new": "tasksNew",
      "tasks/get": "tasksGet",
      "tasks/get/:id": "tasksGetShow",
      "tasks/index": "tasksIndex",
      "tasks/:id/destroy": "tasksDestroy",
      "tasks/:id/edit": "tasksEdit",
      "tasks/:id": "tasksShow",
      "tasks.*": "tasksIndex",
      "tasklists/detail": "tasklistsDetail",
      "tasklists/new": "tasklistsNew",
      "tasklists/index": "tasklistsIndex",
      "tasklists/:id/destroy": "tasklistsDestroy",
      "tasklists/:id/edit": "tasklistsEdit",
      "tasklists.*": "tasklistsIndex"
    };

    AppRouter.prototype.start = function() {
      this.view = new Tasking.Views.Static.StartView();
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.login = function() {
      return window.open("/auth/facebook");
    };

    AppRouter.prototype.logout = function() {
      return window.open("/signout");
    };

    AppRouter.prototype.close = function() {
      opener.location.hash = "";
      opener.location.reload();
      return window.close();
    };

    AppRouter.prototype.currentUserInitialize = function(options) {
      var CU;
      CU = new Tasking.Models.CurrentUser();
      window.current_user = CU;
      return CU.fetch({
        async: false
      });
    };

    AppRouter.prototype.usersRanking = function(options) {
      this.view = new Tasking.Views.Users.RankingView();
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasksInitialize = function(options) {
      this.tasks = new Tasking.Collections.TasksCollection();
      return this.tasks.fetch({
        async: false
      });
    };

    AppRouter.prototype.tasksNew = function() {
      this.view = new Tasking.Views.Tasks.NewView({
        collection: this.tasks
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasksIndex = function() {
      this.view = new Tasking.Views.Tasks.IndexView({
        tasks: this.tasks
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasksShow = function(id) {
      var task;
      task = this.tasks.get(id);
      this.view = new Tasking.Views.Tasks.ShowView({
        model: task
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasksGetShow = function(id) {
      var task;
      task = this.tasks.get(id);
      this.view = new Tasking.Views.Tasks.GetShowView({
        model: task
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasksGet = function(id) {
      this.getTasks = new Tasking.Collections.TasksCollection();
      this.getTasks.url = "tasks/get";
      this.getTasks.fetch({
        async: false
      });
      this.view = new Tasking.Views.Tasks.GetView({
        tasks: this.getTasks
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasksEdit = function(id) {
      var task;
      task = this.tasks.get(id);
      this.view = new Tasking.Views.Tasks.EditView({
        model: task
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasksDestroy = function(id) {
      var task;
      task = this.tasks.get(id);
      task.destroy();
      this.view = new Tasking.Views.Tasks.IndexView({
        tasks: this.tasks,
        msg: task.name + " deleted!"
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasklistsInitialize = function() {
      this.tasklists = new Tasking.Collections.TasklistsCollection();
      return this.tasklists.fetch({
        async: false
      });
    };

    AppRouter.prototype.tasklistsNew = function() {
      this.view = new Tasking.Views.Tasklists.NewView({
        collection: this.tasklists
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasklistsDetail = function() {
      this.view = new Tasking.Views.Tasklists.DetailView({
        tasklists: this.tasklists
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasklistsIndex = function() {
      this.view = new Tasking.Views.Tasklists.IndexView({
        tasklists: this.tasklists
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasklistsShow = function(id) {
      var tasklist;
      tasklist = this.tasklists.get(id);
      this.view = new Tasking.Views.Tasklists.ShowView({
        model: tasklist
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasklistsEdit = function(id) {
      var tasklist;
      tasklist = this.tasklists.get(id);
      this.view = new Tasking.Views.Tasklists.EditView({
        model: tasklist
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    AppRouter.prototype.tasklistsDestroy = function(id) {
      var tasklist;
      tasklist = this.tasklists.get(id);
      tasklist.destroy();
      this.view = new Tasking.Views.Tasklists.IndexView({
        tasklists: this.tasklists,
        msg: tasklist.name + " deleted!"
      });
      return $("#BBCont").html(this.view.render().el).trigger('pagecreate');
    };

    return AppRouter;

  })(Backbone.Router);

}).call(this);
(function() {


}).call(this);
(function() {
  jQuery(function() {
    $('body').prepend('<div id="fb-root"></div>');
    return $.ajax({
      url: "" + window.location.protocol + "//connect.facebook.net/en_US/all.js",
      dataType: 'script',
      cache: true
    });
  });

  window.fbAsyncInit = function() {
    FB.init({
      appId: '557026374368942',
      cookie: true
    });
    $('#sign_in').click(function(e) {
      e.preventDefault();
      return FB.login(function(response) {
        if (response.authResponse) {
          return window.location = '/auth/facebook/callback';
        }
      });
    });
    return $('#sign_out').click(function(e) {
      FB.getLoginStatus(function(response) {
        if (response.authResponse) {
          return FB.logout();
        }
      });
      return true;
    });
  };

}).call(this);
(function() {


}).call(this);
$(document).bind("mobileinit", function () {
    $.mobile.ajaxEnabled = false;
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.pushStateEnabled = false;
});

$('div[data-role="page"]').on('pagehide', function (event, ui) {
    $(event.currentTarget).remove();
});
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//








;
