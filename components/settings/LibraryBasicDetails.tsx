'use client';
import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, Edit3, Check } from 'lucide-react';
import { useLibraryStore } from '@/lib/store';
import { libraryFormSchema, type LibraryFormState } from '@/lib/validations';

interface LibraryBasicDetailsProps {
  data: any;
  isLoading?: boolean;
}

export const LibraryBasicDetails = ({ data, isLoading }: LibraryBasicDetailsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<LibraryFormState>(data);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { updateLibrary, createLibrary, library } = useLibraryStore();

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSave = async () => {
    try {
      // Validate form data
      const validatedData = libraryFormSchema.parse(formData);

      if (library?.id) {
        await updateLibrary(validatedData);
      } else {
        await createLibrary(validatedData);
      }

      setIsEditing(false);
      setValidationErrors({});
    } catch (error: any) {
      if (error.errors) {
        // Handle Zod validation errors
        const errors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        setValidationErrors(errors);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Building2 size={20} className="text-indigo-600" /> Library Profile
        </h2>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition ${isEditing ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}
        >
          {isEditing ? <><Check size={16}/> Save</> : <><Edit3 size={16}/> Edit Details</>}
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
        <DetailItem
          label="Library Name"
          value={formData.name}
          icon={<Building2 size={16}/>}
          isEditing={isEditing}
          error={validationErrors.name}
          onChange={(val) => handleChange('name', val)}
        />
        <DetailItem
          label="Email Address"
          value={formData.email}
          icon={<Mail size={16}/>}
          isEditing={isEditing}
          error={validationErrors.email}
          onChange={(val) => handleChange('email', val)}
        />
        <DetailItem
          label="Contact"
          value={formData.contactNumber}
          icon={<Phone size={16}/>}
          isEditing={isEditing}
          error={validationErrors.contactNumber}
          onChange={(val) => handleChange('contactNumber', val)}
        />
        <div className="md:col-span-2 lg:col-span-3">
          <DetailItem
            label="Full Address"
            value={formData.address}
            icon={<MapPin size={16}/>}
            isEditing={isEditing}
            error={validationErrors.address}
            onChange={(val) => handleChange('address', val)}
          />
        </div>
      </div>
    </div>
  );
};

interface DetailItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isEditing: boolean;
  error?: string;
  onChange?: (value: string) => void;
}

const DetailItem = ({ label, value, icon, isEditing, error, onChange }: DetailItemProps) => (
  <div className="space-y-1.5">
    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </p>
    {isEditing ? (
      <div>
        <input
          className={`w-full px-3 py-2 border rounded-lg bg-indigo-50/30 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium ${
            error ? 'border-red-500 ring-2 ring-red-200' : 'border-indigo-100'
          }`}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    ) : (
      <p className="text-slate-700 font-semibold truncate">{value || 'Not provided'}</p>
    )}
  </div>
);
