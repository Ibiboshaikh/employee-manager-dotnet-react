import { useState } from "react";

function useSort(initialField) {
    const [sort, setSort] = useState({field: initialField, order: "asc"});
    
    const handleSort = (field) => {
        if(field === sort.field) {
            setSort({
                field: field,
                order: sort.order === "asc" ? "desc" : "asc"
            });
            return;
        }
        setSort({
            field: field,
            order: "asc"
        });
    }
    return [sort, handleSort];
} 
export default useSort;