import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Bell } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((type, text) => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { id, type, text }]);
    setTimeout(() => setItems((l) => l.filter((x) => x.id !== id)), 3500);
  }, []);
  const toast = { success: (t) => push('success', t), error: (t) => push('error', t), info: (t) => push('info', t) };
  const look = {
    success: ['border-emerald-500/40 bg-emerald-950 text-emerald-200', CheckCircle2],
    error: ['border-red-500/40 bg-red-950 text-red-200', AlertCircle],
    info: ['border-cyan-400/40 bg-slate-900 text-cyan-100 shadow-cyan-500/20', Bell],
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-72 flex-col gap-2">
        {items.map((i) => {
          const [cls, Icon] = look[i.type];
          return (
            <div key={i.id} className={`toast animate-fadeUp flex items-start gap-2 rounded-lg border p-3 text-sm shadow-xl ${cls}`}>
              <Icon size={18} className="mt-0.5 shrink-0" />
              <span>{i.text}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
