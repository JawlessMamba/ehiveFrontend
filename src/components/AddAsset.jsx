import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Header from './common/Header';
import Navigation from './common/Navigation';
import Footer from './common/Footer';
import LoadingSpinner from './common/LoadingSpinner';
import { useCreateAsset } from '../../api/client/asset';
import { useAllCategories } from '../../api/client/category';

function AddAsset() {
  const [isCommon, setIsCommon] = useState(false);
  const [success, setSuccess] = useState(null);

  const { createAsset, isPending, isError: mutationError, error: mutationErrorData } = useCreateAsset();
  const { combinedOptions: categories, isLoading, isError } = useAllCategories([
    'department',
    'section',
    'hardware_type',
    'building',
    'vendor',
    'model',
    'cadre',
    'operational_status',
    'disposition_status',
  ]);

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

const onSubmit = async (data) => {
  console.log('Form data:', data);
  try {
    // Map form data to API payload - STORE VALUES, NOT IDs
    const payload = {
      asset_id: data.asset_id || null,
      serial_number: data.serial_number,
      
      // Store the actual value/name, not the ID
      hardware_type: data.hardware_type || null,
      
      model_number: data.model || null,
      employee_id: data.owner_fullname || null,
      owner_fullname: data.owner_fullname || null,
      hostname: data.hostname || null,
      p_number: data.p_number || null,
      
      // Store the actual value/name, not the ID
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
      
      // Store the actual value/name, not the ID
      operational_status: data.operational_status || null,
      disposition_status: data.disposition_status || null,
    };

    console.log('Submitting asset data (storing values, not IDs):', payload);

    await createAsset(payload);
    setSuccess('Asset created successfully!');
    reset();
    setIsCommon(false);
  } catch (err) {
    setSuccess(null);
    console.error('Error creating asset:', err);
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
        {mutationError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {mutationErrorData?.message || 'Failed to create asset'}
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
                      {categories.hardware_type?.map((type) => (
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
                      {categories.model?.map((model) => (
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
                      {categories.cadre?.map((cadre) => (
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
                      {categories.department?.map((dept) => (
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
                      {categories.section?.map((sec) => (
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
                      {categories.building?.map((building) => (
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
                      {categories.vendor?.map((vendor) => (
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
                      {categories.operational_status?.map((status) => (
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
                      {categories.disposition_status?.map((status) => (
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

            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setIsCommon(false);
                  setSuccess(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                <i className="fas fa-undo mr-2"></i>Reset
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
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