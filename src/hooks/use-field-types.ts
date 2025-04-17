import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldTypesApi } from '@/lib/api';
import { useFieldTypeStore, useAuthStore, FieldTypeEnum } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';

// Define the backend field type structure
interface BackendFieldType {
  id: number;
  fieldTypeName: string;
  fieldTypeDesc: string;
  displayName: string;
  helpText: string;
  logoImagePath: string;
  isActive: boolean;
}

// Define the field type option structure for the UI
export interface FieldTypeOption {
  type: FieldTypeEnum;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  iconText: string;
  id: number;
}

export const useFieldTypes = () => {
  const { fieldTypes, setFieldTypes, loading, setLoading, error, setError } = useFieldTypeStore();
  const [fieldTypeOptions, setFieldTypeOptions] = useState<FieldTypeOption[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, token, logout } = useAuthStore();

  // Map field type names to FieldTypeEnum
  const mapFieldTypeNameToEnum = (name: string): FieldTypeEnum => {
    console.log(`Mapping field type name: ${name}`);

    // Check if the enum exists directly
    if (Object.values(FieldTypeEnum).includes(name as FieldTypeEnum)) {
      console.log(`Direct match found for ${name}`);
      return name as FieldTypeEnum;
    }

    // Try to find a matching enum by converting to uppercase
    const enumKey = name.toUpperCase().replace(/-/g, '_');
    console.log(`Looking for enum key: ${enumKey}`);

    for (const key in FieldTypeEnum) {
      if (key === enumKey) {
        console.log(`Match found: ${key} -> ${FieldTypeEnum[key as keyof typeof FieldTypeEnum]}`);
        return FieldTypeEnum[key as keyof typeof FieldTypeEnum];
      }
    }

    // Default to TEXT if not found
    console.warn(`Field type ${name} not found in FieldTypeEnum, defaulting to TEXT`);
    return FieldTypeEnum.TEXT;
  };

  // Generate icon information based on field type
  const getIconForFieldType = (fieldType: BackendFieldType) => {
    const type = mapFieldTypeNameToEnum(fieldType.fieldTypeName);

    // Map of field types to their icon information
    const iconMap: Record<string, { bg: string; color: string; text: string }> = {
      // New field types
      [FieldTypeEnum.TEXT]: { bg: 'bg-green-100', color: 'text-green-700', text: 'Aa' },
      [FieldTypeEnum.NUMBER]: { bg: 'bg-red-100', color: 'text-red-700', text: '123' },
      [FieldTypeEnum.DATE]: { bg: 'bg-amber-100', color: 'text-amber-700', text: '📅' },
      [FieldTypeEnum.IMAGE]: { bg: 'bg-purple-100', color: 'text-purple-700', text: '🖼️' },
      [FieldTypeEnum.RICH_TEXT]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '∷' },
      [FieldTypeEnum.MASK]: { bg: 'bg-green-100', color: 'text-green-700', text: '##' },
      [FieldTypeEnum.CALENDAR]: { bg: 'bg-amber-100', color: 'text-amber-700', text: '📆' },
      [FieldTypeEnum.EDITOR]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '≡' },
      [FieldTypeEnum.PASSWORD]: { bg: 'bg-yellow-100', color: 'text-yellow-700', text: '🔒' },
      [FieldTypeEnum.AUTOCOMPLETE]: { bg: 'bg-indigo-100', color: 'text-indigo-700', text: '⌨️' },
      [FieldTypeEnum.CASCADE_SELECT]: { bg: 'bg-teal-100', color: 'text-teal-700', text: '📂' },
      [FieldTypeEnum.DROPDOWN]: { bg: 'bg-purple-100', color: 'text-purple-700', text: '▼' },
      [FieldTypeEnum.FILE]: { bg: 'bg-purple-100', color: 'text-purple-700', text: '📄' },
      [FieldTypeEnum.MULTI_STATE_CHECKBOX]: { bg: 'bg-green-100', color: 'text-green-700', text: '☑️' },
      [FieldTypeEnum.MULTI_SELECT]: { bg: 'bg-purple-100', color: 'text-purple-700', text: '⊠' },
      [FieldTypeEnum.MENTION]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '@' },
      [FieldTypeEnum.TEXTAREA]: { bg: 'bg-orange-100', color: 'text-orange-700', text: '¶' },
      [FieldTypeEnum.OTP]: { bg: 'bg-yellow-100', color: 'text-yellow-700', text: '#' },

      // Legacy field types for backward compatibility
      [FieldTypeEnum.INPUT_MASK]: { bg: 'bg-green-100', color: 'text-green-700', text: '##' },
      [FieldTypeEnum.RICH_TEXT_BLOCKS]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '∷' },
      [FieldTypeEnum.RICH_TEXT_MARKDOWN]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '≡' },
      [FieldTypeEnum.BOOLEAN]: { bg: 'bg-green-100', color: 'text-green-700', text: '⚪' },
      [FieldTypeEnum.JSON]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '{}' },
      [FieldTypeEnum.EMAIL]: { bg: 'bg-red-100', color: 'text-red-700', text: '@' },
      [FieldTypeEnum.MEDIA]: { bg: 'bg-purple-100', color: 'text-purple-700', text: '🖼️' },
      [FieldTypeEnum.ENUMERATION]: { bg: 'bg-purple-100', color: 'text-purple-700', text: '≣' },
      [FieldTypeEnum.RELATION]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '🔗' },
      [FieldTypeEnum.UID]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '🔑' },
      [FieldTypeEnum.COMPONENT]: { bg: 'bg-gray-100', color: 'text-gray-700', text: '⚙️' },
      [FieldTypeEnum.DYNAMIC_ZONE]: { bg: 'bg-gray-100', color: 'text-gray-700', text: '∞' },
      [FieldTypeEnum.INPUT_TEXTAREA]: { bg: 'bg-orange-100', color: 'text-orange-700', text: '¶' },
    };

    const iconInfo = iconMap[type] || { bg: 'bg-gray-100', color: 'text-gray-700', text: '?' };
    return {
      iconBg: iconInfo.bg,
      iconColor: iconInfo.color,
      iconText: iconInfo.text
    };
  };

  // Check authentication before making API calls
  const checkAuthentication = () => {
    if (!isAuthenticated || !token) {
      console.log('Not authenticated, redirecting to login');
      logout(); // Clear any invalid tokens
      navigate('/login');
      return false;
    }
    return true;
  };

  // Fetch field types from the backend
  const fetchFieldTypes = async () => {
    // Check authentication first
    if (!checkAuthentication()) {
      return;
    }

    setLoading(true);
    console.log('Fetching field types from API...');
    try {
      console.log('Making API call to:', '/field-types/active');
      const response = await fieldTypesApi.getActive();
      console.log('Field types API response:', response.data);

      if (!response.data || !Array.isArray(response.data)) {
        console.error('Invalid response data format:', response.data);
        setError('Invalid response data format');
        return;
      }

      const backendFieldTypes: BackendFieldType[] = response.data;
      console.log('Number of field types received:', backendFieldTypes.length);

      // Map backend field types to frontend format
      const mappedFieldTypes = backendFieldTypes.map(fieldType => {
        console.log('Processing field type:', fieldType);
        return {
          id: fieldType.id.toString(),
          name: fieldType.displayName || fieldType.fieldTypeName,
          apiId: fieldType.fieldTypeName,
          isActive: fieldType.isActive
        };
      });

      // Store in Zustand store
      setFieldTypes(mappedFieldTypes);
      console.log('Field types stored in Zustand store');

      // Create field type options for the UI
      const options = backendFieldTypes.map(fieldType => {
        console.log(`Creating UI option for field type: ${fieldType.fieldTypeName}`);
        const { iconBg, iconColor, iconText } = getIconForFieldType(fieldType);
        const type = mapFieldTypeNameToEnum(fieldType.fieldTypeName);
        console.log(`Mapped type: ${type}`);

        return {
          id: fieldType.id,
          type,
          title: fieldType.displayName || fieldType.fieldTypeName,
          description: fieldType.fieldTypeDesc || '',
          icon: 'icon', // Just a placeholder, we'll use the separate properties
          iconBg,
          iconColor,
          iconText
        };
      });

      console.log('Field type options created:', options.length);
      setFieldTypeOptions(options);
    } catch (error: any) {
      console.error('Error fetching field types:', error);
      console.error('Error details:', error.message);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }

      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        const errorMsg = 'Authentication required. Please log in again.';
        console.error(errorMsg);
        setError(errorMsg);
        toast({
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });

        // Redirect to login
        logout();
        navigate('/login');
      } else {
        const errorMsg = `Failed to load field types: ${error.message}`;
        console.error(errorMsg);
        setError(errorMsg);
        toast({
          title: 'Error',
          description: 'Failed to load field types',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchFieldTypes();
    }
  }, [isAuthenticated, token]);

  // Provide fallback field types if none are loaded
  useEffect(() => {
    if (!loading && fieldTypeOptions.length === 0) {
      console.log('No field types loaded, providing fallback options');
      const fallbackOptions: FieldTypeOption[] = [
        { id: 1, type: FieldTypeEnum.TEXT, title: 'Text', description: 'Simple text field', icon: '', iconBg: 'bg-green-100', iconColor: 'text-green-700', iconText: 'Aa' },
        { id: 2, type: FieldTypeEnum.NUMBER, title: 'Number', description: 'Numeric field', icon: '', iconBg: 'bg-red-100', iconColor: 'text-red-700', iconText: '123' },
        { id: 3, type: FieldTypeEnum.DATE, title: 'Date', description: 'Date field', icon: '', iconBg: 'bg-amber-100', iconColor: 'text-amber-700', iconText: '📅' },
        { id: 4, type: FieldTypeEnum.PASSWORD, title: 'Password', description: 'Password input field', icon: '', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-700', iconText: '🔒' },
        { id: 5, type: FieldTypeEnum.RICH_TEXT, title: 'Rich Text', description: 'Rich text editor', icon: '', iconBg: 'bg-blue-100', iconColor: 'text-blue-700', iconText: '∷' },
        { id: 6, type: FieldTypeEnum.TEXTAREA, title: 'Textarea', description: 'Multi-line text input', icon: '', iconBg: 'bg-orange-100', iconColor: 'text-orange-700', iconText: '¶' }
      ];
      setFieldTypeOptions(fallbackOptions);
    }
  }, [loading, fieldTypeOptions.length]);

  return {
    fieldTypes,
    fieldTypeOptions,
    loading,
    error,
    refetch: fetchFieldTypes
  };
};
