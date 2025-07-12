import React, { useCallback, useState } from 'react';
import { Upload, File, X, AlertCircle, FolderOpen, FileSpreadsheet, Info } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (files: File[], content: string[]) => void;
  acceptedTypes?: string[];
  title: string;
  description: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  acceptedTypes = ['.rinex', '.o', '.n', '.g', '.xlsx', '.csv'],
  title,
  description
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  const handleFileUpload = (files: File[]) => {
    const contents: string[] = [];
    let processedCount = 0;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          contents[index] = content;
          processedCount++;
          
          if (processedCount === files.length) {
            setUploadedFiles(files);
            onFileUpload(files, contents);
          }
        }
      };
      reader.onerror = () => {
        setError(`Error reading file: ${file.name}`);
      };
      reader.readAsText(file);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setError(null);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300 text-sm"
          >
            <Info className="h-4 w-4" />
            <span>Panduan Format Data</span>
          </button>
        </div>
        <p className="text-sm text-gray-300">{description}</p>
      </div>

      {/* Data Format Guide */}
      {showGuide && (
        <div className="mb-6 bg-gray-900 rounded-lg p-4 border border-gray-600">
          <h4 className="text-green-400 font-medium mb-3">📋 Panduan Format Data</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <FolderOpen className="h-5 w-5 text-blue-400" />
                <h5 className="text-blue-300 font-medium">Struktur Folder (Recommended)</h5>
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <div>📁 datapdg/</div>
                <div className="ml-4">📁 2021/ - Data tahun 2021</div>
                <div className="ml-4">📁 2022/ - Data tahun 2022</div>
                <div className="ml-4">📁 2023/ - Data tahun 2023</div>
                <div className="ml-4">📁 2024/ - Data tahun 2024</div>
                <div className="ml-8">📄 station1.csv</div>
                <div className="ml-8">📄 station2.rinex</div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center space-x-2 mb-2">
                <FileSpreadsheet className="h-5 w-5 text-green-400" />
                <h5 className="text-green-300 font-medium">Format File Excel/CSV</h5>
              </div>
              <div className="text-sm text-gray-300">
                <p className="mb-2">Kolom yang diperlukan:</p>
                <ul className="space-y-1">
                  <li>• <strong>Date/Timestamp</strong> - Tanggal pengukuran</li>
                  <li>• <strong>Easting</strong> - Koordinat UTM Timur (m)</li>
                  <li>• <strong>Northing</strong> - Koordinat UTM Utara (m)</li>
                  <li>• <strong>Height</strong> - Ketinggian (m)</li>
                  <li>• <strong>Station_ID</strong> - ID stasiun (opsional)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-900 border border-green-600 rounded-lg p-3">
            <h5 className="text-green-200 font-medium mb-2">💡 Tips untuk Data Berkualitas</h5>
            <div className="text-green-300 text-sm space-y-1">
              <p>• Pastikan data memiliki minimal 30 hari pengukuran kontinyu</p>
              <p>• Koordinat dalam sistem UTM 48S untuk wilayah Padang</p>
              <p>• Akurasi posisi minimal sub-meter (< 1 meter)</p>
              <p>• Format tanggal konsisten: YYYY-MM-DD atau DD/MM/YYYY</p>
              <p>• Hindari data dengan gap lebih dari 7 hari berturut-turut</p>
            </div>
          </div>

          <div className="mt-3 bg-yellow-900 border border-yellow-600 rounded-lg p-3">
            <h5 className="text-yellow-200 font-medium mb-2">⚠️ Contoh Format CSV</h5>
            <pre className="text-yellow-300 text-xs bg-yellow-800 p-2 rounded overflow-x-auto">
{`Date,Easting,Northing,Height,Station_ID
2023-01-01,756432.123,9876543.456,45.678,PDG001
2023-01-02,756432.098,9876543.445,45.672,PDG001
2023-01-03,756432.089,9876543.441,45.669,PDG001`}
            </pre>
          </div>
        </div>
      )}

      {uploadedFiles.length === 0 ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            dragActive
              ? 'border-green-400 bg-green-900 bg-opacity-20'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={acceptedTypes.join(',')}
            multiple
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-white mb-2">
            Drop file data Anda di sini, atau klik untuk browse
          </p>
          <p className="text-sm text-gray-400 mb-2">
            Mendukung multiple files untuk analisis multi-tahun
          </p>
          <p className="text-xs text-gray-500">
            Format: {acceptedTypes.join(', ')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-green-400 font-medium">
            {uploadedFiles.length} file(s) berhasil diupload:
          </div>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="bg-gray-800 border border-green-600 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="font-medium text-white">{file.name}</p>
                    <p className="text-sm text-green-300">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-900 border border-red-600 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};