
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, FilePlus, Plus, Trash2 } from 'lucide-react';
import { collectionsApi } from '@/lib/api';
import { useCollectionStore, Field, FieldTypeEnum } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import FieldTypeSelector from '@/components/content-type/FieldTypeSelector';
import FieldConfigDialog from '@/components/content-type/FieldConfigDialog';

export default function ContentTypeEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    collections,
    selectedCollection,
    setSelectedCollection,
    updateCollection,
    setLoading,
    loading
  } = useCollectionStore();

  const [fieldTypeSelectorOpen, setFieldTypeSelectorOpen] = React.useState(false);
  const [fieldConfigOpen, setFieldConfigOpen] = React.useState(false);
  const [selectedFieldType, setSelectedFieldType] = React.useState<FieldTypeEnum | null>(null);
  const [fieldToEdit, setFieldToEdit] = React.useState<Field | undefined>(undefined);
  const [deleteFieldDialogOpen, setDeleteFieldDialogOpen] = React.useState(false);
  const [fieldToDelete, setFieldToDelete] = React.useState<string | null>(null);

  // Fetch collection details
  React.useEffect(() => {
    const fetchCollection = async () => {
      if (!id) return;

      setLoading(true);
      try {
        console.log('Fetching collection with ID:', id);
        const response = await collectionsApi.getById(id);
        console.log('Collection data received:', response.data);

        if (!response.data) {
          throw new Error('No collection data received');
        }

        // Format the collection data to match the expected structure
        const formattedCollection = {
          id: response.data.id.toString(),
          name: response.data.collectionName,
          apiId: response.data.collectionApiId,
          apiIdPlural: '',
          draftAndPublish: false,
          isInternationally: false,
          fields: [],
          isActive: true,
          createdAt: '',
          updatedAt: ''
        };

        // Try to parse additional information if available
        if (response.data.additionalInformation) {
          try {
            const additionalInfo = JSON.parse(response.data.additionalInformation);
            formattedCollection.apiIdPlural = additionalInfo.apiIdPlural || '';
            formattedCollection.draftAndPublish = additionalInfo.draftAndPublish || false;
            formattedCollection.isInternationally = additionalInfo.isInternationally || false;
          } catch (parseError) {
            console.error('Error parsing additional information:', parseError);
          }
        }

        setSelectedCollection(formattedCollection);
      } catch (error) {
        console.error('Error fetching collection:', error);
        toast({
          title: 'Error',
          description: 'Failed to load collection details',
          variant: 'destructive',
        });
        navigate('/content-types');
      } finally {
        setLoading(false);
      }
    };

    if (!selectedCollection || selectedCollection.id !== id) {
      fetchCollection();
    }
  }, [id, setSelectedCollection, navigate, toast, selectedCollection, setLoading]);

  // Handle adding a new field
  const handleAddField = (fieldType: FieldTypeEnum) => {
    setSelectedFieldType(fieldType);
    setFieldToEdit(undefined);
    setFieldConfigOpen(true);
  };

  // Handle editing a field
  const handleEditField = (field: Field) => {
    setFieldToEdit(field);
    setSelectedFieldType(field.type);
    setFieldConfigOpen(true);
  };

  // Handle saving a field
  const handleSaveField = async (field: Field) => {
    if (!selectedCollection) return;

    try {
      let updatedFields: Field[];

      if (field.id) {
        // Update existing field
        updatedFields = selectedCollection.fields.map(f =>
          f.id === field.id ? field : f
        );
      } else {
        // Add new field
        updatedFields = [
          ...selectedCollection.fields,
          { ...field, id: `temp-${Date.now()}` } // Backend will assign a real ID
        ];
      }

      const updatedCollection = {
        ...selectedCollection,
        fields: updatedFields
      };

      // Update in API
      await collectionsApi.update(selectedCollection.id, updatedCollection);

      // Update in state
      updateCollection(selectedCollection.id, { fields: updatedFields });

      toast({
        title: field.id ? 'Field updated' : 'Field added',
        description: `Field "${field.name}" has been ${field.id ? 'updated' : 'added'} successfully`,
      });
    } catch (error) {
      console.error('Error saving field:', error);
      toast({
        title: 'Error',
        description: `Failed to ${field.id ? 'update' : 'add'} field`,
        variant: 'destructive',
      });
    }
  };

  // Handle deleting a field
  const confirmDeleteField = (fieldId: string) => {
    setFieldToDelete(fieldId);
    setDeleteFieldDialogOpen(true);
  };

  const handleDeleteField = async () => {
    if (!selectedCollection || !fieldToDelete) return;

    try {
      const updatedFields = selectedCollection.fields.filter(f => f.id !== fieldToDelete);

      const updatedCollection = {
        ...selectedCollection,
        fields: updatedFields
      };

      // Update in API
      await collectionsApi.update(selectedCollection.id, updatedCollection);

      // Update in state
      updateCollection(selectedCollection.id, { fields: updatedFields });

      toast({
        title: 'Field deleted',
        description: 'Field has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete field',
        variant: 'destructive',
      });
    } finally {
      setDeleteFieldDialogOpen(false);
      setFieldToDelete(null);
    }
  };

  // Render field type icon
  const renderFieldTypeIcon = (type: FieldTypeEnum) => {
    switch (type) {
      // New field types
      case FieldTypeEnum.TEXT:
        return <div className="w-8 h-8 bg-green-100 text-green-700 flex items-center justify-center rounded">Aa</div>;
      case FieldTypeEnum.NUMBER:
        return <div className="w-8 h-8 bg-red-100 text-red-700 flex items-center justify-center rounded">123</div>;
      case FieldTypeEnum.DATE:
        return <div className="w-8 h-8 bg-amber-100 text-amber-700 flex items-center justify-center rounded">📅</div>;
      case FieldTypeEnum.IMAGE:
        return <div className="w-8 h-8 bg-purple-100 text-purple-700 flex items-center justify-center rounded">🖼️</div>;
      case FieldTypeEnum.RICH_TEXT:
        return <div className="w-8 h-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded">∷</div>;
      case FieldTypeEnum.MASK:
        return <div className="w-8 h-8 bg-green-100 text-green-700 flex items-center justify-center rounded">##</div>;
      case FieldTypeEnum.CALENDAR:
        return <div className="w-8 h-8 bg-amber-100 text-amber-700 flex items-center justify-center rounded">📆</div>;
      case FieldTypeEnum.EDITOR:
        return <div className="w-8 h-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded">≡</div>;
      case FieldTypeEnum.PASSWORD:
        return <div className="w-8 h-8 bg-yellow-100 text-yellow-700 flex items-center justify-center rounded">🔒</div>;
      case FieldTypeEnum.AUTOCOMPLETE:
        return <div className="w-8 h-8 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded">⌨️</div>;
      case FieldTypeEnum.CASCADE_SELECT:
        return <div className="w-8 h-8 bg-teal-100 text-teal-700 flex items-center justify-center rounded">📂</div>;
      case FieldTypeEnum.DROPDOWN:
        return <div className="w-8 h-8 bg-purple-100 text-purple-700 flex items-center justify-center rounded">▼</div>;
      case FieldTypeEnum.FILE:
        return <div className="w-8 h-8 bg-purple-100 text-purple-700 flex items-center justify-center rounded">📄</div>;
      case FieldTypeEnum.MULTI_STATE_CHECKBOX:
        return <div className="w-8 h-8 bg-green-100 text-green-700 flex items-center justify-center rounded">☑️</div>;
      case FieldTypeEnum.MULTI_SELECT:
        return <div className="w-8 h-8 bg-purple-100 text-purple-700 flex items-center justify-center rounded">⊠</div>;
      case FieldTypeEnum.MENTION:
        return <div className="w-8 h-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded">@</div>;
      case FieldTypeEnum.TEXTAREA:
        return <div className="w-8 h-8 bg-orange-100 text-orange-700 flex items-center justify-center rounded">¶</div>;
      case FieldTypeEnum.OTP:
        return <div className="w-8 h-8 bg-yellow-100 text-yellow-700 flex items-center justify-center rounded">#</div>;

      // Legacy field types
      case FieldTypeEnum.RICH_TEXT_BLOCKS:
        return <div className="w-8 h-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded">∷</div>;
      case FieldTypeEnum.RICH_TEXT_MARKDOWN:
        return <div className="w-8 h-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded">≡</div>;
      case FieldTypeEnum.BOOLEAN:
        return <div className="w-8 h-8 bg-green-100 text-green-700 flex items-center justify-center rounded">⚪</div>;
      case FieldTypeEnum.EMAIL:
        return <div className="w-8 h-8 bg-red-100 text-red-700 flex items-center justify-center rounded">@</div>;
      case FieldTypeEnum.MEDIA:
        return <div className="w-8 h-8 bg-purple-100 text-purple-700 flex items-center justify-center rounded">🖼️</div>;
      case FieldTypeEnum.ENUMERATION:
        return <div className="w-8 h-8 bg-purple-100 text-purple-700 flex items-center justify-center rounded">≣</div>;
      case FieldTypeEnum.RELATION:
        return <div className="w-8 h-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded">🔗</div>;
      case FieldTypeEnum.UID:
        return <div className="w-8 h-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded">🔑</div>;
      case FieldTypeEnum.JSON:
        return <div className="w-8 h-8 bg-blue-100 text-blue-700 flex items-center justify-center rounded">{}</div>;
      case FieldTypeEnum.COMPONENT:
        return <div className="w-8 h-8 bg-gray-100 text-gray-700 flex items-center justify-center rounded">⚙️</div>;
      case FieldTypeEnum.DYNAMIC_ZONE:
        return <div className="w-8 h-8 bg-gray-100 text-gray-700 flex items-center justify-center rounded">∞</div>;
      case FieldTypeEnum.INPUT_MASK:
        return <div className="w-8 h-8 bg-green-100 text-green-700 flex items-center justify-center rounded">##</div>;
      case FieldTypeEnum.INPUT_TEXTAREA:
        return <div className="w-8 h-8 bg-orange-100 text-orange-700 flex items-center justify-center rounded">¶</div>;
      default:
        return <div className="w-8 h-8 bg-gray-100 text-gray-700 flex items-center justify-center rounded">?</div>;
    }
  };

  // Get field type label
  const getFieldTypeLabel = (type: FieldTypeEnum) => {
    switch (type) {
      // New field types
      case FieldTypeEnum.TEXT:
        return 'Text';
      case FieldTypeEnum.NUMBER:
        return 'Number';
      case FieldTypeEnum.DATE:
        return 'Date';
      case FieldTypeEnum.IMAGE:
        return 'Image';
      case FieldTypeEnum.RICH_TEXT:
        return 'Rich Text';
      case FieldTypeEnum.MASK:
        return 'Masked Input';
      case FieldTypeEnum.CALENDAR:
        return 'Calendar';
      case FieldTypeEnum.EDITOR:
        return 'Editor';
      case FieldTypeEnum.PASSWORD:
        return 'Password';
      case FieldTypeEnum.AUTOCOMPLETE:
        return 'Autocomplete';
      case FieldTypeEnum.CASCADE_SELECT:
        return 'Cascade Select';
      case FieldTypeEnum.DROPDOWN:
        return 'Dropdown';
      case FieldTypeEnum.FILE:
        return 'File';
      case FieldTypeEnum.MULTI_STATE_CHECKBOX:
        return 'Multi-State Checkbox';
      case FieldTypeEnum.MULTI_SELECT:
        return 'Multi-Select';
      case FieldTypeEnum.MENTION:
        return 'Mention';
      case FieldTypeEnum.TEXTAREA:
        return 'Textarea';
      case FieldTypeEnum.OTP:
        return 'OTP';

      // Legacy field types
      case FieldTypeEnum.RICH_TEXT_BLOCKS:
        return 'Rich Text (Blocks)';
      case FieldTypeEnum.RICH_TEXT_MARKDOWN:
        return 'Rich Text (Markdown)';
      case FieldTypeEnum.BOOLEAN:
        return 'Boolean';
      case FieldTypeEnum.EMAIL:
        return 'Email';
      case FieldTypeEnum.MEDIA:
        return 'Media';
      case FieldTypeEnum.ENUMERATION:
        return 'Enumeration';
      case FieldTypeEnum.RELATION:
        return 'Relation';
      case FieldTypeEnum.UID:
        return 'UID';
      case FieldTypeEnum.JSON:
        return 'JSON';
      case FieldTypeEnum.COMPONENT:
        return 'Component';
      case FieldTypeEnum.DYNAMIC_ZONE:
        return 'Dynamic Zone';
      case FieldTypeEnum.INPUT_MASK:
        return 'Input Mask';
      case FieldTypeEnum.INPUT_TEXTAREA:
        return 'Input Textarea';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
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
            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mt-2"></div>
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

  if (!selectedCollection && !loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle>Collection not found</CardTitle>
            <CardDescription>
              The collection you are looking for does not exist or has been deleted.
              This could be due to an issue with the database connection or the collection ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Collection ID: {id}
            </p>
            <p className="text-sm text-muted-foreground">
              Try creating a new collection or check the database connection.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/content-types')}>
              Go back to Content Types
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Create a default title if collection name is missing
  const collectionName = selectedCollection.name || 'New Collection';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => navigate('/content-types')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col ml-2">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">{collectionName}</h1>
              <Button variant="ghost" size="icon" className="ml-2">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Build the data architecture of your content
            </p>
          </div>
        </div>
        <Button>
          Save
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Content Fields</CardTitle>
            <CardDescription>
              Build the data architecture of your content
            </CardDescription>
          </div>
          <Button onClick={() => setFieldTypeSelectorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add another field
          </Button>
        </CardHeader>
        <CardContent>
          {selectedCollection.fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed rounded-md">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <img src="/document-icon.svg" alt="Document" className="w-16 h-16" />
                </div>
                <h3 className="text-lg font-medium mb-2">Add your first field to this Collection-Type</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Fields are used to structure your content and store data
                </p>
              </div>
              <Button onClick={() => setFieldTypeSelectorOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add new field
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-4 p-2 font-medium text-muted-foreground text-sm">
                <div className="col-span-5">NAME</div>
                <div className="col-span-5">TYPE</div>
                <div className="col-span-2"></div>
              </div>

              {selectedCollection.fields.map((field) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-4 p-2 items-center rounded-md hover:bg-muted/50"
                >
                  <div className="col-span-5 font-medium">{field.name}</div>
                  <div className="col-span-5 flex items-center">
                    {renderFieldTypeIcon(field.type)}
                    <span className="ml-2">{getFieldTypeLabel(field.type)}</span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditField(field)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDeleteField(field.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="pt-4 flex justify-center">
                <Button
                  variant="outline"
                  className="w-full max-w-md"
                  onClick={() => setFieldTypeSelectorOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add new field
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Type Selector */}
      <FieldTypeSelector
        open={fieldTypeSelectorOpen}
        onClose={() => setFieldTypeSelectorOpen(false)}
        onSelect={handleAddField}
      />

      {/* Field Configuration Dialog */}
      {selectedFieldType && (
        <FieldConfigDialog
          open={fieldConfigOpen}
          onClose={() => setFieldConfigOpen(false)}
          onSave={handleSaveField}
          field={fieldToEdit}
          fieldType={selectedFieldType}
          onAddAnother={() => {
            setFieldConfigOpen(false);
            setFieldTypeSelectorOpen(true);
          }}
          collectionName={collectionName}
        />
      )}

      {/* Delete Field Confirmation */}
      <Dialog open={deleteFieldDialogOpen} onOpenChange={setDeleteFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete field</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this field? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFieldDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteField}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
