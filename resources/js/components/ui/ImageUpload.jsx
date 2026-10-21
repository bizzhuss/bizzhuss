import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
    UploadCloud, 
    Image as ImageIcon, 
    X, 
    Loader2, 
    CheckCircle2, 
    AlertCircle, 
    Link as LinkIcon, 
    ExternalLink, 
    RefreshCw 
} from 'lucide-react';

export function ImageUpload({
    value = '',
    onChange,
    label = 'Upload Image',
    folder = 'bizzhuss_catalog',
    aspectRatio = 'video', // 'video' (16:9), 'square' (1:1), 'banner' (3:1), 'auto'
    recommendedSize = 'JPG, PNG, WebP up to 10MB',
    placeholder = 'Click or drag image file here to upload',
    className = '',
    disabled = false,
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [manualUrl, setManualUrl] = useState(value || '');
    const fileInputRef = useRef(null);

    const aspectClasses = {
        video: 'aspect-video max-h-48',
        square: 'aspect-square max-h-40 max-w-[160px]',
        banner: 'aspect-[3/1] max-h-40',
        auto: 'min-h-[140px] max-h-60',
    }[aspectRatio] || 'min-h-[140px]';

    const handleUpload = async (file) => {
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            setError('Unsupported format. Please upload JPG, PNG, WebP, SVG, or GIF.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('File exceeds 10MB limit.');
            return;
        }

        setError(null);
        setUploading(true);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('folder', folder);

        try {
            const response = await axios.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && response.data.success && response.data.url) {
                onChange(response.data.url);
                setManualUrl(response.data.url);
                setError(null);
            } else {
                throw new Error(response.data?.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Image upload error:', err);
            const msg = err.response?.data?.message || err.message || 'Image upload failed. Please try again.';
            setError(msg);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && !uploading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (disabled || uploading) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setManualUrl('');
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleApplyManualUrl = () => {
        onChange(manualUrl);
        setShowUrlInput(false);
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                        {label}
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                        <LinkIcon className="w-3 h-3" />
                        <span>{showUrlInput ? 'Hide URL input' : 'Paste URL instead'}</span>
                    </button>
                </div>
            )}

            {/* Manual URL Input Fallback */}
            {showUrlInput && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                    <input
                        type="url"
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or hosted URL"
                        className="flex-1 px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-brand-500 font-mono text-[11px]"
                    />
                    <button
                        type="button"
                        onClick={handleApplyManualUrl}
                        className="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-colors shadow-xs"
                    >
                        Apply
                    </button>
                </div>
            )}

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,image/svg+xml,image/gif,application/pdf"
                className="hidden"
                disabled={disabled || uploading}
                onChange={handleFileChange}
            />

            {/* Preview Box OR Upload Dropzone */}
            {value ? (
                <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 group flex items-center justify-center ${aspectClasses}`}>
                    <img
                        src={value}
                        alt={label || 'Uploaded preview'}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/600x400?text=Preview+Unavailable';
                        }}
                    />

                    {/* Overlay Action Bar */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2.5 p-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                            title="Replace Image"
                        >
                            <RefreshCw className="w-3.5 h-3.5 text-brand-600" />
                            <span>Replace</span>
                        </button>

                        <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-white transition-all shadow-md cursor-pointer"
                            title="View Full Size"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-md cursor-pointer"
                            title="Remove Image"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Success Pill */}
                    <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-bold shadow-xs backdrop-blur-xs pointer-events-none">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Uploaded</span>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative w-full rounded-2xl border-2 border-dashed transition-all p-5 flex flex-col items-center justify-center text-center cursor-pointer ${aspectClasses} ${
                        isDragging
                            ? 'border-brand-500 bg-brand-50/50 scale-[0.99]'
                            : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50/70 bg-slate-50/30'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-3">
                            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                            <span className="text-xs font-bold text-slate-700">Uploading to Cloudinary...</span>
                            <span className="text-[10px] text-slate-400">Please wait while the image is processed</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-1.5">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                                <UploadCloud className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                                {placeholder}
                            </span>
                            <span className="text-[11px] text-slate-400">
                                {recommendedSize}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}

export default ImageUpload;
