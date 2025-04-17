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
    // Convert snake_case to SNAKE_CASE for enum lookup
    const enumKey = name.toUpperCase();

    // Check if the enum exists
    if (Object.values(FieldTypeEnum).includes(name as FieldTypeEnum)) {
      return name as FieldTypeEnum;
    }

    // Default to TEXT if not found
    console.warn(`Field type ${name} not found in FieldTypeEnum, defaulting to TEXT`);
    return FieldTypeEnum.TEXT;
  };

  // Generate icon information based on field type
  const getIconForFieldType = (fieldType: BackendFieldType) => {
    const type = mapFieldTypeNameToEnum(fieldType.fieldTypeName);

    // Map of field types to their icon information
    const iconMap: Record<FieldTypeEnum, { bg: string; color: string; text: string }> = {
      [FieldTypeEnum.TEXT]: { bg: 'bg-green-100', color: 'text-green-700', text: 'Aa' },
      [FieldTypeEnum.INPUT_MASK]: { bg: 'bg-green-100', color: 'text-green-700', text: '##' },
      [FieldTypeEnum.AUTOCOMPLETE]: { bg: 'bg-indigo-100', color: 'text-indigo-700', text: '⌨️' },
      [FieldTypeEnum.CASCADE_SELECT]: { bg: 'bg-teal-100', color: 'text-teal-700', text: '📂' },
      [FieldTypeEnum.DROPDOWN]: { bg: 'bg-purple-100', color: 'text-purple-700', text: '▼' },
      [FieldTypeEnum.RICH_TEXT_BLOCKS]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '∷' },
      [FieldTypeEnum.RICH_TEXT_MARKDOWN]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '≡' },
      [FieldTypeEnum.NUMBER]: { bg: 'bg-red-100', color: 'text-red-700', text: '123' },
      [FieldTypeEnum.BOOLEAN]: { bg: 'bg-green-100', color: 'text-green-700', text: '⚪' },
      [FieldTypeEnum.JSON]: { bg: 'bg-blue-100', color: 'text-blue-700', text: '{}' },
      [FieldTypeEnum.EMAIL]: { bg: 'bg-red-100', color: 'text-red-700', text: '@' },
      [FieldTypeEnum.PASSWORD]: { bg: 'bg-yellow-100', color: 'text-yellow-700', text: '🔒' },
      [FieldTypeEnum.DATE]: { bg: 'bg-amber-100', color: 'text-amber-700', text: '📅' },
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
    try {
      const response = await fieldTypesApi.getActive();
      const backendFieldTypes: BackendFieldType[] = response.data;

      // Map backend field types to frontend format
      const mappedFieldTypes = backendFieldTypes.map(fieldType => ({
        id: fieldType.id.toString(),
        name: fieldType.displayName || fieldType.fieldTypeName,
        apiId: fieldType.fieldTypeName,
        isActive: fieldType.isActive
      }));

      // Store in Zustand store
      setFieldTypes(mappedFieldTypes);

      // Create field type options for the UI
      const options = backendFieldTypes.map(fieldType => {
        const { iconBg, iconColor, iconText } = getIconForFieldType(fieldType);
        return {
          id: fieldType.id,
          type: mapFieldTypeNameToEnum(fieldType.fieldTypeName),
          title: fieldType.displayName || fieldType.fieldTypeName,
          description: fieldType.fieldTypeDesc || '',
          icon: 'icon', // Just a placeholder, we'll use the separate properties
          iconBg,
          iconColor,
          iconText
        };
      });

      setFieldTypeOptions(options);
    } catch (error: any) {
      console.error('Error fetching field types:', error);

      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        setError('Authentication required. Please log in again.');
        toast({
          title: 'Authentication Error',
          description: 'Your session has expired. Please log in again.',
          variant: 'destructive',
        });

        // Redirect to login
        logout();
        navigate('/login');
      } else {
        setError('Failed to load field types');
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

  return {
    fieldTypes,
    fieldTypeOptions,
    loading,
    error,
    refetch: fetchFieldTypes
  };
};
