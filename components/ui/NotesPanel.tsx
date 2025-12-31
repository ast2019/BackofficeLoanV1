import React, { useState } from 'react';
import { Note } from '../../types';
import Button from './Button';
import { MessageSquarePlus } from 'lucide-react';

interface NotesPanelProps {
  notes: Note[];
  onAddNote: (text: string) => void;
  isLoading?: boolean;
  title?: string;
}

const NotesPanel: React.FC<NotesPanelProps> = ({ notes, onAddNote, isLoading, title = "یادداشت‌ها" }) => {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full max-h-[500px]">
      <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <MessageSquarePlus className="w-5 h-5 text-gray-500" />
          {title}
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {notes.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">هنوز یادداشتی ثبت نشده است.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.text}</p>
              <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                <span>{note.authorName}</span>
                <span>{new Date(note.createdAt).toLocaleString('fa-IR')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand focus:border-brand"
            placeholder="نوشتن یادداشت جدید..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={!newNote.trim() || isLoading}>
            ثبت
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NotesPanel;