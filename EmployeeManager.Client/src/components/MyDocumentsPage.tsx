import { useState } from 'react';
import { format } from 'date-fns';
import { useMyDocuments } from '../Queries/useMyDocuments';
import { useDeleteDocument } from '../Queries/useDeleteDocument';
import { formatBytes } from '../utils/format';
import ConfirmModal from './ConfirmModal';
import type { DocumentDTO } from '../Types/Document';
import { toast } from 'react-toastify';
import { downloadDocument } from '../services/api';
import { triggerDownload } from '../utils/triggerDownload';

const handleDownload = async (doc: DocumentDTO) => {
    try {
        const response = await downloadDocument(doc.id);
        triggerDownload(response.data, doc.fileName);
    } catch {
        toast.error("Failed to download.");
    }
}

const MyDocumentsPage = () => {
    const {data: documents, isLoading, isError} = useMyDocuments();
    const deleteDocument = useDeleteDocument();
    const [pendingDelete, setPendingDelete] = useState<DocumentDTO | null>(null);
    if(isLoading) return <p className="p-6 text-muted dark:text-gray-400">Loading documents…</p>;
    if(isError) return <p className="p-6 text-red-600">Failed to load documents.</p>;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="page-title">My Documents</h1>
            {documents && documents.length === 0 ?(
                <div className="card text-center text-muted dark:text-gray-400">
                    No documents yet. Please upload some to see them here.
                </div>
            ): (
                <div className="card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-line dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Size
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Uploaded
                                    </th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-line dark:divide-gray-700">
                                {documents?.map(doc => (
                                    <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-ink dark:text-gray-100">
                                            {doc.fileName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted dark:text-gray-400">
                                            {formatBytes(doc.sizeBytes)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted dark:text-gray-400">
                                            {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-4">
                                            <button onClick={() => handleDownload(doc)} className="text-sm font-medium text-brand-600 hover:text-brand-800">
                                                Download
                                            </button>
                                            <button onClick={() => setPendingDelete(doc)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            <ConfirmModal open={!!pendingDelete} message={` "${pendingDelete?.fileName}"`}
                onConfirm={() => {
                    if(pendingDelete) {
                        deleteDocument.mutate(pendingDelete.id);
                        setPendingDelete(null);
                    }
                }}
                onCancel={() => setPendingDelete(null)}>
            </ConfirmModal>
        </div>
    );
}

export default MyDocumentsPage;