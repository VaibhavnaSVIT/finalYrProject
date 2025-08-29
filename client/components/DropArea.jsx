import React, { useCallback, useState } from "react";

const DropArea = ({ onFiles }) => {
  const [isOver, setIsOver] = useState(false);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsOver(false);
      const files = e.dataTransfer?.files;
      if (files && files.length) onFiles(Array.from(files));
    },
    [onFiles]
  );

  const onBrowse = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png,.dcm";
    input.multiple = true;
    input.onchange = (e) => onFiles(Array.from(e.target.files || []));
    input.click();
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={onDrop}
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition ${
        isOver ? "border-gray-900 bg-gray-50" : "border-gray-300"
      }`}
    >
      <svg
        className="h-10 w-10 text-gray-500"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 5 17 10" />
        <line x1="12" y1="5" x2="12" y2="20" />
      </svg>
      <p className="mt-4 text-base font-medium text-gray-900">
        Drop medical images here or click to browse
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Supports JPEG, PNG, and DICOM formats up to 10MB each
      </p>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-4 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/60"
      >
        Browse Files
      </button>
    </div>
  );
};

export default DropArea;
