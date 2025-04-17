import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCollectionStore, useContentEntryStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import ContentForm from '@/components/content/ContentForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ContentEntryCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { collectionId } = useParams<{ collectionId: string }>();
  const { collections } = useCollectionStore();
  const { addEntry } = useContentEntryStore();
  const [isLoading, setIsLoading] = useState(false);

  // Find the collection
  const collection = collections.find(c => c.id === collectionId);

  // Handle form submission
  const handleSubmit = async (data: Record<string, any>) => {
    if (!collection) return;
    
    setIsLoading(true);
    
    try {
      // For demo purposes, we'll create a mock entry
      const newEntry = {
        id: Date.now().toString(),
        collectionId: collection.id,
        data,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add the entry to the store
      addEntry(newEntry);
      
      toast({
        title: 'Success',
        description: 'Content entry created successfully',
      });
      
      // Navigate back to the content manager
      navigate(`/content-manager/${collection.id}`);
    } catch (error) {
      console.error('Error creating content entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create content entry',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If collection not found, show error
  if (!collection) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/content-manager')} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Collection Not Found</h1>
        </div>
        <p>The collection you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(`/content-manager/${collection.id}`)} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Create {collection.name}</h1>
      </div>
      
      <ContentForm
        collection={collection}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/content-manager/${collection.id}`)}
        isLoading={isLoading}
      />
    </div>
  );
}
