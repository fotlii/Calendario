
import React, { useState } from 'react';
import type { TeamMember } from '../types';

interface TeamManagerProps {
  teamMembers: TeamMember[];
  onClose: () => void;
  onAddMember: (newMember: Omit<TeamMember, 'id'>) => void;
  onRemoveMember: (personId: string) => void;
  onReactivateMember: (personId: string, newShift: 'M' | 'T' | 'JF') => void;
}

const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-black">{label}</label>
        <input type="text" {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
);

const SelectField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-black">{label}</label>
        <select {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
    </div>
);

export const TeamManager: React.FC<TeamManagerProps> = ({ teamMembers, onClose, onAddMember, onRemoveMember, onReactivateMember }) => {
    const [newName, setNewName] = useState('');
    const [newRole, setNewRole] = useState('Agent');
    const [newShift, setNewShift] = useState<'M' | 'T' | 'JF' | 'B'>('M');
    
    const [reactivating, setReactivating] = useState<{ id: string; name: string } | null>(null);
    const [reactivateShift, setReactivateShift] = useState<'M' | 'T' | 'JF'>('M');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) {
            alert("El nombre no puede estar vacío.");
            return;
        }
        onAddMember({ name: newName.trim(), role: newRole, defaultShift: newShift });
        setNewName('');
        setNewRole('Agent');
        setNewShift('M');
    };
    
    const handleConfirmReactivate = () => {
        if (reactivating) {
            onReactivateMember(reactivating.id, reactivateShift);
            setReactivating(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-black">Gestionar Equipo</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light leading-none">&times;</button>
                </div>
                
                <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Add Member Form */}
                    <div className="border-r-0 md:border-r pr-0 md:pr-8">
                        <h3 className="text-lg font-semibold text-black mb-4">Añadir Nuevo Miembro</h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <InputField label="Nombre Completo" value={newName} onChange={e => setNewName(e.target.value)} required />
                            <InputField label="Rol" value={newRole} onChange={e => setNewRole(e.target.value)} required />
                            <SelectField label="Turno por Defecto" value={newShift} onChange={e => setNewShift(e.target.value as any)}>
                                <option value="M">Mañana (M)</option>
                                <option value="T">Tarde (T)</option>
                                <option value="JF">Jornada Flexible (JF)</option>
                                <option value="B">Baja (B)</option>
                            </SelectField>
                            <button type="submit" className="w-full px-4 py-2 bg-green-200 text-black font-bold rounded-md hover:bg-green-300 transition-colors shadow">
                                Añadir Miembro
                            </button>
                        </form>
                    </div>

                    {/* Current Team List */}
                    <div>
                        <h3 className="text-lg font-semibold text-black mb-4">Equipo Actual</h3>
                        <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {teamMembers.map(member => (
                                <li key={member.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-100">
                                    <div>
                                        <p className="font-medium text-black">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.role} - Turno: {member.defaultShift}</p>
                                    </div>
                                    {member.defaultShift === 'B' ? (
                                        <button onClick={() => setReactivating({ id: member.id, name: member.name })} className="px-3 py-1 text-sm bg-blue-200 text-black font-bold rounded-md hover:bg-blue-300">
                                            Activar
                                        </button>
                                    ) : (
                                        <button onClick={() => onRemoveMember(member.id)} className="px-3 py-1 text-sm bg-red-200 text-black font-bold rounded-md hover:bg-red-300">
                                            Eliminar
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 text-right">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-black font-bold rounded-md hover:bg-gray-300 transition-colors shadow">
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Reactivate Member Modal */}
            {reactivating && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 shadow-xl space-y-4 w-full max-w-sm">
                        <h3 className="text-lg font-semibold text-black">Activar a {reactivating.name}</h3>
                        <p className="text-sm text-black">Selecciona el nuevo turno por defecto. Esto eliminará la 'B' de baja de todos sus días futuros.</p>
                        <SelectField label="Nuevo Turno" value={reactivateShift} onChange={e => setReactivateShift(e.target.value as any)}>
                            <option value="M">Mañana (M)</option>
                            <option value="T">Tarde (T)</option>
                            <option value="JF">Jornada Flexible (JF)</option>
                        </SelectField>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setReactivating(null)} className="px-4 py-2 bg-gray-200 text-black font-bold rounded-md hover:bg-gray-300">Cancelar</button>
                            <button onClick={handleConfirmReactivate} className="px-4 py-2 bg-blue-200 text-black font-bold rounded-md hover:bg-blue-300">Confirmar Activación</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};