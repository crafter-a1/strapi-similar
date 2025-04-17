import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Field, FieldTypeEnum } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Schema for field validation
const fieldSchema = z.object({
  name: z.string().min(2, 'Name is required and must be at least 2 characters'),
  apiId: z.string().min(2, 'API ID is required and must be at least 2 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'API ID can only contain letters, numbers, and underscores'),
  type: z.string(),
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  description: z.string().optional(),
  defaultValue: z.any().optional(),
  // Common properties
  dependOn: z.string().optional(),
  uniqueId: z.string().optional(),
  displayName: z.string().optional(),
  isVisible: z.boolean().default(true),
  getApiUrl: z.string().optional(),
  // Field configuration
  attributes: z.object({
    // Common attributes
    keyfilter: z.string().optional(),
    placeholder: z.string().optional(),
    helpText: z.string().optional(),
    floatLabel: z.boolean().optional(),
    invalid: z.boolean().optional(),
    disabled: z.boolean().optional(),
    icon: z.string().optional(),
    tooltip: z.string().optional(),
    tooltipPosition: z.enum(['top', 'bottom', 'left', 'right']).optional(),
    tooltipEvent: z.enum(['hover', 'focus']).optional(),
    autoClear: z.boolean().optional(),
    // Date specific attributes
    dateFormat: z.string().optional(),
    locale: z.string().optional(),
    showIcon: z.boolean().optional(),
    minDate: z.string().optional(),
    maxDate: z.string().optional(),
    readOnlyInput: z.boolean().optional(),
    selectionMode: z.enum(['single', 'multiple', 'range']).optional(),
    hideOnRangeSelection: z.boolean().optional(),
    showButtonBar: z.boolean().optional(),
    showTime: z.boolean().optional(),
    hourFormat: z.enum(['12', '24']).optional(),
    view: z.enum(['month', 'year']).optional(),
    numberOfMonths: z.number().optional(),
    variant: z.enum(['filled', 'outlined']).optional(),
    timeOnly: z.boolean().optional(),
    inline: z.boolean().optional(),
    showWeek: z.boolean().optional(),
    // Password specific attributes
    feedback: z.boolean().optional(),
    promptLabel: z.string().optional(),
    weakLabel: z.string().optional(),
    mediumLabel: z.string().optional(),
    strongLabel: z.string().optional(),
    toggleMask: z.boolean().optional(),
    // Dropdown/Select specific attributes
    dropdown: z.boolean().optional(),
    object: z.boolean().optional(),
    group: z.boolean().optional(),
    forceSelection: z.boolean().optional(),
    multiple: z.boolean().optional(),
    checkmark: z.boolean().optional(),
    highlightOnSelect: z.boolean().optional(),
    editable: z.boolean().optional(),
    optionGroupLabel: z.string().optional(),
    optionGroupChildren: z.string().optional(),
    optionGroupTemplate: z.string().optional(),
    valueTemplate: z.string().optional(),
    itemTemplate: z.string().optional(),
    panelFooterTemplate: z.string().optional(),
    filter: z.boolean().optional(),
    showClear: z.boolean().optional(),
    loading: z.boolean().optional(),
    virtualScrollerOptions: z.any().optional(),
    // File upload specific attributes
    mode: z.enum(['basic', 'advanced']).optional(),
    url: z.string().optional(),
    accept: z.string().optional(),
    minFileSize: z.number().optional(),
    maxFileSize: z.number().optional(),
    auto: z.boolean().optional(),
    chooseLabel: z.string().optional(),
    emptyTemplate: z.string().optional(),
    customUpload: z.boolean().optional(),
    uploadHandler: z.string().optional(),
    // Select/Radio specific attributes
    options: z.array(z.any()).optional(),
    iconTemplate: z.string().optional(),
    value: z.any().optional(),
    optionValue: z.string().optional(),
    display: z.string().optional(),
    optionLabel: z.string().optional(),
    maxSelectedLabels: z.number().optional(),
    // Textarea specific attributes
    field: z.string().optional(),
    rows: z.number().optional(),
    cols: z.number().optional(),
    trigger: z.enum(['blur', 'change']).optional(),
    autoResize: z.boolean().optional(),
  }).optional(),
  validations: z.object({
    required: z.boolean().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    regex: z.string().optional(),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    minFractionDigits: z.number().optional(),
    maxFractionDigits: z.number().optional(),
    apiUrl: z.string().optional(),
  }).optional(),
  // Conditional fields
  enumValues: z.array(z.string()).optional(),
  relationCollection: z.string().optional(),
  relationField: z.string().optional(),
  componentId: z.string().optional(),
  componentType: z.enum(['new', 'existing']).optional(),
  componentCategory: z.string().optional(),
  icon: z.string().optional(),
  allowedComponents: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
}).partial();

type FieldFormValues = z.infer<typeof fieldSchema>;

interface FieldConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (field: Field) => void;
  field?: Field;
  fieldType: FieldTypeEnum;
  onAddAnother?: () => void;
  collectionName?: string;
}

export default function FieldConfigDialog({
  open,
  onClose,
  onSave,
  field,
  fieldType,
  onAddAnother,
  collectionName = "New Collection"
}: FieldConfigDialogProps) {
  const [textType, setTextType] = useState<'short' | 'long'>('short');

  // Form initialization with react-hook-form
  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: field?.name || '',
      apiId: field?.apiId || '',
      type: field?.type || fieldType,
      required: field?.required || false,
      unique: field?.unique || false,
      description: field?.description || '',
      defaultValue: field?.defaultValue || '',
      // Common properties
      dependOn: field?.dependOn || '',
      uniqueId: field?.uniqueId || '',
      displayName: field?.displayName || '',
      isVisible: field?.isVisible !== undefined ? field.isVisible : true,
      getApiUrl: field?.getApiUrl || '',
      // Field configuration
      attributes: field?.attributes || {},
      validations: field?.validations || {},
      // Conditional fields
      enumValues: field?.enumValues || [],
      relationCollection: field?.relationCollection || '',
      relationField: field?.relationField || '',
      componentId: field?.componentId || '',
      componentType: field?.componentType || 'new',
      componentCategory: field?.componentCategory || '',
      icon: field?.icon || '',
      allowedComponents: field?.allowedComponents || [],
      min: field?.min || undefined,
      max: field?.max || undefined,
    },
  });

  const onSubmit = (data: FieldFormValues) => {
    const fieldData: Field = {
      id: field?.id,
      name: data.name,
      apiId: data.apiId,
      type: data.type as FieldTypeEnum,
      required: data.required,
      unique: data.unique,
      description: data.description,
      defaultValue: data.defaultValue,
      // Common properties
      dependOn: data.dependOn,
      uniqueId: data.uniqueId,
      displayName: data.displayName,
      isVisible: data.isVisible,
      getApiUrl: data.getApiUrl,
      // Field configuration
      attributes: data.attributes,
      validations: data.validations,
    };

    // Add type-specific properties
    if (data.type === FieldTypeEnum.ENUMERATION && data.enumValues) {
      fieldData.enumValues = data.enumValues;
    }

    if (data.type === FieldTypeEnum.RELATION) {
      fieldData.relationCollection = data.relationCollection;
      fieldData.relationField = data.relationField;
    }

    if (data.type === FieldTypeEnum.COMPONENT) {
      fieldData.componentId = data.componentId;
      fieldData.componentType = data.componentType;
      fieldData.componentCategory = data.componentCategory;
      fieldData.icon = data.icon;
    }

    if (data.type === FieldTypeEnum.DYNAMIC_ZONE) {
      fieldData.allowedComponents = data.allowedComponents;
      fieldData.min = data.min;
      fieldData.max = data.max;
    }

    // Set field-specific attributes based on field type
    if (!fieldData.attributes) {
      fieldData.attributes = {};
    }

    if (!fieldData.validations) {
      fieldData.validations = {};
    }

    // Set default attributes based on field type
    switch (data.type) {
      case FieldTypeEnum.TEXT:
        // Text field default attributes
        fieldData.attributes.placeholder = fieldData.attributes.placeholder || 'Enter text...';
        fieldData.attributes.keyfilter = fieldData.attributes.keyfilter || '';
        fieldData.attributes.helpText = fieldData.attributes.helpText || '';
        fieldData.attributes.floatLabel = fieldData.attributes.floatLabel !== undefined ? fieldData.attributes.floatLabel : true;
        fieldData.attributes.disabled = fieldData.attributes.disabled || false;
        fieldData.attributes.icon = fieldData.attributes.icon || '';
        fieldData.attributes.tooltip = fieldData.attributes.tooltip || '';
        fieldData.attributes.tooltipPosition = fieldData.attributes.tooltipPosition || 'top';
        fieldData.attributes.tooltipEvent = fieldData.attributes.tooltipEvent || 'hover';
        fieldData.attributes.autoClear = fieldData.attributes.autoClear || false;
        fieldData.attributes.variant = fieldData.attributes.variant || 'outlined';

        // Set tooltip options if not already set
        fieldData.attributes.tooltipOptions = fieldData.attributes.tooltipOptions || {
          position: fieldData.attributes.tooltipPosition || 'top',
          event: fieldData.attributes.tooltipEvent || 'hover'
        };

        // Text field validations
        fieldData.validations.minLength = fieldData.validations.minLength || undefined;
        fieldData.validations.maxLength = fieldData.validations.maxLength || undefined;
        fieldData.validations.regex = fieldData.validations.regex || '';
        fieldData.validations.apiUrl = fieldData.validations.apiUrl || '';
        break;

      case FieldTypeEnum.INPUT_MASK:
        // InputMask field default attributes
        fieldData.attributes.placeholder = fieldData.attributes.placeholder || 'Enter text...';
        fieldData.attributes.mask = fieldData.attributes.mask || '999-999-9999';
        fieldData.attributes.slotChar = fieldData.attributes.slotChar || '_';
        fieldData.attributes.helpText = fieldData.attributes.helpText || '';
        fieldData.attributes.floatLabel = fieldData.attributes.floatLabel !== undefined ? fieldData.attributes.floatLabel : true;
        fieldData.attributes.disabled = fieldData.attributes.disabled || false;
        fieldData.attributes.icon = fieldData.attributes.icon || '';
        fieldData.attributes.autoClear = fieldData.attributes.autoClear || false;
        fieldData.attributes.variant = fieldData.attributes.variant || 'outlined';
        fieldData.attributes.invalid = fieldData.attributes.invalid || false;

        // InputMask field validations
        fieldData.validations.required = fieldData.validations.required || false;
        fieldData.validations.mask = fieldData.validations.mask || fieldData.attributes.mask;
        fieldData.validations.regex = fieldData.validations.regex || '';
        fieldData.validations.unmask = fieldData.validations.unmask !== undefined ? fieldData.validations.unmask : false;
        break;

      case FieldTypeEnum.RICH_TEXT_BLOCKS:
      case FieldTypeEnum.RICH_TEXT_MARKDOWN:
        // Rich text field default attributes
        fieldData.attributes.rows = fieldData.attributes.rows || 10;
        fieldData.attributes.cols = fieldData.attributes.cols || 80;
        fieldData.attributes.autoResize = fieldData.attributes.autoResize !== undefined ? fieldData.attributes.autoResize : true;
        fieldData.attributes.placeholder = fieldData.attributes.placeholder || 'Enter rich text...';
        break;

      case FieldTypeEnum.NUMBER:
        // Number field default attributes
        fieldData.attributes.placeholder = fieldData.attributes.placeholder || 'Enter number...';
        fieldData.attributes.helpText = fieldData.attributes.helpText || '';
        fieldData.attributes.mode = fieldData.attributes.mode || 'decimal';
        fieldData.attributes.locale = fieldData.attributes.locale || 'en-US';
        fieldData.attributes.suffix = fieldData.attributes.suffix || '';
        fieldData.attributes.prefix = fieldData.attributes.prefix || '';
        fieldData.attributes.showButtons = fieldData.attributes.showButtons || false;
        fieldData.attributes.currency = fieldData.attributes.currency || 'USD';
        fieldData.attributes.step = fieldData.attributes.step || 1;
        fieldData.attributes.min = fieldData.attributes.min || undefined;
        fieldData.attributes.max = fieldData.attributes.max || undefined;
        fieldData.attributes.minFractionDigits = fieldData.attributes.minFractionDigits || 0;
        fieldData.attributes.maxFractionDigits = fieldData.attributes.maxFractionDigits || 2;
        fieldData.attributes.incrementButtonIcon = fieldData.attributes.incrementButtonIcon || 'plus';
        fieldData.attributes.decrementButtonIcon = fieldData.attributes.decrementButtonIcon || 'minus';
        fieldData.attributes.decrementButtonClassName = fieldData.attributes.decrementButtonClassName || '';
        fieldData.attributes.incrementButtonClassName = fieldData.attributes.incrementButtonClassName || '';
        fieldData.attributes.buttonLayout = fieldData.attributes.buttonLayout || 'stacked';
        fieldData.attributes.autoClear = fieldData.attributes.autoClear || false;
        fieldData.attributes.icon = fieldData.attributes.icon || '';
        fieldData.attributes.floatLabel = fieldData.attributes.floatLabel !== undefined ? fieldData.attributes.floatLabel : true;
        fieldData.attributes.variant = fieldData.attributes.variant || 'outlined';
        fieldData.attributes.invalid = fieldData.attributes.invalid || false;
        fieldData.attributes.disabled = fieldData.attributes.disabled || false;
        fieldData.attributes.useGrouping = fieldData.attributes.useGrouping !== undefined ? fieldData.attributes.useGrouping : true;

        // Number field validations
        fieldData.validations.required = fieldData.validations.required || false;
        fieldData.validations.minValue = fieldData.validations.minValue || undefined;
        fieldData.validations.maxValue = fieldData.validations.maxValue || undefined;
        fieldData.validations.minFractionDigits = fieldData.validations.minFractionDigits || undefined;
        fieldData.validations.maxFractionDigits = fieldData.validations.maxFractionDigits || undefined;
        break;

      case FieldTypeEnum.DATE:
        // Date field default attributes
        // Basic attributes
        fieldData.attributes.dateFormat = fieldData.attributes.dateFormat || 'mm/dd/yy';
        fieldData.attributes.locale = fieldData.attributes.locale || 'en-US';
        fieldData.attributes.showIcon = fieldData.attributes.showIcon !== undefined ? fieldData.attributes.showIcon : true;
        fieldData.attributes.minDate = fieldData.attributes.minDate || '';
        fieldData.attributes.maxDate = fieldData.attributes.maxDate || '';

        // Selection and view attributes
        fieldData.attributes.readOnlyInput = fieldData.attributes.readOnlyInput || false;
        fieldData.attributes.selectionMode = fieldData.attributes.selectionMode || 'single';
        fieldData.attributes.hideOnRangeSelection = fieldData.attributes.hideOnRangeSelection || false;
        fieldData.attributes.showButtonBar = fieldData.attributes.showButtonBar !== undefined ? fieldData.attributes.showButtonBar : true;
        fieldData.attributes.view = fieldData.attributes.view || 'month';
        fieldData.attributes.numberOfMonths = fieldData.attributes.numberOfMonths || 1;

        // Time-related attributes
        fieldData.attributes.showTime = fieldData.attributes.showTime || false;
        fieldData.attributes.hourFormat = fieldData.attributes.hourFormat || '24';
        fieldData.attributes.timeOnly = fieldData.attributes.timeOnly || false;

        // Display attributes
        fieldData.attributes.variant = fieldData.attributes.variant || 'outlined';
        fieldData.attributes.icon = fieldData.attributes.icon || '';
        fieldData.attributes.floatLabel = fieldData.attributes.floatLabel !== undefined ? fieldData.attributes.floatLabel : true;
        fieldData.attributes.invalid = fieldData.attributes.invalid || false;
        fieldData.attributes.disabled = fieldData.attributes.disabled || false;
        fieldData.attributes.inline = fieldData.attributes.inline || false;
        fieldData.attributes.showWeek = fieldData.attributes.showWeek || false;

        // Common properties
        fieldData.dependOn = fieldData.dependOn || '';
        fieldData.uniqueId = fieldData.uniqueId || '';
        fieldData.displayName = fieldData.displayName || fieldData.name;
        fieldData.isVisible = fieldData.isVisible !== undefined ? fieldData.isVisible : true;
        break;

      case FieldTypeEnum.BOOLEAN:
        // Boolean field default attributes
        // Default value is handled separately
        break;

      case FieldTypeEnum.JSON:
        // JSON field default attributes
        fieldData.attributes.rows = fieldData.attributes.rows || 10;
        fieldData.attributes.autoResize = fieldData.attributes.autoResize !== undefined ? fieldData.attributes.autoResize : true;
        break;

      case FieldTypeEnum.EMAIL:
        // Email field default attributes
        fieldData.attributes.placeholder = fieldData.attributes.placeholder || 'Enter email...';
        fieldData.attributes.keyfilter = fieldData.attributes.keyfilter || 'email';

        // Email field validations
        // Email validation is handled automatically
        break;

      case FieldTypeEnum.PASSWORD:
        // Password field default attributes
        // Basic attributes
        fieldData.attributes.promptLabel = fieldData.attributes.promptLabel || 'Enter a password';
        fieldData.attributes.icon = fieldData.attributes.icon || '';
        fieldData.attributes.variant = fieldData.attributes.variant || 'outlined';

        // Password strength labels
        fieldData.attributes.weakLabel = fieldData.attributes.weakLabel || 'Weak';
        fieldData.attributes.mediumLabel = fieldData.attributes.mediumLabel || 'Medium';
        fieldData.attributes.strongLabel = fieldData.attributes.strongLabel || 'Strong';

        // Toggle options
        fieldData.attributes.feedback = fieldData.attributes.feedback !== undefined ? fieldData.attributes.feedback : true;
        fieldData.attributes.toggleMask = fieldData.attributes.toggleMask !== undefined ? fieldData.attributes.toggleMask : true;
        fieldData.attributes.floatLabel = fieldData.attributes.floatLabel !== undefined ? fieldData.attributes.floatLabel : true;
        fieldData.attributes.invalid = fieldData.attributes.invalid || false;
        fieldData.attributes.disabled = fieldData.attributes.disabled || false;

        // Common properties
        fieldData.dependOn = fieldData.dependOn || '';
        fieldData.uniqueId = fieldData.uniqueId || '';
        fieldData.displayName = fieldData.displayName || fieldData.name;
        fieldData.isVisible = fieldData.isVisible !== undefined ? fieldData.isVisible : true;

        // Validations
        fieldData.validations.required = fieldData.validations.required || false;
        fieldData.validations.minLength = fieldData.validations.minLength || undefined;
        fieldData.validations.maxLength = fieldData.validations.maxLength || undefined;
        fieldData.validations.regex = fieldData.validations.regex || '';
        break;

      case FieldTypeEnum.ENUMERATION:
        // Enumeration field default attributes
        fieldData.attributes.dropdown = fieldData.attributes.dropdown !== undefined ? fieldData.attributes.dropdown : true;
        fieldData.attributes.multiple = fieldData.attributes.multiple || false;
        fieldData.attributes.filter = fieldData.attributes.filter !== undefined ? fieldData.attributes.filter : true;
        fieldData.attributes.showClear = fieldData.attributes.showClear !== undefined ? fieldData.attributes.showClear : true;
        break;

      case FieldTypeEnum.MEDIA:
        // Media field default attributes
        fieldData.attributes.mode = fieldData.attributes.mode || 'basic';
        fieldData.attributes.accept = fieldData.attributes.accept || 'image/*';
        fieldData.attributes.maxFileSize = fieldData.attributes.maxFileSize || 10000000; // 10MB
        fieldData.attributes.auto = fieldData.attributes.auto !== undefined ? fieldData.attributes.auto : true;
        fieldData.attributes.chooseLabel = fieldData.attributes.chooseLabel || 'Choose';
        break;

      case FieldTypeEnum.RELATION:
        // Relation field default attributes
        fieldData.attributes.dropdown = fieldData.attributes.dropdown !== undefined ? fieldData.attributes.dropdown : true;
        fieldData.attributes.filter = fieldData.attributes.filter !== undefined ? fieldData.attributes.filter : true;
        break;

      case FieldTypeEnum.AUTOCOMPLETE:
        // AutoComplete field default attributes
        // Basic attributes
        fieldData.attributes.placeholder = fieldData.attributes.placeholder || 'Start typing...';
        fieldData.attributes.icon = fieldData.attributes.icon || '';
        fieldData.attributes.variant = fieldData.attributes.variant || 'outlined';

        // Toggle options
        fieldData.attributes.dropdown = fieldData.attributes.dropdown !== undefined ? fieldData.attributes.dropdown : true;
        fieldData.attributes.object = fieldData.attributes.object || false;
        fieldData.attributes.group = fieldData.attributes.group || false;
        fieldData.attributes.forceSelection = fieldData.attributes.forceSelection || false;
        fieldData.attributes.multiple = fieldData.attributes.multiple || false;
        fieldData.attributes.floatLabel = fieldData.attributes.floatLabel !== undefined ? fieldData.attributes.floatLabel : true;
        fieldData.attributes.invalid = fieldData.attributes.invalid || false;
        fieldData.attributes.disabled = fieldData.attributes.disabled || false;

        // Common properties
        fieldData.dependOn = fieldData.dependOn || '';
        fieldData.uniqueId = fieldData.uniqueId || '';
        fieldData.displayName = fieldData.displayName || fieldData.name;
        fieldData.isVisible = fieldData.isVisible !== undefined ? fieldData.isVisible : true;
        break;

      case FieldTypeEnum.CASCADE_SELECT:
        // CascadeSelect field default attributes
        // Basic attributes
        fieldData.attributes.placeholder = fieldData.attributes.placeholder || 'Select a value...';
        fieldData.attributes.variant = fieldData.attributes.variant || 'outlined';

        // Option configuration
        fieldData.attributes.optionLabel = fieldData.attributes.optionLabel || 'label';
        fieldData.attributes.optionValue = fieldData.attributes.optionValue || 'value';
        fieldData.attributes.optionGroupLabel = fieldData.attributes.optionGroupLabel || 'label';
        fieldData.attributes.optionGroupChildren = fieldData.attributes.optionGroupChildren || 'items';
        fieldData.attributes.options = fieldData.attributes.options || [];

        // Toggle options
        fieldData.attributes.floatLabel = fieldData.attributes.floatLabel !== undefined ? fieldData.attributes.floatLabel : true;
        fieldData.attributes.invalid = fieldData.attributes.invalid || false;
        fieldData.attributes.disabled = fieldData.attributes.disabled || false;

        // Common properties
        fieldData.dependOn = fieldData.dependOn || '';
        fieldData.uniqueId = fieldData.uniqueId || '';
        fieldData.displayName = fieldData.displayName || fieldData.name;
        fieldData.isVisible = fieldData.isVisible !== undefined ? fieldData.isVisible : true;
        break;

      case FieldTypeEnum.DROPDOWN:
        // Dropdown field default attributes
        // Basic attributes
        fieldData.attributes.placeholder = fieldData.attributes.placeholder || 'Select an option...';
        fieldData.attributes.variant = fieldData.attributes.variant || 'outlined';
        fieldData.attributes.options = fieldData.attributes.options || [];

        // Option configuration
        fieldData.attributes.optionLabel = fieldData.attributes.optionLabel || 'text';
        fieldData.attributes.optionValue = fieldData.attributes.optionValue || 'value';
        fieldData.attributes.optionGroupLabel = fieldData.attributes.optionGroupLabel || 'label';
        fieldData.attributes.optionGroupChildren = fieldData.attributes.optionGroupChildren || 'items';

        // Toggle options
        fieldData.attributes.checkmark = fieldData.attributes.checkmark !== undefined ? fieldData.attributes.checkmark : true;
        fieldData.attributes.highlightOnSelect = fieldData.attributes.highlightOnSelect !== undefined ? fieldData.attributes.highlightOnSelect : true;
        fieldData.attributes.editable = fieldData.attributes.editable || false;
        fieldData.attributes.filter = fieldData.attributes.filter !== undefined ? fieldData.attributes.filter : true;
        fieldData.attributes.showClear = fieldData.attributes.showClear || false;
        fieldData.attributes.loading = fieldData.attributes.loading || false;
        fieldData.attributes.floatLabel = fieldData.attributes.floatLabel !== undefined ? fieldData.attributes.floatLabel : true;
        fieldData.attributes.invalid = fieldData.attributes.invalid || false;
        fieldData.attributes.disabled = fieldData.attributes.disabled || false;

        // Templates
        fieldData.attributes.optionGroupTemplate = fieldData.attributes.optionGroupTemplate || '';
        fieldData.attributes.valueTemplate = fieldData.attributes.valueTemplate || '';
        fieldData.attributes.itemTemplate = fieldData.attributes.itemTemplate || '';
        fieldData.attributes.panelFooterTemplate = fieldData.attributes.panelFooterTemplate || '';

        // Common properties
        fieldData.dependOn = fieldData.dependOn || '';
        fieldData.uniqueId = fieldData.uniqueId || '';
        fieldData.displayName = fieldData.displayName || fieldData.name;
        fieldData.isVisible = fieldData.isVisible !== undefined ? fieldData.isVisible : true;
        fieldData.getApiUrl = fieldData.getApiUrl || '';
        break;

      case FieldTypeEnum.INPUT_TEXTAREA:
        // InputTextArea field default attributes
        // Basic attributes
        fieldData.attributes.placeholder = fieldData.attributes.placeholder || 'Enter text...';
        fieldData.attributes.rows = fieldData.attributes.rows || 5;
        fieldData.attributes.cols = fieldData.attributes.cols || undefined;
        fieldData.attributes.autoResize = fieldData.attributes.autoResize !== undefined ? fieldData.attributes.autoResize : true;
        fieldData.attributes.keyfilter = fieldData.attributes.keyfilter || '';
        fieldData.attributes.floatLabel = fieldData.attributes.floatLabel !== undefined ? fieldData.attributes.floatLabel : true;
        fieldData.attributes.variant = fieldData.attributes.variant || 'outlined';
        fieldData.attributes.disabled = fieldData.attributes.disabled || false;
        fieldData.attributes.invalid = fieldData.attributes.invalid || false;
        fieldData.attributes.helpText = fieldData.attributes.helpText || '';

        // Validations
        fieldData.validations.required = fieldData.validations.required || false;
        fieldData.validations.minLength = fieldData.validations.minLength || undefined;
        fieldData.validations.maxLength = fieldData.validations.maxLength || undefined;

        // Common properties
        fieldData.dependOn = fieldData.dependOn || '';
        fieldData.uniqueId = fieldData.uniqueId || '';
        fieldData.displayName = fieldData.displayName || fieldData.name;
        fieldData.isVisible = fieldData.isVisible !== undefined ? fieldData.isVisible : true;
        break;

      case FieldTypeEnum.UID:
        // UID field default attributes
        fieldData.attributes.placeholder = fieldData.attributes.placeholder || 'Auto-generated UID';
        fieldData.attributes.disabled = fieldData.attributes.disabled !== undefined ? fieldData.attributes.disabled : true;
        break;

      case FieldTypeEnum.COMPONENT:
        // Component field default attributes
        // No specific default attributes for component
        break;

      case FieldTypeEnum.DYNAMIC_ZONE:
        // Dynamic zone field default attributes
        // No specific default attributes for dynamic zone
        break;
    }

    onSave(fieldData);
    onClose();
  };

  // Handle name change to auto-generate API ID
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);

    // Only auto-generate API ID if it hasn't been manually changed or is empty
    if (!field?.apiId) {
      const apiId = name.toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      form.setValue('apiId', apiId);
    }
  };

  // Derive the field type label for display
  const getFieldTypeLabel = () => {
    switch (fieldType) {
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
        return 'Field';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-0" hideCloseButton>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="bg-green-100 text-green-700 w-8 h-8 flex items-center justify-center rounded mr-2">
              Aa
            </div>
            <span>{collectionName}</span>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-1">Add new {getFieldTypeLabel()} field</h2>
          <p className="text-muted-foreground mb-6">Small or long text like title or description</p>

          <Tabs defaultValue="basic" className="w-full">
            <div className="flex justify-end mb-6">
              <TabsList className="border-b-0">
                <TabsTrigger
                  value="basic"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600"
                >
                  BASIC SETTINGS
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600"
                >
                  ADVANCED SETTINGS
                </TabsTrigger>
              </TabsList>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="basic" className="space-y-6">
                <div className="w-1/2">
                  <Label htmlFor="name" className="block mb-2">Name</Label>
                  <Input
                    id="name"
                    placeholder="Field name"
                    {...form.register('name')}
                    onChange={handleNameChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    No space is allowed for the name of the attribute
                  </p>
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                {fieldType === FieldTypeEnum.TEXT && (
                  <div>
                    <Label className="block mb-2">Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`border rounded-md p-4 flex items-start space-x-3 cursor-pointer ${textType === 'short' ? 'bg-indigo-50 border-indigo-600' : ''}`}
                        onClick={() => setTextType('short')}
                      >
                        <div className="mt-1">
                          <div className="h-5 w-5 rounded-full border border-indigo-600 flex items-center justify-center">
                            {textType === 'short' && (
                              <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-indigo-600">Short text</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Best for titles, names, links (URL). It also enables exact search on the field.
                          </p>
                        </div>
                      </div>
                      <div
                        className={`border rounded-md p-4 flex items-start space-x-3 cursor-pointer ${textType === 'long' ? 'bg-indigo-50 border-indigo-600' : ''}`}
                        onClick={() => setTextType('long')}
                      >
                        <div className="mt-1">
                          <div className="h-5 w-5 rounded-full border border-indigo-600 flex items-center justify-center">
                            {textType === 'long' && (
                              <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Long text</div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Best for descriptions, biography. Exact search is disabled.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.ENUMERATION && (
                  <div>
                    <Label className="block mb-2">Values (one per line)</Label>
                    <Textarea
                      placeholder="option1&#10;option2&#10;option3"
                      className="min-h-[100px]"
                      onChange={(e) => {
                        const values = e.target.value.split('\n').filter(v => v.trim() !== '');
                        form.setValue('enumValues', values);
                      }}
                      defaultValue={field?.enumValues?.join('\n') || ''}
                    />
                  </div>
                )}

                {fieldType === FieldTypeEnum.RELATION && (
                  <div className="space-y-4">
                    <div>
                      <Label className="block mb-2">Related Collection</Label>
                      <Input
                        placeholder="e.g., users"
                        {...form.register('relationCollection')}
                      />
                    </div>
                    <div>
                      <Label className="block mb-2">Relation Field</Label>
                      <Input
                        placeholder="e.g., author"
                        {...form.register('relationField')}
                      />
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.COMPONENT && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Add new component (1/2)</h3>
                    <p className="text-sm text-muted-foreground mb-6">Group of fields that you can repeat or reuse</p>

                    <div className="mb-6">
                      <Label className="block mb-2">Type</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div
                          className={cn(
                            "p-4 border rounded-md cursor-pointer",
                            "bg-primary/5 border-primary"
                          )}
                          onClick={() => {
                            form.setValue('componentType', 'new');
                          }}
                        >
                          <div className="flex items-center mb-2">
                            <div className="h-4 w-4 rounded-full border border-primary mr-2 flex items-center justify-center">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                            </div>
                            <span className="font-medium text-primary">Create a new component</span>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            A component is shared across types and components, it will be available and accessible everywhere.
                          </p>
                        </div>

                        <div
                          className={cn(
                            "p-4 border rounded-md cursor-pointer",
                            "hover:bg-gray-50"
                          )}
                          onClick={() => {
                            form.setValue('componentType', 'existing');
                          }}
                        >
                          <div className="flex items-center mb-2">
                            <div className="h-4 w-4 rounded-full border border-gray-300 mr-2"></div>
                            <span className="font-medium">Use an existing component</span>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            Reuse a component already created to keep your data consistent across content-types.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="displayName" className="block mb-2">Display name</Label>
                        <Input
                          id="displayName"
                          placeholder="My Component"
                          {...form.register('displayName')}
                        />
                      </div>

                      <div>
                        <Label htmlFor="componentCategory" className="block mb-2">Select a category or enter a name to create a new one</Label>
                        <div className="relative">
                          <Input
                            id="componentCategory"
                            placeholder="Select or enter a value"
                            {...form.register('componentCategory')}
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <Label htmlFor="icon" className="block mb-2">Icon</Label>
                      <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto">
                        <div className="grid grid-cols-10 gap-2">
                          {/* Icons - these would be dynamically loaded in a real implementation */}
                          {[
                            'skull', 'grid', 'trash', 'download', 'arrow-left', 'arrow-right', 'arrow-up', 'link', 'bell', 'bold',
                            'file', 'briefcase', 'pencil', 'list', 'box', 'car', 'chart-bar', 'clock', 'thumbs-up', 'code',
                            'refresh', 'check', 'globe', 'heart', 'image', 'mail', 'map', 'music', 'phone', 'search',
                            'star', 'user', 'video', 'camera', 'cog', 'home', 'lock', 'unlock', 'eye', 'eye-off',
                            'filter', 'flag', 'folder', 'gift', 'info', 'key', 'layers', 'layout', 'life-buoy', 'map-pin',
                            'maximize', 'minimize', 'mic', 'moon', 'sun', 'paperclip', 'pause', 'play', 'plus', 'minus',
                            'printer', 'radio', 'save', 'scissors', 'share', 'shield', 'shopping-bag', 'shopping-cart', 'shuffle', 'tag'
                          ].map((icon, index) => (
                            <div
                              key={index}
                              className={cn(
                                "h-8 w-8 flex items-center justify-center rounded-md cursor-pointer hover:bg-gray-100",
                                form.getValues('icon') === icon ? 'bg-primary/10 text-primary' : 'text-gray-500'
                              )}
                              onClick={() => form.setValue('icon', icon)}
                            >
                              <div className="h-5 w-5 flex items-center justify-center">
                                <span className="text-lg">{icon.charAt(0).toUpperCase()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                          // This would navigate to the next step in a real implementation
                          console.log('Configure component');
                        }}
                      >
                        Configure the component
                      </Button>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.DYNAMIC_ZONE && (
                  <div className="space-y-4">
                    <div>
                      <Label className="block mb-2">Allowed Components</Label>
                      <Input
                        placeholder="Select components"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        You can select components after saving this field
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="block mb-2">Min Components</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Minimum"
                          onChange={(e) => form.setValue('min', parseInt(e.target.value) || undefined)}
                          defaultValue={field?.min || ''}
                        />
                      </div>
                      <div>
                        <Label className="block mb-2">Max Components</Label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Maximum"
                          onChange={(e) => form.setValue('max', parseInt(e.target.value) || undefined)}
                          defaultValue={field?.max || ''}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="w-1/2">
                    <Label htmlFor="apiId" className="block mb-2">API ID</Label>
                    <Input
                      id="apiId"
                      placeholder="API ID"
                      {...form.register('apiId')}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      API identifier for this field
                    </p>
                    {form.formState.errors.apiId && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.apiId.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="defaultValue" className="block mb-2">Default value</Label>
                    <Input
                      id="defaultValue"
                      placeholder="Default value"
                      {...form.register('defaultValue')}
                    />
                  </div>

                  {fieldType === FieldTypeEnum.TEXT && (
                    <div>
                      <Label htmlFor="regexPattern" className="block mb-2">RegExp pattern</Label>
                      <Input
                        id="regexPattern"
                        placeholder="RegExp pattern"
                        onChange={(e) => {
                          const validations = form.getValues('validations') || {};
                          form.setValue('validations', {
                            ...validations,
                            regex: e.target.value
                          });
                        }}
                        defaultValue={field?.validations?.regex || ''}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        The text of the regular expression
                      </p>
                    </div>
                  )}
                </div>

                {/* Field-specific configuration */}
                {(fieldType === FieldTypeEnum.TEXT || fieldType === FieldTypeEnum.INPUT_MASK) && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">{fieldType === FieldTypeEnum.INPUT_MASK ? 'Input Mask Field Configuration' : 'Text Field Configuration'}</h3>

                    {/* Basic Text Attributes */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="placeholder" className="block mb-2">Placeholder</Label>
                        <Input
                          id="placeholder"
                          placeholder="Enter placeholder text"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              placeholder: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.placeholder || ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="helpText" className="block mb-2">Help Text</Label>
                        <Input
                          id="helpText"
                          placeholder="Enter help text"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              helpText: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.helpText || ''}
                        />
                      </div>
                    </div>

                    {/* Input Mask specific attributes */}
                    {fieldType === FieldTypeEnum.INPUT_MASK && (
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <Label htmlFor="mask" className="block mb-2">Mask Pattern</Label>
                          <Input
                            id="mask"
                            placeholder="e.g., 999-999-9999"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                mask: e.target.value
                              });

                              // Also update the validation mask
                              const validations = form.getValues('validations') || {};
                              form.setValue('validations', {
                                ...validations,
                                mask: e.target.value
                              });
                            }}
                            defaultValue={field?.attributes?.mask || ''}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            9: numeric, a: alphabetic, *: alphanumeric
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="slotChar" className="block mb-2">Slot Character</Label>
                          <Input
                            id="slotChar"
                            placeholder="e.g., _"
                            maxLength={1}
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                slotChar: e.target.value.charAt(0)
                              });
                            }}
                            defaultValue={field?.attributes?.slotChar || '_'}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Character to display for empty slots
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Key Filter */}
                    <div className="mb-6">
                      <Label htmlFor="keyfilter" className="block mb-2">Key Filter</Label>
                      <select
                        id="keyfilter"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        onChange={(e) => {
                          const attributes = form.getValues('attributes') || {};
                          form.setValue('attributes', {
                            ...attributes,
                            keyfilter: e.target.value
                          });
                        }}
                        defaultValue={field?.attributes?.keyfilter || ''}
                      >
                        <option value="">None</option>
                        <option value="int">Integer (positive/negative)</option>
                        <option value="pint">Positive Integer</option>
                        <option value="num">Number (decimal/integer)</option>
                        <option value="pnum">Positive Number</option>
                        <option value="money">Money</option>
                        <option value="hex">Hexadecimal</option>
                        <option value="alpha">Alphabetic</option>
                        <option value="alphanum">Alphanumeric</option>
                        <option value="email">Email</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Restricts the input to specific character sets
                      </p>
                    </div>

                    {/* Display Options */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="variant" className="block mb-2">Variant</Label>
                        <select
                          id="variant"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              variant: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.variant || 'outlined'}
                        >
                          <option value="outlined">Outlined</option>
                          <option value="filled">Filled</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="icon" className="block mb-2">Icon</Label>
                        <Input
                          id="icon"
                          placeholder="Icon name (e.g., search)"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              icon: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.icon || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Icon to display with the input
                        </p>
                      </div>
                    </div>

                    {/* Tooltip Configuration */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="tooltip" className="block mb-2">Tooltip</Label>
                        <Input
                          id="tooltip"
                          placeholder="Tooltip text"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              tooltip: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.tooltip || ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="tooltipPosition" className="block mb-2">Tooltip Position</Label>
                        <select
                          id="tooltipPosition"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            const tooltipOptions = attributes.tooltipOptions || {};
                            form.setValue('attributes', {
                              ...attributes,
                              tooltipPosition: e.target.value as 'top' | 'bottom' | 'left' | 'right',
                              tooltipOptions: {
                                ...tooltipOptions,
                                position: e.target.value as 'top' | 'bottom' | 'left' | 'right'
                              }
                            });
                          }}
                          defaultValue={field?.attributes?.tooltipPosition || 'top'}
                        >
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>

                    {/* Tooltip Event */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="tooltipEvent" className="block mb-2">Tooltip Event</Label>
                        <select
                          id="tooltipEvent"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            const tooltipOptions = attributes.tooltipOptions || {};
                            form.setValue('attributes', {
                              ...attributes,
                              tooltipEvent: e.target.value as 'hover' | 'focus',
                              tooltipOptions: {
                                ...tooltipOptions,
                                event: e.target.value as 'hover' | 'focus'
                              }
                            });
                          }}
                          defaultValue={field?.attributes?.tooltipEvent || 'hover'}
                        >
                          <option value="hover">Hover</option>
                          <option value="focus">Focus</option>
                        </select>
                      </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="floatLabel" className="font-normal">Float Label</Label>
                          <p className="text-xs text-muted-foreground">
                            Label floats when the field is focused
                          </p>
                        </div>
                        <Switch
                          id="floatLabel"
                          checked={field?.attributes?.floatLabel !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              floatLabel: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoClear" className="font-normal">Auto Clear</Label>
                          <p className="text-xs text-muted-foreground">
                            Clear input after submission
                          </p>
                        </div>
                        <Switch
                          id="autoClear"
                          checked={field?.attributes?.autoClear === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              autoClear: checked
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.NUMBER && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Number Field Configuration</h3>

                    {/* Basic Number Attributes */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="mode" className="block mb-2">Mode</Label>
                        <select
                          id="mode"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              mode: e.target.value as 'decimal' | 'currency'
                            });
                          }}
                          defaultValue={field?.attributes?.mode || 'decimal'}
                        >
                          <option value="decimal">Decimal</option>
                          <option value="currency">Currency</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="placeholder" className="block mb-2">Placeholder</Label>
                        <Input
                          id="placeholder"
                          placeholder="Enter placeholder text"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              placeholder: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.placeholder || ''}
                        />
                      </div>
                    </div>

                    {/* Help Text */}
                    <div className="mb-6">
                      <Label htmlFor="helpText" className="block mb-2">Help Text</Label>
                      <Input
                        id="helpText"
                        placeholder="Enter help text"
                        onChange={(e) => {
                          const attributes = form.getValues('attributes') || {};
                          form.setValue('attributes', {
                            ...attributes,
                            helpText: e.target.value
                          });
                        }}
                        defaultValue={field?.attributes?.helpText || ''}
                      />
                    </div>

                    {/* Min/Max Values */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="min" className="block mb-2">Minimum Value</Label>
                        <Input
                          id="min"
                          type="number"
                          placeholder="Minimum value"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              min: e.target.value ? parseFloat(e.target.value) : undefined
                            });
                          }}
                          defaultValue={field?.attributes?.min || ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max" className="block mb-2">Maximum Value</Label>
                        <Input
                          id="max"
                          type="number"
                          placeholder="Maximum value"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              max: e.target.value ? parseFloat(e.target.value) : undefined
                            });
                          }}
                          defaultValue={field?.attributes?.max || ''}
                        />
                      </div>
                    </div>

                    {/* Step and Fraction Digits */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="step" className="block mb-2">Step</Label>
                        <Input
                          id="step"
                          type="number"
                          placeholder="Step value"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              step: e.target.value ? parseFloat(e.target.value) : undefined
                            });
                          }}
                          defaultValue={field?.attributes?.step || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Amount to increment/decrement
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="fractionDigits" className="block mb-2">Fraction Digits</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            id="minFractionDigits"
                            type="number"
                            min="0"
                            placeholder="Min"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                minFractionDigits: e.target.value ? parseInt(e.target.value) : undefined
                              });
                            }}
                            defaultValue={field?.attributes?.minFractionDigits || ''}
                          />
                          <Input
                            id="maxFractionDigits"
                            type="number"
                            min="0"
                            placeholder="Max"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                maxFractionDigits: e.target.value ? parseInt(e.target.value) : undefined
                              });
                            }}
                            defaultValue={field?.attributes?.maxFractionDigits || ''}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Min and max decimal places
                        </p>
                      </div>
                    </div>

                    {/* Currency and Locale */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      {form.watch('attributes.mode') === 'currency' && (
                        <div>
                          <Label htmlFor="currency" className="block mb-2">Currency</Label>
                          <Input
                            id="currency"
                            placeholder="USD"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                currency: e.target.value
                              });
                            }}
                            defaultValue={field?.attributes?.currency || 'USD'}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Currency code (e.g., USD, EUR)
                          </p>
                        </div>
                      )}
                      <div>
                        <Label htmlFor="locale" className="block mb-2">Locale</Label>
                        <Input
                          id="locale"
                          placeholder="en-US"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              locale: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.locale || 'en-US'}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Locale for number formatting
                        </p>
                      </div>
                    </div>

                    {/* Prefix and Suffix */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="prefix" className="block mb-2">Prefix</Label>
                        <Input
                          id="prefix"
                          placeholder="$"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              prefix: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.prefix || ''}
                        />
                      </div>
                      <div>
                        <Label htmlFor="suffix" className="block mb-2">Suffix</Label>
                        <Input
                          id="suffix"
                          placeholder="%"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              suffix: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.suffix || ''}
                        />
                      </div>
                    </div>

                    {/* Button Configuration */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Label htmlFor="showButtons" className="font-normal">Show Buttons</Label>
                          <p className="text-xs text-muted-foreground">
                            Show increment/decrement buttons
                          </p>
                        </div>
                        <Switch
                          id="showButtons"
                          checked={field?.attributes?.showButtons === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              showButtons: checked
                            });
                          }}
                        />
                      </div>

                      {form.watch('attributes.showButtons') === true && (
                        <>
                          <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                              <Label htmlFor="buttonLayout" className="block mb-2">Button Layout</Label>
                              <select
                                id="buttonLayout"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                onChange={(e) => {
                                  const attributes = form.getValues('attributes') || {};
                                  form.setValue('attributes', {
                                    ...attributes,
                                    buttonLayout: e.target.value as 'stacked' | 'horizontal' | 'vertical'
                                  });
                                }}
                                defaultValue={field?.attributes?.buttonLayout || 'stacked'}
                              >
                                <option value="stacked">Stacked</option>
                                <option value="horizontal">Horizontal</option>
                                <option value="vertical">Vertical</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6 mb-4">
                            <div>
                              <Label htmlFor="incrementButtonIcon" className="block mb-2">Increment Button Icon</Label>
                              <Input
                                id="incrementButtonIcon"
                                placeholder="plus"
                                onChange={(e) => {
                                  const attributes = form.getValues('attributes') || {};
                                  form.setValue('attributes', {
                                    ...attributes,
                                    incrementButtonIcon: e.target.value
                                  });
                                }}
                                defaultValue={field?.attributes?.incrementButtonIcon || ''}
                              />
                            </div>
                            <div>
                              <Label htmlFor="decrementButtonIcon" className="block mb-2">Decrement Button Icon</Label>
                              <Input
                                id="decrementButtonIcon"
                                placeholder="minus"
                                onChange={(e) => {
                                  const attributes = form.getValues('attributes') || {};
                                  form.setValue('attributes', {
                                    ...attributes,
                                    decrementButtonIcon: e.target.value
                                  });
                                }}
                                defaultValue={field?.attributes?.decrementButtonIcon || ''}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="incrementButtonClassName" className="block mb-2">Increment Button Class</Label>
                              <Input
                                id="incrementButtonClassName"
                                placeholder="p-button-primary"
                                onChange={(e) => {
                                  const attributes = form.getValues('attributes') || {};
                                  form.setValue('attributes', {
                                    ...attributes,
                                    incrementButtonClassName: e.target.value
                                  });
                                }}
                                defaultValue={field?.attributes?.incrementButtonClassName || ''}
                              />
                            </div>
                            <div>
                              <Label htmlFor="decrementButtonClassName" className="block mb-2">Decrement Button Class</Label>
                              <Input
                                id="decrementButtonClassName"
                                placeholder="p-button-secondary"
                                onChange={(e) => {
                                  const attributes = form.getValues('attributes') || {};
                                  form.setValue('attributes', {
                                    ...attributes,
                                    decrementButtonClassName: e.target.value
                                  });
                                }}
                                defaultValue={field?.attributes?.decrementButtonClassName || ''}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Display Options */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="variant" className="block mb-2">Variant</Label>
                        <select
                          id="variant"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              variant: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.variant || 'outlined'}
                        >
                          <option value="outlined">Outlined</option>
                          <option value="filled">Filled</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="icon" className="block mb-2">Icon</Label>
                        <Input
                          id="icon"
                          placeholder="Icon name (e.g., dollar)"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              icon: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.icon || ''}
                        />
                      </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="useGrouping" className="font-normal">Use Grouping</Label>
                          <p className="text-xs text-muted-foreground">
                            Display number with thousand separators
                          </p>
                        </div>
                        <Switch
                          id="useGrouping"
                          checked={field?.attributes?.useGrouping !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              useGrouping: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="floatLabel" className="font-normal">Float Label</Label>
                          <p className="text-xs text-muted-foreground">
                            Label floats when the field is focused
                          </p>
                        </div>
                        <Switch
                          id="floatLabel"
                          checked={field?.attributes?.floatLabel !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              floatLabel: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoClear" className="font-normal">Auto Clear</Label>
                          <p className="text-xs text-muted-foreground">
                            Clear input after submission
                          </p>
                        </div>
                        <Switch
                          id="autoClear"
                          checked={field?.attributes?.autoClear === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              autoClear: checked
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.PASSWORD && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Password Field Configuration</h3>

                    {/* Password Labels */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="promptLabel" className="block mb-2">Prompt Label</Label>
                        <Input
                          id="promptLabel"
                          placeholder="Enter a password"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              promptLabel: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.promptLabel || 'Enter a password'}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Text displayed as placeholder
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="icon" className="block mb-2">Icon</Label>
                        <Input
                          id="icon"
                          placeholder="Icon name (e.g., lock)"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              icon: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.icon || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Icon to display with the input
                        </p>
                      </div>
                    </div>

                    {/* Password Strength Labels */}
                    <div className="mb-6">
                      <Label className="block mb-2">Password Strength Labels</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="weakLabel" className="block mb-2 text-xs">Weak</Label>
                          <Input
                            id="weakLabel"
                            placeholder="Weak"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                weakLabel: e.target.value
                              });
                            }}
                            defaultValue={field?.attributes?.weakLabel || 'Weak'}
                          />
                        </div>
                        <div>
                          <Label htmlFor="mediumLabel" className="block mb-2 text-xs">Medium</Label>
                          <Input
                            id="mediumLabel"
                            placeholder="Medium"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                mediumLabel: e.target.value
                              });
                            }}
                            defaultValue={field?.attributes?.mediumLabel || 'Medium'}
                          />
                        </div>
                        <div>
                          <Label htmlFor="strongLabel" className="block mb-2 text-xs">Strong</Label>
                          <Input
                            id="strongLabel"
                            placeholder="Strong"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                strongLabel: e.target.value
                              });
                            }}
                            defaultValue={field?.attributes?.strongLabel || 'Strong'}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="variant" className="block mb-2">Variant</Label>
                        <select
                          id="variant"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              variant: e.target.value as 'filled' | 'outlined'
                            });
                          }}
                          defaultValue={field?.attributes?.variant || 'outlined'}
                        >
                          <option value="outlined">Outlined</option>
                          <option value="filled">Filled</option>
                        </select>
                      </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="feedback" className="font-normal">Show Password Strength</Label>
                          <p className="text-xs text-muted-foreground">
                            Display password strength indicator
                          </p>
                        </div>
                        <Switch
                          id="feedback"
                          checked={field?.attributes?.feedback !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              feedback: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="toggleMask" className="font-normal">Toggle Mask</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow showing/hiding password
                          </p>
                        </div>
                        <Switch
                          id="toggleMask"
                          checked={field?.attributes?.toggleMask !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              toggleMask: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="floatLabel" className="font-normal">Float Label</Label>
                          <p className="text-xs text-muted-foreground">
                            Label floats when the field is focused
                          </p>
                        </div>
                        <Switch
                          id="floatLabel"
                          checked={field?.attributes?.floatLabel !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              floatLabel: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="invalid" className="font-normal">Invalid State</Label>
                          <p className="text-xs text-muted-foreground">
                            Mark field as invalid
                          </p>
                        </div>
                        <Switch
                          id="invalid"
                          checked={field?.attributes?.invalid === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              invalid: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="disabled" className="font-normal">Disabled</Label>
                          <p className="text-xs text-muted-foreground">
                            Disable the field
                          </p>
                        </div>
                        <Switch
                          id="disabled"
                          checked={field?.attributes?.disabled === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              disabled: checked
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.BOOLEAN && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Boolean Field Configuration</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="defaultChecked" className="font-normal">Default Checked</Label>
                          <p className="text-xs text-muted-foreground">
                            Whether the boolean field should be checked by default
                          </p>
                        </div>
                        <Switch
                          id="defaultChecked"
                          checked={form.getValues('defaultValue') === true}
                          onCheckedChange={(checked) => form.setValue('defaultValue', checked)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.DATE && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Date Field Configuration</h3>

                    {/* Basic Date Attributes */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="dateFormat" className="block mb-2">Date Format</Label>
                        <Input
                          id="dateFormat"
                          placeholder="mm/dd/yy"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              dateFormat: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.dateFormat || 'mm/dd/yy'}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Format pattern for date (e.g., mm/dd/yy, dd/mm/yy)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="locale" className="block mb-2">Locale</Label>
                        <Input
                          id="locale"
                          placeholder="en-US"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              locale: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.locale || 'en-US'}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Locale code (e.g., en-US, fr-FR)
                        </p>
                      </div>
                    </div>

                    {/* Date Range Settings */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="minDate" className="block mb-2">Minimum Date</Label>
                        <Input
                          id="minDate"
                          type="date"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              minDate: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.minDate || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Earliest selectable date
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="maxDate" className="block mb-2">Maximum Date</Label>
                        <Input
                          id="maxDate"
                          type="date"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              maxDate: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.maxDate || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Latest selectable date
                        </p>
                      </div>
                    </div>

                    {/* Selection Mode */}
                    <div className="mb-6">
                      <Label htmlFor="selectionMode" className="block mb-2">Selection Mode</Label>
                      <select
                        id="selectionMode"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        onChange={(e) => {
                          const attributes = form.getValues('attributes') || {};
                          form.setValue('attributes', {
                            ...attributes,
                            selectionMode: e.target.value as 'single' | 'multiple' | 'range'
                          });
                        }}
                        defaultValue={field?.attributes?.selectionMode || 'single'}
                      >
                        <option value="single">Single</option>
                        <option value="multiple">Multiple</option>
                        <option value="range">Range</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        How dates can be selected
                      </p>
                    </div>

                    {/* View Settings */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="view" className="block mb-2">Calendar View</Label>
                        <select
                          id="view"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              view: e.target.value as 'month' | 'year'
                            });
                          }}
                          defaultValue={field?.attributes?.view || 'month'}
                        >
                          <option value="month">Month</option>
                          <option value="year">Year</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Default calendar view
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="numberOfMonths" className="block mb-2">Number of Months</Label>
                        <Input
                          id="numberOfMonths"
                          type="number"
                          min="1"
                          max="12"
                          placeholder="1"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              numberOfMonths: parseInt(e.target.value) || 1
                            });
                          }}
                          defaultValue={field?.attributes?.numberOfMonths || '1'}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Number of months to display
                        </p>
                      </div>
                    </div>

                    {/* Time Settings */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="showTime" className="font-normal">Show Time</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow time selection
                          </p>
                        </div>
                        <Switch
                          id="showTime"
                          checked={field?.attributes?.showTime === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              showTime: checked
                            });
                          }}
                        />
                      </div>
                      {form.watch('attributes.showTime') === true && (
                        <div>
                          <Label htmlFor="hourFormat" className="block mb-2">Hour Format</Label>
                          <select
                            id="hourFormat"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                hourFormat: e.target.value as '12' | '24'
                              });
                            }}
                            defaultValue={field?.attributes?.hourFormat || '24'}
                          >
                            <option value="12">12 Hour</option>
                            <option value="24">24 Hour</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Display Options */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="variant" className="block mb-2">Variant</Label>
                        <select
                          id="variant"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              variant: e.target.value as 'filled' | 'outlined'
                            });
                          }}
                          defaultValue={field?.attributes?.variant || 'outlined'}
                        >
                          <option value="outlined">Outlined</option>
                          <option value="filled">Filled</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="icon" className="block mb-2">Icon</Label>
                        <Input
                          id="icon"
                          placeholder="Icon name (e.g., calendar)"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              icon: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.icon || ''}
                        />
                      </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="showIcon" className="font-normal">Show Calendar Icon</Label>
                          <p className="text-xs text-muted-foreground">
                            Display a calendar icon in the date field
                          </p>
                        </div>
                        <Switch
                          id="showIcon"
                          checked={field?.attributes?.showIcon !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              showIcon: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="readOnlyInput" className="font-normal">Read-only Input</Label>
                          <p className="text-xs text-muted-foreground">
                            Prevent direct typing in the input field
                          </p>
                        </div>
                        <Switch
                          id="readOnlyInput"
                          checked={field?.attributes?.readOnlyInput === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              readOnlyInput: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="hideOnRangeSelection" className="font-normal">Hide on Range Selection</Label>
                          <p className="text-xs text-muted-foreground">
                            Hide calendar when range is selected
                          </p>
                        </div>
                        <Switch
                          id="hideOnRangeSelection"
                          checked={field?.attributes?.hideOnRangeSelection === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              hideOnRangeSelection: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="showButtonBar" className="font-normal">Show Button Bar</Label>
                          <p className="text-xs text-muted-foreground">
                            Show today/clear buttons
                          </p>
                        </div>
                        <Switch
                          id="showButtonBar"
                          checked={field?.attributes?.showButtonBar !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              showButtonBar: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="timeOnly" className="font-normal">Time Only</Label>
                          <p className="text-xs text-muted-foreground">
                            Show only time picker
                          </p>
                        </div>
                        <Switch
                          id="timeOnly"
                          checked={field?.attributes?.timeOnly === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              timeOnly: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="inline" className="font-normal">Inline Calendar</Label>
                          <p className="text-xs text-muted-foreground">
                            Display calendar inline instead of popup
                          </p>
                        </div>
                        <Switch
                          id="inline"
                          checked={field?.attributes?.inline === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              inline: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="showWeek" className="font-normal">Show Week Numbers</Label>
                          <p className="text-xs text-muted-foreground">
                            Display week numbers in calendar
                          </p>
                        </div>
                        <Switch
                          id="showWeek"
                          checked={field?.attributes?.showWeek === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              showWeek: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="floatLabel" className="font-normal">Float Label</Label>
                          <p className="text-xs text-muted-foreground">
                            Label floats when the field is focused
                          </p>
                        </div>
                        <Switch
                          id="floatLabel"
                          checked={field?.attributes?.floatLabel !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              floatLabel: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="invalid" className="font-normal">Invalid State</Label>
                          <p className="text-xs text-muted-foreground">
                            Mark field as invalid
                          </p>
                        </div>
                        <Switch
                          id="invalid"
                          checked={field?.attributes?.invalid === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              invalid: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="disabled" className="font-normal">Disabled</Label>
                          <p className="text-xs text-muted-foreground">
                            Disable the field
                          </p>
                        </div>
                        <Switch
                          id="disabled"
                          checked={field?.attributes?.disabled === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              disabled: checked
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.CASCADE_SELECT && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Cascade Select Field Configuration</h3>

                    {/* Basic CascadeSelect Attributes */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="placeholder" className="block mb-2">Placeholder</Label>
                        <Input
                          id="placeholder"
                          placeholder="Select a value..."
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              placeholder: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.placeholder || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Text displayed when no value is selected
                        </p>
                      </div>
                    </div>

                    {/* Option Configuration */}
                    <div className="mb-6">
                      <Label htmlFor="optionConfig" className="block mb-2">Option Configuration</Label>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="optionLabel" className="block mb-2 text-xs">Option Label</Label>
                          <Input
                            id="optionLabel"
                            placeholder="label"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                optionLabel: e.target.value
                              });
                            }}
                            defaultValue={field?.attributes?.optionLabel || 'label'}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Property name for the option label
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="optionValue" className="block mb-2 text-xs">Option Value</Label>
                          <Input
                            id="optionValue"
                            placeholder="value"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                optionValue: e.target.value
                              });
                            }}
                            defaultValue={field?.attributes?.optionValue || 'value'}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Property name for the option value
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Group Configuration */}
                    <div className="mb-6">
                      <Label htmlFor="groupConfig" className="block mb-2">Group Configuration</Label>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="optionGroupLabel" className="block mb-2 text-xs">Group Label</Label>
                          <Input
                            id="optionGroupLabel"
                            placeholder="label"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                optionGroupLabel: e.target.value
                              });
                            }}
                            defaultValue={field?.attributes?.optionGroupLabel || 'label'}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Property name for the option group label
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="optionGroupChildren" className="block mb-2 text-xs">Group Children</Label>
                          <Input
                            id="optionGroupChildren"
                            placeholder="items"
                            onChange={(e) => {
                              const attributes = form.getValues('attributes') || {};
                              form.setValue('attributes', {
                                ...attributes,
                                optionGroupChildren: e.target.value
                              });
                            }}
                            defaultValue={field?.attributes?.optionGroupChildren || 'items'}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Property name for the option group children
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Data Structure Example */}
                    <div className="mb-6">
                      <Label htmlFor="dataExample" className="block mb-2">Data Structure Example</Label>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <pre className="text-xs overflow-auto">
{`[
  {
    "label": "Australia",
    "value": "AU",
    "items": [
      {
        "label": "Sydney",
        "value": "SYD"
      },
      {
        "label": "Melbourne",
        "value": "MEL"
      }
    ]
  },
  {
    "label": "United States",
    "value": "US",
    "items": [
      {
        "label": "California",
        "value": "CA",
        "items": [
          {
            "label": "Los Angeles",
            "value": "LA"
          },
          {
            "label": "San Francisco",
            "value": "SF"
          }
        ]
      }
    ]
  }
]`}
                        </pre>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Example of the expected data structure for the cascade select options
                      </p>
                    </div>

                    {/* Display Options */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="variant" className="block mb-2">Variant</Label>
                        <select
                          id="variant"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              variant: e.target.value as 'filled' | 'outlined'
                            });
                          }}
                          defaultValue={field?.attributes?.variant || 'outlined'}
                        >
                          <option value="outlined">Outlined</option>
                          <option value="filled">Filled</option>
                        </select>
                      </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="floatLabel" className="font-normal">Float Label</Label>
                          <p className="text-xs text-muted-foreground">
                            Label floats when the field is focused
                          </p>
                        </div>
                        <Switch
                          id="floatLabel"
                          checked={field?.attributes?.floatLabel !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              floatLabel: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="invalid" className="font-normal">Invalid State</Label>
                          <p className="text-xs text-muted-foreground">
                            Mark field as invalid
                          </p>
                        </div>
                        <Switch
                          id="invalid"
                          checked={field?.attributes?.invalid === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              invalid: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="disabled" className="font-normal">Disabled</Label>
                          <p className="text-xs text-muted-foreground">
                            Disable the field
                          </p>
                        </div>
                        <Switch
                          id="disabled"
                          checked={field?.attributes?.disabled === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              disabled: checked
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.DROPDOWN && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Dropdown Field Configuration</h3>

                    {/* Basic Dropdown Attributes */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="placeholder" className="block mb-2">Placeholder</Label>
                        <Input
                          id="placeholder"
                          placeholder="Select an option..."
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              placeholder: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.placeholder || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Text displayed when no value is selected
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="getApiUrl" className="block mb-2">API URL</Label>
                        <Input
                          id="getApiUrl"
                          placeholder="https://api.example.com/options"
                          onChange={(e) => {
                            form.setValue('getApiUrl', e.target.value);
                          }}
                          defaultValue={field?.getApiUrl || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          URL to fetch options from API
                        </p>
                      </div>
                    </div>

                    {/* Options Configuration */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <Label htmlFor="options" className="block">Options</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const options = form.getValues('attributes.options') || [];
                            form.setValue('attributes.options', [
                              ...options,
                              { text: '', value: '', icon: '', color: '' }
                            ]);
                          }}
                        >
                          Add Option
                        </Button>
                      </div>

                      {/* Options List */}
                      <div className="space-y-4">
                        {!form.getValues('attributes.options') || form.getValues('attributes.options').length === 0 ? (
                          <div className="bg-gray-50 p-6 rounded-md flex flex-col items-center justify-center">
                            <div className="text-gray-400 mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                              </svg>
                            </div>
                            <p className="text-sm text-gray-500">No options added yet</p>
                            <p className="text-xs text-gray-400 mt-1">Click "Add Option" to create your first option</p>
                          </div>
                        ) : (
                          form.getValues('attributes.options').map((option: DropdownOption, index: number) => (
                            <div key={index} className="border rounded-md p-4">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="text-sm font-medium">Option {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const options = form.getValues('attributes.options') || [];
                                    form.setValue(
                                      'attributes.options',
                                      options.filter((_, i) => i !== index)
                                    );
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                  </svg>
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`option-text-${index}`} className="block mb-2 text-xs">Text *</Label>
                                  <Input
                                    id={`option-text-${index}`}
                                    placeholder="Display text"
                                    value={option.text || ''}
                                    onChange={(e) => {
                                      const options = [...(form.getValues('attributes.options') || [])];
                                      options[index] = { ...options[index], text: e.target.value };
                                      form.setValue('attributes.options', options);
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`option-value-${index}`} className="block mb-2 text-xs">Value *</Label>
                                  <Input
                                    id={`option-value-${index}`}
                                    placeholder="Option value"
                                    value={option.value || ''}
                                    onChange={(e) => {
                                      const options = [...(form.getValues('attributes.options') || [])];
                                      options[index] = { ...options[index], value: e.target.value };
                                      form.setValue('attributes.options', options);
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`option-icon-${index}`} className="block mb-2 text-xs">Icon</Label>
                                  <Input
                                    id={`option-icon-${index}`}
                                    placeholder="Icon name"
                                    value={option.icon || ''}
                                    onChange={(e) => {
                                      const options = [...(form.getValues('attributes.options') || [])];
                                      options[index] = { ...options[index], icon: e.target.value };
                                      form.setValue('attributes.options', options);
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`option-color-${index}`} className="block mb-2 text-xs">Color</Label>
                                  <Input
                                    id={`option-color-${index}`}
                                    placeholder="#RRGGBB"
                                    value={option.color || ''}
                                    onChange={(e) => {
                                      const options = [...(form.getValues('attributes.options') || [])];
                                      options[index] = { ...options[index], color: e.target.value };
                                      form.setValue('attributes.options', options);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="variant" className="block mb-2">Variant</Label>
                        <select
                          id="variant"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              variant: e.target.value as 'filled' | 'outlined'
                            });
                          }}
                          defaultValue={field?.attributes?.variant || 'outlined'}
                        >
                          <option value="outlined">Outlined</option>
                          <option value="filled">Filled</option>
                        </select>
                      </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="checkmark" className="font-normal">Show Checkmark</Label>
                          <p className="text-xs text-muted-foreground">
                            Display a checkmark for selected option
                          </p>
                        </div>
                        <Switch
                          id="checkmark"
                          checked={field?.attributes?.checkmark !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              checkmark: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="highlightOnSelect" className="font-normal">Highlight On Select</Label>
                          <p className="text-xs text-muted-foreground">
                            Highlight option when selected
                          </p>
                        </div>
                        <Switch
                          id="highlightOnSelect"
                          checked={field?.attributes?.highlightOnSelect !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              highlightOnSelect: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="editable" className="font-normal">Editable</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow typing in the dropdown
                          </p>
                        </div>
                        <Switch
                          id="editable"
                          checked={field?.attributes?.editable === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              editable: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="filter" className="font-normal">Filter</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow filtering options
                          </p>
                        </div>
                        <Switch
                          id="filter"
                          checked={field?.attributes?.filter !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              filter: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="showClear" className="font-normal">Show Clear Button</Label>
                          <p className="text-xs text-muted-foreground">
                            Display a button to clear selection
                          </p>
                        </div>
                        <Switch
                          id="showClear"
                          checked={field?.attributes?.showClear === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              showClear: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="loading" className="font-normal">Loading State</Label>
                          <p className="text-xs text-muted-foreground">
                            Show loading indicator
                          </p>
                        </div>
                        <Switch
                          id="loading"
                          checked={field?.attributes?.loading === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              loading: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="floatLabel" className="font-normal">Float Label</Label>
                          <p className="text-xs text-muted-foreground">
                            Label floats when the field is focused
                          </p>
                        </div>
                        <Switch
                          id="floatLabel"
                          checked={field?.attributes?.floatLabel !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              floatLabel: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="invalid" className="font-normal">Invalid State</Label>
                          <p className="text-xs text-muted-foreground">
                            Mark field as invalid
                          </p>
                        </div>
                        <Switch
                          id="invalid"
                          checked={field?.attributes?.invalid === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              invalid: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="disabled" className="font-normal">Disabled</Label>
                          <p className="text-xs text-muted-foreground">
                            Disable the field
                          </p>
                        </div>
                        <Switch
                          id="disabled"
                          checked={field?.attributes?.disabled === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              disabled: checked
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.AUTOCOMPLETE && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">AutoComplete Field Configuration</h3>

                    {/* Basic AutoComplete Attributes */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="placeholder" className="block mb-2">Placeholder</Label>
                        <Input
                          id="placeholder"
                          placeholder="Enter placeholder text"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              placeholder: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.placeholder || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Text displayed when the field is empty
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="icon" className="block mb-2">Icon</Label>
                        <Input
                          id="icon"
                          placeholder="Icon name (e.g., search)"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              icon: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.icon || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Icon to display with the input
                        </p>
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="variant" className="block mb-2">Variant</Label>
                        <select
                          id="variant"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              variant: e.target.value as 'filled' | 'outlined'
                            });
                          }}
                          defaultValue={field?.attributes?.variant || 'outlined'}
                        >
                          <option value="outlined">Outlined</option>
                          <option value="filled">Filled</option>
                        </select>
                      </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="dropdown" className="font-normal">Dropdown</Label>
                          <p className="text-xs text-muted-foreground">
                            Show suggestions in a dropdown
                          </p>
                        </div>
                        <Switch
                          id="dropdown"
                          checked={field?.attributes?.dropdown !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              dropdown: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="object" className="font-normal">Object</Label>
                          <p className="text-xs text-muted-foreground">
                            Treat suggestions as objects
                          </p>
                        </div>
                        <Switch
                          id="object"
                          checked={field?.attributes?.object === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              object: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="group" className="font-normal">Group</Label>
                          <p className="text-xs text-muted-foreground">
                            Group suggestions by category
                          </p>
                        </div>
                        <Switch
                          id="group"
                          checked={field?.attributes?.group === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              group: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="forceSelection" className="font-normal">Force Selection</Label>
                          <p className="text-xs text-muted-foreground">
                            Only allow values from suggestions
                          </p>
                        </div>
                        <Switch
                          id="forceSelection"
                          checked={field?.attributes?.forceSelection === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              forceSelection: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="multiple" className="font-normal">Multiple</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow multiple selections
                          </p>
                        </div>
                        <Switch
                          id="multiple"
                          checked={field?.attributes?.multiple === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              multiple: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="floatLabel" className="font-normal">Float Label</Label>
                          <p className="text-xs text-muted-foreground">
                            Label floats when the field is focused
                          </p>
                        </div>
                        <Switch
                          id="floatLabel"
                          checked={field?.attributes?.floatLabel !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              floatLabel: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="invalid" className="font-normal">Invalid State</Label>
                          <p className="text-xs text-muted-foreground">
                            Mark field as invalid
                          </p>
                        </div>
                        <Switch
                          id="invalid"
                          checked={field?.attributes?.invalid === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              invalid: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="disabled" className="font-normal">Disabled</Label>
                          <p className="text-xs text-muted-foreground">
                            Disable the field
                          </p>
                        </div>
                        <Switch
                          id="disabled"
                          checked={field?.attributes?.disabled === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              disabled: checked
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.MEDIA && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">File Upload Field Configuration</h3>

                    {/* Basic File Upload Attributes */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="accept" className="block mb-2">Accepted File Types</Label>
                        <Input
                          id="accept"
                          placeholder="image/*,application/pdf,.doc,.docx"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              accept: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.accept || 'image/*'}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Comma-separated list of MIME types or file extensions
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="chooseLabel" className="block mb-2">Choose Label</Label>
                        <Input
                          id="chooseLabel"
                          placeholder="Choose files..."
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              chooseLabel: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.chooseLabel || 'Drag and drop files or click to upload'}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Text displayed in the upload area
                        </p>
                      </div>
                    </div>

                    {/* File Size Limits */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="maxFileSize" className="block mb-2">Maximum File Size (bytes)</Label>
                        <Input
                          id="maxFileSize"
                          type="number"
                          min="0"
                          placeholder="10000000"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              maxFileSize: parseInt(e.target.value) || 10000000
                            });
                          }}
                          defaultValue={field?.attributes?.maxFileSize || 10000000}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum file size in bytes (10MB = 10000000)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="minFileSize" className="block mb-2">Minimum File Size (bytes)</Label>
                        <Input
                          id="minFileSize"
                          type="number"
                          min="0"
                          placeholder="0"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              minFileSize: parseInt(e.target.value) || 0
                            });
                          }}
                          defaultValue={field?.attributes?.minFileSize || 0}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum file size in bytes
                        </p>
                      </div>
                    </div>

                    {/* Upload Configuration */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="url" className="block mb-2">Upload URL</Label>
                        <Input
                          id="url"
                          placeholder="/api/upload"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              url: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.url || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          URL to upload files to (leave empty to use default)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="emptyTemplate" className="block mb-2">Empty Template</Label>
                        <Input
                          id="emptyTemplate"
                          placeholder="Drag and drop files here"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              emptyTemplate: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.emptyTemplate || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Text displayed when no files are selected
                        </p>
                      </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="multiple" className="font-normal">Multiple Files</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow uploading multiple files
                          </p>
                        </div>
                        <Switch
                          id="multiple"
                          checked={field?.attributes?.multiple === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              multiple: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto" className="font-normal">Auto Upload</Label>
                          <p className="text-xs text-muted-foreground">
                            Upload files automatically when selected
                          </p>
                        </div>
                        <Switch
                          id="auto"
                          checked={field?.attributes?.auto !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              auto: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="customUpload" className="font-normal">Custom Upload Handler</Label>
                          <p className="text-xs text-muted-foreground">
                            Use custom upload handler instead of default
                          </p>
                        </div>
                        <Switch
                          id="customUpload"
                          checked={field?.attributes?.customUpload === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              customUpload: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="disabled" className="font-normal">Disabled</Label>
                          <p className="text-xs text-muted-foreground">
                            Disable the field
                          </p>
                        </div>
                        <Switch
                          id="disabled"
                          checked={field?.attributes?.disabled === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              disabled: checked
                            });
                          }}
                        />
                      </div>
                    </div>

                    {field?.attributes?.customUpload && (
                      <div className="mb-6">
                        <Label htmlFor="uploadHandler" className="block mb-2">Upload Handler</Label>
                        <Input
                          id="uploadHandler"
                          placeholder="myCustomUploadHandler"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              uploadHandler: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.uploadHandler || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Name of the custom upload handler function
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {fieldType === FieldTypeEnum.INPUT_TEXTAREA && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Input Textarea Field Configuration</h3>

                    {/* Basic Textarea Attributes */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="placeholder" className="block mb-2">Placeholder</Label>
                        <Input
                          id="placeholder"
                          placeholder="Enter placeholder text"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              placeholder: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.placeholder || 'Enter text...'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="helpText" className="block mb-2">Help Text</Label>
                        <Input
                          id="helpText"
                          placeholder="Enter help text"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              helpText: e.target.value
                            });
                          }}
                          defaultValue={field?.attributes?.helpText || ''}
                        />
                      </div>
                    </div>

                    {/* Size Configuration */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="rows" className="block mb-2">Rows</Label>
                        <Input
                          id="rows"
                          type="number"
                          min="1"
                          placeholder="5"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              rows: parseInt(e.target.value) || 5
                            });
                          }}
                          defaultValue={field?.attributes?.rows || 5}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Number of visible text rows
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="cols" className="block mb-2">Columns</Label>
                        <Input
                          id="cols"
                          type="number"
                          min="1"
                          placeholder="Optional"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              cols: parseInt(e.target.value) || undefined
                            });
                          }}
                          defaultValue={field?.attributes?.cols || ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Number of visible text columns (optional)
                        </p>
                      </div>
                    </div>

                    {/* Key Filter */}
                    <div className="mb-6">
                      <Label htmlFor="keyfilter" className="block mb-2">Key Filter</Label>
                      <select
                        id="keyfilter"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        onChange={(e) => {
                          const attributes = form.getValues('attributes') || {};
                          form.setValue('attributes', {
                            ...attributes,
                            keyfilter: e.target.value
                          });
                        }}
                        defaultValue={field?.attributes?.keyfilter || ''}
                      >
                        <option value="">None</option>
                        <option value="int">Integer (positive/negative)</option>
                        <option value="pint">Positive Integer</option>
                        <option value="num">Number (decimal/integer)</option>
                        <option value="pnum">Positive Number</option>
                        <option value="alpha">Alphabetic</option>
                        <option value="alphanum">Alphanumeric</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Restricts the input to specific character sets
                      </p>
                    </div>

                    {/* Display Options */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <Label htmlFor="variant" className="block mb-2">Variant</Label>
                        <select
                          id="variant"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              variant: e.target.value as 'filled' | 'outlined'
                            });
                          }}
                          defaultValue={field?.attributes?.variant || 'outlined'}
                        >
                          <option value="outlined">Outlined</option>
                          <option value="filled">Filled</option>
                        </select>
                      </div>
                    </div>

                    {/* Switches */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoResize" className="font-normal">Auto Resize</Label>
                          <p className="text-xs text-muted-foreground">
                            Automatically resize the textarea based on content
                          </p>
                        </div>
                        <Switch
                          id="autoResize"
                          checked={field?.attributes?.autoResize !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              autoResize: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="floatLabel" className="font-normal">Float Label</Label>
                          <p className="text-xs text-muted-foreground">
                            Label floats when the field is focused
                          </p>
                        </div>
                        <Switch
                          id="floatLabel"
                          checked={field?.attributes?.floatLabel !== false}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              floatLabel: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="invalid" className="font-normal">Invalid State</Label>
                          <p className="text-xs text-muted-foreground">
                            Mark field as invalid
                          </p>
                        </div>
                        <Switch
                          id="invalid"
                          checked={field?.attributes?.invalid === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              invalid: checked
                            });
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="disabled" className="font-normal">Disabled</Label>
                          <p className="text-xs text-muted-foreground">
                            Disable the field
                          </p>
                        </div>
                        <Switch
                          id="disabled"
                          checked={field?.attributes?.disabled === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              disabled: checked
                            });
                          }}
                        />
                      </div>
                    </div>

                    {/* Validation */}
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Validation</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="minLength" className="block mb-2">Minimum Length</Label>
                          <Input
                            id="minLength"
                            type="number"
                            min="0"
                            placeholder="Minimum length"
                            onChange={(e) => {
                              const validations = form.getValues('validations') || {};
                              form.setValue('validations', {
                                ...validations,
                                minLength: parseInt(e.target.value) || undefined
                              });
                            }}
                            defaultValue={field?.validations?.minLength || ''}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Minimum number of characters required
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="maxLength" className="block mb-2">Maximum Length</Label>
                          <Input
                            id="maxLength"
                            type="number"
                            min="0"
                            placeholder="Maximum length"
                            onChange={(e) => {
                              const validations = form.getValues('validations') || {};
                              form.setValue('validations', {
                                ...validations,
                                maxLength: parseInt(e.target.value) || undefined
                              });
                            }}
                            defaultValue={field?.validations?.maxLength || ''}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Maximum number of characters allowed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {fieldType === FieldTypeEnum.JSON && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">JSON Field Configuration</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="rows" className="block mb-2">Rows</Label>
                        <Input
                          id="rows"
                          type="number"
                          min="1"
                          placeholder="10"
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              rows: parseInt(e.target.value) || 10
                            });
                          }}
                          defaultValue={field?.attributes?.rows || 10}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="autoResize" className="font-normal">Auto Resize</Label>
                          <p className="text-xs text-muted-foreground">
                            Automatically resize the textarea based on content
                          </p>
                        </div>
                        <Switch
                          id="autoResize"
                          checked={field?.attributes?.autoResize === true}
                          onCheckedChange={(checked) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              autoResize: checked
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <h3 className="font-medium mb-4">Validation Settings</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="required" className="font-normal">Required field</Label>
                        <p className="text-xs text-muted-foreground">
                          You won't be able to create an entry if this field is empty
                        </p>
                      </div>
                      <Switch
                        id="required"
                        checked={form.watch('required')}
                        onCheckedChange={(checked) => {
                          form.setValue('required', checked);
                          const validations = form.getValues('validations') || {};
                          form.setValue('validations', {
                            ...validations,
                            required: checked
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="unique" className="font-normal">Unique field</Label>
                        <p className="text-xs text-muted-foreground">
                          You won't be able to create an entry if there is an existing entry with identical content
                        </p>
                      </div>
                      <Switch
                        id="unique"
                        checked={form.watch('unique')}
                        onCheckedChange={(checked) => form.setValue('unique', checked)}
                      />
                    </div>

                    {(fieldType === FieldTypeEnum.TEXT || fieldType === FieldTypeEnum.EMAIL || fieldType === FieldTypeEnum.PASSWORD || fieldType === FieldTypeEnum.INPUT_MASK) && (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="maxLength" className="block mb-2">Maximum length</Label>
                            <Input
                              id="maxLength"
                              type="number"
                              min="0"
                              placeholder="Maximum length"
                              onChange={(e) => {
                                const validations = form.getValues('validations') || {};
                                form.setValue('validations', {
                                  ...validations,
                                  maxLength: parseInt(e.target.value) || undefined
                                });
                              }}
                              defaultValue={field?.validations?.maxLength || ''}
                            />
                          </div>
                          <div>
                            <Label htmlFor="minLength" className="block mb-2">Minimum length</Label>
                            <Input
                              id="minLength"
                              type="number"
                              min="0"
                              placeholder="Minimum length"
                              onChange={(e) => {
                                const validations = form.getValues('validations') || {};
                                form.setValue('validations', {
                                  ...validations,
                                  minLength: parseInt(e.target.value) || undefined
                                });
                              }}
                              defaultValue={field?.validations?.minLength || ''}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="regex" className="block mb-2">Regular Expression</Label>
                            <Input
                              id="regex"
                              placeholder="e.g., ^[a-zA-Z0-9]+$"
                              onChange={(e) => {
                                const validations = form.getValues('validations') || {};
                                form.setValue('validations', {
                                  ...validations,
                                  regex: e.target.value
                                });
                              }}
                              defaultValue={field?.validations?.regex || ''}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Pattern for validation
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="apiUrl" className="block mb-2">API URL for Validation</Label>
                            <Input
                              id="apiUrl"
                              placeholder="e.g., /api/validate/field"
                              onChange={(e) => {
                                const validations = form.getValues('validations') || {};
                                form.setValue('validations', {
                                  ...validations,
                                  apiUrl: e.target.value
                                });
                              }}
                              defaultValue={field?.validations?.apiUrl || ''}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              URL to validate field value against
                            </p>
                          </div>
                        </div>

                        {fieldType === FieldTypeEnum.INPUT_MASK && (
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <Label htmlFor="unmask" className="font-normal">Unmask for Validation</Label>
                              <p className="text-xs text-muted-foreground">
                                Remove mask characters when validating
                              </p>
                            </div>
                            <Switch
                              id="unmask"
                              checked={field?.validations?.unmask === true}
                              onCheckedChange={(checked) => {
                                const validations = form.getValues('validations') || {};
                                form.setValue('validations', {
                                  ...validations,
                                  unmask: checked
                                });
                              }}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {fieldType === FieldTypeEnum.NUMBER && (
                      <>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="maxValue" className="block mb-2">Maximum value</Label>
                            <Input
                              id="maxValue"
                              type="number"
                              placeholder="Maximum value"
                              onChange={(e) => {
                                const validations = form.getValues('validations') || {};
                                form.setValue('validations', {
                                  ...validations,
                                  maxValue: parseFloat(e.target.value) || undefined
                                });
                              }}
                              defaultValue={field?.validations?.maxValue || ''}
                            />
                          </div>
                          <div>
                            <Label htmlFor="minValue" className="block mb-2">Minimum value</Label>
                            <Input
                              id="minValue"
                              type="number"
                              placeholder="Minimum value"
                              onChange={(e) => {
                                const validations = form.getValues('validations') || {};
                                form.setValue('validations', {
                                  ...validations,
                                  minValue: parseFloat(e.target.value) || undefined
                                });
                              }}
                              defaultValue={field?.validations?.minValue || ''}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label htmlFor="validationMinFractionDigits" className="block mb-2">Min Fraction Digits</Label>
                            <Input
                              id="validationMinFractionDigits"
                              type="number"
                              min="0"
                              placeholder="Min decimal places"
                              onChange={(e) => {
                                const validations = form.getValues('validations') || {};
                                form.setValue('validations', {
                                  ...validations,
                                  minFractionDigits: parseInt(e.target.value) || undefined
                                });
                              }}
                              defaultValue={field?.validations?.minFractionDigits || ''}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Minimum required decimal places
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="validationMaxFractionDigits" className="block mb-2">Max Fraction Digits</Label>
                            <Input
                              id="validationMaxFractionDigits"
                              type="number"
                              min="0"
                              placeholder="Max decimal places"
                              onChange={(e) => {
                                const validations = form.getValues('validations') || {};
                                form.setValue('validations', {
                                  ...validations,
                                  maxFractionDigits: parseInt(e.target.value) || undefined
                                });
                              }}
                              defaultValue={field?.validations?.maxFractionDigits || ''}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Maximum allowed decimal places
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          id="private"
                          checked={field?.attributes?.disabled === true}
                          onChange={(e) => {
                            const attributes = form.getValues('attributes') || {};
                            form.setValue('attributes', {
                              ...attributes,
                              disabled: e.target.checked
                            });
                          }}
                        />
                      </div>
                      <div className="ml-2">
                        <Label htmlFor="private" className="font-normal">Private field</Label>
                        <p className="text-xs text-muted-foreground">
                          This field will not show up in the API response
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="block mb-2">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description"
                    {...form.register('description')}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Description will be displayed below the field in the content form
                  </p>
                </div>

                {/* Common Properties */}
                <div className="mt-6">
                  <h3 className="font-medium mb-4">Common Properties</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="dependOn" className="block mb-2">Depend On</Label>
                      <Input
                        id="dependOn"
                        placeholder="Field dependency"
                        {...form.register('dependOn')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="displayName" className="block mb-2">Display Name</Label>
                      <Input
                        id="displayName"
                        placeholder="Display name"
                        {...form.register('displayName')}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <div className="flex justify-between items-center pt-6 mt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => {
                      onSubmit(form.getValues());
                      if (onAddAnother) onAddAnother();
                    }}
                  >
                    <span className="text-indigo-600">+</span> Add another field
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Finish
                  </Button>
                </div>
              </div>
            </form>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
