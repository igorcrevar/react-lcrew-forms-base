import { hasErrors } from '../reducer/FormComponentReducer'
import { useFormContext } from './ContextHooks'

export default function useFormSubmit() {
    const [ state, dispatch, additionalContextProps ] = useFormContext()
    const isSubmitted = state.isSubmitted
    const disabled = isSubmitted || hasErrors(state)
    return [ isSubmitted, disabled, dispatch, additionalContextProps ]
}