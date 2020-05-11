Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var PropTypes = require('prop-types');

var FormContext = React.createContext(null);

function formComponentReducerInit(formGlobalErrorName) {
  var obj;
  if (formGlobalErrorName === void 0) formGlobalErrorName = 'globalError';
  var formComponentInitialState = {
    fields: [],
    values: {},
    errors: (obj = {}, obj[formGlobalErrorName] = undefined, obj),
    fieldActiveMap: {},
    isSubmitted: false,
    formGlobalErrorName: formGlobalErrorName,
    dependenciesMap: {}
  };
  return formComponentInitialState;
}
function formComponentReducer(state, action) {
  var obj, obj$1, obj$2, obj$3, obj$4, obj$5, obj$6, obj$7, obj$8;

  switch (action.type) {
    case 'add':
      {
        var newField = {
          name: action.name,
          validators: action.validators,
          defaultValue: action.value,
          valueFilter: action.valueFilter,
          validateOnBlur: action.validateOnBlur
        };
        var values = Object.assign({}, state.values, (obj = {}, obj[action.name] = action.value, obj));
        var errors = Object.assign({}, state.errors, (obj$1 = {}, obj$1[action.name] = undefined, obj$1));
        var fieldActiveMap = Object.assign({}, state.fieldActiveMap, (obj$2 = {}, obj$2[action.name] = action.enabled, obj$2));
        var fields = state.fields.concat([newField]);
        var dependenciesMap = Object.assign({}, state.dependenciesMap);

        if (action.dependencies) {
          action.dependencies.forEach(function (fname) {
            var obj;
            dependenciesMap[fname] = Object.assign({}, dependenciesMap[fname], (obj = {}, obj[action.name] = true, obj));
          });
        }

        return Object.assign({}, state, {
          fields: fields,
          values: values,
          errors: errors,
          dependenciesMap: dependenciesMap,
          fieldActiveMap: fieldActiveMap
        });
      }

    case 'value':
      {
        if (state.values[action.name] !== action.value && (!action.condition || action.condition(state))) {
          var values$1 = Object.assign({}, state.values, (obj$3 = {}, obj$3[action.name] = action.value, obj$3));
          var errors$1 = Object.assign({}, state.errors, (obj$4 = {}, obj$4[state.formGlobalErrorName] = undefined, obj$4));
          var field = state.fields.find(function (x) {
            return x.name == action.name;
          });

          if (!field.validateOnBlur || !!errors$1[action.name]) {
            errors$1[action.name] = validateField(field, values$1, errors$1, state.fieldActiveMap);
          }

          if (action.name in state.dependenciesMap) {
            var namesMap = state.dependenciesMap[action.name];
            state.fields.forEach(function (field) {
              if (field.name in namesMap) {
                errors$1[field.name] = validateField(field, values$1, errors$1, state.fieldActiveMap);
              }
            });
          }

          return Object.assign({}, state, {
            values: values$1,
            errors: errors$1
          });
        }

        return state;
      }

    case 'error':
      {
        var rn = action.name !== null && action.name !== undefined ? action.name : state.formGlobalErrorName;
        var errors$2 = Object.assign({}, state.errors, (obj$5 = {}, obj$5[rn] = action.error, obj$5));
        return Object.assign({}, state, {
          errors: errors$2
        });
      }

    case 'enable':
      {
        if (state.fieldActiveMap[action.name] !== action.value) {
          var fieldActiveMap$1 = Object.assign({}, state.fieldActiveMap, (obj$6 = {}, obj$6[action.name] = action.value, obj$6));
          var errors$3 = Object.assign({}, state.errors, (obj$7 = {}, obj$7[action.name] = undefined, obj$7));
          return Object.assign({}, state, {
            fieldActiveMap: fieldActiveMap$1,
            errors: errors$3
          });
        }

        return state;
      }

    case 'validateAll':
      {
        var errors$4 = {};
        errors$4[state.formGlobalErrorName] = undefined;
        state.fields.forEach(function (field) {
          return errors$4[field.name] = validateField(field, state.values, state.errors, state.fieldActiveMap);
        });
        return Object.assign({}, state, {
          errors: errors$4
        });
      }

    case 'validate':
      {
        var field$1 = state.fields.find(function (x) {
          return x.name == action.name;
        });
        var error = validateField(field$1, state.values, state.errors, state.fieldActiveMap);

        if (error !== state.errors[action.name]) {
          var errors$5 = Object.assign({}, state.errors, (obj$8 = {}, obj$8[action.name] = error, obj$8));
          return Object.assign({}, state, {
            errors: errors$5
          });
        }

        return state;
      }

    case 'submit':
      {
        var errors$6 = {};
        errors$6[state.formGlobalErrorName] = undefined;
        state.fields.forEach(function (field) {
          return errors$6[field.name] = validateField(field, state.values, state.errors, state.fieldActiveMap);
        });
        var newState = Object.assign({}, state, {
          errors: errors$6
        });
        newState.isSubmitted = !hasErrors(newState);
        return newState;
      }

    case 'finishSubmit':
      {
        var errors$7 = {};
        errors$7[state.formGlobalErrorName] = undefined;
        var values$2 = Object.assign({}, state.values);

        if (action.errors) {
          // errors should be object -> key is field name, value should be object ({ message: 'error' }) or error string
          for (var name in action.errors) {
            var rn$1 = name !== 'null' && name !== 'undefined' ? name : state.formGlobalErrorName;
            var error$1 = action.errors[name];
            errors$7[rn$1] = !error$1 || typeof error$1 == 'string' || error$1 instanceof String ? error$1 : error$1.message;
          }
        } // reset fields to default values only if there are no errors and clearFieldsAfterSubmit is set
        else if (action.clearFieldsAfterSubmit) {
            state.fields.forEach(function (field) {
              values$2[field.name] = field.defaultValue;
            });
          }

        return Object.assign({}, state, {
          isSubmitted: false,
          values: values$2,
          errors: errors$7
        });
      }

    default:
      throw new Error('formComponentReducer unknown action type: ' + action.type);
  }
}
function getFormFilteredValues(state) {
  var values = state.fields.reduce(function (map, field) {
    map[field.name] = getFieldValue(field, state.values[field.name]);
    return map;
  }, {});
  return values;
}
function hasErrors(ref, includeGlobalError) {
  var errors = ref.errors;
  var formGlobalErrorName = ref.formGlobalErrorName;
  if (includeGlobalError === void 0) includeGlobalError = false;
  return !!errors && Object.keys(errors).some(function (name) {
    return !!errors[name] && (includeGlobalError || name != formGlobalErrorName);
  });
}

function validateField(field, values, errors, fieldActiveMap) {
  if (!field.validators || !fieldActiveMap[field.name]) {
    return undefined;
  }

  var value = getFieldValue(field, values[field.name]);

  if (Array.isArray(field.validators)) {
    var error = field.validators.find(function (x) {
      return !x.func(value, values, errors);
    });
    return error ? error.message : undefined;
  }

  return !field.validators.func(value, values, errors) ? field.validators.message : undefined;
}

function getFieldValue(field, value) {
  if (field.valueFilter) {
    value = field.valueFilter(value);
  }

  return value;
}

function FormComponent(ref) {
  var children = ref.children;
  var formSubmit = ref.formSubmit;
  var clearFieldsAfterSubmit = ref.clearFieldsAfterSubmit;
  var additionalContextProps = ref.additionalContextProps;
  var formGlobalErrorName = ref.formGlobalErrorName;
  if (formGlobalErrorName === void 0) formGlobalErrorName = 'globalError';
  var reducerData = React.useReducer(formComponentReducer, formGlobalErrorName, formComponentReducerInit);
  var state = reducerData[0];
  var dispatch = reducerData[1];
  var formContextValue = React.useMemo(function () {
    return [state, dispatch, additionalContextProps];
  }, [state, additionalContextProps]);
  React.useEffect(function () {
    var isMounted = true;

    if (state.isSubmitted) {
      var values = getFormFilteredValues(state);
      formSubmit(values).then(function (errors) {
        isMounted && dispatch({
          type: 'finishSubmit',
          clearFieldsAfterSubmit: clearFieldsAfterSubmit,
          errors: errors
        });
      });
    }

    return function () {
      return isMounted = false;
    };
  }, [state.isSubmitted, clearFieldsAfterSubmit]);
  return React.createElement(FormContext.Provider, {
    value: formContextValue
  }, children);
}

var FormComponent$1 = React.memo(FormComponent);
FormComponent.propTypes = {
  formSubmit: PropTypes.func.isRequired,
  // async (values) => {}
  clearFieldsAfterSubmit: PropTypes.bool,
  additionalContextProps: PropTypes.object,
  formGlobalErrorName: PropTypes.string
};

function useFormContext() {
  return React.useContext(FormContext);
}
function useFormContextError(name) {
  var ref = React.useContext(FormContext);
  var state = ref[0];
  return state.errors[name || state.formGlobalErrorName];
}
function useFormContextValue(name) {
  var ref = React.useContext(FormContext);
  var state = ref[0];
  return state.values[name];
}
function useFormContextEnabled(name) {
  var ref = React.useContext(FormContext);
  var state = ref[0];
  return state.fieldActiveMap[name];
}

function useFormField(ref) {
  var name = ref.name;
  var validators = ref.validators;
  var valueFilter = ref.valueFilter;
  var dependencies = ref.dependencies;
  var value = ref.value;
  var refreshValue = ref.refreshValue;
  var validateOnBlur = ref.validateOnBlur;
  var fieldEnabled = ref.fieldEnabled;
  var ref$1 = useFormContext();
  var state = ref$1[0];
  var dispatch = ref$1[1];
  var additionalContextProps = ref$1[2]; // register field in reducer

  React.useEffect(function () {
    var action = {
      type: 'add',
      name: name,
      value: value,
      validators: validators,
      valueFilter: valueFilter,
      dependencies: dependencies,
      validateOnBlur: validateOnBlur,
      enabled: fieldEnabled
    };
    dispatch(action);
  }, []); // set refreshValue props to true in order to change value in reducer whenever value prop has been changed

  React.useEffect(function () {
    if (refreshValue) {
      dispatch({
        type: 'value',
        name: name,
        value: value
      });
    }
  }, [value, refreshValue]);
  var error = state.errors[name];
  var valueCurrent = state.values[name] !== undefined ? state.values[name] : value;
  var fieldEnabledCurrent = state.fieldActiveMap[name] !== undefined ? state.fieldActiveMap[name] : fieldEnabled;
  return [valueCurrent, error, fieldEnabledCurrent, dispatch, additionalContextProps];
}

var getMergedProps = function (props1, props2) {
  var result = Object.keys(props2).reduce(function (acc, key) {
    var value = props2[key];

    if (value !== undefined) {
      acc[key] = value;
    }

    return acc;
  }, Object.assign({}, props1));
  return result;
};

function FormFieldComponent(props) {
  var ref = useFormField(props);
  var value = ref[0];
  var error = ref[1];
  var fieldEnabled = ref[2];
  var dispatch = ref[3];
  var additionalContextProps = ref[4];
  var name = props.name;
  var onBlur = props.onBlur;
  var validateOnBlur = props.validateOnBlur;
  var Template = props.Template;
  var templateChangeValue = React.useCallback(function (newValue) {
    dispatch({
      type: 'value',
      name: name,
      value: newValue
    });
  }, [name]);
  var templateOnBlur = React.useCallback(function () {
    if (validateOnBlur) {
      dispatch({
        type: 'validate',
        name: name
      });
    }

    if (onBlur) {
      onBlur(name, value, error, dispatch);
    }
  }, [name, value, error]);
  var ComponentTemplate = Template || additionalContextProps.Template;
  var mergedProps = getMergedProps(additionalContextProps, props);
  return React.createElement(ComponentTemplate, Object.assign({}, mergedProps, {
    value: value,
    error: error,
    fieldEnabled: fieldEnabled,
    dispatch: dispatch,
    onBlur: templateOnBlur,
    changeValue: templateChangeValue
  }));
}

function useFormSubmit() {
  var ref = useFormContext();
  var state = ref[0];
  var dispatch = ref[1];
  var additionalContextProps = ref[2];
  var isSubmitted = state.isSubmitted;
  var disabled = isSubmitted || hasErrors(state);
  return [isSubmitted, disabled, dispatch, additionalContextProps];
}

function objectWithoutProperties(obj, exclude) {
  var target = {};

  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && exclude.indexOf(k) === -1) target[k] = obj[k];

  return target;
}
function FormFieldSubmitComponent(ref) {
  var Template = ref.Template;
  var buttonDisabled = ref.disabled;
  var rest = objectWithoutProperties(ref, ["Template", "disabled"]);
  var otherProps = rest;
  var ref$1 = useFormSubmit();
  var isSubmitted = ref$1[0];
  var disabled = ref$1[1];
  var dispatch = ref$1[2];
  var additionalContextProps = ref$1[3];
  var onSubmit = React.useCallback(function () {
    return dispatch({
      type: 'submit'
    });
  }, []);
  var TemplateComponent = Template || additionalContextProps.SubmitTemplate;
  var mergedProps = getMergedProps(additionalContextProps, otherProps);
  return React.createElement(TemplateComponent, Object.assign({}, mergedProps, {
    onSubmit: onSubmit,
    isSubmitted: isSubmitted,
    disabled: disabled || buttonDisabled,
    dispatch: dispatch
  }));
}

var emptyArray = [];
function useAutocomplete(items, selectedItems, setSelectedItems, getItemId, filterItems, searchTimeout, maxItemsCount, maxSelectedItemsCount) {
  var ref = React.useState('');
  var searchText = ref[0];
  var setSearchText = ref[1];
  var ref$1 = React.useState(undefined);
  var availableItems = ref$1[0];
  var setAvailableItems = ref$1[1];
  var itemsMap = React.useMemo(function () {
    return (items || emptyArray).reduce(function (acc, x) {
      acc[getItemId(x)] = x;
      return acc;
    }, {});
  }, [items]); // if itemsMap changed (items), old selected items which are not anymore in items lists should be removed

  React.useEffect(function () {
    var newSelectedItems = selectedItems.filter(function (x) {
      return x in itemsMap;
    });

    if (selectedItems.length < newSelectedItems.length) {
      setSelectedItems(newSelectedItems);
    }
  }, [items]); // on search text changed update available items (with timeout)

  React.useEffect(function () {
    if (!searchText) {
      setAvailableItems(emptyArray);
    } else {
      var timer = setTimeout(function () {
        var availableItems = filterItems(items || emptyArray, searchText);

        if (availableItems) {
          availableItems = availableItems.filter(function (x) {
            return !selectedItems.includes(getItemId(x));
          }).slice(0, maxItemsCount);
        }

        setAvailableItems(availableItems);
      }, searchTimeout);
      return function () {
        return clearTimeout(timer);
      };
    }
  }, [items, searchText]);
  var onItemPress = React.useCallback(function (item) {
    var id = getItemId(item);

    if (!selectedItems.some(function (x) {
      return x === id;
    }) && (!maxSelectedItemsCount || maxSelectedItemsCount > selectedItems.length)) {
      var newSelectedItems = selectedItems.concat([id]);
      setSearchText('');
      setSelectedItems(newSelectedItems);
    }
  }, [selectedItems]);
  var onRemoveSelectedItemPress = React.useCallback(function (item) {
    var id = getItemId(item);
    var newSelectedItems = selectedItems.filter(function (x) {
      return x !== id;
    });
    setSearchText('');
    setSelectedItems(newSelectedItems);
  }, [selectedItems]);
  var onSearchTextChange = React.useCallback(function (value) {
    setSearchText(value);
  }, []);
  return [availableItems, searchText, onSearchTextChange, onItemPress, onRemoveSelectedItemPress, itemsMap];
}

exports.Form = FormComponent$1;
exports.FormField = FormFieldComponent;
exports.FormFieldSubmit = FormFieldSubmitComponent;
exports.useAutocomplete = useAutocomplete;
exports.useFormContext = useFormContext;
exports.useFormContextEnabled = useFormContextEnabled;
exports.useFormContextError = useFormContextError;
exports.useFormContextValue = useFormContextValue;
exports.useFormField = useFormField;
exports.useFormSubmit = useFormSubmit;
