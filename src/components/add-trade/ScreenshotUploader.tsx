"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";

interface ScreenshotUploaderProps {
  onImageChange: (image: string | null) => void;
}

export function ScreenshotUploader({ onImageChange }: ScreenshotUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    
    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10 MB.");
      return;
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a PNG, JPG, or WEBP.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      setFileName(file.name);
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setFileName(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-danger text-sm">{error}</p>}
      
      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-white/5'}
          `}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center mb-4">
            <UploadCloud className="w-6 h-6 text-primary" />
          </div>
          <h4 className="text-base font-medium mb-1">Upload chart screenshot</h4>
          <p className="text-sm text-foreground/60">
            Drag & drop or <span className="text-primary hover:underline">Browse files</span>
          </p>
          <p className="text-xs text-foreground/40 mt-4">
            Accepts PNG, JPG, WEBP (Max 10 MB)
          </p>
        </div>
      ) : (
        <div className="relative border border-border rounded-xl p-4 bg-card group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-medium truncate">{fileName}</p>
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="p-2 hover:bg-danger/10 text-foreground/60 hover:text-danger rounded-lg transition-colors"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative rounded-lg overflow-hidden border border-border bg-black/50 aspect-video flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={preview} 
              alt="Chart preview" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
    </div>
  );
}
