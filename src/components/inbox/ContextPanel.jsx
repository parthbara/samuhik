import React from 'react';
import { Tag, MapPin, Phone, ClipboardList, ShoppingBag, Clock3 } from 'lucide-react';

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-700 leading-tight">{value}</p>
    </div>
  </div>
);

const ContextPanel = ({ conversation }) => {
  if (!conversation) return null;

  return (
    <aside className="w-80 h-full overflow-y-auto bg-white border-l border-slate-200 hidden xl:flex flex-col">
      <div className="p-6 space-y-8">
        {/* Profile Section */}
        <section>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">Customer Profile</h4>
          <div className="space-y-4">
            <DetailRow icon={Phone} label="Phone" value={conversation.phone || "Not provided"} />
            <DetailRow icon={MapPin} label="Location" value={conversation.address || "Unknown"} />
            <DetailRow icon={ShoppingBag} label="Lifetime Value" value={conversation.lifetimeValue || "Rs. 0"} />
          </div>
        </section>

        {/* Tags Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-slate-400" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Segments</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {conversation.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Notes Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-4 w-4 text-slate-400" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Internal Notes</h4>
          </div>
          <div className="space-y-3">
            {conversation.notes?.map((note, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed border border-slate-100">
                {note}
              </div>
            )) || <p className="text-xs text-slate-400 italic">No notes added yet.</p>}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock3 className="h-4 w-4 text-slate-400" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Recent Activity</h4>
          </div>
          <div className="space-y-4">
            {conversation.activity?.map((act) => (
              <div key={act.id} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none mb-1">{act.id}</p>
                  <p className="text-xs text-slate-500 mb-1">{act.item}</p>
                  <span className="text-[10px] font-bold uppercase text-indigo-600">{act.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};

export default ContextPanel;
