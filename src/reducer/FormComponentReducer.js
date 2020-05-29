export function formComponentReducerInit(formGlobalErrorName = 'globalError') {
    const formComponentInitialState = {
        fields: [],
        values: {},
        defaultValues: {},
        errors: { 
            [formGlobalErrorName]: undefined,
        },
        fieldActiveMap: { },
        isSubmitted: false,
        formGlobalErrorName,
        dependenciesMap: {}
    }
    return formComponentInitialState
}
  
export function formComponentReducer(state, action) {
    switch (action.type) {
        case 'add': {
            const newField = { 
                name: action.name,
                validators: action.validators,
                valueFilter: action.valueFilter,
                validateOnBlur: action.validateOnBlur,
            }
            const values = { ...state.values, [action.name]: action.value }
            const errors = { ...state.errors, [action.name]: undefined }
            const defaultValues = { ...state.defaultValues, [action.name]: action.value }
            const fieldActiveMap = { ...state.fieldActiveMap, [action.name]: action.enabled }
            const fields = [ ...state.fields, newField ]
            const dependenciesMap = { ...state.dependenciesMap }
            if (action.dependencies) {
                action.dependencies.forEach(fname => {
                    dependenciesMap[fname] = { ...dependenciesMap[fname], [action.name]: true }
                })
            }
            return { ...state, fields, values, errors, dependenciesMap, fieldActiveMap, defaultValues }
        }

        case 'value': {
            if (state.values[action.name] !== action.value && (!action.condition || action.condition(state))) {
                const values = { ...state.values, [action.name]: action.value }
                const errors = { ...state.errors, [state.formGlobalErrorName]: undefined }
                const defaultValues = action.updateDefaultValue 
                    ? { ...state.defaultValues, [action.name]: action.value }
                    : state.defaultValues

                const field = state.fields.find(x => x.name == action.name)
                if (!field.validateOnBlur || !!errors[action.name]) {
                    errors[action.name] = validateField(field, values, errors, state.fieldActiveMap) 
                }
                if (action.name in state.dependenciesMap) {
                    const namesMap = state.dependenciesMap[action.name]
                    state.fields.forEach(field => {
                        if (field.name in namesMap) {
                            errors[field.name] = validateField(field, values, errors, state.fieldActiveMap)
                        }
                    })
                }
                return { ...state, values, errors, defaultValues }
            }
            return state
        }
        
        case 'error': {
            const rn = action.name !== null && action.name !== undefined ? action.name : state.formGlobalErrorName
            const errors = { ...state.errors, [rn]: action.error }
            return { ...state, errors }
        }

        case 'enable': {
            if (state.fieldActiveMap[action.name] !== action.value) {
                const fieldActiveMap = { ...state.fieldActiveMap, [action.name]: action.value }
                const errors = { ...state.errors, [action.name]: undefined }
                return { ...state, fieldActiveMap, errors }
            }
            return state
        }

        case 'validateAll': {
            const errors = { [state.formGlobalErrorName]: undefined }
            state.fields.forEach(field => errors[field.name] = validateField(field, state.values, state.errors, state.fieldActiveMap))
            return { ...state, errors }
        }

        case 'validate': {
            const field = state.fields.find(x => x.name == action.name)
            const error = validateField(field, state.values, state.errors, state.fieldActiveMap)
            if (error !== state.errors[action.name]) {
                const errors = { ...state.errors, [action.name]: error }
                return { ...state, errors }
            }
            return state
        }

        case 'submit': {
            const errors = { [state.formGlobalErrorName]: undefined }
            state.fields.forEach(field => errors[field.name] = validateField(field, state.values, state.errors, state.fieldActiveMap))
            const newState = { ...state, errors }
            newState.isSubmitted = !hasErrors(newState)
            return newState
        }

        case 'finishSubmit': {
            const errors = { [state.formGlobalErrorName]: undefined }
            const values = { ...state.values }
            if (action.errors) {
                // errors should be object -> key is field name, value should be object ({ message: 'error' }) or error string
                for (let name in action.errors) {
                    const rn = name !== 'null' && name !== 'undefined' ? name : state.formGlobalErrorName
                    const error = action.errors[name]
                    errors[rn] = !error || typeof error == 'string' || error instanceof String
                        ? error : error.message
               }
            }
            // reset fields to default values only if there are no errors and clearFieldsAfterSubmit is set
            else if (action.clearFieldsAfterSubmit) {
                state.fields.forEach(field => {
                    values[field.name] = state.defaultValues[field.name]
                })
            }
            
            return { ...state, isSubmitted: false, values, errors }
        }

        default:
            throw new Error('formComponentReducer unknown action type: ' + action.type);
    }
}

export function getFormFilteredValues(state) {
    const values = state.fields.reduce((map, field) => { 
        map[field.name] = getFieldValue(field, state.values[field.name])
        return map
    }, {})
    return values
}

export function hasErrors({ errors, formGlobalErrorName }, includeGlobalError = false) {
    return !!errors && Object.keys(errors).some(name => !!errors[name] && (includeGlobalError || name != formGlobalErrorName))
}

function validateField(field, values, errors, fieldActiveMap) {
    if (!field.validators || !fieldActiveMap[field.name]) {
        return undefined
    }

    const value = getFieldValue(field, values[field.name])
    if (Array.isArray(field.validators)) {
        const error = field.validators.find(x => !x.func(value, values, errors))
        return error ? error.message : undefined
    }
    
    return !field.validators.func(value, values, errors) ? field.validators.message : undefined
}

function getFieldValue(field, value) {
    if (field.valueFilter) {
        value = field.valueFilter(value)
    }
    return value
}
