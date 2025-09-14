import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Header from './common/Header';
import Navigation from './common/Navigation';
import Footer from './common/Footer';
import LoadingSpinner from './common/LoadingSpinner';

// Dummy data to replace API calls
const dummyCategories = {
  hardware_type: [
    { id: 1, value: 'Laptop' },
    { id: 2, value: 'Desktop' },
    { id: 3, value: 'Server' },
    { id: 4, value: 'Printer' },
    { id: 5, value: 'Network Device' },
    { id: 6, value: 'Monitor' },
    { id: 7, value: 'Router' },
    { id: 8, value: 'Switch' }
  ],
  model: [
    { id: 1, value: 'Dell Latitude 5520' },
    { id: 2, value: 'HP EliteBook 840' },
    { id: 3, value: 'Lenovo ThinkPad T14' },
    { id: 4, value: 'Dell OptiPlex 7090' },
    { id: 5, value: 'HP ProDesk 400' },
    { id: 6, value: 'MacBook Pro 14-inch' },
    { id: 7, value: 'Dell Inspiron 3501' },
    { id: 8, value: 'HP Pavilion 15' }
  ],
  cadre: [
    { id: 1, value: 'Officer' },
    { id: 2, value: 'Staff' },
    { id: 3, value: 'Manager' },
    { id: 4, value: 'Director' },
    { id: 5, value: 'Executive' },
    { id: 6, value: 'Supervisor' },
    { id: 7, value: 'Coordinator' },
    { id: 8, value: 'Specialist' }
  ],
  department: [
    { id: 1, value: 'Information Technology' },
    { id: 2, value: 'Human Resources' },
    { id: 3, value: 'Finance & Accounting' },
    { id: 4, value: 'Operations' },
    { id: 5, value: 'Marketing & Sales' },
    { id: 6, value: 'Research & Development' },
    { id: 7, value: 'Quality Assurance' },
    { id: 8, value: 'Customer Service' }
  ],
  section: [
    { id: 1, value: 'Software Development' },
    { id: 2, value: 'Technical Support' },
    { id: 3, value: 'Network Infrastructure' },
    { id: 4, value: 'Information Security' },
    { id: 5, value: 'Quality Assurance' },
    { id: 6, value: 'Database Administration' },
    { id: 7, value: 'System Administration' },
    { id: 8, value: 'Help Desk' }
  ],
  building: [
    { id: 1, value: 'Main Building' },
    { id: 2, value: 'North Wing' },
    { id: 3, value: 'South Wing' },
    { id: 4, value: 'East Wing' },
    { id: 5, value: 'West Wing' },
    { id: 6, value: 'Annex Building' },
    { id: 7, value: 'Remote Office A' },
    { id: 8, value: 'Remote Office B' }
  ],
  vendor: [
    { id: 1, value: 'Dell Technologies' },
    { id: 2, value: 'HP Inc.' },
    { id: 3, value: 'Lenovo Group' },
    { id: 4, value: 'Microsoft Corporation' },
    { id: 5, value: 'Cisco Systems' },
    { id: 6, value: 'Apple Inc.' },
    { id: 7, value: 'ASUS Computer' },
    { id: 8, value: 'Acer Group' }
  ],
  operational_status: [
    { id: 1, value: 'Active' },
    { id: 2, value: 'Inactive' },
    { id: 3, value: 'Under Maintenance' },
    { id: 4, value: 'Retired' },
    { id: 5, value: 'In Storage' },
    { id: 6, value: 'Under Repair' },
    { id: 7, value: 'Awaiting Assignment' }
  ],
  disposition_status: [
    { id: 1, value: 'In Use' },
    { id: 2, value: 'Available' },
    { id: 3, value: 'Under Repair' },
    { id: 4, value: 'Disposed' },
    { id: 5, value: 'Lost/Stolen' },
    { id: 6, value: 'Transferred' },
    { id: 7, value: 'Surplus' }
  ]
};

function AddAsset() {
  const [isCommon, setIsCommon] = useState(false);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Simulated loading state
  const [isLoading] = useState(false);
  const [isError] = useState(false);

  // Create dynamic validation schema based on isCommon state
  const createValidationSchema = (isCommon) =>
    yup.object().shape({
      asset_id: yup.string().trim(),
      serial_number: yup.string().required('Serial number is required').trim(),
      hardware_type: yup.string().required('Hardware type is required'),
      model: yup.string().nullable(),
      cadre: yup.string().required('Cadre is required'),
      department: yup.string().required('Department is required'),
      section: yup.string().nullable(),
      building: yup.string().nullable(),
      vendor: yup.string().nullable(),
      po_number: yup.string().nullable(),
      po_date: yup
        .date()
        .nullable()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .max(new Date(), 'PO date cannot be in the future'),
      dc_number: yup.string().nullable(),
      dc_date: yup
        .date()
        .nullable()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .max(new Date(), 'DC date cannot be in the future'),
      assigned_date: yup
        .date()
        .nullable()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .max(new Date(), 'Assigned date cannot be in the future'),
      replacement_due_period: yup.string().nullable(),
      replacement_due_date: yup
        .date()
        .nullable()
        .transform((value, originalValue) => (originalValue === '' ? null : value))
        .when('replacement_due_period', {
          is: 'other',
          then: (schema) => schema.required('Replacement due date is required when "Other" is selected'),
        }),
      operational_status: yup.string().required('Operational status is required'),
      disposition_status: yup.string().required('Disposition status is required'),
      ...(isCommon
        ? {
            owner_fullname: yup.string().nullable(),
            hostname: yup.string().nullable(),
            p_number: yup.string().nullable(),
          }
        : {
            owner_fullname: yup.string().required('Owner fullname is required').trim(),
            hostname: yup.string().required('Hostname is required').trim(),
            p_number: yup.string().required('P number is required').trim(),
          }),
    });

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(createValidationSchema(isCommon)),
    defaultValues: {
      asset_id: '',
      serial_number: '',
      hardware_type: '',
      model: '',
      owner_fullname: '',
      hostname: '',
      p_number: '',
      cadre: '',
      department: '',
      section: '',
      building: '',
      vendor: '',
      po_number: '',
      po_date: '',
      dc_number: '',
      dc_date: '',
      assigned_date: '',
      replacement_due_period: '',
      replacement_due_date: '',
      operational_status: '',
      disposition_status: '',
    },
    mode: 'onChange',
  });

  // Update validation schema when isCommon changes
  useEffect(() => {
    reset(undefined, { keepValues: true }); // Re-apply validation schema without resetting form values
  }, [isCommon, reset]);

  // Watch specific fields for auto-calculation
  const watchedDcDate = watch('dc_date');
  const watchedReplacementPeriod = watch('replacement_due_period');

  useEffect(() => {
    if (isCommon) {
      setValue('owner_fullname', 'common');
      setValue('hostname', 'common');
      setValue('p_number', 'common');
      clearErrors(['owner_fullname', 'hostname', 'p_number']);
    } else {
      setValue('owner_fullname', '');
      setValue('hostname', '');
      setValue('p_number', '');
    }
  }, [isCommon, setValue, clearErrors]);

  useEffect(() => {
    if (watchedDcDate && watchedReplacementPeriod && watchedReplacementPeriod !== 'other') {
      const dcDate = new Date(watchedDcDate);
      if (!isNaN(dcDate)) {
        const years = watchedReplacementPeriod === '3_years' ? 3 : 5;
        dcDate.setFullYear(dcDate.getFullYear() + years);
        setValue('replacement_due_date', dcDate.toISOString().split('T')[0]);
      }
    } else if (watchedReplacementPeriod === 'other') {
      setValue('replacement_due_date', '');
    }
  }, [watchedDcDate, watchedReplacementPeriod, setValue]);

  // Simulate API call with dummy response
  const onSubmit = async (data) => {
    console.log('Form data:', data);
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate random success/error (80% success rate)
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        // Map form data to API payload - STORE VALUES, NOT IDs
        const payload = {
          asset_id: data.asset_id || null,
          serial_number: data.serial_number,
          hardware_type: data.hardware_type || null,
          model_number: data.model || null,
          employee_id: data.owner_fullname || null,
          owner_fullname: data.owner_fullname || null,
          hostname: data.hostname || null,
          p_number: data.p_number || null,
          cadre: data.cadre || null,
          department: data.department || null,
          section: data.section || null,
          building: data.building || null,
          vendor: data.vendor || null,
          po_number: data.po_number || null,
          po_date: data.po_date ? new Date(data.po_date).toISOString().split('T')[0] : null,
          dc_number: data.dc_number || null,
          dc_date: data.dc_date ? new Date(data.dc_date).toISOString().split('T')[0] : null,
          assigned_date: data.assigned_date ? new Date(data.assigned_date).toISOString().split('T')[0] : null,
          replacement_due_period: data.replacement_due_period || null,
          replacement_due_date: data.replacement_due_date
            ? new Date(data.replacement_due_date).toISOString().split('T')[0]
            : null,
          operational_status: data.operational_status || null,
          disposition_status: data.disposition_status || null,
        };

        console.log('Simulated API success with payload:', payload);
        setSuccess('Asset created successfully!');
        reset();
        setIsCommon(false);
      } else {
        throw new Error('Simulated API error - please try again');
      }
    } catch (err) {
      setSuccess(null);
      setSubmitError(err.message || 'Failed to create asset');
      console.error('Simulated error creating asset:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading categories..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading categories
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="Add New Asset"
        subtitle="Create a new IT asset record"
        showRoleSelector={false}
      />
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {submitError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {submitError}
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              {success}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Asset Information</h2>
            <p className="text-sm text-gray-600">
              Fill in all required fields marked with <span className="text-red-500">*</span>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="mb-6">
              <div className="flex items-center">
                <input
                  id="common"
                  type="checkbox"
                  checked={isCommon}
                  onChange={(e) => setIsCommon(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="common" className="ml-2 block text-sm text-gray-700">
                  <i className="fas fa-check text-green-500 mr-1"></i>
                  Common (shared asset)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset ID
                </label>
                <Controller
                  name="asset_id"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter asset ID"
                    />
                  )}
                />
                {errors.asset_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.asset_id.message}</p>
                )}
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial # <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="serial_number"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.serial_number ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter serial number"
                    />
                  )}
                />
                {errors.serial_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.serial_number.message}</p>
                )}
              </div>

              {/* Hardware Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hardware Type <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="hardware_type"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.hardware_type ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Hardware Type</option>
                      {dummyCategories.hardware_type?.map((type) => (
                        <option key={type.id} value={type.value}>
                          {type.value}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.hardware_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.hardware_type.message}</p>
                )}
              </div>

              {/* Model Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Number
                </label>
                <Controller
                  name="model"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Model</option>
                      {dummyCategories.model?.map((model) => (
                        <option key={model.id} value={model.value}>
                          {model.value}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.model && (
                  <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
                )}
              </div>

              {/* Owner Fullname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Fullname {isCommon ? '' : <span className="text-red-500">*</span>}
                </label>
                <Controller
                  name="owner_fullname"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      disabled={isCommon}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isCommon ? 'bg-gray-100 text-gray-600' : ''
                      } ${errors.owner_fullname ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder={isCommon ? 'Set to "common" for shared assets' : 'Enter owner fullname'}
                    />
                  )}
                />
                {errors.owner_fullname && (
                  <p className="mt-1 text-sm text-red-600">{errors.owner_fullname.message}</p>
                )}
              </div>

              {/* Hostname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostname {isCommon ? '' : <span className="text-red-500">*</span>}
                </label>
                <Controller
                  name="hostname"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      disabled={isCommon}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isCommon ? 'bg-gray-100 text-gray-600' : ''
                      } ${errors.hostname ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder={isCommon ? 'Set to "common" for shared assets' : 'Enter hostname'}
                    />
                  )}
                />
                {errors.hostname && (
                  <p className="mt-1 text-sm text-red-600">{errors.hostname.message}</p>
                )}
              </div>

              {/* P Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  P Number {isCommon ? '' : <span className="text-red-500">*</span>}
                </label>
                <Controller
                  name="p_number"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      disabled={isCommon}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isCommon ? 'bg-gray-100 text-gray-600' : ''
                      } ${errors.p_number ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder={isCommon ? 'Set to "common" for shared assets' : 'Enter P number'}
                    />
                  )}
                />
                {errors.p_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.p_number.message}</p>
                )}
              </div>

              {/* Cadre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cadre <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="cadre"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.cadre ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Cadre</option>
                      {dummyCategories.cadre?.map((cadre) => (
                        <option key={cadre.id} value={cadre.value}>
                          {cadre.value}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.cadre && (
                  <p className="mt-1 text-sm text-red-600">{errors.cadre.message}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Department</option>
                      {dummyCategories.department?.map((dept) => (
                        <option key={dept.id} value={dept.value}>
                          {dept.value}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <Controller
                  name="section"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Section</option>
                      {dummyCategories.section?.map((sec) => (
                        <option key={sec.id} value={sec.value}>
                          {sec.value}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.section && (
                  <p className="mt-1 text-sm text-red-600">{errors.section.message}</p>
                )}
              </div>

              {/* Building */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building
                </label>
                <Controller
                  name="building"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Building</option>
                      {dummyCategories.building?.map((building) => (
                        <option key={building.id} value={building.value}>
                          {building.value}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.building && (
                  <p className="mt-1 text-sm text-red-600">{errors.building.message}</p>
                )}
              </div>

              {/* Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <Controller
                  name="vendor"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Vendor</option>
                      {dummyCategories.vendor?.map((vendor) => (
                        <option key={vendor.id} value={vendor.value}>
                          {vendor.value}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.vendor && (
                  <p className="mt-1 text-sm text-red-600">{errors.vendor.message}</p>
                )}
              </div>

              {/* PO Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PO Number
                </label>
                <Controller
                  name="po_number"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter PO number"
                    />
                  )}
                />
                {errors.po_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.po_number.message}</p>
                )}
              </div>

              {/* PO Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PO Date
                </label>
                <Controller
                  name="po_date"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.po_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.po_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.po_date.message}</p>
                )}
              </div>

              {/* DC Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DC Number
                </label>
                <Controller
                  name="dc_number"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter DC number"
                    />
                  )}
                />
                {errors.dc_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.dc_number.message}</p>
                )}
              </div>

              {/* DC Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DC Date
                </label>
                <Controller
                  name="dc_date"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.dc_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.dc_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.dc_date.message}</p>
                )}
              </div>

              {/* Assigned Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Date
                </label>
                <Controller
                  name="assigned_date"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.assigned_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  )}
                />
                {errors.assigned_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.assigned_date.message}</p>
                )}
              </div>

              {/* Replacement Due Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Replacement Due Period
                </label>
                <Controller
                  name="replacement_due_period"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Period</option>
                      <option value="3_years">3 Years</option>
                      <option value="5_years">5 Years</option>
                      <option value="other">Other</option>
                    </select>
                  )}
                />
                {errors.replacement_due_period && (
                  <p className="mt-1 text-sm text-red-600">{errors.replacement_due_period.message}</p>
                )}
              </div>

              {/* Replacement Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Replacement Due Date
                  {watchedReplacementPeriod === 'other' && <span className="text-red-500">*</span>}
                </label>
                <Controller
                  name="replacement_due_date"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      disabled={watchedReplacementPeriod && watchedReplacementPeriod !== 'other'}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        watchedReplacementPeriod && watchedReplacementPeriod !== 'other'
                          ? 'bg-gray-100 text-gray-600'
                          : ''
                      } ${errors.replacement_due_date ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder={
                        watchedReplacementPeriod && watchedReplacementPeriod !== 'other'
                          ? 'Auto-calculated from DC date + selected period'
                          : 'Select replacement due date'
                      }
                    />
                  )}
                />
                {errors.replacement_due_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.replacement_due_date.message}</p>
                )}
              </div>

              {/* Operational Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operational Status <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="operational_status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.operational_status ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Operational Status</option>
                      {dummyCategories.operational_status?.map((status) => (
                        <option key={status.id} value={status.value}>
                          {status.value}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.operational_status && (
                  <p className="mt-1 text-sm text-red-600">{errors.operational_status.message}</p>
                )}
              </div>

              {/* Disposition Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disposition Status <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="disposition_status"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.disposition_status ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Disposition Status</option>
                      {dummyCategories.disposition_status?.map((status) => (
                        <option key={status.id} value={status.value}>
                          {status.value}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.disposition_status && (
                  <p className="mt-1 text-sm text-red-600">{errors.disposition_status.message}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setIsCommon(false);
                  setSuccess(null);
                  setSubmitError(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <i className="fas fa-undo mr-2"></i>Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>Create Asset
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AddAsset;