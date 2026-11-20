import React, { useState } from 'react';

export default function MessagesManager() {
  const [messages, setMessages] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('serenoa_messages') || '[]');
      if (Array.isArray(stored)) return stored;
    } catch (e) {}
    return [
      {
        id: "msg-1",
        nombre: "María Elena García",
        email: "maria.garcia@gmail.com",
        mensaje: "Hola, quisiera saber si hacen tartas de cumpleaños personalizadas para 25 personas y con cuántos días de anticipación se reservan.",
        fecha: "Hoy 14:32",
        leido: false
      },
      {
        id: "msg-2",
        nombre: "Roberto Zambrano",
        email: "roberto.z@hotmail.com",
        mensaje: "Excelente el cheesecake de frutos rojos que pedí la semana pasada, ¡felicidades por la calidad!",
        fecha: "Ayer 18:15",
        leido: true
      }
    ];
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const saveMessages = (updated) => {
    setMessages(updated);
    try {
      localStorage.setItem('serenoa_messages', JSON.stringify(updated));
    } catch (e) {}
  };

  const toggleRead = (id) => {
    const updated = messages.map(m => m.id === id ? { ...m, leido: !m.leido } : m);
    saveMessages(updated);
  };

  const handleDelete = (id) => {
    const updated = messages.filter(m => m.id !== id);
    saveMessages(updated);
    setConfirmDeleteId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ECC979]/40 shadow-sm p-6">
      <div className="flex justify-between items-center pb-4 border-b border-[#ECC979]/20 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-[#2E2A27]">
            Mensajes y Consultas de Clientes
          </h3>
          <p className="text-xs text-[#7A736B]">
            Consultas recibidas desde el formulario de contacto de la tienda.
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 bg-[#99B4AA]/20 text-[#565935] border border-[#99B4AA]/30 rounded-full font-bold">
          {messages.filter(m => !m.leido).length} no leídos
        </span>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-[#7A736B] text-xs sm:text-sm">
            No hay mensajes registrados.
          </div>
        ) : (
          messages.map(m => (
            <div 
              key={m.id} 
              className={`p-4 rounded-xl border transition-all ${m.leido ? 'bg-white border-gray-100' : 'bg-[#FAF6EF] border-[#ECC979]/40 shadow-sm'}`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${m.leido ? 'bg-gray-300' : 'bg-[#D4AF37]'}`} />
                  <strong className="text-gray-900 text-sm">{m.nombre}</strong>
                  <span className="text-xs text-gray-500">({m.email})</span>
                </div>
                <span className="text-[11px] text-gray-400">{m.fecha}</span>
              </div>

              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-3 pl-4 border-l-2 border-[#ECC979]">
                {m.mensaje}
              </p>

              <div className="flex items-center gap-2 justify-end">
                <button 
                  onClick={() => toggleRead(m.id)}
                  className="px-3 py-1 rounded bg-[#FAF6EF] hover:bg-[#F2DEC7] text-[#565935] text-xs font-semibold border border-[#ECC979]/30 cursor-pointer transition-colors"
                >
                  {m.leido ? 'Marcar no leído' : 'Marcar como leído'}
                </button>
                <a 
                  href={`mailto:${m.email}?subject=Respuesta Serenoa`}
                  className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white text-xs font-semibold shadow-sm border border-[#ECC979]/50 cursor-pointer transition-all active:scale-95"
                >
                  Responder Correo
                </a>

                {confirmDeleteId === m.id ? (
                  <div className="inline-flex items-center gap-1.5 p-0.5 bg-red-50 rounded border border-red-200">
                    <span className="text-[11px] text-red-700 font-bold px-1">¿Eliminar?</span>
                    <button 
                      onClick={() => handleDelete(m.id)}
                      className="px-2 py-0.5 rounded bg-red-600 text-white text-xs font-bold"
                    >
                      Sí
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-0.5 rounded bg-gray-200 text-gray-700 text-xs font-bold"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDeleteId(m.id)}
                    className="px-2.5 py-1 rounded text-red-500 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                    title="Eliminar mensaje"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
