
import React from 'react';
import { useForm } from 'react-hook-form';
import { Field, FieldTypeEnum } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface ContentEntryFormProps {
  fields: Field[];
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ContentEntryForm({
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting
}: ContentEntryFormProps) {
  const form = useForm({
    defaultValues: initialData
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
  };

  // Render the appropriate form field based on field type
  const renderField = (field: Field) => {
    switch (field.type) {
      case FieldTypeEnum.TEXT:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.apiId}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}{field.required && '*'}</FormLabel>
                <FormControl>
                  <Input placeholder={field.name} {...formField} />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldTypeEnum.RICH_TEXT_BLOCKS:
      case FieldTypeEnum.RICH_TEXT_MARKDOWN:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.apiId}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}{field.required && '*'}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={field.name}
                    className="min-h-[200px]"
                    {...formField}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldTypeEnum.NUMBER:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.apiId}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}{field.required && '*'}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={field.name}
                    {...formField}
                    onChange={(e) => formField.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldTypeEnum.BOOLEAN:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.apiId}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                <FormControl>
                  <Checkbox
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>{field.name}{field.required && '*'}</FormLabel>
                  {field.description && (
                    <FormDescription>{field.description}</FormDescription>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldTypeEnum.EMAIL:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.apiId}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}{field.required && '*'}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={`example@domain.com`}
                    {...formField}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldTypeEnum.PASSWORD:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.apiId}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}{field.required && '*'}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...formField}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldTypeEnum.DATE:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.apiId}
            render={({ field: formField }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{field.name}{field.required && '*'}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !formField.value && "text-muted-foreground"
                        )}
                      >
                        {formField.value ? (
                          format(new Date(formField.value), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formField.value ? new Date(formField.value) : undefined}
                      onSelect={formField.onChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldTypeEnum.ENUMERATION:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.apiId}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}{field.required && '*'}</FormLabel>
                <Select 
                  onValueChange={formField.onChange} 
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select a ${field.name.toLowerCase()}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(field.enumValues || []).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case FieldTypeEnum.JSON:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.apiId}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.name}{field.required && '*'}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="{}"
                    className="font-mono min-h-[200px]"
                    value={typeof formField.value === 'object' ? JSON.stringify(formField.value, null, 2) : formField.value}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        formField.onChange(parsed);
                      } catch {
                        formField.onChange(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
          
      // For other field types, we'd implement the appropriate UI components
      // This is a simplified version showing the most common field types
      default:
        return (
          <FormItem key={field.id}>
            <FormLabel>{field.name}{field.required && '*'}</FormLabel>
            <FormDescription>
              Field type '{field.type}' rendering not implemented yet
            </FormDescription>
          </FormItem>
        );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-6">
          {fields.map(renderField)}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
