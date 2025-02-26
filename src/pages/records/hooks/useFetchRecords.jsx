import { useState } from "react";
import supabase from "../../../config/supabaseClient";

const useFetchRecords = (setShowError) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch function to be called from the parent component
    const fetchData = async (tableName, filterField = null, filterValue = null, page = 1, limit = 10,startDate,endDate) => {
        // console.log("inside fetch data");
        setLoading(true);
        setError(null);


        try {
            const offset = (page - 1) * limit;
            let query;
          
            if (tableName === "task_completion") {
                // Special case: Join with the task table to get the task name
                console.log("fetching general task record");
                // task:task_id(task_name), 
                query = supabase
                .from(tableName)
                .select(`
                  verified_at,
                  completion_time,
                  completion_notes,
                  task:task_id(task_name),
                  verified_by:verified_by(name),
                  completed_by:completed_by(name)
                `)
                .range(offset, offset + limit - 1);
            } else {
                // Default case: Select all columns, but check for foreign keys and join referenced tables
                // console.log("fetching data collection task record");

                // Step 1: Fetch the table_id based on the table_name
                const { data: tableData, error: tableError } = await supabase
                    .from("tables_metadata")
                    .select("table_id")
                    .eq("table_name", tableName)
                    .single(); // Use .single() if you expect only one result

                if (tableError) throw tableError;

                // Step 2: Fetch column metadata for the current table
                const { data: columnMetadata, error: metadataError } = await supabase
                    .from("columns_metadata")
                    .select("*")
                    .eq("table_id", tableData.table_id); // Use the retrieved table_id

                if (metadataError) throw metadataError;

                // Step 3: Identify columns that reference other tables
                const joinColumns = columnMetadata.filter(
                    (column) =>  column.reference_table && column.reference_column && (column.soft_reference === false)
                );
                // Step 3: Build the select query, excluding original foreign key columns
                const baseColumns = columnMetadata
                    .filter((column) => !column.reference_table) // Exclude foreign key columns
                    .map((column) => column.column_name); // Get column names

                // Step 4: Build the select query with joins
                let selectQuery = baseColumns.join(", "); // Start with selecting all columns
                joinColumns.forEach((column) => {
                    // Add a join for each referenced table
                    selectQuery += `, ${column.column_name}:${column.column_name} (${column.reference_column})`;
                });
               
                // Step 5: Execute the query
                query = supabase
                    .from(tableName)
                    .select(selectQuery)
                    .range(offset, offset + limit - 1);
            }

            // Add filter if provided
            if (filterField && filterValue) {
                query = query.eq(filterField, filterValue);
            }
            // Apply date filter if provided
            if (startDate && endDate) {
                query = query.gte("created_at", startDate).lte("created_at", endDate);
            }

            const { data: fetchedData, error } = await query;

            if (error) throw error;
            // setData(fetchedData);
            console.log(fetchedData);
           
            return fetchedData;

        } catch (err) {
            setError(err.message);
            console.log(err);
            setShowError({state : true, message : `${err}`})
        } finally {
            setLoading(false);
        }
    };


    return { loading, error, fetchData };
};

export default useFetchRecords;