import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-lg' }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                <div
                    className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full ${maxWidth}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
