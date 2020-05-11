import { useEffect } from 'react'
import { useFormContext } from './ContextHooks'

export default function useFormField({
    name, validators, 
    valueFilter, dependencies,
    value, refreshValue,
    validateOnBlur, fieldEnabled
}) {
    const [ state, dispatch, additionalContextProps ] = useFormContext()

    // register field in reducer
    useEffect(() => {
        const action = { 
            type: 'add',
            name,
            value,
            validators,
            valueFilter,
            dependencies,
            validateOnBlur,
            enabled: fieldEnabled,
        }
        dispatch(action)
    }, [])

    // set refreshValue props to true in order to change value in reducer whenever value prop has been changed
    useEffect(() => {
        if (refreshValue) {
            dispatch({ type: 'value', name, value })
        }
    }, [value, refreshValue])

    const error = state.errors[name]
    const valueCurrent = state.values[name] !== undefined ? state.values[name] : value
    const fieldEnabledCurrent = state.fieldActiveMap[name] !== undefined ? state.fieldActiveMap[name] : fieldEnabled
    return [ valueCurrent, error, fieldEnabledCurrent, dispatch, additionalContextProps ]
}