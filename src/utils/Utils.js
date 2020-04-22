export const getMergedProps = function(props1, props2) {
    const result = Object.keys(props2).reduce(function (acc, key) {
        const value = props2[key]
        if (value !== undefined) {
            acc[key] = value
        }
        return acc
    }, { ...props1 })
    return result
}