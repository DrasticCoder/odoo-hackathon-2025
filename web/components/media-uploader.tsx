import React, { useRef, useState } from 'react';

import Image from 'next/image';

import { Card } from '@/components/ui/card';

import { cn } from '@/lib/utils';

export type MediaUploaderProps = {
  className?: string;

  type?: 'image' | 'video' | 'file';

  multiple?: boolean;

  folderName?: string;

  onUpload?: (urls: string[]) => void;
};

const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  className,

  type = 'image',

  multiple = false,

  folderName = '',

  onUpload,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [progress, setProgress] = useState(0);

  const [previews, setPreviews] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : '*';

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);

    setUploading(true);

    setProgress(0);

    setPreviews([]);

    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const formData = new FormData();

      formData.append('file', file);

      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      if (folderName) formData.append('folder', folderName);

      try {
        const xhr = new XMLHttpRequest();

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        const promise = new Promise<string>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              try {
                const res = JSON.parse(xhr.responseText);

                urls.push(res.secure_url);

                resolve(res.secure_url);
              } catch {
                reject('Invalid response format');
              }
            } else {
              try {
                const errorRes = JSON.parse(xhr.responseText);

                reject(errorRes.error?.message || 'Upload failed');
              } catch {
                reject(`Upload failed with status ${xhr.status}`);
              }
            }
          };

          xhr.onerror = () => reject('Network error during upload');
        });

        xhr.send(formData);

        await promise;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);

        console.error('Upload error:', errMsg);

        setError('Upload failed. Please try again.');

        setUploading(false);

        return;
      }
    }

    setUploading(false);

    setProgress(0);

    setPreviews(urls);

    if (onUpload) onUpload(urls);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    setDragActive(false);

    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    setDragActive(false);
  };

  return (
    <Card
      className={cn(
        'mx-auto flex w-full max-w-md flex-col items-center border-2 border-dashed p-4 transition-colors',

        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200',

        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={inputRef}
        type='file'
        accept={acceptTypes}
        multiple={multiple}
        className='hidden'
        onChange={handleInputChange}
      />

      <div
        className='flex w-full cursor-pointer flex-col items-center justify-center py-8'
        onClick={() => inputRef.current?.click()}
        tabIndex={0}
        role='button'
        aria-label='Upload files'
      >
        <span className='mb-2 text-lg font-medium'>Drag & drop or click to upload {type}(s)</span>

        <span className='text-xs text-gray-500'>
          {multiple ? 'You can select multiple files.' : 'Only one file allowed.'}
        </span>
      </div>

      {uploading && (
        <div className='mt-4 w-full'>
          <div className='h-2 rounded bg-gray-200'>
            <div className='h-2 rounded bg-blue-500 transition-all' style={{ width: `${progress}%` }} />
          </div>

          <div className='mt-1 text-xs text-gray-500'>Uploading... {progress}%</div>
        </div>
      )}

      {error && <div className='mt-2 text-red-500'>{error}</div>}

      {previews.length > 0 && (
        <div className='mt-4 grid w-full grid-cols-2 gap-2'>
          {previews.map((url, idx) =>
            type === 'image' ? (
              <Image
                key={idx}
                src={url}
                alt='preview'
                width={128}
                height={128}
                className='h-32 w-full rounded object-cover shadow'
              />
            ) : type === 'video' ? (
              <video key={idx} src={url} controls className='h-32 w-full rounded object-cover shadow' />
            ) : (
              <a
                key={idx}
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                className='block truncate text-blue-600 underline'
              >
                {url.split('/').pop()}
              </a>
            )
          )}
        </div>
      )}
    </Card>
  );
};

export default MediaUploader;
