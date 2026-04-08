import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Users, Lock, Globe, X, Clock } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import useRoomStore from '../stores/roomStore';

function CreateRoomModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '', topic: '', isPrivate: false, maxMembers: 100 });
  const { isLoading, error } = useRoomStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onCreate(form);
      onClose();
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-[#0F172A]">Start a New Chamber</h3>
          <button onClick={onClose} className="text-[#76777d] hover:text-[#0F172A] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[['name', 'Chamber Name', 'Protocol 9-Alpha...', 'text'],
            ['description', 'Description', 'Describe the purpose...', 'text'],
            ['topic', 'Domain / Topic', 'e.g. Governance, Finance...', 'text'],
            ['maxMembers', 'Max Members', '100', 'number'],
          ].map(([field, label, placeholder, type]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-[#45464d] uppercase tracking-wide mb-1.5">{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: type === 'number' ? +e.target.value : e.target.value }))}
                placeholder={placeholder}
                required={field === 'name'}
                className="w-full px-4 py-2.5 bg-[#f2f4f6] rounded-xl text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#0F172A] transition"
              />
            </div>
          ))}

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm((f) => ({ ...f, isPrivate: !f.isPrivate }))}
              className={`w-10 h-6 rounded-full transition-colors ${form.isPrivate ? 'bg-[#0F172A]' : 'bg-[#c6c6cd]'} relative`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isPrivate ? 'left-5' : 'left-1'}`} />
            </div>
            <span className="text-sm text-[#45464d]">{form.isPrivate ? 'Private chamber' : 'Public chamber'}</span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white font-semibold rounded-xl text-sm hover:opacity-90 transition disabled:opacity-60"
          >
            {isLoading ? 'Creating...' : 'Establish Chamber'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Rooms() {
  const { rooms, fetchRooms, createRoom, joinRoom, isLoading } = useRoomStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const showCreate = searchParams.get('create') === '1';

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleJoin = async (e, roomId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await joinRoom(roomId);
      await fetchRooms();
    } catch (_) {}
  };

  return (
    <AppLayout>
      {showCreate && (
        <CreateRoomModal
          onClose={() => setSearchParams({})}
          onCreate={createRoom}
        />
      )}

      <div className="p-8 space-y-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#76777d] font-medium mb-2">Chambers</p>
            <h1 className="font-display text-3xl font-bold text-[#0F172A]">Decision Rooms</h1>
            <p className="text-[#45464d] mt-1.5 text-sm max-w-lg">
              Transparent, multi-stakeholder chambers for architectural protocols, fiscal policy, and organizational evolution.
            </p>
          </div>
          <button
            id="create-room-btn"
            onClick={() => setSearchParams({ create: '1' })}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            New Chamber
          </button>
        </div>

        {/* Rooms grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 h-40 animate-pulse" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center">
            <p className="font-display text-[#0F172A] font-semibold mb-2">No Chambers Yet</p>
            <p className="text-[#76777d] text-sm mb-6">Begin a new consensus journey for your proposal.</p>
            <button
              onClick={() => setSearchParams({ create: '1' })}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition"
            >
              <Plus className="w-4 h-4" />
              Start a New Chamber
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Link
                key={room.id}
                to={`/rooms/${room.id}`}
                className="group bg-white hover:bg-[#f7f9fb] rounded-2xl p-6 shadow-sm transition flex flex-col gap-4"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#f2f4f6] flex items-center justify-center text-[#0F172A]">
                    {room.isPrivate ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${
                    room.isPrivate ? 'bg-slate-100 text-slate-500' : 'bg-emerald-950 text-emerald-400'
                  }`}>
                    {room.isPrivate ? 'Private' : 'Open'}
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="font-display font-semibold text-[#0F172A] group-hover:underline">{room.name}</h3>
                  {room.description && (
                    <p className="text-[#76777d] text-xs mt-1.5 line-clamp-2">{room.description}</p>
                  )}
                  {room.topic && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-[#f2f4f6] text-[#45464d] text-[10px] rounded-md">
                      {room.topic}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#f2f4f6]">
                  <div className="flex gap-3 text-xs text-[#76777d]">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {room.members?.length ?? 0}/{room.maxMembers}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {room.decisions?.length ?? 0} decisions
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleJoin(e, room.id)}
                    className="text-xs font-medium text-[#0F172A] hover:text-emerald-600 transition"
                  >
                    Join →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
