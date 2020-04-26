(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('react'), require('prop-types')) :
  typeof define === 'function' && define.amd ? define(['exports', 'react', 'prop-types'], factory) :
  (global = global || self, factory(global.ReactFormValidation = {}, global.React, global.PropTypes));
}(this, (function (exports, React, propTypes$1) { 'use strict';

  var React__default = 'default' in React ? React['default'] : React;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};

    var target = _objectWithoutPropertiesLoose(source, excluded);

    var key, i;

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var FormContext = React.createContext(null);

  var getName = function getName(ref) {return ref.id || ref.name;};

  var Form = React.forwardRef(function (_ref, ref) {var onSubmit = _ref.onSubmit,rest = _objectWithoutProperties(_ref, ["onSubmit"]);
    var formRef = React.useRef(ref);
    var touched = React.useRef({});
    var fields = React.useRef({});

    /**
                              * This is invoked from `useValidation`
                              * Each element, as it's mounted, must register with us so we can do things with them
                              * This happens in a `useEffect` - the disposable will call the unregister function.
                              */
    var register = React.useCallback(function (ref, ctx) {
      fields.current[getName(ref)] = { ref: ref, ctx: ctx };
    }, []);

    var unregister = React.useCallback(function (ref) {
      delete fields.current[getName(ref)];
    }, []);

    /**
             * Validates a single input.
             * - Pass in a formInput to find relevant details (validation, update state function) from our fields ref.
             * - this allows calling this routine from anywhere which is useful.
             * - Also we pass along all the other form inputs so validation routines can check the state of the form.
             *
             * This is called in form#submit, and potentially change/blur on individual elements if configured.
             * - must have been touched OR force = true
             * - if constraints fail, return early with those errors
             * - if constraints pass, call custom validation routines (if any)
             * - if we get back an error from custom validation, set it on the input.
             * - otherwise, call into `updateState` which fires callbacks for state updates
             *
             * @param {HtmlInputElement} formInput the input to validate
             * @param {boolean} [force=false] whether to bypass touched check.
             */
    var validateSingle = React.useCallback(function (ref) {var _ctx$validation;var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var isTouched = touched.current[ref.name];
      if (!force && !isTouched) return;

      ref.setCustomValidity('');
      if (!ref.checkValidity()) return; // the invalid event will have fired.
      var
      ctx = fields.current[getName(ref)].ctx;
      var refs = Object.entries(fields.current).map(function (_ref2) {var _ref3 = _slicedToArray(_ref2, 2),ref = _ref3[1].ref;return ref;});var _map$filter =

      ((_ctx$validation = ctx.validation) !== null && _ctx$validation !== void 0 ? _ctx$validation : []).
      map(function (fn) {return fn(ref, refs);}).
      filter(function (valResult) {return valResult != null;}),_map$filter2 = _slicedToArray(_map$filter, 1),error = _map$filter2[0];

      if (typeof error === 'string') error = new Error(error);

      if (error != null) {
        ref.setCustomValidity(error.message);
        ref.checkValidity();
      } else {
        ctx.updateState(null, ref.validity);
      }
    }, []);

    /**
             * Validates a single input, accounting for `others`
             * If input has `others`: upon validation, all elements in `other` are validated as well.
             */
    var validate = React.useCallback(
    function (_ref4) {var element = _ref4.target;var
      ctx = fields.current[getName(element)].ctx;
      var allFields = ctx.otherArray.reduce(
      function (acc, item) {
        var other = fields.current[item];
        if (other) acc.push(other.ref);
        return acc;
      },
      [element]);


      allFields.forEach(function (field) {return validateSingle(field);});
    },
    [validateSingle]);


    /**
                        * Form submit handler
                        * Verify each of our inputs passes custom validation before calling onSubmit
                        * If custom validation fails replicate existing dom behavior of not submitting
                        */
    var handleSubmit = React.useCallback(
    function (e) {
      for (var _i = 0, _Object$entries = Object.entries(fields.current); _i < _Object$entries.length; _i++) {var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),_ref5 = _Object$entries$_i[1].ref;
        validateSingle(_ref5, true);
      }
      if (e.target.checkValidity()) {
        onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit(e);
      } else {
        e.preventDefault();
      }
    },
    [onSubmit, validateSingle]);


    var setInputTouched = React.useCallback(
    function (e) {return touched.current[e.target.name] = true;},
    [touched]);


    var contextValue = React.useMemo(
    function () {return {
        register: register,
        unregister: unregister,
        validate: validate,
        setInputTouched: setInputTouched };},

    [register, unregister, validate, setInputTouched]);


    return /*#__PURE__*/(
      React__default.createElement(FormContext.Provider, { value: contextValue }, /*#__PURE__*/
      React__default.createElement("form", _extends({ ref: formRef, onSubmit: handleSubmit }, rest))));


  });

  Form.displayName = 'Form';

  Form.propTypes = {
    onSubmit: propTypes$1.func };


  var memoized = React.memo(Form);
  memoized.displayName = 'Memo(Form)';

  var errors = new Map();
  var getErrorKey = function getErrorKey(err, code) {return "".concat(code, "_").concat(err.message);};
  var getError = function getError(error, validity) {
    var code = null;
    for (var x in validity) {if (validity[x]) code = x;}
    var key = getErrorKey(error, code);
    if (errors.has(key)) return errors.get(key);
    error.code = code;
    errors.set(key, error);
    return error;
  };

  var useValidation = function useValidation(
  innerRef, _ref)
















  {var onBlur = _ref.onBlur,onChange = _ref.onChange,onClick = _ref.onClick,onFocus = _ref.onFocus,validation = _ref.validation,other = _ref.other,recheck = _ref.recheck,blur = _ref.blur,change = _ref.change,click = _ref.click,onError = _ref.onError,onInvalid = _ref.onInvalid,onValid = _ref.onValid,onValidated = _ref.onValidated;var _useContext =
    React.useContext(
    FormContext),register = _useContext.register,unregister = _useContext.unregister,validate = _useContext.validate,setInputTouched = _useContext.setInputTouched;var _useState =


    React.useState(false),_useState2 = _slicedToArray(_useState, 2),validated = _useState2[0],setValidated = _useState2[1];var _useState3 =
    React.useState(null),_useState4 = _slicedToArray(_useState3, 2),valid = _useState4[0],setValid = _useState4[1];var _useState5 =
    React.useState(null),_useState6 = _slicedToArray(_useState5, 2),error = _useState6[0],setError = _useState6[1];var _useState7 =
    React.useState(null),_useState8 = _slicedToArray(_useState7, 2),invalid = _useState8[0],setInvalid = _useState8[1];

    var updateState = React.useCallback(
    function (error, validity) {
      var is_valid = error == null || error === false || error === '';
      var is_invalid = !is_valid;
      setValid(is_valid);
      setInvalid(is_invalid);
      setError(is_valid ? null : getError(error, validity));
      setValidated(true);
    },
    [setValid, setInvalid, setError, setValidated]);


    React.useEffect(function () {
      onError === null || onError === void 0 ? void 0 : onError(error);
      onInvalid === null || onInvalid === void 0 ? void 0 : onInvalid(invalid);
      onValid === null || onValid === void 0 ? void 0 : onValid(valid);
      onValidated === null || onValidated === void 0 ? void 0 : onValidated(validated);
    }, [
    onError,
    onInvalid,
    onValid,
    onValidated,
    error,
    invalid,
    valid,
    validated]);


    var handleFocus = React.useCallback(
    function (e) {
      onFocus === null || onFocus === void 0 ? void 0 : onFocus(e);
      setInputTouched(e);
    },
    [onFocus, setInputTouched]);


    var handleChange = React.useCallback(
    function (e) {
      onChange === null || onChange === void 0 ? void 0 : onChange(e);
      if (validated && recheck || change) validate(e);
    },
    [onChange, recheck, change, validated, validate]);


    var handleBlur = React.useCallback(
    function (e) {
      onBlur === null || onBlur === void 0 ? void 0 : onBlur(e);
      if (blur) validate(e);
    },
    [onBlur, blur, validate]);


    var handleClick = React.useCallback(
    function (e) {
      onClick === null || onClick === void 0 ? void 0 : onClick(e);
      if (click) validate(e);
    },
    [onClick, click, validate]);


    var ctx = React.useMemo(
    function () {return {
        validation:
        validation == null ?
        null :
        Array.isArray(validation) ?
        validation :
        [validation],
        updateState: updateState,
        otherArray: other == null ? [] : Array.isArray(other) ? other : [other] };},

    [validation, updateState, other]);


    React.useEffect(function () {
      var thisRef = innerRef.current;
      register(thisRef, ctx);
      return function () {return unregister(thisRef);};
    }, [innerRef, register, unregister, ctx]);

    React.useEffect(function () {
      var thisRef = innerRef.current;
      var handler = function handler(_ref2) {var _ref2$target = _ref2.target,validationMessage = _ref2$target.validationMessage,validity = _ref2$target.validity;
        updateState(new Error(validationMessage), validity);
      };
      thisRef.addEventListener('invalid', handler);
      return function () {return thisRef.removeEventListener('invalid', handler);};
    }, [innerRef, updateState]);

    return React.useMemo(
    function () {return { handleBlur: handleBlur, handleChange: handleChange, handleClick: handleClick, handleFocus: handleFocus };},
    [handleBlur, handleChange, handleClick, handleFocus]);

  };

  var propTypes = {
    onBlur: propTypes$1.func,
    onChange: propTypes$1.func,
    onClick: propTypes$1.func,
    onFocus: propTypes$1.func,
    validation: propTypes$1.oneOfType([propTypes$1.arrayOf(propTypes$1.func), propTypes$1.func]),
    other: propTypes$1.oneOfType([propTypes$1.arrayOf(propTypes$1.string), propTypes$1.string]),
    recheck: propTypes$1.bool,
    blur: propTypes$1.bool,
    change: propTypes$1.bool,
    click: propTypes$1.bool,
    onError: propTypes$1.func,
    onValid: propTypes$1.func,
    onInvalid: propTypes$1.func,
    onValidated: propTypes$1.func,
    name: propTypes$1.string.isRequired // form elements must have name!
  };

  var createInput = function createInput(inputType) {
    var Wrapped = React.forwardRef(
    function (_ref,

















    ref)
    {var onBlur = _ref.onBlur,onClick = _ref.onClick,onChange = _ref.onChange,onFocus = _ref.onFocus,validation = _ref.validation,other = _ref.other,recheck = _ref.recheck,blur = _ref.blur,change = _ref.change,click = _ref.click,onError = _ref.onError,onValid = _ref.onValid,onInvalid = _ref.onInvalid,onValidated = _ref.onValidated,rest = _objectWithoutProperties(_ref, ["onBlur", "onClick", "onChange", "onFocus", "validation", "other", "recheck", "blur", "change", "click", "onError", "onValid", "onInvalid", "onValidated"]);
      var innerRef = React.useRef(ref);var _useValidation =






      useValidation(innerRef, {
        onBlur: onBlur,
        onChange: onChange,
        onClick: onClick,
        onFocus: onFocus,
        validation: validation,
        other: other,
        recheck: recheck,
        blur: blur,
        change: change,
        click: click,
        onError: onError,
        onValid: onValid,
        onInvalid: onInvalid,
        onValidated: onValidated }),handleBlur = _useValidation.handleBlur,handleChange = _useValidation.handleChange,handleClick = _useValidation.handleClick,handleFocus = _useValidation.handleFocus;


      return React__default.createElement(inputType, _objectSpread2({
        ref: innerRef,
        onBlur: handleBlur,
        onChange: handleChange,
        onClick: handleClick,
        onFocus: handleFocus },
      rest));

    });


    Wrapped.displayName = "Validated(".concat(inputType, ")");
    Wrapped.propTypes = propTypes;

    var memoized = React.memo(Wrapped);
    memoized.displayName = "Memo(".concat(Wrapped.displayName, ")");
    return Wrapped;
  };

  var Input = createInput('input');
  var Select = createInput('select');
  var TextArea = createInput('textarea');

  var mapDeep = function mapDeep(children, fn) {return (
      React.Children.map(children, function (child, index) {return (
          React.isValidElement(child) &&
          React.Children.toArray(child.props.children).some(function (child) {return (
              React.isValidElement(child));}) ?

          fn(
          React.cloneElement(child, _objectSpread2({},
          child.props, {
            children: mapDeep(child.props.children, fn) })),

          index) :

          fn(child, index));}));};


  var getCtorFromItem = function getCtorFromItem(item) {
    if (!React.isValidElement(item)) return null;
    if (item.type === 'input') return Input;
    if (item.type === 'select') return Select;
    if (item.type === 'textarea') return TextArea;
    return null;
  };

  var Validator = function Validator(_ref) {var children = _ref.children,rest = _objectWithoutProperties(_ref, ["children"]);var _useState =
    React.useState(null),_useState2 = _slicedToArray(_useState, 2),error = _useState2[0],setError = _useState2[1];var _useState3 =
    React.useState(null),_useState4 = _slicedToArray(_useState3, 2),valid = _useState4[0],setValid = _useState4[1];var _useState5 =
    React.useState(null),_useState6 = _slicedToArray(_useState5, 2),invalid = _useState6[0],setInvalid = _useState6[1];var _useState7 =
    React.useState(null),_useState8 = _slicedToArray(_useState7, 2),validated = _useState8[0],setValidated = _useState8[1];
    var handleError = React.useCallback(function (e) {return setError(e);}, []);
    var handleValid = React.useCallback(function (e) {return setValid(e);}, []);
    var handleInvalid = React.useCallback(function (e) {return setInvalid(e);}, []);
    var handleValidated = React.useCallback(function (e) {return setValidated(e);}, []);
    return mapDeep(children({ error: error, valid: valid, invalid: invalid, validated: validated }), function (item) {
      var myCtor = getCtorFromItem(item);
      if (myCtor == null) return item;
      return React.createElement(myCtor, _objectSpread2({},
      rest, {
        onError: handleError,
        onValid: handleValid,
        onInvalid: handleInvalid,
        onValidated: handleValidated },
      item.props));

    });
  };

  Validator.propTypes = {
    children: propTypes$1.func.isRequired,
    validation: propTypes$1.oneOfType([propTypes$1.func, propTypes$1.arrayOf(propTypes$1.func)]) };


  var memoized$1 = React.memo(Validator);
  memoized$1.displayName = "Memo(".concat(Validator.displayName, ")");

  exports.Form = memoized;
  exports.FormContext = FormContext;
  exports.Input = Input;
  exports.Select = Select;
  exports.TextArea = TextArea;
  exports.Validator = Validator;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
