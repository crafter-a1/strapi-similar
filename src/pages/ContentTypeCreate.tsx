
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collectionsApi } from '@/lib/api';
import { useCollectionStore } from '@/lib/store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

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

export default function ContentTypeCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addCollection } = useCollectionStore();
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

    const collectionData = {
      name: data.name,
      apiId: data.apiIdSingular,
      apiIdPlural: data.apiIdPlural,
      draftAndPublish: data.draftAndPublish,
      isInternationally: data.isInternationally,
      fields: [],
    };

    try {
      const response = await collectionsApi.create(collectionData);
      addCollection(response.data);
      
      toast({
        title: 'Content type created',
        description: 'Your content type has been created successfully',
      });
      
      navigate(`/content-types/edit/${response.data.id}`);
    } catch (error) {
      console.error('Error creating content type:', error);
      
      toast({
        title: 'Error',
        description: 'Failed to create content type',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate('/content-types')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold ml-2">Create a collection type</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Configurations</h2>
                <p className="text-muted-foreground">A type for modeling data</p>
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList>
                  <TabsTrigger value="basic">BASIC SETTINGS</TabsTrigger>
                  <TabsTrigger value="advanced">ADVANCED SETTINGS</TabsTrigger>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apiIdSingular"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API ID (Singular)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. restaurant" {...field} />
                        </FormControl>
                        <FormDescription>
                          The UID is used to generate the API routes and databases tables/collections
                        </FormDescription>
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
                </TabsContent>
                <TabsContent value="advanced" className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="draftAndPublish"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Draft & publish</FormLabel>
                          <FormDescription>
                            Allows writing a draft version of an entry, before it is published
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isInternationally"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Internationalization</FormLabel>
                          <FormDescription>
                            Allows translating an entry into different languages
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => navigate('/content-types')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Continue'}
                  {!isLoading && <Check className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
