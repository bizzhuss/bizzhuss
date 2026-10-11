import React from 'react';
import { Link } from '@inertiajs/react';

export default function ApplicationLogo({ 
    className = "h-10 w-auto", 
    href = "/", 
    variant = "full", 
    asLink = true,
    alt = "Bizzhuss Marketplace",
    ...props 
}) {
    const isIconOnly = variant === 'icon-only';
    const computedClass = `object-contain rounded-lg ${isIconOnly ? 'aspect-square' : ''} ${className}`;

    const imgTag = (
        <img 
            src="/images/bizzhuss-logo.png" 
            alt={alt} 
            className={computedClass}
            {...props}
        />
    );

    if (!asLink) {
        return imgTag;
    }

    return (
        <Link className="inline-flex items-center gap-2 group shrink-0" href={href}>
            {imgTag}
        </Link>
    );
}
export { ApplicationLogo };
