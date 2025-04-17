import React, { useState } from 'react';
import { Collection, Field } from '@/lib/store';
import { renderField } from '@/lib/field-renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContentFormProps {
  collection: Collection;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function ContentForm({
  collection,
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false
}: ContentFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [activeTab, setActiveTab] = useState('main');

  // Group fields into tabs
  const fieldGroups = React.useMemo(() => {
    const groups: Record<string, Field[]> = {
      main: []
    };

    // Group fields by their dependOn property
    collection.fields.forEach(field => {
      if (!field.dependOn) {
        groups.main.push(field);
      } else {
        if (!groups[field.dependOn]) {
          groups[field.dependOn] = [];
        }
        groups[field.dependOn].push(field);
      }
    });

    return groups;
  }, [collection.fields]);

  // Handle field change
  const handleFieldChange = (field: Field, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field.apiId]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Get tab names
  const tabNames = Object.keys(fieldGroups);

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{collection.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {tabNames.length > 1 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                {tabNames.map(tabName => (
                  <TabsTrigger key={tabName} value={tabName}>
                    {tabName === 'main' ? 'Main' : tabName}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabNames.map(tabName => (
                <TabsContent key={tabName} value={tabName} className="space-y-6">
                  {fieldGroups[tabName].map(field => (
                    <div key={field.apiId}>
                      {renderField(
                        field,
                        formData[field.apiId],
                        (value) => handleFieldChange(field, value)
                      )}
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="space-y-6">
              {fieldGroups.main.map(field => (
                <div key={field.apiId}>
                  {renderField(
                    field,
                    formData[field.apiId],
                    (value) => handleFieldChange(field, value)
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
