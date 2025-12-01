import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Trash2, Edit, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import EditMemberModal from './EditMemberModal';

interface TeamActionsProps {
    memberId: string;
    onDelete: () => void;
}

export default function TeamActions({ memberId, onDelete }: TeamActionsProps) {
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
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setIsEditModalOpen(true);
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                setIsEditModalOpen(true); // Reusing edit modal for role change as it includes role
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Change Role
                        </button>
                        <button
                            onClick={async () => {
                                setIsOpen(false);
                                if (confirm('Are you sure you want to remove this team member?')) {
                                    try {
                                        const supabase = createClient();
                                        const { error } = await supabase.functions.invoke('delete-user', {
                                            body: { user_id: memberId }
                                        });

                                        if (error) throw error;

                                        onDelete();
                                        window.location.reload(); // Refresh to show changes
                                    } catch (error) {
                                        console.error('Error removing member:', error);
                                        alert('Failed to remove member. Please try again.');
                                    }
                                }
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Member
                        </button>
                    </div>
                )}
            </div>

            <EditMemberModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={() => {
                    setIsEditModalOpen(false);
                    window.location.reload(); // Refresh to show changes
                }}
                memberId={memberId}
            />
        </>
    );
}
