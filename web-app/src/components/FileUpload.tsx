'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

interface FileUploadProps {
    conversationId: string;
    onFileUploaded: (fileUrl: string) => void;
}

export default function FileUpload({ conversationId, onFileUploaded }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);

        // Show preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleUpload() {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('conversation_id', conversationId);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onFileUploaded(data.file.url);

            // Reset
            setSelectedFile(null);
            setPreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    }

    function handleCancel() {
        setSelectedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <div>
            {!selectedFile ? (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    title="Attach file"
                >
                    <Upload className="h-5 w-5 text-muted-foreground" />
                </button>
            ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    {preview ? (
                        <img src={preview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                    ) : (
                        <FileText className="h-12 w-12 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(0)} KB
                        </p>
                    </div>
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                    </button>
                    <button
                        onClick={handleCancel}
                        className="p-1 hover:bg-background rounded"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
        </div>
    );
}
