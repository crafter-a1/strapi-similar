
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, Edit, Trash2 } from 'lucide-react';
import { componentsApi } from '@/lib/api';
import { useComponentStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Components() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    components, 
    setComponents, 
    removeComponent,
    loading, 
    setLoading 
  } = useComponentStore();
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [componentToDelete, setComponentToDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchComponents = async () => {
      setLoading(true);
      try {
        const response = await componentsApi.getAll();
        setComponents(response.data);
      } catch (error) {
        console.error('Error fetching components:', error);
        toast({
          title: 'Error',
          description: 'Failed to load components',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, [setComponents, setLoading, toast]);

  const handleCreateComponent = () => {
    // Placeholder - would navigate to component creation page
    toast({
      title: 'Coming Soon',
      description: 'Component creation is under development',
    });
  };

  const handleEditComponent = (id: string) => {
    // Placeholder - would navigate to component edit page
    toast({
      title: 'Coming Soon',
      description: 'Component editing is under development',
    });
  };

  const confirmDeleteComponent = (id: string) => {
    setComponentToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteComponent = async () => {
    if (!componentToDelete) return;

    try {
      await componentsApi.delete(componentToDelete);
      removeComponent(componentToDelete);
      toast({
        title: 'Success',
        description: 'Component deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting component:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete component',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setComponentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Components</h1>
        <Button onClick={handleCreateComponent}>
          <Plus className="mr-2 h-4 w-4" />
          Create new component
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
        ) : components.length === 0 ? (
          // Empty state
          <div className="col-span-full flex flex-col items-center justify-center p-8 bg-gray-50 border border-dashed rounded-lg">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No components found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first component to reuse across your content types
            </p>
            <Button onClick={handleCreateComponent}>
              <Plus className="mr-2 h-4 w-4" />
              Create component
            </Button>
          </div>
        ) : (
          // List of components
          components.map((component) => (
            <Card key={component.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{component.name}</CardTitle>
                  <div className="p-1 rounded-full bg-primary/10">
                    <Layers className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <CardDescription>
                  API ID: {component.apiId}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-4">
                  <div className="bg-muted rounded-md p-3">
                    <div className="text-sm text-muted-foreground">
                      {component.fields?.length || 0} fields
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/30 px-6 py-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditComponent(component.id)}
                >
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => confirmDeleteComponent(component.id)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Create new component card */}
      {!loading && components.length > 0 && (
        <Card className="cursor-pointer hover:border-primary transition-colors" 
             onClick={handleCreateComponent}>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Create new component</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Build reusable components for your content types
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete component</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this component? This action cannot be undone and this component will be removed from all content types using it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteComponent}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
