"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UploadCloud, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

import Sidebar from "@/component/dashoboadpropertyowner/sidebar";
import { propertyApi } from '@/lib/api/property';
import { propertyOwnerApi } from '@/lib/api/propertyOwner';

// --- Helper to fetch dynamic data ---
const fetchFilters = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
};

const steps = ["General", "Location", "Pricing & Features", "Images", "Review"];

// --- Form Data Interfaces ---
interface FormData {
  title: string;
  description: string;
    bedrooms: number;
    bathrooms: number;
    land_area: number;
    floor_area: number;
    status: string;
    category_id?: number;
    feature_ids: number[];
    rent_price: number;
    available_from: string;
    street_number: string;
    latitude: number;
    longitude: number;
    city_id?: number;
    district_id?: number;
    commune_id?: number;
    media: { media_url: string; media_type: string }[];
}

const initialFormData: FormData = {
    title: "",
    description: "",
    bedrooms: 1,
    bathrooms: 1,
    land_area: 100,
    floor_area: 80,
    status: "available",
    feature_ids: [],
    rent_price: 500,
    available_from: new Date().toISOString().split('T')[0],
    street_number: "",
    latitude: 11.5564,
    longitude: 104.9282,
    media: [],
};


export default function CreatePropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // --- Form State ---
  const [formData, setFormData] = useState<FormData>(initialFormData);
  
  // --- Dynamic Data State ---
  const [categories, setCategories] = useState<{ category_id: number; category_name: string }[]>([]);
  const [features, setFeatures] = useState<{ feature_id: number; feature_name: string }[]>([]);
  const [cities, setCities] = useState<{ city_id: number; city_name: string }[]>([]);
  const [districts, setDistricts] = useState<{ district_id: number; district_name: string }[]>([]);
  const [communes, setCommunes] = useState<{ commune_id: number; commune_name: string }[]>([]);

  // --- Control State ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- Fetch initial data ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesData, featuresData, citiesData] = await Promise.all([
          fetchFilters(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/filters/categories`),
          fetchFilters(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/filters/features`),
          fetchFilters(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/filters/cities`),
        ]);
        setCategories(categoriesData);
        setFeatures(featuresData);
        setCities(citiesData);
        if (categoriesData.length > 0) setFormData(prev => ({...prev, category_id: categoriesData[0].category_id}));
        if (citiesData.length > 0) setFormData(prev => ({...prev, city_id: citiesData[0].city_id}));
      } catch (error) {
        toast.error("Failed to load form data. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // --- Fetch chained location data ---
  useEffect(() => {
    if (!formData.city_id) return;
    const loadDistricts = async () => {
      const districtsData = await fetchFilters(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/filters/districts?city_id=${formData.city_id}`);
      setDistricts(districtsData);
      setFormData(prev => ({ ...prev, district_id: districtsData[0]?.district_id }));
    };
    loadDistricts();
  }, [formData.city_id]);

  useEffect(() => {
    if (!formData.district_id) return;
    const loadCommunes = async () => {
      const communesData = await fetchFilters(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/filters/communes?district_id=${formData.district_id}`);
      setCommunes(communesData);
      setFormData(prev => ({ ...prev, commune_id: communesData[0]?.commune_id }));
    };
    loadCommunes();
  }, [formData.district_id]);
    
  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name.includes('_id') || ['bedrooms', 'bathrooms', 'land_area', 'floor_area', 'rent_price'].includes(name) ? Number(value) : value }));
  };

  const handleFeatureToggle = (id: number) => {
    setFormData(prev => ({
        ...prev,
        feature_ids: prev.feature_ids.includes(id) ? prev.feature_ids.filter(fid => fid !== id) : [...prev.feature_ids, id]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Temporarily disabled
    toast.error("Image upload is temporarily disabled.");
    return;
    /*
    const files = e.target.files;
    if (!files) return;
    
    setIsUploading(true);
    toast.loading("Uploading images...");
    try {
      const uploadPromises = Array.from(files).map(file => propertyOwnerApi.uploadImageToCloudinary(file));
      const results = await Promise.all(uploadPromises);
      const newMedia = results.map(result => ({ media_url: result.secure_url, media_type: 'image' }));
      setFormData(prev => ({ ...prev, media: [...prev.media, ...newMedia] }));
      toast.dismiss();
      toast.success("Images uploaded successfully!");
    } catch (error) {
      toast.dismiss();
      toast.error("Image upload failed.");
    } finally {
      setIsUploading(false);
    }
    */
  };

  const handleFinalSubmit = async () => {
    if (!formData.category_id || !formData.city_id || !formData.district_id || !formData.commune_id) {
        toast.error("Please ensure all location and category fields are selected.");
        return;
    }
    
    setIsSubmitting(true);
    toast.loading("Creating property...");
    try {
      const { city_id, district_id, commune_id, street_number, latitude, longitude, ...restOfData } = formData;
      const payload = {
          ...restOfData,
          location: { city_id, district_id, commune_id, street_number, latitude, longitude },
          pricing: { rent_price: formData.rent_price, available_from: formData.available_from || null }
      };
      
      await propertyApi.createProperty(payload);
      toast.dismiss();
      toast.success("Property created successfully! Redirecting...");
      
      // Redirect after a short delay to allow toast to be seen
      setTimeout(() => {
        router.push("/propertyowner/property");
      }, 1500);

    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || "Failed to create property.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // General
        return (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">General Information</h2>
                    <div><label>Title <span className="text-red-500">*</span></label><input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded" required /></div>
                    <div><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" rows={4}></textarea></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>Bedrooms <span className="text-red-500">*</span></label><input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div><label>Bathrooms <span className="text-red-500">*</span></label><input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div><label>Floor Area (m²) <span className="text-red-500">*</span></label><input name="floor_area" type="number" value={formData.floor_area} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div><label>Land Area (m²) <span className="text-red-500">*</span></label><input name="land_area" type="number" value={formData.land_area} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                    </div>
                </div>
            );
        case 1: // Location
            return (
                <div className="space-y-4">
                     <h2 className="text-xl font-semibold">Location</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>City/Province <span className="text-red-500">*</span></label><select name="city_id" value={formData.city_id} onChange={handleChange} className="w-full p-2 border rounded">{cities.map(c => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}</select></div>
                        <div><label>District/Khan <span className="text-red-500">*</span></label><select name="district_id" value={formData.district_id} onChange={handleChange} className="w-full p-2 border rounded">{districts.map(d => <option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}</select></div>
                        <div><label>Commune/Sangkat <span className="text-red-500">*</span></label><select name="commune_id" value={formData.commune_id} onChange={handleChange} className="w-full p-2 border rounded">{communes.map(c => <option key={c.commune_id} value={c.commune_id}>{c.commune_name}</option>)}</select></div>
                        <div><label>Street Number</label><input name="street_number" value={formData.street_number} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div><label>Latitude <span className="text-red-500">*</span></label><input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        <div><label>Longitude <span className="text-red-500">*</span></label><input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                    </div>
                    {/* Add Google Maps component here */}
                </div>
            );
        case 2: // Pricing & Features
             return (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Pricing & Availability</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label>Rent Price (USD) <span className="text-red-500">*</span></label><input name="rent_price" type="number" value={formData.rent_price} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                            <div><label>Available From</label><input name="available_from" type="date" value={formData.available_from} onChange={handleChange} className="w-full p-2 border rounded" /></div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Features & Category</h2>
                        <div><label>Category <span className="text-red-500">*</span></label><select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full p-2 border rounded mb-4">{categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}</select></div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {features.map(feature => (
                                <label key={feature.feature_id} className="flex items-center space-x-2"><input type="checkbox" checked={formData.feature_ids.includes(feature.feature_id)} onChange={() => handleFeatureToggle(feature.feature_id)} /><span>{feature.feature_name}</span></label>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 3: // Images
            return (
            <div>
                    <h2 className="text-xl font-semibold mb-4">Images</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {formData.media.map(m => <img key={m.media_url} src={m.media_url} alt="property" className="w-full h-32 object-cover rounded"/>)}
                </div>
                    <label htmlFor="image-upload" className="flex justify-center items-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                        {isUploading ? <Loader2 className="h-8 w-8 animate-spin"/> : <UploadCloud className="h-8 w-8 text-gray-400"/>}
              </label>
                    <input id="image-upload" type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
        );
        case 4: // Review
        return (
            <div>
                    <h2 className="text-xl font-semibold mb-4">Review & Submit</h2>
                    <div className="space-y-2">
                        <p><strong>Title:</strong> {formData.title}</p>
                        <p><strong>Category:</strong> {categories.find(c => c.category_id === formData.category_id)?.category_name}</p>
                        <p><strong>Location:</strong> {cities.find(c=>c.city_id === formData.city_id)?.city_name}, {districts.find(d=>d.district_id === formData.district_id)?.district_name}, {communes.find(c=>c.commune_id === formData.commune_id)?.commune_name}</p>
                        <p><strong>Rent:</strong> ${formData.rent_price}/month</p>
                        <p><strong>Images:</strong> {formData.media.length}</p>
                        <p><strong>Features:</strong> {formData.feature_ids.length}</p>
            </div>
          </div>
        );
        default: return null;
    }
  };

  if (isLoading) {
    return <Sidebar><div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-2">Loading form...</p></div></Sidebar>;
  }

  return (
    <Sidebar>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Create New Property</h1>
                <span className="text-sm font-medium text-gray-500">Step {currentStep + 1} of {steps.length}</span>
        </div>
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                    <div key={step} className={`flex-1 h-2 rounded-full ${index <= currentStep ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                ))}
          </div>
        </div>

        <div className="p-8 border rounded-lg bg-white min-h-[400px]">
            {renderStepContent()}
        </div>

        <div className="flex justify-between mt-8">
            <button onClick={() => setCurrentStep(s => Math.max(0, s-1))} disabled={currentStep === 0} className="flex items-center px-6 py-2 border rounded disabled:opacity-50"><ArrowLeft className="h-5 w-5 mr-2"/> Back</button>
            {currentStep < steps.length - 1 ? (
                <button onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s+1))} className="flex items-center px-6 py-2 bg-green-800 text-white rounded"><ArrowRight className="h-5 w-5 ml-2"/> Next</button>
            ) : (
                <button onClick={handleFinalSubmit} disabled={isSubmitting} className="flex items-center px-6 py-2 bg-green-800 text-white rounded disabled:bg-gray-400">
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2"/> : <CheckCircle className="h-5 w-5 mr-2"/>}
                    Create Property
            </button>
          )}
        </div>
      </div>
    </Sidebar>
  );
}
