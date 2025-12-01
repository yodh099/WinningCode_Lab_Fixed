import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Pencil, Eye, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import EditClientModal from './EditClientModal';

interface ClientActionsProps {
    clientId: string;
    onDelete: () => void;
}

export default function ClientActions({ clientId, onDelete }: ClientActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                >
                    <MoreHorizontal className="h-5 w-5" />
                </button>

                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg border border-border z-50 py-1 animate-in fade-in zoom-in duration-100">
                        <Link
                            href={`/admin/clients/${clientId}`}
                            className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                        </Link>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setIsEditModalOpen(true);
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </button>
                        <button
                            onClick={async () => {
                                setIsOpen(false);
                                if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
                                    try {
                                        const supabase = createClient();
                                        const { error } = await supabase.functions.invoke('delete-user', {
                                            body: { user_id: clientId }
                                        });

                                        if (error) throw error;

                                        onDelete();
                                        window.location.reload();
                                    } catch (error) {
                                        console.error('Error deleting client:', error);
                                        alert('Failed to delete client. Please try again.');
                                    }
                                }
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            <EditClientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    window.location.reload(); // Refresh to show changes
                }}
                clientId={clientId}
            />
        </>
    );
}
