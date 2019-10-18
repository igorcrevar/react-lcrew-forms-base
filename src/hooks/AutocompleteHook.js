import { useEffect, useCallback, useMemo, useState } from 'react'

const emptyArray = []

export default function useAutocomplete(
    items, selectedItems, setSelectedItems, getItemId, filterItems, 
    searchTimeout, maxItemsCount, maxSelectedItemsCount) {

    const [searchText, setSearchText] = useState('')
    const [availableItems, setAvailableItems] = useState(undefined)

    const itemsMap = useMemo(() => {
        return (items || emptyArray).reduce((acc, x) => {
            acc[getItemId(x)] = x
            return acc
        }, {})
    }, [items])

    // if itemsMap changed (items), old selected items which are not anymore in items lists should be removed
    useEffect(() => {
        const newSelectedItems = selectedItems.filter(x => x in itemsMap)
        if (selectedItems.length < newSelectedItems.length) {
            setSelectedItems(newSelectedItems)
        }
    }, [items])

    // on search text changed update available items (with timeout)
    useEffect(() => {
        if (!searchText) {
            setAvailableItems(emptyArray)
        }
        else {
            const timer = setTimeout(() => {
                let availableItems = filterItems(items || emptyArray, searchText)
                if (availableItems) {
                    availableItems = availableItems.filter(x => !selectedItems.includes(getItemId(x)))
                                                .slice(0, maxItemsCount)
                }
                setAvailableItems(availableItems)
            }, searchTimeout)
            return () => clearTimeout(timer)
        }
    }, [items, searchText])

    const onItemPress = useCallback(item => {
        const id = getItemId(item)
        if (!selectedItems.some(x => x === id) && (!maxSelectedItemsCount || maxSelectedItemsCount > selectedItems.length)) {
            const newSelectedItems = [...selectedItems, id]
            setSearchText('')
            setSelectedItems(newSelectedItems)
        }
    }, [selectedItems])

    const onRemoveSelectedItemPress = useCallback(item => {
        const id = getItemId(item)
        const newSelectedItems = selectedItems.filter(x => x !== id)
        setSearchText('')
        setSelectedItems(newSelectedItems)
    }, [selectedItems])

    const onSearchTextChange = useCallback(value => {
        setSearchText(value)
    }, [])

    return [availableItems, searchText, onSearchTextChange, onItemPress, onRemoveSelectedItemPress, itemsMap]
}