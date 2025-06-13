import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Upload } from "lucide-react";
import api from "../api/api";
import { useConfirmationDialog } from "../components/providers/confirmation-provider";
import { useToast } from "../components/ui/use-toast";
import { Modal } from "../components/ui/modal";
import { MixerTable } from "../components/mixers/mixer-table";
import { MixerForm } from "../components/mixers/mixer-form";
import { EmptyState } from "../components/mixers/empty-state";
import { BulkImportModal } from "../components/mixers/bulk-import-modal";

export function Mixers() {
  const [mixers, setMixers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [currentMixer, setCurrentMixer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    available: true
  });
  
  const { openConfirmation } = useConfirmationDialog();
  const { toast } = useToast();

  // Fetch all mixers on component mount
  useEffect(() => {
    fetchMixers();
  }, []);

  const fetchMixers = async () => {
    setLoading(true);
    try {
      const data = await api.mixers.getMixers();
      setMixers(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching mixers:", err);
      setError("Failed to load mixers. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load mixers. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMixer = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.price) {
        setError("Name and price are required.");
        return;
      }
      
      const newMixerData = {
        name: formData.name,
        price: parseFloat(formData.price),
        available: formData.available
      };
      
      await api.mixers.createMixer(newMixerData);
      setIsAddModalOpen(false);
      resetForm();
      fetchMixers();
      setError(null);
      
      toast({
        variant: "success",
        title: "Mixer Added",
        description: `${newMixerData.name} has been added successfully.`
      });
    } catch (err) {
      console.error("Error adding mixer:", err);
      setError("Failed to add mixer. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add mixer. Please try again."
      });
    }
  };

  const handleEditMixer = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.price) {
        setError("Name and price are required.");
        return;
      }
      
      const updatedMixerData = {
        name: formData.name,
        price: parseFloat(formData.price),
        available: formData.available
      };
      
      await api.mixers.updateMixer(currentMixer._id, updatedMixerData);
      setIsEditModalOpen(false);
      resetForm();
      fetchMixers();
      setError(null);
      
      toast({
        variant: "success",
        title: "Mixer Updated",
        description: `${updatedMixerData.name} has been updated successfully.`
      });
    } catch (err) {
      console.error("Error updating mixer:", err);
      setError("Failed to update mixer. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update mixer. Please try again."
      });
    }
  };

  const openDeleteModal = (mixer) => {
    openConfirmation({
      title: "Delete Mixer",
      message: `Are you sure you want to delete ${mixer.name}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      confirmVariant: "destructive",
      onConfirm: async () => {
        try {
          await api.mixers.deleteMixer(mixer._id);
          fetchMixers();
          setError(null);
          
          toast({
            variant: "success",
            title: "Mixer Deleted",
            description: `${mixer.name} has been deleted successfully.`
          });
        } catch (err) {
          console.error("Error deleting mixer:", err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete mixer. Please try again."
          });
        }
      }
    });
  };

  const openAddModal = () => {
    resetForm();
    setError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (mixer) => {
    setCurrentMixer(mixer);
    setError(null);
    setFormData({
      name: mixer.name,
      price: mixer.price.toString(),
      available: mixer.available
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      available: true
    });
    setCurrentMixer(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (checked) => {
    setFormData({
      ...formData,
      available: checked
    });
  };
  
  const handleBulkImport = async (data) => {
    try {
      const response = await api.mixers.bulkImportMixers(data);
      fetchMixers();
      
      toast({
        variant: "success",
        title: "Bulk Import Successful",
        description: `Successfully imported ${response.data?.imported || data.length} mixers.`
      });
      
      return response.data;
    } catch (err) {
      console.error("Error importing mixers:", err);
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: "Failed to import mixers. Please try again."
      });
      throw err;
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter mixers based on search term
  const displayMixers = mixers.filter(mixer => 
    mixer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format price with currency (AED - Dirhams)
  const formatPrice = (price) => {
    return price ? `${parseFloat(price).toFixed(2)} AED` : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mixers</h1>
          <p className="text-muted-foreground">
            Manage your mixers for drinks
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1" 
            onClick={() => setIsBulkImportModalOpen(true)}
          >
            <Upload className="h-4 w-4" /> Bulk Import
          </Button>
          <Button className="flex items-center gap-1" onClick={openAddModal}>
            <Plus className="h-4 w-4" /> Add Mixer
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Search mixers..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          {displayMixers.length} {displayMixers.length === 1 ? 'mixer' : 'mixers'} found
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <p>Loading mixers...</p>
        </div>
      ) : displayMixers.length === 0 ? (
        <EmptyState onAdd={openAddModal} />
      ) : (
        <MixerTable 
          mixers={displayMixers} 
          onEdit={openEditModal} 
          onDelete={openDeleteModal} 
          formatPrice={formatPrice} 
        />
      )}

      {/* Add Mixer Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Mixer"
      >
        <MixerForm
          formData={formData}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onSubmit={handleAddMixer}
          onCancel={() => setIsAddModalOpen(false)}
          submitText="Add Mixer"
          error={error}
        />
      </Modal>

      {/* Edit Mixer Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Mixer"
      >
        <MixerForm
          formData={formData}
          onInputChange={handleInputChange}
          onCheckboxChange={handleCheckboxChange}
          onSubmit={handleEditMixer}
          onCancel={() => setIsEditModalOpen(false)}
          submitText="Update Mixer"
          error={error}
        />
      </Modal>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        onImport={handleBulkImport}
        formatPrice={formatPrice}
      />
    </div>
  );
}

export default Mixers;