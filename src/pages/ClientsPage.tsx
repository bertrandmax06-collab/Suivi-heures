import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Client } from '../types';
import { useApp } from '../context/AppContext';
import { ClientCard } from '../components/clients/ClientCard';
import { ClientForm } from '../components/clients/ClientForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

export function ClientsPage() {
  const { clients } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  function handleEdit(client: Client) {
    setEditingClient(client);
    setIsModalOpen(true);
  }

  function handleClose() {
    setIsModalOpen(false);
    setEditingClient(null);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients & Chantiers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)} size="md">
          Nouveau
        </Button>
      </div>

      {/* Client grid */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Aucun client</h3>
          <p className="text-sm text-gray-500 mb-5">
            Commencez par créer vos clients ou chantiers pour pouvoir enregistrer vos heures.
          </p>
          <Button icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
            Créer un client
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={editingClient ? 'Modifier le client' : 'Nouveau client'}
      >
        <ClientForm
          client={editingClient ?? undefined}
          onSave={handleClose}
          onCancel={handleClose}
        />
      </Modal>
    </div>
  );
}
