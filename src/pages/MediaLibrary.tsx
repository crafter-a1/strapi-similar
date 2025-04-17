import React, { useState, useEffect } from 'react';
import { useMediaStore } from '@/lib/store';
import { mediaApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  FolderPlus,
  Upload,
  Grid,
  List,
  Search,
  Settings,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MediaLibrary() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const {
    assets,
    folders,
    loading,
    error,
    setAssets,
    setFolders,
    setLoading,
    setError
  } = useMediaStore();

  // Placeholder for empty state
  const isEmpty = assets.length === 0;

  // Fetch assets and folders
  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        // In a real implementation, we would fetch from the API
        // const assetsResponse = await mediaApi.getAllAssets();
        // const foldersResponse = await mediaApi.getAllFolders();
        // setAssets(assetsResponse.data);
        // setFolders(foldersResponse.data);

        // For now, we'll use empty arrays since the API isn't implemented yet
        setAssets([]);
        setFolders([]);
      } catch (error) {
        console.error('Error fetching media:', error);
        setError('Failed to load media assets');
        toast({
          title: 'Error',
          description: 'Failed to load media assets',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [setAssets, setFolders, setLoading, setError, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {}}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Add new folder
          </Button>
          <Button onClick={() => {}}>
            <Upload className="mr-2 h-4 w-4" />
            Add new assets
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent uploads</SelectItem>
              <SelectItem value="oldest">Oldest uploads</SelectItem>
              <SelectItem value="name">Name (A to Z)</SelectItem>
              <SelectItem value="size">Size (smallest first)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="border rounded-md flex">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-muted/20 rounded-md aspect-square animate-pulse" />
          ))}
        </div>
      ) : error ? (
        // Error state
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-destructive/10">
          <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-destructive/20">
            <FileText className="h-10 w-10 text-destructive" />
          </div>
          <h3 className="text-xl font-medium mb-2 text-destructive">Error loading media</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            {error}
          </p>
          <Button onClick={() => window.location.reload()}>
            <Upload className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : isEmpty ? (
        // Empty state
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/20">
          <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-medium mb-2">Upload your first assets...</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            Drag and drop files to upload content to the Media Library
          </p>
          <Button onClick={() => {}}>
            <Upload className="mr-2 h-4 w-4" />
            Add new assets
          </Button>
        </div>
      ) : (
        // Media items grid/list
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-2"}>
          {/* This would be populated with actual media items */}
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={
                viewMode === 'grid'
                  ? "bg-muted/20 rounded-md aspect-square flex items-center justify-center hover:bg-muted/30 cursor-pointer transition-colors"
                  : "flex items-center p-3 border rounded-md hover:bg-muted/10 cursor-pointer transition-colors"
              }
            >
              {viewMode === 'grid' ? (
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              ) : (
                <div className="flex items-center space-x-3 w-full">
                  <div className="bg-muted/30 rounded-md p-2">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Image {index + 1}</div>
                    <div className="text-sm text-muted-foreground">100 KB • Added 2 days ago</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
