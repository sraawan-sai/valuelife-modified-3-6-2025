import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/ui/Card';
import { FileCheck, AlertTriangle, CheckCircle, Lock, Upload, Check, ArrowRight } from 'lucide-react';
import KycUploader from '../components/kyc/KycUploader';
import { saveFile, getAllFiles, FILE_STORAGE_KEYS, StoredFile } from '../utils/fileStorage';
import {
  getCurrentUser,
  updateCurrentUser,
  addKycRequest,
  getUserData,
  getKycDocuments,
  saveLastKycStatus,
  getKycSubmissionHistory,
  KycSubmission,
  addKycSubmission
} from '../utils/localStorageService';
import { v4 as uuidv4 } from 'uuid';
import { KYCStatus } from '../types';
import Button from '../components/ui/Button';

interface KycDocuments {
  idProof?: StoredFile | null;
  addressProof?: StoredFile | null;
  bankDetails?: StoredFile | null;
}

const Kyc: React.FC = () => {
  const [kycStatus, setKycStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [documents, setDocuments] = useState<KycDocuments>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [kycRequestCreated, setKycRequestCreated] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [submissionHistory, setSubmissionHistory] = useState<KycSubmission[]>([]);

  // Load user data and KYC documents on component mount
  useEffect(() => {
    const loadUserData = () => {
      const user = getCurrentUser();
      if (user) {
        // Check if KYC status has changed since last visit
        const previousStatus = localStorage.getItem('last_kyc_status');
        const currentStatus = user.kycStatus || 'pending';

        if (previousStatus && previousStatus !== currentStatus) {
          // Alert user about status change
          if (currentStatus === 'approved') {
            alert('Good news! Your KYC verification has been approved.');
          } else if (currentStatus === 'rejected') {
            alert('Your KYC verification was rejected. Please check the details and resubmit.');
          }
        }

        // Save current status for next comparison
        localStorage.setItem('last_kyc_status', currentStatus);
        setKycStatus(currentStatus);

        // If KYC request was already created previously
        if (currentStatus === 'pending' && user.kycDocuments?.idProof) {
          setKycRequestCreated(true);
        }
      }

      // // Load documents from local storage
      // const idProofFiles = getAllFiles(FILE_STORAGE_KEYS.KYC_ID_PROOF);
      // const addressProofFiles = getAllFiles(FILE_STORAGE_KEYS.KYC_ADDRESS_PROOF);
      // const bankDetailsFiles = getAllFiles(FILE_STORAGE_KEYS.KYC_BANK_DETAILS);

      // Get the most recent file of each type
      // setDocuments({
      //   idProof: idProofFiles.length > 0 ? idProofFiles[idProofFiles.length - 1] : null,
      //   addressProof: addressProofFiles.length > 0 ? addressProofFiles[addressProofFiles.length - 1] : null,
      //   bankDetails: bankDetailsFiles.length > 0 ? bankDetailsFiles[bankDetailsFiles.length - 1] : null
      // });

      setIsLoading(false);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const functionCall = async () => {
      // Load user data and KYC documents
      const user = await getUserData();
      const userId = user!.id
      setUserData(user);

      const kycDocs = await getKycDocuments(userId) || [];

      // Convert kycDocs to the expected KycDocuments type format
      const formattedDocs: KycDocuments = {};
      if (Array.isArray(kycDocs) && kycDocs.length > 0) {
        kycDocs.forEach((doc: any) => {
          if (doc.documentType === 'idProof') {
            formattedDocs.idProof = doc;
          } else if (doc.documentType === 'addressProof') {
            formattedDocs.addressProof = doc;
          } else if (doc.documentType === 'bankDetails') {
            formattedDocs.bankDetails = doc;
          }
        });
      }

      console.log(formattedDocs);

      setDocuments(formattedDocs);

      // Check for status change
      const lastStatus = localStorage.getItem('lastKycStatus');
      if (user && user.kycStatus && lastStatus && user.kycStatus !== lastStatus) {
        const message = user.kycStatus === 'approved'
          ? 'Your KYC verification has been approved!'
          : user.kycStatus === 'rejected'
            ? 'Your KYC verification was rejected. Please check the feedback and resubmit.'
            : 'Your KYC status has been updated.';

        alert(message);
      }

      // Save current status for future comparison
      if (user && user.kycStatus) {
        saveLastKycStatus(user.kycStatus);
      }

      // Get submission history using our new function
      const history = getKycSubmissionHistory();
      setSubmissionHistory(history);

      setIsLoading(false);
    }

    functionCall()
  }, []);

  console.log("documents", documents);


  const handleDocumentUpload = async (docType: string, file: File) => {
    try {
      // Save file to local storage
      let storedFile: StoredFile;
      let storageKey: string;

      switch (docType) {
        case 'idProof':
          storageKey = FILE_STORAGE_KEYS.KYC_ID_PROOF;
          break;
        case 'addressProof':
          storageKey = FILE_STORAGE_KEYS.KYC_ADDRESS_PROOF;
          break;
        case 'bankDetails':
          storageKey = FILE_STORAGE_KEYS.KYC_BANK_DETAILS;
          break;
        default:
          throw new Error(`Unknown document type: ${docType}`);
      }

      storedFile = await saveFile(file, storageKey);

      // Update documents state with new file
      setDocuments(prev => ({
        ...prev,
        [docType]: storedFile
      }));

      // Add submission to history
      const newSubmission: KycSubmission = {
        documentType: docType,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      await addKycSubmission(newSubmission);
      setSubmissionHistory(prev => [...prev, newSubmission]);

      alert("New Kyc Uploaded!");

      // Set KYC status to pending if it was rejected
      if (kycStatus === 'rejected') {
        setKycStatus('pending');

        // Update user KYC status in local storage
        const user = getCurrentUser();
        if (user) {
          updateCurrentUser({
            ...user,
            kycStatus: 'pending'
          });
        }
      }

      // Close the active section after successful upload
      setActiveSection(null);

      console.log(`Uploaded ${docType}:`, file.name);
    } catch (error) {
      console.error(`Error uploading ${docType}:`, error);
      alert(`Failed to upload document. Please try again.`);
    }
  };

  const getTotalDocumentsUploaded = () => {
    let count = 0;
    if (documents.idProof) count++;
    if (documents.addressProof) count++;
    if (documents.bankDetails) count++;
    return count;
  };

  const allDocumentsUploaded = documents.idProof && documents.addressProof && documents.bankDetails;

  const handleSubmitKycRequest = async () => {
    if (!allDocumentsUploaded) {
      alert('Please upload all required documents before submitting.');
      return;
    }

    // Create a KYC request for admin review
    const user = await getCurrentUser();
    if (user) {
      // Update user KYC status in local storage
      updateCurrentUser({
        ...user,
        kycStatus: 'pending',
        kycDocuments: {
          idProof: documents.idProof?.name || '',
          addressProof: documents.addressProof?.name || '',
          bankDetails: documents.bankDetails?.name || ''
        }
      });

      // Create a KYC request for admin
      const kycRequest = {
        id: uuidv4(),
        userId: user.id,
        userName: user.name,
        documents: {
          idProof: documents.idProof?.base64 || '',
          addressProof: documents.addressProof?.base64 || '',
          bankDetails: documents.bankDetails?.base64 || ''
        },
        status: 'pending' as KYCStatus,
        submissionDate: new Date().toISOString()
      };

      await addKycRequest(kycRequest);
      setKycRequestCreated(true);
      setShowSuccessMessage(true);

      // Record submissions in history for all document types if not already there
      const currentTime = new Date().toISOString();
      const documentTypes = ['idProof', 'addressProof', 'bankDetails'];

      // Check existing submissions to avoid duplicates
      const existingTypes = submissionHistory.map(s => s.documentType);

      documentTypes.forEach(docType => {
        // Only add to history if this is a new submission or existing one was rejected
        const existingSubmission = submissionHistory.find(s =>
          s.documentType === docType && s.status === 'pending'
        );

        if (!existingSubmission) {
          const newSubmission: KycSubmission = {
            documentType: docType,
            status: 'pending',
            submittedAt: currentTime
          };

          addKycSubmission(newSubmission);

          // Update local state
          setSubmissionHistory(prev => [...prev, newSubmission]);
        }
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      console.log("KYC request created and sent to admin:", kycRequest.id);
    }
  };

  const handleStartKyc = (section: string) => {
    setActiveSection(section);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-neutral-600">Loading KYC information...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Animated Rainbow Blobs and Gradient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-pink-300 via-yellow-200 via-green-200 via-blue-200 to-purple-300 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-200 via-pink-200 via-blue-200 to-green-200 rounded-full filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-blue-200 via-pink-200 to-yellow-200 rounded-full filter blur-2xl opacity-10 animate-blob-slow animate-spin"></div>
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-tr from-green-200 via-yellow-200 to-pink-200 rounded-full filter blur-2xl opacity-10 animate-blob-fast animate-spin-reverse"></div>
        <div className="absolute left-1/3 top-0 w-60 h-60 bg-gradient-to-br from-purple-200 via-pink-100 to-yellow-100 rounded-full filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute right-1/4 bottom-10 w-40 h-40 bg-gradient-to-tr from-blue-100 via-green-100 to-pink-200 rounded-full filter blur-2xl opacity-20 animate-blob-fast animation-delay-3000"></div>
        <div className="fixed inset-0 animate-bg-gradient" style={{ background: 'linear-gradient(120deg, rgba(255,0,150,0.07), rgba(0,229,255,0.07), rgba(255,255,0,0.07))' }}></div>
      </div>
      <div className="mb-6 relative z-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-400 via-green-400 via-blue-400 to-purple-500 animate-gradient-x drop-shadow-lg animate-pulse-rainbow">KYC Verification</h1>
        <p className="text-lg font-semibold text-blue-400 animate-fade-in">Verify your identity to unlock full platform features</p>
      </div>

      {/* Feature Access Notification */}
      {kycStatus !== 'approved' && (
        <div className="mb-6 relative z-10">
          <Card className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl floating-card rainbow-border-glow">
            <div className="flex items-start">
              <div className="p-3 rounded-full mr-4 flex-shrink-0 bg-primary-100 text-primary-600">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">KYC Verification Required</h3>
                <p className="mt-1 text-neutral-600">
                  Your KYC verification must be approved to access these features:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-neutral-600">
                  <li>My Network - View and manage your referral network</li>
                  <li>Wallet - Access earnings and manage withdrawals</li>
                  <li>Referral Tools - Promote and grow your network</li>
                </ul>
                <p className="mt-2 text-sm text-primary-600 font-medium">
                  Complete your KYC verification below to gain full access to all platform features.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* KYC Status Card */}
      <div className="mb-6 relative z-10">
        <Card className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl floating-card rainbow-border-glow">
          <div className="flex items-start">
            <div className={`
              p-3 rounded-full mr-4 flex-shrink-0
              ${kycStatus === 'approved' ? 'bg-success-100 text-success-600' :
                kycStatus === 'rejected' ? 'bg-error-100 text-error-600' :
                  'bg-warning-100 text-warning-600'}
            `}>
              {kycStatus === 'approved' ? (
                <CheckCircle className="h-6 w-6" />
              ) : kycStatus === 'rejected' ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <FileCheck className="h-6 w-6" />
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900">
                KYC Status: {' '}
                <span className={
                  kycStatus === 'approved' ? 'text-success-600' :
                    kycStatus === 'rejected' ? 'text-error-600' :
                      'text-warning-600'
                }>
                  {kycStatus === 'approved' ? 'Approved' :
                    kycStatus === 'rejected' ? 'Rejected' :
                      'Pending'}
                </span>
              </h3>

              <p className="mt-1 text-neutral-600">
                {kycStatus === 'approved' ?
                  'Your KYC verification has been approved. You now have full access to all platform features.' :
                  kycStatus === 'rejected' ?
                    'Your KYC verification was rejected. Please check the reason below and resubmit the required documents.' :
                    kycRequestCreated ?
                      'Your KYC documents are under review. This process usually takes 1-2 business days.' :
                      'Please upload all required documents and submit for verification.'}
              </p>

              {kycStatus === 'rejected' && (
                <div className="mt-3 p-3 bg-error-50 border border-error-200 rounded-md">
                  <p className="text-sm text-error-700">
                    <strong>Reason for rejection:</strong> The uploaded documents were unclear or incomplete. Please upload clear, high-resolution images of your documents.
                  </p>
                </div>
              )}

              {!kycRequestCreated && (
                <div className="mt-3">
                  <div className="bg-neutral-100 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">Verification Progress: </span>
                        <span className="text-sm font-bold">{getTotalDocumentsUploaded()}/3 documents uploaded</span>
                      </div>
                      <div className="w-32 bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${(getTotalDocumentsUploaded() / 3) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success message when documents are submitted */}
              {showSuccessMessage && (
                <div className="mt-3 p-3 bg-success-50 border border-success-200 rounded-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
                    <p className="text-sm text-success-700">
                      <strong>Success!</strong> Your KYC documents have been submitted for review. You'll be notified once the verification is complete.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Document Upload Section */}
      <div className="mb-6 relative z-10">
        <h2 className="text-xl font-semibold mb-4">Document Verification</h2>

        {!kycRequestCreated && kycStatus !== 'approved' && (
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Identity Proof Section */}
            <div>
              {activeSection === 'idProof' ? (
                <KycUploader
                  documentType="idProof"
                  documentTitle="Identity Proof"
                  documentDescription="Enter a government-issued ID Number (passport, driver's license, etc.)"
                  status={documents.idProof ? 'pending' : null as any}
                  existingDocument={documents.idProof?.base64}
                  existingDocumentName={documents.idProof?.name}
                  rejectionReason={kycStatus === 'rejected' ? "The document was blurry or incomplete" : undefined}
                  onUpload={(file) => handleDocumentUpload('idProof', file)}
                  showHistory={true}
                />
              ) : (
                <Card className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl floating-card rainbow-border-glow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${documents.idProof?.status === "approved" ? 'bg-success-100' : 'bg-neutral-100'}`}>
                        {documents.idProof?.status === "approved" ? (
                          <Check className="h-5 w-5 text-success-600" />
                        ) : (
                          <Upload className="h-5 w-5 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Identity Proof</h3>
                        <p className="text-sm text-neutral-600">
                          {documents.idProof ?
                            `Uploaded: ${documents.idProof.name}` :
                            'Government-issued ID (passport, driver\'s license)'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={documents.idProof ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleStartKyc('idProof')}
                    >
                      {documents.idProof ? 'Replace' : 'Upload'}
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Address Proof Section */}
            <div>
              {activeSection === 'addressProof' ? (
                <KycUploader
                  documentType="addressProof"
                  documentTitle="Address Proof"
                  documentDescription="Enter a Address Proof"
                  status={documents.addressProof ? 'pending' : null as any}
                  existingDocument={documents.addressProof?.base64}
                  existingDocumentName={documents.addressProof?.name}
                  rejectionReason={kycStatus === 'rejected' ? "The document was expired or too old" : undefined}
                  onUpload={(file) => handleDocumentUpload('addressProof', file)}
                  showHistory={true}
                />
              ) : (
                <Card className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl floating-card rainbow-border-glow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${documents.addressProof?.status === "approved" ? 'bg-success-100' : 'bg-neutral-100'}`}>
                        {documents.addressProof?.status === "approved" ? (
                          <Check className="h-5 w-5 text-success-600" />
                        ) : (
                          <Upload className="h-5 w-5 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Address Proof</h3>
                        <p className="text-sm text-neutral-600">
                          {documents.addressProof ?
                            `Uploaded: ${documents.addressProof.name}` :
                            'Utility bill or bank statement (not older than 3 months)'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={documents.addressProof ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleStartKyc('addressProof')}
                    >
                      {documents.addressProof ? 'Replace' : 'Upload'}
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Bank Details Section */}
            <div>
              {activeSection === 'bankDetails' ? (
                <KycUploader
                  documentType="bankDetails"
                  documentTitle="Bank Account Details"
                  documentDescription="Enter A Bank Account Details"
                  status={documents.bankDetails ? 'pending' : null as any}
                  existingDocument={documents.bankDetails?.base64}
                  existingDocumentName={documents.bankDetails?.name}
                  rejectionReason={kycStatus === 'rejected' ? "The account details were not clearly visible" : undefined}
                  onUpload={(file) => handleDocumentUpload('bankDetails', file)}
                />
              ) : (
                <Card className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl floating-card rainbow-border-glow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full mr-3 ${documents.bankDetails?.status === "approved" ? 'bg-success-100' : 'bg-neutral-100'}`}>
                        {documents.bankDetails?.status === "approved" ? (
                          <Check className="h-5 w-5 text-success-600" />
                        ) : (
                          <Upload className="h-5 w-5 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">Bank Account Details</h3>
                        <p className="text-sm text-neutral-600">
                          {documents.bankDetails ?
                            `Uploaded: ${documents.bankDetails.name}` :
                            'Cancelled check or bank statement showing your account details'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={documents.bankDetails ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleStartKyc('bankDetails')}
                    >
                      {documents.bankDetails ? 'Replace' : 'Upload'}
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Already submitted documents in review status */}
        {kycRequestCreated && kycStatus !== 'approved' && (
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl floating-card rainbow-border-glow">
              <div className="p-4 rounded-lg bg-warning-50 mb-4">
                <div className="flex items-center">
                  <FileCheck className="h-5 w-5 text-warning-600 mr-2" />
                  <p className="text-warning-700 font-medium">Your documents are under review</p>
                </div>
                <p className="text-sm text-warning-600 mt-1">Please check back later for updates on your verification status.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-neutral-800">Identity Proof</h3>
                  <div className="flex items-center mt-2 text-warning-600">
                    <FileCheck className="h-4 w-4 mr-1" />
                    <span className="text-sm">Under Review</span>
                  </div>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-neutral-800">Address Proof</h3>
                  <div className="flex items-center mt-2 text-warning-600">
                    <FileCheck className="h-4 w-4 mr-1" />
                    <span className="text-sm">Under Review</span>
                  </div>
                </div>
                <div className="border rounded-md p-4">
                  <h3 className="font-medium text-neutral-800">Bank Account Details</h3>
                  <div className="flex items-center mt-2 text-warning-600">
                    <FileCheck className="h-4 w-4 mr-1" />
                    <span className="text-sm">Under Review</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Submit Button */}
        {!kycRequestCreated && allDocumentsUploaded && kycStatus !== 'approved' && (
          <div className="flex justify-center mt-6 mb-8">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmitKycRequest}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Submit Documents for Verification
            </Button>
          </div>
        )}
      </div>

      {/* KYC Information */}
      <div className="relative z-10">
        <Card
          title="KYC Requirements"
          icon={<AlertTriangle className="h-5 w-5" />}
          className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl floating-card rainbow-border-glow"
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-neutral-900">Why is KYC required?</h4>
              <p className="mt-1 text-sm text-neutral-600">
                KYC (Know Your Customer) verification is required to ensure platform security,
                prevent fraud, and comply with financial regulations.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900">Document Guidelines</h4>
              <ul className="mt-1 text-sm text-neutral-600 list-disc list-inside space-y-1">
                <li>Documents must be valid and not expired</li>
                <li>All corners and information must be clearly visible</li>
                <li>Files must be in JPG, PNG, or PDF format, max 5MB in size</li>
                <li>Address proof must be recent (issued within the last 3 months)</li>
                <li>Bank details must clearly show your account number and name</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-neutral-900">Processing Time</h4>
              <p className="mt-1 text-sm text-neutral-600">
                KYC verification typically takes 1-2 business days. You'll be notified once
                the verification is complete.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {
        submissionHistory.length > 0 && (
          <div className="mb-6 relative z-10">
            <Card className="p-6 bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl floating-card rainbow-border-glow">
              <h2 className="text-xl font-semibold mb-4">Submission History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Document Type</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Review Date</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissionHistory.map((submission, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{formatDate(submission.submittedAt)}</td>
                        <td className="px-4 py-2 capitalize">{submission.documentType}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                            submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {submission.reviewedAt ? formatDate(submission.reviewedAt) : '-'}
                        </td>
                        <td className="px-4 py-2">
                          {submission.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )
      }
      {/* Custom Animations and Effects */}
      <style>{`
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .floating-card {
          animation: floating 4s ease-in-out infinite;
        }
        @keyframes rainbowGlow {
          0% { box-shadow: 0 0 16px 2px #ff00cc44, 0 0 32px 8px #3333ff22; }
          25% { box-shadow: 0 0 24px 4px #00eaff44, 0 0 40px 12px #fffb0044; }
          50% { box-shadow: 0 0 32px 8px #00ff9444, 0 0 48px 16px #ff00cc44; }
          75% { box-shadow: 0 0 24px 4px #fffb0044, 0 0 40px 12px #00eaff44; }
          100% { box-shadow: 0 0 16px 2px #ff00cc44, 0 0 32px 8px #3333ff22; }
        }
        .rainbow-border-glow {
          border-image: linear-gradient(90deg, #ff00cc, #3333ff, #00eaff, #fffb00, #00ff94, #ff00cc) 1;
          animation: rainbowGlow 6s linear infinite;
        }
        @keyframes pulseRainbow {
          0%, 100% { text-shadow: 0 0 8px #ff00cc, 0 0 16px #00eaff; }
          25% { text-shadow: 0 0 16px #fffb00, 0 0 32px #3333ff; }
          50% { text-shadow: 0 0 24px #00ff94, 0 0 48px #ff00cc; }
          75% { text-shadow: 0 0 16px #00eaff, 0 0 32px #fffb00; }
        }
        .animate-pulse-rainbow {
          animation: pulseRainbow 3s infinite;
        }
        @keyframes blobSlow {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(20deg); }
        }
        .animate-blob-slow {
          animation: blobSlow 18s ease-in-out infinite;
        }
        @keyframes blobFast {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.05) rotate(-15deg); }
        }
        .animate-blob-fast {
          animation: blobFast 8s ease-in-out infinite;
        }
        .animate-spin {
          animation: spin 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spinReverse 24s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
          100% { transform: rotate(-360deg); }
        }
        @keyframes bgGradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-bg-gradient {
          background-size: 200% 200%;
          animation: bgGradientMove 16s ease-in-out infinite;
        }
        .animate-blob {
          animation: blobFast 12s ease-in-out infinite;
        }
      `}</style>
    </MainLayout >
  );
};

export default Kyc;