import React from 'react'
import {
  FolderOpen,
  FileText,
  Search,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react'

export const DocumentsPage: React.FC = () => {
  const documents = [
    {
      id: 'DOC-1102',
      client: 'Rajesh Verma',
      docType: 'Permanent Account Number (PAN)',
      fileName: 'pan_card_rajesh_v.pdf',
      status: 'Verified',
      uploadedDate: '15-Nov-2026',
      verifiedBy: 'Sneha Reddy (Operations)',
    },
    {
      id: 'DOC-1103',
      client: 'Rajesh Verma',
      docType: 'Income Proof (ITR V FY23-24)',
      fileName: 'itr_v_acknowledgement.pdf',
      status: 'Verified',
      uploadedDate: '15-Nov-2026',
      verifiedBy: 'Sneha Reddy (Operations)',
    },
    {
      id: 'DOC-1104',
      client: 'Ananya Iyer',
      docType: 'Aadhaar Offline XML / Masked',
      fileName: 'aadhaar_masked_ananya.pdf',
      status: 'Pending Verification',
      uploadedDate: '16-Nov-2026',
      verifiedBy: 'Pending Queue',
    },
    {
      id: 'DOC-1105',
      client: 'Suresh Patel',
      docType: 'Proposal Form Countersigned',
      fileName: 'sbi_proposal_signed.pdf',
      status: 'Pending Verification',
      uploadedDate: '16-Nov-2026',
      verifiedBy: 'Pending Queue',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8EF]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#16856D]">
            Document Management Repository
          </span>
          <h1 className="text-2xl font-bold text-[#142D4E] font-['Manrope'] mt-0.5">
            Client KYC & Proposal Documents
          </h1>
          <p className="text-xs text-[#687788]">
            Encrypted document storage repository complying with IRDAI electronic records management standards.
          </p>
        </div>

        <button
          onClick={() => alert('Secure Document Upload Dialog: Drag and drop PDF/TIFF files.')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142D4E] hover:bg-[#1D3D5C] text-white text-xs font-semibold shadow-xs"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Customer Document</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8EF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9FB] border-b border-[#E2E8EF] text-[#687788]">
              <tr>
                <th className="py-3 px-4 font-semibold">Doc ID & Date</th>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Document Type</th>
                <th className="py-3 px-4 font-semibold">File Name</th>
                <th className="py-3 px-4 font-semibold">Verification Status</th>
                <th className="py-3 px-4 font-semibold">Audited By</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8EF]">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F7F9FB]/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[#142D4E] block">{doc.id}</span>
                    <span className="text-[10px] text-[#687788]">{doc.uploadedDate}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#182536]">{doc.client}</td>
                  <td className="py-3 px-4 font-medium text-[#182536]">{doc.docType}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#687788] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#16856D]" />
                    <span>{doc.fileName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        doc.status === 'Verified'
                          ? 'bg-[#E8F5F2] text-[#16856D]'
                          : 'bg-[#FDF7EE] text-[#C58A36]'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#687788] text-[11px]">{doc.verifiedBy}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Reviewing document ${doc.fileName}`)}
                      className="px-2 py-1 text-[11px] font-semibold rounded bg-[#E9F1F5] hover:bg-[#d8e7ee] text-[#142D4E]"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
