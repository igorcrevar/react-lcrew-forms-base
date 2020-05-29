import React, { useCallback, useState, useEffect } from 'react'
import useFormField from './hooks/FormFieldHook'
import { getMergedProps } from './utils/Utils'

export default function FormFieldComponent(props) {
    const [ value, error, fieldEnabled, dispatch, additionalContextProps ] = useFormField(props)
    // dispatch does not have callback
    // this hack ensures user onBlur handler is called after validation on blur
    const [ onBlurIndex, setOnBlurIndex ] = useState(undefined)
    const { 
        name, onBlur, validateOnBlur, Template,
    } = props
   
    const templateChangeValue = useCallback(newValue => {
        dispatch({ type: 'value', name, value: newValue })
    }, [name])
    const templateOnBlur = useCallback(() => {
        if (validateOnBlur) {
            dispatch({ type: 'validate', name })
            if (onBlur) {
                setOnBlurIndex((onBlurIndex || 0) + 1)
            }
        }
        else if (onBlur) {
            onBlur(name, value, error, dispatch)
        }
    }, [name, value, error])

    // onBlur hack
    useEffect(() => {
        if (onBlurIndex !== undefined) {
            onBlur(name, value, error, dispatch)
        }
    }, [onBlurIndex])

    const ComponentTemplate = Template || additionalContextProps.Template
    const mergedProps = getMergedProps(additionalContextProps, props)
    return <ComponentTemplate {...mergedProps}
            value={value} error={error} fieldEnabled={fieldEnabled} dispatch={dispatch}
            onBlur={templateOnBlur} changeValue={templateChangeValue} />
}
