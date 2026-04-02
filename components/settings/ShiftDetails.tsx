'use client';
import { useState } from 'react';
import { Clock, ToggleRight, ToggleLeft, AlertCircle } from 'lucide-react';
import { shiftSchema } from '@/lib/validations';

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  price: number;
  active?: boolean;
}

interface ShiftDetailsProps {
  shifts: Shift[];
  onUpdateShift: (shiftId: string, startTime: string, endTime: string, price: number) => Promise<any>;
  onToggleShift?: (shiftId: string) => void;
  isLoading?: boolean;
}

export const ShiftDetails = ({
  shifts,
  onUpdateShift,
  onToggleShift,
  isLoading
}: ShiftDetailsProps) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, Record<string, string>>>({});

  const validateShiftField = (shiftId: string, field: string, value: any) => {
    try {
      const shift = shifts.find(s => s.id === shiftId);
      if (!shift) return true;

      const dataToValidate = {
        name: shift.name,
        startTime: field === 'startTime' ? value : shift.startTime,
        endTime: field === 'endTime' ? value : shift.endTime,
        price: field === 'price' ? value : shift.price,
        active: shift.active ?? true,
      };

      shiftSchema.parse(dataToValidate);

      // Clear errors for this shift
      setValidationErrors(prev => {
        const { [shiftId]: _, ...rest } = prev;
        return rest;
      });
      return true;
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        errors[err.path[0]] = err.message;
      });
      setValidationErrors(prev => ({
        ...prev,
        [shiftId]: { ...prev[shiftId], ...errors }
      }));
      return false;
    }
  };

  const handlePriceChange = async (shiftId: string, newPrice: number, shift: Shift) => {
    if (validateShiftField(shiftId, 'price', newPrice)) {
      await onUpdateShift(shiftId, shift.startTime, shift.endTime, newPrice);
    }
  };

  const handleTimeChange = async (shiftId: string, field: 'startTime' | 'endTime', value: string, shift: Shift) => {
    if (validateShiftField(shiftId, field, value)) {
      const startTime = field === 'startTime' ? value : shift.startTime;
      const endTime = field === 'endTime' ? value : shift.endTime;
      await onUpdateShift(shiftId, startTime, endTime, shift.price);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-blue-500" />
          <h2 className="font-bold text-lg">Shift Configuration & Pricing</h2>
        </div>
        <div className="text-sm text-slate-500">{shifts.length} shifts</div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className={`p-5 rounded-2xl border transition-all ${
                shift.active !== false
                  ? 'border-indigo-100 bg-indigo-50/30'
                  : 'border-slate-100 bg-slate-50 opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-[10px] font-black px-2 py-1 rounded bg-white border uppercase tracking-widest ${
                    shift.active !== false
                      ? 'text-indigo-600 border-indigo-100'
                      : 'text-slate-400 border-slate-200'
                  }`}
                >
                  {shift.name}
                </span>
                <button
                  onClick={() => onToggleShift?.(shift.id)}
                  disabled={isLoading}
                  className={shift.active !== false ? 'text-indigo-600' : 'text-slate-300'}
                >
                  {shift.active !== false ? (
                    <ToggleRight size={28}/>
                  ) : (
                    <ToggleLeft size={28}/>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Start Time</label>
                  <input
                    type="time"
                    className={`w-full bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none font-medium text-slate-700 ${
                      validationErrors[shift.id]?.startTime ? 'border-red-500 text-red-600' : ''
                    }`}
                    value={shift.startTime}
                    onChange={(e) => handleTimeChange(shift.id, 'startTime', e.target.value, shift)}
                    disabled={isLoading}
                  />
                  {validationErrors[shift.id]?.startTime && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors[shift.id].startTime}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">End Time</label>
                  <input
                    type="time"
                    className={`w-full bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none font-medium text-slate-700 ${
                      validationErrors[shift.id]?.endTime ? 'border-red-500 text-red-600' : ''
                    }`}
                    value={shift.endTime}
                    onChange={(e) => handleTimeChange(shift.id, 'endTime', e.target.value, shift)}
                    disabled={isLoading}
                  />
                  {validationErrors[shift.id]?.endTime && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors[shift.id].endTime}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Price</label>
                  <div className={`flex items-center gap-1 font-bold text-indigo-700 ${
                    validationErrors[shift.id]?.price ? 'text-red-600' : ''
                  }`}>
                    <span>₹</span>
                    <input
                      type="number"
                      className={`w-full bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none ${
                        validationErrors[shift.id]?.price ? 'border-red-500' : ''
                      }`}
                      value={shift.price}
                      onChange={(e) => handlePriceChange(shift.id, parseFloat(e.target.value), shift)}
                      disabled={isLoading}
                    />
                  </div>
                  {validationErrors[shift.id]?.price && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors[shift.id].price}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};