import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@table-library/react-table-library/theme';
import { Edit, Trash2 } from 'lucide-react';
import AuditDetails from './AuditDetails';
import Pagination from './Pagination';
import { MdArrowDropDown,MdArrowRight } from 'react-icons/md';

import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    HeaderCell,
    Cell,
    useCustom,
} from "@table-library/react-table-library/table";

const AuditList = ({ 
    filters, 
    onEditAudit, 
    onDeleteAudit, // Add this prop
    audits, 
    setSelectedAudit,
    loading,
    error,
    page,
    setPage,
    totalPages 
}) => {

    const [auditData, setAuditData] = useState({nodes: []});
    const [ids, setIds] = useState([]);
    // const [isHide, setHide] = useState(false);

    useEffect(() => {
        setAuditData({nodes: audits});
    },[audits]);

    const tableTheme = {
        Table: `
            color : #17612B;
            font-family : sans-serif;
            background-color : white;
            border : 1px solid #e5e7eb;
            border-radius : 10px;
            margin-top : 10px;
        `,
        Row: `
            background: ;
            font-size: 12px;
            color : #9ca3af;
            font-weight: 500;
        `,
        HeaderRow: `
            font-weight: 200;
            font-size : 13px;
            color : #16a34a;
            background: #e5e7eb;
            border-radius : 15px;
            border-bottom: 1px solid black;
        `,
        BaseCell: `
            padding: 15px 5px;
            border-bottom: 1px solid  #f5f5f5 ;
        `,
    };

    const theme = useTheme(tableTheme);

    const data = useMemo(() => {
        return { nodes : auditData.nodes }
    }, [ auditData.nodes]);

    // Modified to prevent row expansion when clicking on action buttons
    const handleExpand = (item, e) => {
        setIds(prev => {if (prev.includes(item.audit_id)) {
            return prev.filter((id) => id !== item.audit_id);
        }else{
            return [...prev, item.audit_id]
        }})
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        // When changing pages, collapse all expanded rows
        setIds([]);
    }

    const handleEdit = (e, item) => {
        e.stopPropagation();
        onEditAudit(item);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this audit?")) {
            onDeleteAudit(id);
        }
    };

    // const { headers, csvData } = prepareCSVData(audits);

    if (loading) {
        return <div className="text-center py-8">Loading audits...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error loading audits: {error}</div>;
    }

    return (
        <>
            {/* <div className="flex justify-end gap-3 mb-4">
                <button
                    onClick={() => console.log("Export to PDF")}
                    disabled={audits.length === 0}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Export to PDF
                </button>
                <CSVLink
                    data={csvData}
                    headers={headers}
                    filename="audit-reports.csv"
                    target="_blank"
                    className={`flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${audits.length === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export to CSV
                </CSVLink>
            </div> */}
            <br />

            <Table data={data} theme={theme}>
                {(tableList) => (
                    <>
                        <Header>
                            <HeaderRow>
                                <HeaderCell>Audit ID</HeaderCell>
                                <HeaderCell>Audit Type</HeaderCell>
                                {/* <HeaderCell>Conducted By</HeaderCell> */}
                                <HeaderCell>Department</HeaderCell>
                                <HeaderCell>Scheduled Date</HeaderCell>
                                {/* <HeaderCell>Completion Date</HeaderCell> */}
                                {/* <HeaderCell>Status</HeaderCell> */}
                                {/* <HeaderCell>Compliance Score</HeaderCell> */}
                                <HeaderCell>Actions</HeaderCell>
                            </HeaderRow>
                        </Header>

                        <Body>
                            {tableList.map((item) => (
                                <React.Fragment key={item.id}>
                                    <Row item={item}>
                                        <Cell>{item.audit_title}</Cell>
                                        <Cell>{item.audit_type}</Cell>
                                        {/* <Cell>{item.conducted_by}</Cell> */}
                                        <Cell>{item.department.name}</Cell>
                                        <Cell>{item.scheduled_date}</Cell>
                                        {/* <Cell>{formatDate(item.completed_at)}</Cell> */}
                                        {/* <Cell>
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                                item.status === 'failed' ? 'bg-red-100 text-red-800' : 
                                                'bg-yellow-100 text-yellow-800'}`}>
                                                {item.status}
                                            </span>
                                        </Cell> */}
                                        {/* <Cell>{item.compliance_score}</Cell> */}
                                        <Cell>
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={(e) => handleEdit(e, item)}
                                                    className="action-button text-indigo-600 hover:text-indigo-900 p-1"
                                                    title="Edit audit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                
                                                <button 
                                                    onClick={(e) => handleDelete(e, item.id)}
                                                    className="action-button text-red-600 hover:text-red-900 p-1"
                                                    title="Delete audit"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                
                                                {/* <button 
                                                    onClick={(e) => handleDownload(e, item)}
                                                    className="action-button text-blue-600 hover:text-blue-900 p-1"
                                                    title="Download report"
                                                >
                                                    <Download size={16} />
                                                </button> */}
                                                
                                                {/* {item.status !== 'pass' && (
                                                    <button 
                                                        onClick={(e) => handleApprove(e, item)}
                                                        className="action-button text-green-600 hover:text-green-900 p-1"
                                                        title="Approve audit"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )} */}
                                                <button onClick={() => handleExpand(item)} >
                                                    {ids.includes(item.audit_id) ? <MdArrowDropDown size={16} /> : <MdArrowRight size={16} />}
                                                </button>
                                            </div>
                                        </Cell>
                                    </Row>
                                    {ids.includes(item.audit_id) && (
                                        <AuditDetails audit={item} />
                                    )}
                                </React.Fragment>
                            ))}
                        </Body>
                    </>
                )}
            </Table>
            {audits.length > 0 && (
                <Pagination 
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </>
    );
};

export default AuditList;