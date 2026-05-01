import React from 'react';

const SectionCard = ({ icon: Icon, title, eyebrow, children, action, tone = 'indigo' }) => {
  const toneClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 glow-indigo',
    emerald: 'bg-accent/10 text-accent border border-accent/20 glow-accent',
    amber: 'bg-warm/10 text-warm border border-warm/20 glow-warm',
    blue: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 glow-blue',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20 glow-rose',
    slate: 'bg-surface text-secondary border border-subtle',
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-subtle glass-card shadow-2xl">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex items-center justify-between gap-4 border-b border-subtle bg-surface/50 backdrop-blur-md px-6 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone] || toneClasses.indigo}`}>
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{eyebrow}</p>}
            <h3 className="truncate text-base font-extrabold text-primary">{title}</h3>
          </div>
        </div>
        {action}
      </div>
      <div className="relative z-10 p-6">{children}</div>
    </section>
  );
};

export default SectionCard;
