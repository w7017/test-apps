import React, { useState, useEffect } from 'react';
import { X, Building, Save, Plus, Trash2, Upload, Eye, Star, StarOff } from 'lucide-react';
import { apiService } from '../services/api';

interface Building {
  id?: string;
  name: string;
  floors: number;
  description: string;
  image?: File | null;
  imagePreview?: string | null;
}

interface AddBuildingModalProps {
  siteId: string;
  siteName: string;
  onClose: () => void;
  onSave: (buildings: Building[]) => void;
  isEditMode?: boolean;
  initialBuildings?: Building[];
}

// Single Image Uploader Component
const BuildingImageUploader = ({ buildingId, onImageChange, isNewBuilding = false }) => {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (buildingId && !isNewBuilding) {
      loadImage();
    }
  }, [buildingId, isNewBuilding]);

  const loadImage = async () => {
    try {
      const response = await apiService.getBuildingImages(buildingId);
      const primaryImage = response.find(img => img.is_primary) || response[0];
      
      // Debug log to see what we're getting
      console.log('Loaded image:', primaryImage);
      
      setImage(primaryImage || null);
      if (onImageChange) {
        onImageChange(primaryImage || null);
      }
    } catch (error) {
      console.error('Error loading image:', error);
    }
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La taille du fichier ne doit pas dépasser 10MB.');
      return;
    }

    if (isNewBuilding) {
      // For new buildings, store file temporarily
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const tempImage = {
            id: Date.now(),
            file_path: e.target?.result,
            original_name: file.name,
            file_size: file.size,
            is_primary: true,
            tempFile: file
          };
          setImage(tempImage);
          if (onImageChange) {
            onImageChange(tempImage);
          }
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Erreur lors du traitement du fichier.');
        }
      };
      reader.onerror = () => {
        console.error('Error reading file');
        alert('Erreur lors de la lecture du fichier.');
      };
      reader.readAsDataURL(file);
    } else {
      await uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    if (isNewBuilding) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('is_primary', 'true');

      await apiService.uploadBuildingImage(buildingId, formData);
      await loadImage();
      alert('Image téléchargée avec succès !');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors du téléchargement de l\'image.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    if (isNewBuilding) {
      setImage(null);
      if (onImageChange) {
        onImageChange(null);
      }
      return;
    }

    try {
      await apiService.deleteBuildingImage(buildingId, image.id);
      setImage(null);
      if (onImageChange) {
        onImageChange(null);
      }
      alert('Image supprimée avec succès !');
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Erreur lors de la suppression de l\'image.');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const getImageSrc = (image) => {
    if (!image || !image.file_path) {
      console.log('No image or file_path:', image);
      return '';
    }
    
    if (image.file_path.startsWith('data:')) {
      return image.file_path;
    }
    
    // Ensure we have the correct API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const imagePath = image.file_path.startsWith('/') ? image.file_path : `/${image.file_path}`;
    const fullImageUrl = `${apiUrl}${imagePath}`;
    
    console.log('Constructed image URL:', fullImageUrl);
    return fullImageUrl;
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      {!image && (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              Télécharger une image
            </p>
            <div className="flex justify-center">
              <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                <span>Sélectionner</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  disabled={uploading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-400">
              PNG, JPG, WEBP jusqu'à 10MB
            </p>
          </div>
        </div>
      )}

      {uploading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
            <span className="text-xs text-gray-600">Téléchargement...</span>
          </div>
        </div>
      )}

      {/* Current Image */}
      {image && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <button
              onClick={handleDeleteImage}
              className="text-red-600 hover:text-red-800 p-1"
              title="Supprimer l'image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="relative">
            <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
              <img
                src={getImageSrc(image)}
                alt={image.original_name || 'Building image'}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error('Error loading image:', image);
                  console.error('Failed URL:', e.currentTarget.src);
                  // Try alternative URL construction
                  const altUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/${image.file_path}`;
                  console.log('Trying alternative URL:', altUrl);
                  if (e.currentTarget.src !== altUrl) {
                    e.currentTarget.src = altUrl;
                  } else {
                    e.currentTarget.src = 'data:image/jpeg;base64,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';
                  }
                }}
              />
            </div>
            
            {/* Replace button */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
              <label className="cursor-pointer bg-white text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-100 transition-colors">
                <span>Remplacer</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">{image.original_name}</p>
        </div>
      )}
    </div>
  );
};

const AddBuildingModal = ({ 
  siteId, 
  siteName, 
  onClose, 
  onSave,
  isEditMode = false,
  initialBuildings
}) => {
  const [buildings, setBuildings] = useState(
    initialBuildings && initialBuildings.length > 0
      ? initialBuildings.map(b => ({ ...b, image: null, imagePreview: null }))
      : [{ name: '', floors: 1, description: '', image: null, imagePreview: null }]
  );

  const handleBuildingChange = (index, field, value) => {
    setBuildings(prev => prev.map((building, i) => 
      i === index ? { ...building, [field]: value } : building
    ));
  };

  const handleImageChange = (index, event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 10MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setBuildings(prev => prev.map((building, i) => 
          i === index ? { 
            ...building, 
            image: file,
            imagePreview: e.target?.result as string
          } : building
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    setBuildings(prev => prev.map((building, i) => 
      i === index ? { ...building, image: null, imagePreview: null } : building
    ));
  };

  const addBuilding = () => {
    if (isEditMode) return;
    setBuildings(prev => [...prev, { name: '', floors: 1, description: '', image: null, imagePreview: null }]);
  };

  const removeBuilding = (index:number) => {
    if (isEditMode) return;
    if (buildings.length > 1) {
      setBuildings(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validBuildings = buildings.filter(b => b.name.trim());
    
    if (validBuildings.length > 0) {
      const buildingsWithImages = validBuildings.map(building => ({
        ...building,
        tempImage: building.image
      }));
      
      onSave(buildingsWithImages);
    }
  };

  const getBuildingImagePreview = (building) => {
    // Check if building has an image
    if (building.image && building.image.file_path) {
      if (building.image.file_path.startsWith('data:')) {
        return building.image.file_path;
      }
      return `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${building.image.file_path}`;
    }

    // Fallback to default images based on name
    const name = building.name.toLowerCase();
    
    if (name.includes('atelier') || name.includes('usine') || name.includes('production')) {
      return 'https://images.pexels.com/photos/236698/pexels-photo-236698.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else if (name.includes('bureau') || name.includes('administratif') || name.includes('siège')) {
      return 'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else if (name.includes('parking') || name.includes('garage')) {
      return 'https://images.pexels.com/photos/63294/autos-technology-vw-multi-storey-car-park-63294.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else if (name.includes('entrepôt') || name.includes('stockage') || name.includes('logistique')) {
      return 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else if (name.includes('tour') || name.includes('immeuble')) {
      return 'https://images.pexels.com/photos/2098427/pexels-photo-2098427.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else if (name.includes('commercial') || name.includes('centre')) {
      return 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=400';
    } else {
      return 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Modifier le bâtiment' : 'Ajouter des bâtiments'}
              </h2>
              <p className="text-gray-600">Site : {siteName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Buildings */}
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-orange-900 flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>{isEditMode ? 'Bâtiment à modifier' : 'Nouveaux bâtiments'}</span>
                </h3>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={addBuilding}
                    className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter</span>
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {buildings.map((building, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Bâtiment {index + 1}</h4>
                      {!isEditMode && buildings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBuilding(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Building Details */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom du bâtiment *
                          </label>
                          <input
                            type="text"
                            value={building.name}
                            onChange={(e) => handleBuildingChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Bâtiment A"
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre d'étages
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={building.floors}
                              onChange={(e) => handleBuildingChange(index, 'floors', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={building.description}
                              onChange={(e) => handleBuildingChange(index, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Bureaux, Atelier..."
                            />
                          </div>
                        </div>

                        {/* Building Preview */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image du bâtiment
                          </label>
                          {!building.imagePreview ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                                <span>Sélectionner une image</span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(index, e)}
                                />
                              </label>
                              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP jusqu'à 10MB</p>
                            </div>
                          ) : (
                            <div className="relative">
                              <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                                <img
                                  src={building.imagePreview}
                                  alt={building.name || 'Bâtiment'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isEditMode ? 'Enregistrer' : 'Ajouter les bâtiments'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBuildingModal;