
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, ListFilter, Plus, RefreshCcw } from 'lucide-react';
import { useCollectionStore, useContentEntryStore } from '@/lib/store';
import { collectionsApi, contentEntriesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ContentManager() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { collections, setCollections, loading: collectionsLoading, setLoading: setCollectionsLoading } = useCollectionStore();
  const { contentEntries, setContentEntries, loading: entriesLoading, setLoading: setEntriesLoading } = useContentEntryStore();
  const [selectedCollection, setSelectedCollection] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [contentFilter, setContentFilter] = React.useState<'all' | 'published' | 'draft'>('all');

  // Fetch collections and entries
  React.useEffect(() => {
    const fetchData = async () => {
      setCollectionsLoading(true);

      try {
        // For demo purposes, we'll create mock collections instead of fetching from API
        const mockCollections = [
          {
            id: '1',
            name: 'New Test Collection',
            apiId: 'new_test_collection',
            apiIdPlural: 'new_test_collections',
            draftAndPublish: true,
            isInternationally: false,
            fields: [
              {
                id: '1',
                name: 'Title',
                apiId: 'title',
                type: FieldTypeEnum.TEXT,
                required: true,
                unique: false
              },
              {
                id: '2',
                name: 'Description',
                apiId: 'description',
                type: FieldTypeEnum.TEXT,
                required: false,
                unique: false
              }
            ],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'User',
            apiId: 'user',
            apiIdPlural: 'users',
            draftAndPublish: true,
            isInternationally: false,
            fields: [
              {
                id: '3',
                name: 'Username',
                apiId: 'username',
                type: FieldTypeEnum.TEXT,
                required: true,
                unique: true
              },
              {
                id: '4',
                name: 'Email',
                apiId: 'email',
                type: FieldTypeEnum.EMAIL,
                required: true,
                unique: true
              }
            ],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        setCollections(mockCollections);

        // Set first collection as selected if none is selected
        if (mockCollections.length > 0 && !selectedCollection) {
          setSelectedCollection(mockCollections[0].id);
        }
      } catch (error) {
        console.error('Error setting up collections:', error);
        toast({
          title: 'Error',
          description: 'Failed to load collections',
          variant: 'destructive',
        });
      } finally {
        setCollectionsLoading(false);
      }
    };

    fetchData();
  }, [setCollections, setCollectionsLoading, selectedCollection, toast]);

  // Fetch content entries when selected collection changes
  React.useEffect(() => {
    if (!selectedCollection) return;

    const fetchEntries = async () => {
      setEntriesLoading(true);

      try {
        // For demo purposes, we'll create mock entries instead of fetching from API
        const mockEntries: ContentEntry[] = [
          {
            id: '1',
            collectionId: '1',
            data: {
              title: 'Sample Test Entry',
              description: 'This is a sample test entry for demonstration purposes.'
            },
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '2',
            collectionId: '1',
            data: {
              title: 'Another Test Entry',
              description: 'This is another sample test entry.'
            },
            isPublished: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: '3',
            collectionId: '2',
            data: {
              username: 'johndoe',
              email: 'john.doe@example.com'
            },
            isPublished: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        // Filter entries for the selected collection
        const filteredEntries = mockEntries.filter(entry => entry.collectionId === selectedCollection);
        setContentEntries(filteredEntries);
      } catch (error) {
        console.error('Error setting up content entries:', error);
        toast({
          title: 'Error',
          description: 'Failed to load content entries',
          variant: 'destructive',
        });
      } finally {
        setEntriesLoading(false);
      }
    };

    fetchEntries();
  }, [selectedCollection, setContentEntries, setEntriesLoading, toast]);

  // Filter entries by search query and publish state
  const filteredEntries = React.useMemo(() => {
    if (!contentEntries) return [];

    return contentEntries.filter(entry => {
      // Filter by collection
      if (selectedCollection && entry.collectionId !== selectedCollection) {
        return false;
      }

      // Filter by search query (simple implementation)
      if (searchQuery && !JSON.stringify(entry.data).toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by publish state
      if (contentFilter === 'published' && !entry.isPublished) {
        return false;
      }
      if (contentFilter === 'draft' && entry.isPublished) {
        return false;
      }

      return true;
    });
  }, [contentEntries, selectedCollection, searchQuery, contentFilter]);

  // Get the current collection
  const currentCollection = collections.find(c => c.id === selectedCollection);

  // Handle collection change
  const handleCollectionChange = (collectionId: string) => {
    setSelectedCollection(collectionId);
  };

  // Handle create content
  const handleCreateContent = () => {
    if (!selectedCollection) return;
    navigate(`/content-manager/${selectedCollection}/create`);
  };

  // Handle edit content
  const handleEditContent = (entryId: string) => {
    if (!selectedCollection) return;
    navigate(`/content-manager/${selectedCollection}/edit/${entryId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Manager</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setCollectionsLoading(true);
              setTimeout(() => {
                setCollectionsLoading(false);
                toast({
                  title: 'Refreshed',
                  description: 'Collections refreshed successfully',
                });
              }, 500);
            }}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {selectedCollection && (
            <Button onClick={handleCreateContent}>
              <Plus className="mr-2 h-4 w-4" />
              Create new entry
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Collection selector */}
        <div className="md:col-span-3 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-white">
              <CardTitle>Collections</CardTitle>
              <CardDescription>Select a collection to manage</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {collectionsLoading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : collections.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  <p>No collections found</p>
                  <Button
                    variant="link"
                    onClick={() => navigate('/content-types/create')}
                    className="mt-2"
                  >
                    Create your first collection
                  </Button>
                </div>
              ) : (
                <div className="border-t">
                  {collections.map(collection => (
                    <Button
                      key={collection.id}
                      variant="ghost"
                      className={`w-full justify-start rounded-none border-l-4 ${selectedCollection === collection.id ? 'border-l-indigo-600 bg-indigo-50 text-indigo-600' : 'border-l-transparent'}`}
                      onClick={() => handleCollectionChange(collection.id)}
                    >
                      {collection.name}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content entries */}
        <div className="md:col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{currentCollection?.name || 'Content'}</CardTitle>
                  <CardDescription>
                    {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                    <ListFilter className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <Select value={contentFilter} onValueChange={(value: any) => setContentFilter(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedCollection ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FilePlus className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a collection</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Choose a collection from the sidebar to view and manage its content
                  </p>
                </div>
              ) : entriesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M60 20H20V60H60V20Z" fill="#E0E7FF" />
                      <path d="M56 24H24V56H56V24Z" stroke="#818CF8" strokeWidth="2" />
                      <path d="M32 32H48" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
                      <path d="M32 40H48" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
                      <path d="M32 48H48" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No content found</h3>
                  <Button
                    onClick={handleCreateContent}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new entry
                  </Button>
                </div>
              ) : (
                <div>
                  <Tabs defaultValue="table">
                    <TabsList>
                      <TabsTrigger value="table">Table</TabsTrigger>
                      <TabsTrigger value="grid">Grid</TabsTrigger>
                    </TabsList>

                    <TabsContent value="table" className="pt-4">
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted text-muted-foreground">
                            <tr>
                              {/* Dynamic columns based on collection fields */}
                              {currentCollection?.fields?.slice(0, 3).map(field => (
                                <th key={field.id} className="px-4 py-2 text-left font-medium">
                                  {field.name}
                                </th>
                              ))}
                              <th className="px-4 py-2 text-left font-medium">Status</th>
                              <th className="px-4 py-2 text-left font-medium">Updated</th>
                              <th className="px-4 py-2 text-right font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredEntries.map(entry => (
                              <tr
                                key={entry.id}
                                className="border-t hover:bg-muted/50 cursor-pointer"
                                onClick={() => handleEditContent(entry.id)}
                              >
                                {currentCollection?.fields?.slice(0, 3).map(field => (
                                  <td key={field.id} className="px-4 py-3 text-left">
                                    {entry.data[field.apiId] ?
                                      String(entry.data[field.apiId]).substring(0, 50) :
                                      <span className="text-muted-foreground italic">Empty</span>
                                    }
                                  </td>
                                ))}
                                <td className="px-4 py-3">
                                  <div className={`px-2 py-1 rounded text-xs inline-block ${
                                    entry.isPublished ?
                                      'bg-green-100 text-green-800' :
                                      'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {entry.isPublished ? 'Published' : 'Draft'}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">
                                  {new Date(entry.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditContent(entry.id);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>

                    <TabsContent value="grid" className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEntries.map(entry => (
                          <Card
                            key={entry.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleEditContent(entry.id)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                {currentCollection?.fields?.slice(0, 2).map(field => (
                                  <div key={field.id}>
                                    <div className="text-sm font-medium">{field.name}</div>
                                    <div className="truncate">
                                      {entry.data[field.apiId] ?
                                        String(entry.data[field.apiId]).substring(0, 50) :
                                        <span className="text-muted-foreground italic">Empty</span>
                                      }
                                    </div>
                                  </div>
                                ))}
                                <div className="flex items-center justify-between pt-2">
                                  <div className={`px-2 py-1 rounded text-xs ${
                                    entry.isPublished ?
                                      'bg-green-100 text-green-800' :
                                      'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {entry.isPublished ? 'Published' : 'Draft'}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(entry.updatedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
