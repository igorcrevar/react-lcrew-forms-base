import { useContext } from 'react'
import { FormContext } from '../reducer/FormContext'

export function useFormContext() {
    return useContext(FormContext)
}

export function useFormContextError(name) {
    const [ state ] = useContext(FormContext)
    return state.errors[name || state.formGlobalErrorName]
}

export function useFormContextValue(name) {
    const [ state ] = useContext(FormContext)
    return state.values[name]
}

export function useFormContextEnabled(name) {
    const [ state ] = useContext(FormContext)
    return state.fieldActiveMap[name]
}