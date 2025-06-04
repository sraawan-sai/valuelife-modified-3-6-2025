import { v4 as uuidv4 } from 'uuid';

/**
 * Utility for handling file storage in local storage by converting files to base64
 */

// Convert a file to base64 string asynchronously
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Structure to store file metadata alongside base64 content
export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  base64: string;
  uploadDate: string;
}

// Save file to local storage
export const saveFile = async (
  file: File, 
  storageKey: string
): Promise<StoredFile> => {
  try {
    const base64 = await fileToBase64(file);
    
    const storedFile: StoredFile = {
      id: uuidv4(),
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      base64,
      uploadDate: new Date().toISOString()
    };
    
    // Get existing files or create empty array
    const existingDataString = localStorage.getItem(storageKey);
    const existingData = existingDataString ? JSON.parse(existingDataString) : [];
    
    // Add new file
    existingData.push(storedFile);
    
    // Save back to localStorage
    localStorage.setItem(storageKey, JSON.stringify(existingData));
    
    return storedFile;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

// Get a file from local storage by ID
export const getFileById = (
  storageKey: string,
  fileId: string
): StoredFile | null => {
  const dataString = localStorage.getItem(storageKey);
  if (!dataString) return null;
  
  const files = JSON.parse(dataString) as StoredFile[];
  return files.find(file => file.id === fileId) || null;
};

// Get all files from a storage key
export const getAllFiles = (storageKey: string): StoredFile[] => {
  const dataString = localStorage.getItem(storageKey);
  if (!dataString) return [];
  
  return JSON.parse(dataString) as StoredFile[];
};

// Delete a file by ID
export const deleteFile = (storageKey: string, fileId: string): boolean => {
  const dataString = localStorage.getItem(storageKey);
  if (!dataString) return false;
  
  const files = JSON.parse(dataString) as StoredFile[];
  const newFiles = files.filter(file => file.id !== fileId);
  
  localStorage.setItem(storageKey, JSON.stringify(newFiles));
  return true;
};

// Clear all files for a storage key
export const clearFiles = (storageKey: string): void => {
  localStorage.removeItem(storageKey);
};

// Storage keys for different document types
export const FILE_STORAGE_KEYS = {
  KYC_ID_PROOF: 'kyc_id_proof_files',
  KYC_ADDRESS_PROOF: 'kyc_address_proof_files',
  KYC_BANK_DETAILS: 'kyc_bank_details_files',
  PROFILE_IMAGES: 'profile_images',
  MARKETING_MATERIALS: 'marketing_materials',
}; 