import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Validation schema
const collectionSchema = z.object({
  name: z.string().min(2, 'Name is required and must be at least 2 characters'),
  apiIdSingular: z.string().min(2, 'Singular API ID is required')
    .regex(/^[a-zA-Z0-9_]+$/, 'API ID can only contain letters, numbers, and underscores'),
  apiIdPlural: z.string().min(2, 'Plural API ID is required')
    .regex(/^[a-zA-Z0-9_]+$/, 'API ID can only contain letters, numbers, and underscores'),
  draftAndPublish: z.boolean().default(false),
  isInternationally: z.boolean().default(false),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CollectionTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CollectionFormValues) => void;
}

export default function CollectionTypeDialog({
  open,
  onClose,
  onSave
}: CollectionTypeDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  // React Hook Form
  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: '',
      apiIdSingular: '',
      apiIdPlural: '',
      draftAndPublish: false,
      isInternationally: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: CollectionFormValues) => {
    setIsLoading(true);
    try {
      await onSave(data);
      // Don't reset loading state on success as the dialog will be closed
    } catch (error) {
      // Only reset loading state on error, so the user can try again
      setIsLoading(false);
      // Re-throw the error to be handled by the parent component
      throw error;
    }
  };

  // Handle name change to auto-generate API IDs
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);

    // Auto-generate API IDs if they haven't been manually changed
    if (!form.formState.dirtyFields.apiIdSingular) {
      const singular = name.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      form.setValue('apiIdSingular', singular);
    }

    if (!form.formState.dirtyFields.apiIdPlural) {
      const plural = `${name.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')}s`;
      form.setValue('apiIdPlural', plural);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 mr-2 bg-primary text-primary-foreground rounded">
              CT
            </div>
            <DialogTitle>Create a collection type</DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-lg font-medium">Configurations</h3>
                <p className="text-sm text-muted-foreground">A type for modeling data</p>
              </div>

              <Tabs defaultValue="basic">
                <TabsList className="w-full">
                  <TabsTrigger value="basic" className="flex-1">BASIC SETTINGS</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">ADVANCED SETTINGS</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Restaurant, Article, Product..."
                            {...field}
                            onChange={handleNameChange}
                          />
                        </FormControl>
                        <FormDescription>
                          The UID is used to generate the API routes and databases tables/collections.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="apiIdSingular"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API ID (Singular)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. restaurant" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="apiIdPlural"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API ID (Plural)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. restaurants" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="draft-publish" className="font-medium">Draft & publish</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow creating a draft version of an entry, before it is published
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="draftAndPublish"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              id="draft-publish"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="internationalization" className="font-medium">Internationalization</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow translating an entry into different languages
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="isInternationally"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Switch
                              id="internationalization"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create collection'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
