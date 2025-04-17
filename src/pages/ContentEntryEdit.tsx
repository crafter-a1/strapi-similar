
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useCollectionStore, useContentEntryStore } from '@/lib/store';
import { collectionsApi, contentEntriesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContentEntryForm from '@/components/content/ContentEntryForm';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ContentEntryEdit() {
  const { collectionId, entryId } = useParams<{ collectionId: string; entryId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { collections, setCollections, loading: collectionsLoading, setLoading: setCollectionsLoading } = useCollectionStore();
  const { contentEntries, setContentEntries, selectedEntry, setSelectedEntry, loading: entriesLoading, setLoading: setEntriesLoading } = useContentEntryStore();
  
  const [collection, setCollection] = React.useState<any>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [publishState, setPublishState] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const isCreating = entryId === 'create';

  // Fetch collection and entry data
  React.useEffect(() => {
    const fetchCollectionAndEntry = async () => {
      if (!collectionId) return;
      
      setCollectionsLoading(true);
      
      try {
        // Fetch collection details
        const collectionResponse = await collectionsApi.getById(collectionId);
        setCollection(collectionResponse.data);
        
        // If editing an existing entry
        if (!isCreating && entryId) {
          setEntriesLoading(true);
          try {
            const entryResponse = await contentEntriesApi.getById(entryId);
            setSelectedEntry(entryResponse.data);
            setPublishState(entryResponse.data.isPublished);
          } catch (error) {
            console.error('Error fetching entry:', error);
            toast({
              title: 'Error',
              description: 'Failed to load content entry',
              variant: 'destructive',
            });
            navigate('/content-manager');
          } finally {
            setEntriesLoading(false);
          }
        } else {
          // For creation, reset selected entry
          setSelectedEntry(null);
          setPublishState(false);
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        toast({
          title: 'Error',
          description: 'Failed to load collection details',
          variant: 'destructive',
        });
        navigate('/content-manager');
      } finally {
        setCollectionsLoading(false);
      }
    };

    fetchCollectionAndEntry();
  }, [collectionId, entryId, isCreating, navigate, setCollectionsLoading, setEntriesLoading, setSelectedEntry, toast]);

  // Handle form submission
  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      const contentData = {
        collectionId,
        data: formData,
        isPublished: publishState,
      };

      let response;
      
      if (isCreating) {
        // Create new entry
        response = await contentEntriesApi.create(contentData);
        toast({
          title: 'Success',
          description: 'Content entry created successfully',
        });
      } else {
        // Update existing entry
        response = await contentEntriesApi.update(entryId!, contentData);
        toast({
          title: 'Success',
          description: 'Content entry updated successfully',
        });
      }

      // Navigate back to content manager
      navigate(`/content-manager`);
    } catch (error) {
      console.error('Error saving content entry:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isCreating ? 'create' : 'update'} content entry`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!entryId) return;
    
    try {
      await contentEntriesApi.delete(entryId);
      
      toast({
        title: 'Success',
        description: 'Content entry deleted successfully',
      });
      
      navigate('/content-manager');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content entry',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // Loading state
  if (collectionsLoading || entriesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse ml-2"></div>
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If collection not found
  if (!collection) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle>Collection not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">The collection you are looking for does not exist or has been deleted.</p>
            <Button onClick={() => navigate('/content-manager')}>
              Go back to Content Manager
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/content-manager')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold ml-2">
            {isCreating ? `Create new ${collection.name}` : `Edit ${collection.name}`}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {!isCreating && (
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          {collection.draftAndPublish && (
            <div className="flex items-center space-x-2">
              <Switch
                id="publish-state"
                checked={publishState}
                onCheckedChange={setPublishState}
              />
              <Label htmlFor="publish-state">
                {publishState ? 'Published' : 'Draft'}
              </Label>
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ContentEntryForm
            fields={collection.fields || []}
            initialData={selectedEntry?.data || {}}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/content-manager')}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete content entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
