import React, { useEffect, useState, useRef } from 'react';
import { FileText, Upload, Trash2, File, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { documentService, Document } from '../../services/documentService';

interface KnowledgePanelProps {
  agentId: string;
}

export function KnowledgePanel({ agentId }: KnowledgePanelProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [agentId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await documentService.list(agentId);
      setDocuments(response.documents);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['pdf', 'txt', 'md'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedTypes.includes(extension)) {
      setError(`Unsupported file type. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size: 10MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      
      const response = await documentService.upload(agentId, file);
      setDocuments(prev => [response.document, ...prev]);
      setSuccess(`"${file.name}" uploaded successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Failed to upload document';
      
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail)) {
        // Handle Pydantic validation errors (array of objects)
        errorMessage = detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
      } else if (typeof detail === 'object' && detail !== null) {
        errorMessage = JSON.stringify(detail);
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (document: Document) => {
    if (!confirm(`Delete "${document.filename}"?`)) return;

    try {
      await documentService.delete(document.id);
      setDocuments(prev => prev.filter(d => d.id !== document.id));
    } catch (err) {
      setError('Failed to delete document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString.endsWith('Z') ? dateString : `${dateString}Z`);
    return date.toLocaleDateString();
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-400" />;
      case 'md':
      case 'markdown':
        return <FileText className="h-4 w-4 text-blue-400" />;
      default:
        return <File className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Knowledge Base</h3>
        <span className="text-xs text-slate-500">{documents.length} files</span>
      </div>

      {/* Upload Button */}
      <label className={`
        flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed cursor-pointer transition-all
        ${uploading 
          ? 'border-primary-500/50 bg-primary-500/10 cursor-wait' 
          : 'border-slate-700 hover:border-primary-500/50 hover:bg-slate-800/50'
        }
      `}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 text-primary-400 animate-spin" />
            <span className="text-sm text-primary-400">Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Upload PDF, TXT, or MD</span>
          </>
        )}
      </label>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-red-500/10 text-red-400 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 text-green-400 text-xs">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            No documents yet. Upload files to add knowledge to this agent.
          </p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="group flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              {getFileIcon(doc.file_type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 truncate">{doc.filename}</p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(doc.file_size)} · {doc.chunk_count} chunks · {formatDate(doc.created_at)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(doc)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-400 text-slate-500 transition-all"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
