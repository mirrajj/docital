import React, { useState, useRef } from 'react';
import useFetchRecords from '../hooks/useFetchRecords';
import DynamicTable from './DynamicTable';
import RecordsHeader from './RecordsHeader';
import {jsPDF}from 'jspdf';
import html2canvas from 'html2canvas';
import AppAlert from '../../../common/AppAlert';


const RecordList = () => {
    
    const [showError, setShowError] = useState({state: false, message : ""});
    const [data, setData] = useState({nodes : []});
    const [columns,setColumns] = useState([]);
    const [skeletonColumns,setSkeletonColumns] = useState([1,2,3,4,5]);
    // State to store current user selections
    const [currentTable, setCurrentTable] = useState(null);
    const [currentFilterField, setCurrentFilterField] = useState(null);
    const [currentFilterValue, setCurrentFilterValue] = useState(null);

    const {loading, error, fetchData} = useFetchRecords(setShowError);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Default limit
    
    // const LIMIT = 2;

    const tableRef = useRef(null);

      // Function to handle PDF download
    const handleDownloadPdf = async () => {
        const tableElement = tableRef.current;

        // Use html2canvas to capture the table as an image
        const canvas = await html2canvas(tableElement);

        // Convert the canvas to a data URL
        const imgData = canvas.toDataURL("image/png");

        // Create a new PDF instance
        const pdf = new jsPDF("p", "mm", "a4"); // Portrait, millimeters, A4 size

        // Get the dimensions of the PDF page
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        // pdf.text("Table Report", pdfWidth / 2, 10, { align: "center" });

        // Get the dimensions of the captured image
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Calculate the aspect ratio of the image
        const ratio = imgWidth / imgHeight;

        // Fit the image within the PDF page
        let imgFinalWidth = pdfWidth;
        let imgFinalHeight = pdfWidth / ratio;

        if (imgFinalHeight > pdfHeight) {
            imgFinalHeight = pdfHeight;
            imgFinalWidth = pdfHeight * ratio;
        }

        // Add the image to the PDF
        pdf.addImage(imgData, "PNG", 0, 0, imgFinalWidth, imgFinalHeight);

        // Save the PDF
        pdf.save("table.pdf");
    };

    const filterColumns = (columns) => {
        const filteredColumns = columns.filter((column) => !column.includes("ID"));
        return filteredColumns;
    }
    function formatText(str) {
        return str.includes('_') ? str.replace(/_/g, ' ').toUpperCase() : str.toUpperCase();
    }
    
    const flattenData = (data) => {
        return data.map((item) => {
            const flattened = {};
            Object.keys(item).forEach((key) => {
                if (typeof item[key] === 'object' && item[key] !== null) {
                    Object.keys(item[key]).forEach((nestedKey) => {
                        const formattedKey = formatText(key);
                        flattened[formattedKey] = item[key][nestedKey]; //flattens the nested object but returns just the parent columns' key instead of concating with the nested key
                    });
                } else {
                    const formattedKey = formatText(key);
                    flattened[formattedKey] = item[key];
                }
            });
            // console.log(flattened);
            return flattened;
        });
    };

       // Handle category change
    const handleCategoryChange = async (category,filterField,filterValue,start_date,end_date) => {
        // Update current selections
        setCurrentTable(category);
        setCurrentFilterField(filterField);
        setCurrentFilterValue(filterValue);

        // Reset to the first page when the category changes
        setCurrentPage(1);

       
        const result = await fetchData(category,filterField ,filterValue,currentPage,itemsPerPage,start_date,end_date);
        const flattenedData = flattenData(result ? result : []);
        setData({nodes : flattenedData || []});

        if (flattenedData.length > 0) {
            const columns  = Object.keys(flattenedData[0]) || [];
            const filteredColumns = filterColumns(columns);
            setColumns(filteredColumns);
        }

    };

    const onPaginationChange = async  (newPage) =>  {
        setCurrentPage(newPage);
        const result = await fetchData(currentTable,currentFilterField ,currentFilterValue,newPage,itemsPerPage);
        const flattenedData = flattenData(result ? result : []);
        setData({nodes : flattenedData || []});
    }
    

    return (
        <>
        
            {showError.state && (
                <AppAlert
                    type="error"
                    message={showError.message}
                    onClose={() => setShowError(false)}
                />
            )}
            <RecordsHeader onCategoryChange={handleCategoryChange} handleDownloadPdf={handleDownloadPdf} />
            {
                loading ? (
                    
                    <div className='w-full border rounded-lg overflow-hidden'>
                        <table className='w-full'>
                            <thead>
                                <tr className='bg-gray-50 border-b'>
                                    {skeletonColumns.map((column, index) => (
                                        <th key={index} className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            {column.label || column.key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, index) => (
                                    <tr key={index}>
                                        {skeletonColumns.map((column, colIndex) => (
                                            <td key={colIndex} className='px-6 py-4 whitespace-nowrap'>
                                                <div className='h-4 bg-gray-200 rounded animate-pulse'></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                
                ) : !data.nodes.length ? (
                    <div className='w-full border rounded-lg overflow-hidden'>
                        <table className='w-full'>
                            <thead>
                                <tr className='bg-gray-50 border-b'>
                                    {columns.map((column, index) => (
                                        <th key={index} className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                            {column.label || column.key}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={columns.length} className='px-6 py-12 text-center text-gray-500 border-b'>
                                        <div className='flex flex-col items-center justify-center'>
                                            <svg className='w-12 h-12 text-gray-300 mb-3' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' />
                                            </svg>
                                            <p className='text-sm font-medium'>No data available</p>
                                            <p className='text-xs text-gray-400 mt-1'>There are currently no records to display</p>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <DynamicTable data={data.nodes} columns={columns} tableRef={tableRef} title={currentTable} />
                )
            }
            {/* Pagination Controls */}
            <div className="border px-4 py-2 w-fit rounded-lg flex gap-4 text-xs font-semibold text-gray-500">
                <button
                    onClick={() => onPaginationChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Prev
                </button>
                <span className='border-x px-2'>Page {currentPage}</span>
                <button
                    onClick={() => onPaginationChange(currentPage + 1)}
                    disabled={data.nodes.length < itemsPerPage} // Disable if fewer items are returned than the limit
                >
                    Next
                </button>
            </div>

        </>
    );
}

export default RecordList;
