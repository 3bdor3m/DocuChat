import React, { useCallback } from 'react';
import { useChat } from '../context/ChatContext';

const FileUpload: React.FC = () => {
  const { uploadFile, uploadedFile } = useChat();

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-black">
      <div
        className="w-full max-w-md p-10 border-2 border-dashed border-[#2873ec]/30 rounded-xl hover:border-[#2873ec] transition-all duration-300 cursor-pointer bg-gray-900/30 backdrop-blur-sm group"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#2873ec]/10 text-[#2873ec] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(40,115,236,0.2)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-200">ارفع مستندك</p>
            <p className="text-sm text-gray-500 mt-1">ندعم PDF, Word, Markdown</p>
          </div>
          <label className="px-6 py-2 bg-[#2873ec] text-white rounded-lg hover:bg-[#4a8fff] transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(40,115,236,0.3)] hover:shadow-[0_0_25px_rgba(74,143,255,0.5)]">
            تصفح الملفات
            <input type="file" className="hidden" onChange={onFileChange} accept=".pdf,.doc,.docx,.md,.txt" />
          </label>
        </div>
      </div>

      {uploadedFile && (
        <div className="w-full max-w-md mt-8 bg-gray-900 p-4 rounded-lg shadow-lg border border-[#2873ec]/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-800 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <span className="text-xs font-medium text-[#2873ec]">{Math.round(uploadedFile.progress)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-[#2873ec] h-2 rounded-full transition-all duration-300 shadow-[0_0_10px_#2873ec]"
              style={{ width: `${uploadedFile.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
