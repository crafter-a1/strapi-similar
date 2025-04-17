
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, LogIn, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FieldTypeEnum, useAuthStore, useCollectionStore } from '@/lib/store';
import { useFieldTypes, FieldTypeOption } from '@/hooks/use-field-types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FieldTypeSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: FieldTypeEnum) => void;
}

export default function FieldTypeSelector({ open, onClose, onSelect }: FieldTypeSelectorProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { fieldTypeOptions, loading, error, refetch } = useFieldTypes();
  const { isAuthenticated } = useAuthStore();
  const { selectedCollection } = useCollectionStore();
  const navigate = useNavigate();

  // Refresh field types when dialog opens
  React.useEffect(() => {
    if (open) {
      console.log('FieldTypeSelector opened, fetching field types...');
      refetch();
    }
  }, [open, refetch]);

  // Debug field type options
  React.useEffect(() => {
    if (fieldTypeOptions.length > 0) {
      console.log('Field type options available:', fieldTypeOptions.length);
      console.log('First few options:', fieldTypeOptions.slice(0, 3));
    } else if (!loading) {
      console.log('No field type options available');
    }
  }, [fieldTypeOptions, loading]);

  // Field type descriptions based on API response
  const getFieldDescription = (type: FieldTypeEnum): string => {
    console.log(`Getting description for field type: ${type}`);
    switch (type) {
      // New field types
      case FieldTypeEnum.TEXT:
        return 'Simple text field';
      case FieldTypeEnum.NUMBER:
        return 'Numeric field';
      case FieldTypeEnum.DATE:
        return 'Date field';
      case FieldTypeEnum.IMAGE:
        return 'Image upload field';
      case FieldTypeEnum.RICH_TEXT:
        return 'Rich text editor';
      case FieldTypeEnum.MASK:
        return 'Masked input field';
      case FieldTypeEnum.CALENDAR:
        return 'Calendar date picker';
      case FieldTypeEnum.EDITOR:
        return 'Rich text editor';
      case FieldTypeEnum.PASSWORD:
        return 'Password input field';
      case FieldTypeEnum.AUTOCOMPLETE:
        return 'Autocomplete suggestions';
      case FieldTypeEnum.CASCADE_SELECT:
        return 'Cascade selection field';
      case FieldTypeEnum.DROPDOWN:
        return 'Dropdown selection';
      case FieldTypeEnum.FILE:
        return 'File upload field';
      case FieldTypeEnum.MULTI_STATE_CHECKBOX:
        return 'Multi-state checkbox';
      case FieldTypeEnum.MULTI_SELECT:
        return 'Multi-select field';
      case FieldTypeEnum.MENTION:
        return 'Mention users or tags';
      case FieldTypeEnum.TEXTAREA:
        return 'Multi-line text input';
      case FieldTypeEnum.OTP:
        return 'One-time password input';

      // Legacy field types
      case FieldTypeEnum.RICH_TEXT_BLOCKS:
        return 'The new JSON-based rich text editor';
      case FieldTypeEnum.BOOLEAN:
        return 'Yes or no, 1 or 0, true or false';
      case FieldTypeEnum.JSON:
        return 'Data in JSON format';
      case FieldTypeEnum.EMAIL:
        return 'Email field with validations format';
      case FieldTypeEnum.MEDIA:
        return 'Files like images, videos, etc';
      case FieldTypeEnum.ENUMERATION:
        return 'List of values, then pick one';
      case FieldTypeEnum.RELATION:
        return 'Refers to a Collection Type';
      case FieldTypeEnum.UID:
        return 'Unique identifier';
      case FieldTypeEnum.COMPONENT:
        return 'Group of fields that can be reused';
      case FieldTypeEnum.DYNAMIC_ZONE:
        return 'Pick any component from a list';
      case FieldTypeEnum.INPUT_MASK:
        return 'Text with a specific format';
      case FieldTypeEnum.INPUT_TEXTAREA:
        return 'Multiline text input';
      default:
        return '';
    }
  };

  // Filter field types based on search
  const filteredFieldTypes = fieldTypeOptions.length > 0
    ? fieldTypeOptions.filter((option) =>
        option.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getFieldDescription(option.type).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedCollection && (
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded font-bold">
                {selectedCollection.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <DialogTitle>Select a field for your collection type</DialogTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="py-4">
          <Tabs defaultValue="default">
            <div className="mb-4">
              <TabsList className="w-full border-b">
                <TabsTrigger value="default" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">DEFAULT</TabsTrigger>
                <TabsTrigger value="custom" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">CUSTOM</TabsTrigger>
              </TabsList>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search field types..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <TabsContent value="default" className="mt-0">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading field types...</span>
                </div>
              ) : error ? (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription className="flex flex-col gap-4">
                    <div>{error}</div>
                    {error.includes('Authentication') ? (
                      <Button
                        variant="outline"
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2"
                      >
                        <LogIn className="h-4 w-4" />
                        Go to Login
                      </Button>
                    ) : (
                      <button
                        className="ml-2 underline"
                        onClick={refetch}
                      >
                        Try again
                      </button>
                    )}
                  </AlertDescription>
                </Alert>
              ) : filteredFieldTypes.length === 0 && fieldTypeOptions.length === 0 ? (
                <div className="flex items-center justify-center h-32 border rounded-md">
                  <p className="text-muted-foreground">No field types found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredFieldTypes.length > 0 ? (
                    filteredFieldTypes.map((option) => (
                      <div
                        key={`${option.type}-${option.id}`}
                        className="flex p-4 border rounded-md cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                        onClick={() => {
                          console.log('Selected field type:', option.type);
                          onSelect(option.type);
                          onClose();
                        }}
                      >
                        <div className="mr-4 flex-shrink-0">
                          <div className={`w-8 h-8 ${option.iconBg} ${option.iconColor} flex items-center justify-center rounded`}>
                            {option.iconText}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{option.title}</h3>
                          <p className="text-sm text-muted-foreground">{getFieldDescription(option.type)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback to hardcoded field types if API doesn't return any
                    [
                      { type: FieldTypeEnum.TEXT, title: 'Text', description: 'Simple text field', iconBg: 'bg-green-100', iconColor: 'text-green-700', iconText: 'Aa' },
                      { type: FieldTypeEnum.NUMBER, title: 'Number', description: 'Numeric field', iconBg: 'bg-red-100', iconColor: 'text-red-700', iconText: '123' },
                      { type: FieldTypeEnum.DATE, title: 'Date', description: 'Date field', iconBg: 'bg-amber-100', iconColor: 'text-amber-700', iconText: '📅' },
                      { type: FieldTypeEnum.PASSWORD, title: 'Password', description: 'Password input field', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-700', iconText: '🔒' },
                      { type: FieldTypeEnum.RICH_TEXT, title: 'Rich Text', description: 'Rich text editor', iconBg: 'bg-blue-100', iconColor: 'text-blue-700', iconText: '∷' },
                      { type: FieldTypeEnum.TEXTAREA, title: 'Textarea', description: 'Multi-line text input', iconBg: 'bg-orange-100', iconColor: 'text-orange-700', iconText: '¶' }
                    ].map((option) => (
                      <div
                        key={`${option.type}`}
                        className="flex p-4 border rounded-md cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                        onClick={() => {
                          console.log('Selected hardcoded field type:', option.type);
                          onSelect(option.type);
                          onClose();
                        }}
                      >
                        <div className="mr-4 flex-shrink-0">
                          <div className={`w-8 h-8 ${option.iconBg} ${option.iconColor} flex items-center justify-center rounded`}>
                            {option.iconText}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{option.title}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="mt-0">
              <div className="flex items-center justify-center h-32 border rounded-md">
                <p className="text-muted-foreground">No custom field types available</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
