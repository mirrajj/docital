import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@table-library/react-table-library/theme';
import { Edit, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuditDetails from './AuditDetails';
import Pagination from './Pagination';
import { MdArrowDropDown, MdArrowRight } from 'react-icons/md';
import { Badge } from '@/components/ui/badge';
import { handleDownloadReport } from '../utils/auditPdfDownload';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
    Table,
    Header,
    HeaderRow,
    Body,
    Row,
    HeaderCell,
    Cell,
} from "@table-library/react-table-library/table";

const AuditList = ({ 
    filters, 
    onEditAudit, 
    onDeleteAudit,
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [auditToDelete, setAuditToDelete] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const {toast} = useToast();

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

    const handleExpand = (item) => {
        setIds(prev => {
            if (prev.includes(item.audit_id)) {
                return prev.filter((id) => id !== item.audit_id);
            } else {
                return [...prev, item.audit_id]
            }
        });
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        setIds([]);
    }

    const handleEdit = (e, item) => {
        e.stopPropagation();
        if (item.status !== 'completed') {
            onEditAudit(item);
        }
    };

    const openDeleteDialog = (e, item) => {
        e.stopPropagation();
        setAuditToDelete(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (auditToDelete) {
            onDeleteAudit(auditToDelete.id);
        }
        setDeleteDialogOpen(false);
        setAuditToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setAuditToDelete(null);
    };
    
    const initiateDownload = async (e, item) => {
        e.stopPropagation();
        
        if (item.status !== 'completed') {
            toast({
                title: "Download unavailable",
                description: "Only completed audits can be downloaded",
                variant: "destructive"
            });
            return;
        }
        
        setIsDownloading(true);
        
        try {
            const success = await handleDownloadReport(item);
            
            if (success) {
                toast({
                    title: "Download successful",
                    description: "Audit report has been downloaded",
                    variant: "default"
                });
            } else {
                toast({
                    title: "Download failed",
                    description: "There was an error generating the report",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Error downloading report:", error);
            toast({
                title: "Download error",
                description: "An unexpected error occurred",
                variant: "destructive"
            });
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading audits...</div>;
    }

    if (error) {
        return <div className="text-center py-8 text-red-500">Error loading audits: {error}</div>;
    }

    return (
        <>
            <br />
            
            <Table data={data} theme={theme}>
                {(tableList) => (
                    <>
                        <Header>
                            <HeaderRow>
                                <HeaderCell>Audit Title</HeaderCell>
                                <HeaderCell>Audit Type</HeaderCell>
                                <HeaderCell>Department</HeaderCell>
                                <HeaderCell>Scheduled Date</HeaderCell>
                                <HeaderCell>Status</HeaderCell>
                                <HeaderCell>Actions</HeaderCell>
                            </HeaderRow>
                        </Header>

                        <Body>
                            {tableList.map((item) => (
                                <React.Fragment key={item.id}>
                                    <Row item={item}>
                                        <Cell>{item.audit_title}</Cell>
                                        <Cell>{item.audit_type}</Cell>
                                        <Cell>{item.department.name}</Cell>
                                        <Cell>{item.scheduled_date}</Cell>
                                        <Cell>
                                            {item.status === 'completed' ? (
                                                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                                                    Completed
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                                                    Pending
                                                </Badge>
                                            )}
                                        </Cell>
                                        <Cell>
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={(e) => handleEdit(e, item)}
                                                    className={`action-button p-1 ${
                                                        item.status === 'completed' 
                                                        ? 'text-gray-400 cursor-not-allowed' 
                                                        : 'text-indigo-600 hover:text-indigo-900'
                                                    }`}
                                                    title={item.status === 'completed' ? "Cannot edit completed audit" : "Edit audit"}
                                                    disabled={item.status === 'completed'}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                
                                                <button 
                                                    onClick={(e) => openDeleteDialog(e, item)}
                                                    className="action-button text-red-600 hover:text-red-900 p-1"
                                                    title="Delete audit"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                
                                                <button 
                                                    onClick={(e) => initiateDownload(e, item)}
                                                    className={`action-button p-1 ${
                                                        item.status === 'completed' 
                                                        ? 'text-blue-600 hover:text-blue-900' 
                                                        : 'text-gray-400 cursor-not-allowed'
                                                    }`}
                                                    title={item.status === 'completed' ? "Download report" : "Report not available"}
                                                    disabled={item.status !== 'completed' || isDownloading}
                                                >
                                                    <Download size={16} />
                                                </button>
                                                
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

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the audit
                            {auditToDelete && `: "${auditToDelete.audit_title}"`}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default AuditList;