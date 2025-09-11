import React, { useState } from 'react';
import { useCreateAssetTransfer } from '../../../api/client/assettransfer';

function TransferModal({ transferringAsset, categories, cancelTransfer, setError, onTransferSuccess }) {
  const { createTransfer, isLoading } = useCreateAssetTransfer();

  // State for new transfer data
  const [newTransferData, setNewTransferData] = useState({
    owner_fullname: '',
    hostname: '',
    p_number: '',
    cadre: '',
    department: '',
    section: '',
    building: '',
    transfer_reason: ''
  });

  const handleTransferSubmit = async () => {
    // Validate required fields
    const requiredFields = [
      { field: 'owner_fullname', label: 'Owner Fullname' },
      { field: 'hostname', label: 'Hostname' },
      { field: 'p_number', label: 'P Number' },
      { field: 'cadre', label: 'Cadre' },
      { field: 'department', label: 'Department' },
      { field: 'section', label: 'Section' },
      { field: 'building', label: 'Building' }
    ];

    const missingFields = requiredFields.filter(
      ({ field }) => !newTransferData[field] || newTransferData[field].trim() === ''
    );

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields.map(({ label }) => label).join(', ');
      setError(`The following fields are required: ${missingFieldNames}`);
      return;
    }

    try {
      // Prepare transfer data matching the backend API
      console.log(newTransferData)
      const transferPayload = {
        asset_id: transferringAsset.id, // Use the database primary key ID for the transfer
        new_owner_fullname: newTransferData.owner_fullname.trim(),
        new_hostname: newTransferData.hostname.trim(),
        new_p_number: newTransferData.p_number.trim(),
        new_cadre: newTransferData.cadre.trim(),
        new_department: newTransferData.department.trim(),
        new_section: newTransferData.section.trim(),
        new_building: newTransferData.building.trim(),
        transfer_reason: newTransferData.transfer_reason.trim(),
        transferred_by: 'admin' // You might want to get this from user context
      };

      // Call the API
      const result = await createTransfer(transferPayload);
      
      if (result && result.success !== false) {
        // Notify parent component of successful transfer
        if (onTransferSuccess) {
          onTransferSuccess({
            asset_id: transferringAsset.id || transferringAsset.asset_id,
            owner_fullname: newTransferData.owner_fullname,
            hostname: newTransferData.hostname,
            p_number: newTransferData.p_number,
            cadre: newTransferData.cadre,
            department: newTransferData.department,
            section: newTransferData.section,
            building: newTransferData.building
          });
        }
        
        // Reset form
        setNewTransferData({
          owner_fullname: '',
          hostname: '',
          p_number: '',
          cadre: '',
          department: '',
          section: '',
          building: '',
          transfer_reason: ''
        });
        
        // Clear any existing errors
        setError(null);
        
        // Show success message
        alert("Asset transferred successfully!");
        
        // Close modal
        cancelTransfer();
      }
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.message || 'Failed to transfer asset. Please try again.');
    }
  };

  if (!transferringAsset) return null;

  return (
    <div className="fixed inset-0 bg-slate-400/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-8 p-4">
      <div className="relative w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200/50 mt-8">

        {/* Close Button */}
        <button
          onClick={cancelTransfer}
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
          aria-label="Close modal"
          disabled={isLoading}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-200/50">
          <h3 className="text-2xl font-bold text-slate-800 mb-1">Transfer Asset</h3>
          <p className="text-sm text-slate-600">Update asset ownership and location details</p>
        </div>

        <div className="p-6">
          {/* Current Asset Info - Readonly */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">Current Asset Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  label: 'Asset ID', 
                  value: transferringAsset.asset_id || 'N/A' 
                },
                { label: 'Serial Number', value: transferringAsset.serial_number || 'N/A' },
                { label: 'Hardware Type', value: transferringAsset.asset_category || transferringAsset.hardware_type || 'N/A' },
                { label: 'Model', value: transferringAsset.model || transferringAsset.model_number || 'N/A' },
                { label: 'Current Owner', value: transferringAsset.owner || transferringAsset.owner_fullname || transferringAsset.current_owner || 'N/A' },
                { label: 'Current PO Number', value: transferringAsset.po_number || transferringAsset.p_number || 'N/A' },
                { label: 'Current Cadre', value: transferringAsset.cadre || transferringAsset.current_cadre || 'N/A' },
                { label: 'Current Department', value: transferringAsset.department || 'N/A' },
                { label: 'Current Building', value: transferringAsset.building || 'N/A' }
              ].map((field, idx) => (
                <div key={idx} className="bg-white/60 p-4 rounded-lg border border-blue-100">
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide block mb-1">{field.label}</span>
                  <p className="text-sm font-semibold text-blue-900">{field.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* New Transfer Form */}
          <h4 className="text-lg font-semibold text-slate-800 mb-6">New Owner Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
            {/* Text Inputs */}
            {[
              { label: 'Owner Fullname', field: 'owner_fullname', type: 'text', placeholder: "Enter owner's full name" },
              { label: 'Hostname', field: 'hostname', type: 'text', placeholder: "Enter hostname" },
              { label: 'P Number', field: 'p_number', type: 'text', placeholder: "Enter P number" }
            ].map(({ label, field, type, placeholder }) => (
              <div key={field} className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">{label} *</label>
                <input
                  type={type}
                  value={newTransferData[field]}
                  onChange={(e) =>
                    setNewTransferData((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  placeholder={placeholder}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white focus:bg-white transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
            ))}

            {/* Select Fields */}
            {[
              { label: 'Cadre', field: 'cadre', options: categories.cadre },
              { label: 'Department', field: 'department', options: categories.department },
              { label: 'Section', field: 'section', options: categories.section },
              { label: 'Building', field: 'building', options: categories.building }
            ].map(({ label, field, options }) => (
              <div key={field} className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">{label} *</label>
                <select
                  value={newTransferData[field]}
                  onChange={(e) => setNewTransferData((prev) => ({ ...prev, [field]: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 hover:bg-white focus:bg-white appearance-none transition-all duration-200"
                  disabled={isLoading}
                >
                  <option value="">Select {label}</option>
                  {options?.map((opt) => (
                    <option key={opt.id} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Transfer Reason */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-slate-700">Transfer Reason</label>
            <textarea
              value={newTransferData.transfer_reason}
              onChange={(e) => setNewTransferData((prev) => ({ ...prev, transfer_reason: e.target.value }))}
              rows={3}
              placeholder="Enter reason for transfer (Mandatory)"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-slate-50/50 hover:bg-white focus:bg-white transition-all duration-200"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 p-6 border-t bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={cancelTransfer}
            className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 focus:ring-2 focus:ring-slate-300 focus:outline-none transition-all duration-200 font-semibold"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleTransferSubmit}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isLoading}
          >
            {isLoading ? 'Transferring...' : 'Transfer Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}
export default TransferModal;