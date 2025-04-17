
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Database, LayoutGrid, Trash2, Edit } from 'lucide-react';
import { useCollectionStore } from '@/lib/store';
import { collectionsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CollectionTypeDialog from '@/components/content-type/CollectionTypeDialog';

export default function ContentTypes() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    collections,
    setCollections,
    setSelectedCollection,
    removeCollection,
    addCollection,
    setLoading,
    loading
  } = useCollectionStore();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [collectionToDelete, setCollectionToDelete] = React.useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  // Function to check database connection
  const checkDatabaseConnection = async () => {
    try {
      await collectionsApi.getAll();
      console.log('Database connection successful');
      return true;
    } catch (error: any) {
      console.error('Database connection error:', error);

      let errorMessage = 'Failed to connect to the database';
      if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check if the backend is running.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }

      toast({
        title: 'Database Connection Error',
        description: errorMessage,
        variant: 'destructive',
      });

      return false;
    }
  };

  React.useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        // First check database connection
        const isConnected = await checkDatabaseConnection();
        if (!isConnected) {
          return;
        }

        const response = await collectionsApi.getAll();
        console.log('Collections fetched from API:', response.data);

        // Transform the backend data format to the frontend format
        const formattedCollections = response.data.map((collection: any) => {
          let apiIdPlural = '';
          let draftAndPublish = false;
          let isInternationally = false;

          // Try to parse additional information if available
          if (collection.additionalInformation) {
            try {
              const additionalInfo = JSON.parse(collection.additionalInformation);
              apiIdPlural = additionalInfo.apiIdPlural || '';
              draftAndPublish = additionalInfo.draftAndPublish || false;
              isInternationally = additionalInfo.isInternationally || false;
            } catch (parseError) {
              console.error('Error parsing additional information:', parseError);
            }
          }

          return {
            id: collection.id.toString(),
            name: collection.collectionName || 'Unnamed Collection',
            apiId: collection.collectionApiId || '',
            apiIdPlural,
            draftAndPublish,
            isInternationally,
            fields: [],
            isActive: true,
            createdAt: '',
            updatedAt: ''
          };
        });

        console.log('Formatted collections:', formattedCollections);
        setCollections(formattedCollections);
      } catch (error) {
        console.error('Error fetching collections:', error);
        toast({
          title: 'Error',
          description: 'Failed to load content types',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [setCollections, setLoading, toast]);

  const handleCreateCollection = () => {
    setCreateDialogOpen(true);
  };

  const handleSaveCollection = async (data: any) => {
    try {
      // First check database connection
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

      // Get all collections to determine the next ID
      const collectionsResponse = await collectionsApi.getAll();
      const existingCollections = collectionsResponse.data || [];

      // Find the highest ID and add 1, or start with 1 if no collections exist
      const nextId = existingCollections.length > 0
        ? Math.max(...existingCollections.map((c: any) => parseInt(c.id))) + 1
        : 1;

      const collectionData = {
        id: nextId,
        collectionName: data.name,
        collectionDesc: `${data.name} collection`,
        collectionApiId: data.apiIdSingular,
        // Store additional properties in the description field as JSON
        additionalInformation: JSON.stringify({
          apiIdPlural: data.apiIdPlural,
          draftAndPublish: data.draftAndPublish,
          isInternationally: data.isInternationally
        }),
        fields: [],
      };

      console.log('Creating collection with data:', collectionData);
      const response = await collectionsApi.create(collectionData);
      console.log('Collection created successfully:', response.data);

      // Format the collection data to match the expected structure in the store
      const formattedCollection = {
        id: response.data.id.toString(),
        name: response.data.collectionName,
        apiId: response.data.collectionApiId,
        apiIdPlural: data.apiIdPlural,
        draftAndPublish: data.draftAndPublish,
        isInternationally: data.isInternationally,
        fields: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Adding formatted collection to store:', formattedCollection);
      addCollection(formattedCollection);

      toast({
        title: 'Content type created',
        description: 'Your content type has been created successfully',
      });

      setCreateDialogOpen(false);

      // Navigate to the edit page with a slight delay to ensure state is updated
      setTimeout(() => {
        console.log('Navigating to edit page for collection ID:', response.data.id);
        navigate(`/content-types/edit/${response.data.id}`);
      }, 100);
    } catch (error: any) {
      console.error('Error creating content type:', error);

      // Extract more specific error message if available
      let errorMessage = 'Failed to create collection';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);

        if (error.response.status === 409) {
          errorMessage = 'A collection with this name already exists';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEditCollection = (id: string) => {
    navigate(`/content-types/edit/${id}`);
  };

  const confirmDeleteCollection = (id: string) => {
    setCollectionToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCollection = async () => {
    if (!collectionToDelete) return;

    try {
      await collectionsApi.delete(collectionToDelete);
      removeCollection(collectionToDelete);
      toast({
        title: 'Success',
        description: 'Content type deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content type',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setCollectionToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content-Type Builder</h1>
        <Button onClick={handleCreateCollection}>
          <Plus className="mr-2 h-4 w-4" />
          Create new collection
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Loading state
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : collections.length === 0 ? (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center p-8 bg-gray-50 border border-dashed rounded-lg">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No content types found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first content type to start building your API
            </p>
            <Button onClick={handleCreateCollection}>
              <Plus className="mr-2 h-4 w-4" />
              Create new collection
            </Button>
          </div>
        ) : (
          // List of collections
          collections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden border-2 hover:border-primary transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2 flex-shrink-0">
                      {(collection.name || 'U')[0].toUpperCase()}
                    </div>
                    <CardTitle className="text-lg font-bold">{collection.name || 'Unnamed Collection'}</CardTitle>
                  </div>
                  <div className="p-1 rounded-full bg-primary/10">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <CardDescription>
                  API ID: {collection.apiId}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="bg-muted rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-medium">
                        Fields
                      </div>
                      <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                        {collection.fields?.length || 0}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {collection.draftAndPublish ? 'Draft/Publish enabled' : 'No draft system'}
                      {collection.isInternationally ? ' • Internationalization enabled' : ''}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/30 px-6 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCollection(collection.id)}
                >
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => confirmDeleteCollection(collection.id)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create new content type card */}
      {!loading && collections.length > 0 && (
        <Card className="cursor-pointer hover:border-primary transition-colors"
             onClick={handleCreateCollection}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Create new collection</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Build the data architecture of your content
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete content type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content type? This action cannot be undone and all related content will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCollection}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create collection type dialog */}
      <CollectionTypeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleSaveCollection}
      />
    </div>
  );
}
