import React from 'react';

const SectionCard = ({ icon: Icon, title, eyebrow, children, action, tone = 'indigo' }) => {
  const toneClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone] || toneClasses.indigo}`}>
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{eyebrow}</p>}
            <h3 className="truncate text-base font-bold text-slate-900">{title}</h3>
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
};

export default SectionCard;
