import { useEffect } from 'react'
import { useFormContext } from './ContextHooks'

export default function useFormField({
    name, validators, 
    valueFilter, dependencies,
    validateOnBlur, value, fieldEnabled
}) {
    const [ state, dispatch, additionalContextProps ] = useFormContext()

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

    const error = state.errors[name]
    const valueCurrent = state.values[name] !== undefined ? state.values[name] : value
    const fieldEnabledCurrent = state.fieldActiveMap[name] !== undefined ? state.fieldActiveMap[name] : fieldEnabled
    return [ valueCurrent, error, fieldEnabledCurrent, dispatch, additionalContextProps ]
}