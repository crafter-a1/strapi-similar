
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Calendar, Database, FileText, Layers, Users } from 'lucide-react';
import { useCollectionStore, useContentEntryStore } from '@/lib/store';
import { collectionsApi, contentEntriesApi } from '@/lib/api';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const navigate = useNavigate();
  const { collections, setCollections, setLoading: setCollectionsLoading } = useCollectionStore();
  const { contentEntries, setContentEntries, setLoading: setEntriesLoading } = useContentEntryStore();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setCollectionsLoading(true);
      setEntriesLoading(true);

      try {
        // Fetch collections
        const collectionsResponse = await collectionsApi.getAll();
        setCollections(collectionsResponse.data);

        // Fetch content entries
        const entriesResponse = await contentEntriesApi.getAll();
        setContentEntries(entriesResponse.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
        setCollectionsLoading(false);
        setEntriesLoading(false);
      }
    };

    fetchDashboardData();
  }, [setCollections, setContentEntries, setCollectionsLoading, setEntriesLoading]);

  // Dashboard stats
  const stats = [
    {
      title: 'Collections',
      value: collections.length,
      icon: Database,
      color: 'bg-blue-500',
      path: '/content-types',
    },
    {
      title: 'Content Entries',
      value: contentEntries.length,
      icon: FileText,
      color: 'bg-green-500',
      path: '/content-manager',
    },
    {
      title: 'Media Items',
      value: 0, // Placeholder
      icon: Layers,
      color: 'bg-purple-500',
      path: '/media-library',
    },
    {
      title: 'Users',
      value: 1, // Placeholder 
      icon: Users,
      color: 'bg-orange-500',
      path: '/settings/users',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate('/content-types/create')}>Create Content Type</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 w-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stat.value}</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="px-0 hover:bg-transparent" onClick={() => navigate(stat.path)}>
                  View all
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Your recent content management activity</CardDescription>
          </CardHeader>
          <CardContent>
            {contentEntries.length === 0 ? (
              <p className="text-center text-muted-foreground p-4">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {contentEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">
                        Content entry {collections.find(c => c.id === entry.collectionId)?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${entry.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {entry.isPublished ? 'Published' : 'Draft'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/content-manager')}>
              View All Entries
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Content Distribution</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Distribution of content by collection type</CardDescription>
          </CardHeader>
          <CardContent>
            {collections.length === 0 ? (
              <p className="text-center text-muted-foreground p-4">No collections created yet</p>
            ) : (
              <div className="space-y-4">
                {collections.slice(0, 5).map((collection) => {
                  const entriesCount = contentEntries.filter(entry => entry.collectionId === collection.id).length;
                  const percentage = collections.length > 0 ? (entriesCount / Math.max(1, contentEntries.length)) * 100 : 0;
                  
                  return (
                    <div key={collection.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{collection.name}</span>
                        <span className="text-sm text-muted-foreground">{entriesCount} entries</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/content-types')}>
              Manage Content Types
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
