import React, { useEffect, useReducer, useMemo } from 'react'
import PropTypes from 'prop-types'
import { FormContext } from './reducer/FormContext'
import {
    formComponentReducerInit, formComponentReducer, getFormFilteredValues
} from './reducer/FormComponentReducer'

function FormComponent({ 
    children,
    formSubmit,
    clearFieldsAfterSubmit,
    additionalContextProps,
    formGlobalErrorName = 'globalError',
 }) {
    const reducerData = useReducer(formComponentReducer, formGlobalErrorName, formComponentReducerInit)
    const [state, dispatch] = reducerData
    const formContextValue = useMemo(() => [state, dispatch, additionalContextProps], [state, additionalContextProps])
    useEffect(() => {
        let isMounted = true
        if (state.isSubmitted) {
            const values = getFormFilteredValues(state)
            formSubmit(values).then(errors => {
                isMounted && dispatch({ type: 'finishSubmit', clearFieldsAfterSubmit, errors })
            })
        }
        return () => isMounted = false
    }, [state.isSubmitted, clearFieldsAfterSubmit])

    return (
        <FormContext.Provider value={formContextValue}>
            {children}
        </FormContext.Provider>
    )
 }

export default React.memo(FormComponent)

FormComponent.propTypes = {
    formSubmit: PropTypes.func.isRequired, // async (values) => {}
    clearFieldsAfterSubmit: PropTypes.bool,
    additionalContextProps: PropTypes.object,
    formGlobalErrorName: PropTypes.string,
}
