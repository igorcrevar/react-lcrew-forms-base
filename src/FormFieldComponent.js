import React from 'react'
import { useCallback } from 'react'
import useFormField from './hooks/FormFieldHook'

export default function FormFieldComponent(props) {
    const [ value, error, fieldEnabled, dispatch, additionalContextProps ] = useFormField(props)
    const { 
        name, onBlur, validateOnBlur, Template,
    } = props
   
    const templateChangeValue = useCallback(newValue => {
        dispatch({ type: 'value', name, value: newValue })
    }, [name])
    const templateOnBlur = useCallback(() => {
        if (validateOnBlur) {
            dispatch({ type: 'validate', name })
        }
        if (onBlur) {
            onBlur(name, value, error, dispatch)
        }
    }, [name, value, error])

    return <Template {...props} {...additionalContextProps}
            value={value} error={error} fieldEnabled={fieldEnabled} dispatch={dispatch}
            onBlur={templateOnBlur} changeValue={templateChangeValue} />
}
