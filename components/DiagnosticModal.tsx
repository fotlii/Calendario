
import React from 'react';
import type { DiagnosticResult } from '../types';

interface DiagnosticModalProps {
  results: DiagnosticResult[];
  onClose: () => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({ results, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Resultados del Diagnóstico</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="overflow-y-auto p-6">
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${result.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{result.name}</h4>
                    <p className={`text-sm font-semibold ${result.eligible ? 'text-green-700' : 'text-red-700'}`}>
                      {result.eligible ? `Elegible (Puntuación: ${result.score === Infinity ? '∞' : result.score})` : 'No Elegible'}
                    </p>
                  </div>
                  {result.eligible ? (
                     <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Candidato</span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Excluido</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-semibold">Motivo:</span> {result.reason}
                </p>
                {result.eligible && (
                    <p className="mt-1 text-sm text-gray-600">
                        <span className="font-semibold">Historial:</span> {result.lastWorkedInfo}
                    </p>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 text-right">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
