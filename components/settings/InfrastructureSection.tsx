import React, { useState } from 'react';
import { Layers, Zap, Plus, Trash2, Edit3, Check, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { floorSchema } from '@/lib/validations';

interface Floor {
  id: string;
  name: string;
  totalSeats: number;
}

interface InfrastructureSectionProps {
  floors: Floor[];
  facilities: string[];
  onAddFloor: (name: string, totalSeats: number) => Promise<any>;
  onUpdateFloor: (floorId: string, name: string, totalSeats: number) => Promise<any>;
  onDeleteFloor: (floorId: string) => Promise<any>;
  onAddFacility: (facility: string) => void;
  onRemoveFacility: (facility: string) => void;
  isLoading?: boolean;
}

export const InfrastructureSection = ({
  floors,
  facilities,
  onAddFloor,
  onUpdateFloor,
  onDeleteFloor,
  onAddFacility,
  onRemoveFacility,
  isLoading
}: InfrastructureSectionProps) => {
  const [editingFloor, setEditingFloor] = useState<string | null>(null);
  const [floorFormData, setFloorFormData] = useState<{ name: string; totalSeats: number }>({ name: '', totalSeats: 0 });
  const [newFacility, setNewFacility] = useState('');
  const [showAddFacility, setShowAddFacility] = useState(false);
  const [floorErrors, setFloorErrors] = useState<Record<string, string>>({});

  const validateFloor = (name: string, totalSeats: number) => {
    try {
      floorSchema.parse({ name, totalSeats });
      setFloorErrors({});
      return true;
    } catch (error: any) {
      const errors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        errors[err.path[0]] = err.message;
      });
      setFloorErrors(errors);
      return false;
    }
  };

  const handleAddFloor = async () => {
    if (!validateFloor(floorFormData.name, floorFormData.totalSeats)) return;
    const result = await onAddFloor(floorFormData.name, floorFormData.totalSeats);
    if (result.success) {
      setFloorFormData({ name: '', totalSeats: 0 });
      setFloorErrors({});
    }
  };

  const handleSaveFloor = async (floor: Floor) => {
    if (!validateFloor(floorFormData.name, floorFormData.totalSeats)) return;
    const result = await onUpdateFloor(floor.id, floorFormData.name, floorFormData.totalSeats);
    if (result.success) {
      setEditingFloor(null);
      setFloorFormData({ name: '', totalSeats: 0 });
      setFloorErrors({});
    }
  };

  const handleAddFacility = () => {
    if (newFacility.trim()) {
      onAddFacility(newFacility);
      setNewFacility('');
      setShowAddFacility(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* FLOOR MANAGEMENT CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-indigo-600" />
            <h3 className="font-bold text-lg">Floor Configuration</h3>
          </div>
          <div className="text-sm text-slate-500">{floors.length} floors</div>
        </div>

        <div className="p-6 space-y-3">
          {floors.map((floor) => (
            <div key={floor.id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
              {editingFloor === floor.id ? (
                <div className="flex flex-1 gap-3 items-center">
                  <input
                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={floorFormData.name}
                    onChange={(e) => setFloorFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Floor Name"
                    autoFocus
                  />
                  <input
                    className="w-20 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    type="number"
                    value={floorFormData.totalSeats}
                    onChange={(e) => setFloorFormData(prev => ({ ...prev, totalSeats: parseInt(e.target.value) || 0 }))}
                    placeholder="Seats"
                  />
                  <button
                    onClick={() => handleSaveFloor(floor)}
                    disabled={isLoading}
                    className="p-1.5 bg-emerald-100 text-emerald-600 rounded-md hover:bg-emerald-200"
                  >
                    <Check size={16}/>
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-bold text-slate-700">{floor.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{floor.totalSeats} Available Seats</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingFloor(floor.id);
                        setFloorFormData({ name: floor.name, totalSeats: floor.totalSeats });
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <Edit3 size={16}/>
                    </button>
                    <button
                      onClick={() => onDeleteFloor(floor.id)}
                      disabled={isLoading}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add Floor Input */}
          <div className="flex gap-2 items-start p-4 bg-indigo-50/30 rounded-xl border border-indigo-100">
            <div className="flex-1">
              <input
                className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                  floorErrors.name ? 'border-red-500 ring-2 ring-red-200' : 'border-indigo-100'
                }`}
                placeholder="New floor name"
                value={floorFormData.name}
                onChange={(e) => setFloorFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              {floorErrors.name && <p className="text-red-500 text-xs mt-1">{floorErrors.name}</p>}
            </div>
            <div className="w-24">
              <input
                className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                  floorErrors.totalSeats ? 'border-red-500 ring-2 ring-red-200' : 'border-indigo-100'
                }`}
                type="number"
                placeholder="Seats"
                value={floorFormData.totalSeats || ''}
                onChange={(e) => setFloorFormData(prev => ({ ...prev, totalSeats: parseInt(e.target.value) || 0 }))}
              />
              {floorErrors.totalSeats && <p className="text-red-500 text-xs mt-1">{floorErrors.totalSeats}</p>}
            </div>
            <button
              onClick={handleAddFloor}
              disabled={isLoading || !floorFormData.name.trim()}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition mt-2"
            >
              <Plus size={16}/>
            </button>
          </div>
        </div>
      </div>

      {/* FACILITIES CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-amber-500" />
            <h3 className="font-bold text-lg">Library Facilities</h3>
          </div>
          <div className="text-sm text-slate-500">{facilities.length} active</div>
        </div>

        <div className="p-6">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Active Amenities</p>
          <div className="flex flex-wrap gap-3 mb-6">
            {facilities.map((facility) => (
              <div
                key={facility}
                className="group flex items-center gap-2 px-4 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-all"
              >
                <CheckCircle2 size={14} className="text-emerald-500" />
                {facility}
                <button
                  onClick={() => onRemoveFacility(facility)}
                  className="ml-1 text-indigo-300 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Facility */}
          {showAddFacility ? (
            <div className="flex gap-2 mb-4">
              <input
                autoFocus
                className="flex-1 px-3 py-2 border border-indigo-100 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="Add facility"
                value={newFacility}
                onChange={(e) => setNewFacility(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddFacility()}
              />
              <button
                onClick={handleAddFacility}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddFacility(false);
                  setNewFacility('');
                }}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddFacility(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all text-sm font-bold"
            >
              <Plus size={16} /> Add New
            </button>
          )}

          <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[11px] text-amber-700 font-bold leading-relaxed">
              💡 Tip: Facilities added here will be visible to students on the registration portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfrastructureSection;