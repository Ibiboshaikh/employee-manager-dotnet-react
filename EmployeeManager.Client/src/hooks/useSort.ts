import { useState } from "react";

type SortOrder = "asc" | "desc";

export interface SortState<T> {
    field: keyof T;
    order: SortOrder;
}

function useSort<T>(initialField: keyof T): [SortState<T>, (field: keyof T) => void] {
    const [sort, setSort] = useState<SortState<T>>({
        field: initialField,
        order: "asc"
    });

    
    const handleSort = (field: keyof T) => {
        setSort(prev =>
             prev.field === field
               ? { ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }
               : { field, order: 'asc' }
           );
    }
    return [sort, handleSort];
} 
export default useSort;