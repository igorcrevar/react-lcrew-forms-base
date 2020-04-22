import React, { useCallback } from 'react'
import useFormSubmit from './hooks/FormSubmitHook'
import { getMergedProps } from './utils/Utils'

export default function FormFieldSubmitComponent({ 
        Template,
        disabled: buttonDisabled,
        ...otherProps
    }) {
    const [ isSubmitted, disabled, dispatch, additionalContextProps ] = useFormSubmit()
    const onSubmit = useCallback(() => dispatch({ type: 'submit' }), [])

    const TemplateComponent = Template || additionalContextProps.SubmitTemplate
    const mergedProps = getMergedProps(additionalContextProps, otherProps)
    return <TemplateComponent {...mergedProps} onSubmit={onSubmit}
        isSubmitted={isSubmitted} disabled={disabled || buttonDisabled} dispatch={dispatch} />
}