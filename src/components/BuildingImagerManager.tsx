import React, { useState, useEffect } from 'react';
import { Upload, X, Star, StarOff, Eye, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';

const BuildingImageManager = ({ buildingId, onImagesChange }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (buildingId) {
      loadImages();
    }
  }, [buildingId]);

  const loadImages = async () => {
    try {
      const response = await apiService.getBuildingImages(buildingId);
      setImages(response);
      if (onImagesChange) {
        onImagesChange(response);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleFileSelect = async (files:any) => {
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

    await uploadImage(file);
  };

// In BuildingImageManager component
const uploadImage = async (file:any, isPrimary = false) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);  // Must match backend expectation
      formData.append('is_primary', isPrimary.toString());
  
      const response = await apiService.uploadBuildingImage(buildingId, formData);
      
      // Reload images
      await loadImages();
      
      alert('Image téléchargée avec succès !');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors du téléchargement de l\'image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (imageId:any) => {
    try {
      await apiService.setBuildingImagePrimary(buildingId, imageId);
      await loadImages();
    } catch (error) {
      console.error('Error setting primary image:', error);
      alert('Erreur lors de la définition de l\'image principale.');
    }
  };

  const handleDeleteImage = async (imageId:any) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
      return;
    }

    try {
      await apiService.deleteBuildingImage(buildingId, imageId);
      await loadImages();
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

  const handleDrop = (e:any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const getPrimaryImage = () => {
    return images.find(img => img.is_primary) || images[0];
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Télécharger une image du bâtiment
          </p>
          <p className="text-sm text-gray-500">
            Glissez-déposez une image ou cliquez pour sélectionner
          </p>
          <div className="flex justify-center">
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <span>Sélectionner un fichier</span>
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

      {uploading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Téléchargement en cours...</span>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Images du bâtiment ({images.length})</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image:any) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${image.file_path}`}
                    alt={image.original_name}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setPreviewImage(image)}
                  />
                </div>
                
                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Principal
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-y-1">
                  <button
                    onClick={() => setPreviewImage(image)}
                    className="bg-black bg-opacity-50 text-white p-1 rounded hover:bg-opacity-70 transition-colors"
                    title="Voir l'image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleSetPrimary(image.id)}
                    className={`p-1 rounded transition-colors ${
                      image.is_primary
                        ? 'bg-yellow-500 text-white'
                        : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'
                    }`}
                    title={image.is_primary ? 'Image principale' : 'Définir comme principale'}
                  >
                    {image.is_primary ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="bg-red-500 bg-opacity-80 text-white p-1 rounded hover:bg-opacity-100 transition-colors"
                    title="Supprimer l'image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Image Info */}
                <div className="mt-2 text-xs text-gray-600">
                  <p className="truncate" title={image.original_name}>
                    {image.original_name}
                  </p>
                  <p>{Math.round(image.file_size / 1024)} KB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">{previewImage.original_name}</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <img
                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${previewImage.file_path}`}
                alt={previewImage.original_name}
                className="max-w-full max-h-96 mx-auto"
              />
            </div>
            <div className="px-4 pb-4 text-sm text-gray-600">
              <p>Taille: {Math.round(previewImage.file_size / 1024)} KB</p>
              <p>Type: {previewImage.mime_type}</p>
              {previewImage.description && <p>Description: {previewImage.description}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingImageManager;