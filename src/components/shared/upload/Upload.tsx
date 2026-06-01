import { Upload as UploadIcon, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/utils/cn.ts';

export interface UploadProps {
  value?: File | File[] | null;
  onChange?: (file: File | File[] | null) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxSize?: number; // in MB
  className?: string;
}

export const Upload = React.forwardRef<HTMLInputElement, UploadProps>(
  ({ value, onChange, accept, multiple = false, disabled, maxSize = 5, className, ...props }, ref) => {
    const [dragActive, setDragActive] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [error, setError] = React.useState<string>('');

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const files = React.useMemo(() => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    }, [value]);

    const validateFile = (file: File): boolean => {
      if (maxSize && file.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds ${maxSize}MB`);
        return false;
      }
      setError('');
      return true;
    };

    const handleFiles = (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const filesArray = Array.from(fileList);
      const validFiles = filesArray.filter(validateFile);

      if (validFiles.length === 0) return;

      if (multiple) {
        onChange?.(validFiles);
      } else {
        onChange?.(validFiles[0]);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (!disabled) {
        handleFiles(e.dataTransfer.files);
      }
    };

    const handleRemove = (index: number) => {
      if (multiple && Array.isArray(value)) {
        const newFiles = value.filter((_, i) => i !== index);
        onChange?.(newFiles.length > 0 ? newFiles : null);
      } else {
        onChange?.(null);
      }
    };

    const handleClick = () => {
      inputRef.current?.click();
    };

    return (
      <div className={cn('space-y-2', className)}>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-(--c-border) bg-(--c-panel) px-6 py-8 text-center transition-colors cursor-pointer',
            dragActive && 'border-primary bg-primary-subtle',
            disabled && 'opacity-50 cursor-not-allowed',
            'hover:border-primary hover:bg-(--c-bg)'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleChange}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <UploadIcon className="w-10 h-10 text-(--c-text-muted) mb-3" />
          <p className="text-sm text-(--c-text) mb-1">
            <span className="font-medium text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-(--c-text-muted)">
            {accept || 'Any file type'} (Max {maxSize}MB)
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-md border border-(--c-border) bg-(--c-panel) px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <UploadIcon className="w-4 h-4 text-(--c-text-muted) shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-(--c-text) truncate">{file.name}</p>
                    <p className="text-xs text-(--c-text-muted)">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    className="ml-2 p-1 text-(--c-text-muted) hover:text-red-500 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
Upload.displayName = 'Upload';


