
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Define auth user type
export interface User {
  id: string;
  username: string;
  email: string;
}

// Define collection type
export interface Collection {
  id: string;
  name: string;
  apiId: string;
  apiIdPlural: string;
  draftAndPublish: boolean;
  isInternationally: boolean;
  fields: Field[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define component type
export interface Component {
  id: string;
  name: string;
  apiId: string;
  fields: Field[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define field type enum
export enum FieldTypeEnum {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  IMAGE = 'image',
  RICH_TEXT = 'rich_text',
  MASK = 'mask',
  CALENDAR = 'calendar',
  EDITOR = 'editor',
  PASSWORD = 'password',
  AUTOCOMPLETE = 'autocomplete',
  CASCADE_SELECT = 'cascade_select',
  DROPDOWN = 'dropdown',
  FILE = 'file',
  MULTI_STATE_CHECKBOX = 'multi_state_checkbox',
  MULTI_SELECT = 'multi_select',
  MENTION = 'mention',
  TEXTAREA = 'textarea',
  OTP = 'otp',
  // Keep these for backward compatibility
  RICH_TEXT_BLOCKS = 'rich_text_blocks',
  RICH_TEXT_MARKDOWN = 'rich_text_markdown',
  BOOLEAN = 'boolean',
  JSON = 'json',
  EMAIL = 'email',
  MEDIA = 'media',
  ENUMERATION = 'enumeration',
  RELATION = 'relation',
  UID = 'uid',
  COMPONENT = 'component',
  DYNAMIC_ZONE = 'dynamic_zone',
  INPUT_MASK = 'input_mask',
  INPUT_TEXTAREA = 'input_textarea',
}

// Define field type
export interface FieldType {
  id: string;
  name: string;
  apiId: string;
  isActive: boolean;
}

// Define field configuration attributes
export interface FieldAttributes {
  // Common attributes
  keyfilter?: 'int' | 'pint' | 'num' | 'pnum' | 'money' | 'hex' | 'alpha' | 'alphanum' | 'email' | string;
  placeholder?: string;
  helpText?: string;
  floatLabel?: boolean;
  variant?: 'filled' | 'outlined' | string;
  invalid?: boolean;
  disabled?: boolean;
  icon?: string;
  tooltip?: string;
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  tooltipEvent?: 'hover' | 'focus';
  autoClear?: boolean;
  tooltipOptions?: {
    position?: 'top' | 'bottom' | 'left' | 'right';
    event?: 'hover' | 'focus';
  };

  // InputMask specific attributes
  mask?: string;
  slotChar?: string;
  unmask?: boolean;

  // Number specific attributes
  useGrouping?: boolean;
  locale?: string;
  suffix?: string;
  prefix?: string;
  showButtons?: boolean;
  mode?: 'decimal' | 'currency';
  currency?: string;
  step?: number;
  min?: number;
  max?: number;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  incrementButtonIcon?: string;
  decrementButtonIcon?: string;
  decrementButtonClassName?: string;
  incrementButtonClassName?: string;
  buttonLayout?: 'stacked' | 'horizontal' | 'vertical';

  // Date specific attributes
  dateFormat?: string;
  showIcon?: boolean;
  minDate?: string;
  maxDate?: string;
  readOnlyInput?: boolean;
  selectionMode?: 'single' | 'multiple' | 'range';
  hideOnRangeSelection?: boolean;
  showButtonBar?: boolean;
  showTime?: boolean;
  hourFormat?: '12' | '24';
  view?: 'month' | 'year';
  numberOfMonths?: number;
  variant?: 'filled' | 'outlined';
  timeOnly?: boolean;
  inline?: boolean;
  showWeek?: boolean;

  // Password specific attributes
  feedback?: boolean;
  promptLabel?: string;
  weakLabel?: string;
  mediumLabel?: string;
  strongLabel?: string;
  toggleMask?: boolean;

  // Dropdown/Select specific attributes
  dropdown?: boolean;
  object?: boolean;
  group?: boolean;
  forceSelection?: boolean;
  multiple?: boolean;
  checkmark?: boolean;
  highlightOnSelect?: boolean;
  editable?: boolean;
  optionGroupLabel?: string;
  optionGroupChildren?: string;
  optionGroupTemplate?: string;
  valueTemplate?: string;
  itemTemplate?: string;
  panelFooterTemplate?: string;
  filter?: boolean;
  showClear?: boolean;
  loading?: boolean;
  virtualScrollerOptions?: any;

  // File upload specific attributes
  mode?: 'basic' | 'advanced';
  url?: string;
  accept?: string;
  minFileSize?: number;
  maxFileSize?: number;
  auto?: boolean;
  chooseLabel?: string;
  emptyTemplate?: string;
  customUpload?: boolean;
  uploadHandler?: string;

  // Select/Radio specific attributes
  options?: any[];
  iconTemplate?: string;
  value?: any;
  optionValue?: string;
  display?: string;
  optionLabel?: string;
  maxSelectedLabels?: number;

  // AutoComplete specific attributes
  dropdown?: boolean;
  object?: boolean;
  group?: boolean;
  forceSelection?: boolean;
  multiple?: boolean;

  // CascadeSelect specific attributes
  placeholder?: string;
  options?: any[]; // Nested structure of options
  optionLabel?: string; // Property name for the option label
  optionValue?: string; // Property name for the option value
  optionGroupLabel?: string; // Property name for the option group label
  optionGroupChildren?: string; // Property name for the option group children

  // Dropdown specific attributes
  checkmark?: boolean;
  highlightOnSelect?: boolean;
  editable?: boolean;
  optionGroupTemplate?: string;
  valueTemplate?: string;
  itemTemplate?: string;
  panelFooterTemplate?: string;
  filter?: boolean;
  showClear?: boolean;
  loading?: boolean;
  virtualScrollerOptions?: any;
  getApiUrl?: string; // URL to fetch options from API

  // Textarea specific attributes
  field?: string;
  rows?: number;
  cols?: number;
  trigger?: 'blur' | 'change';
  autoResize?: boolean;
}

// Define dropdown option
export interface DropdownOption {
  text: string;
  value: string;
  icon?: string;
  color?: string;
}

// Define field validation rules
export interface FieldValidations {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  regex?: string;
  minValue?: number;
  maxValue?: number;
  minFractionDigits?: number;
  maxFractionDigits?: number;
  apiUrl?: string; // URL to validate against (e.g., for unique validation)
  mask?: string; // Mask pattern for validation
  unmask?: boolean; // Whether to unmask the value for validation
}

// Define field
export interface Field {
  id?: string;
  name: string;
  apiId: string;
  type: FieldTypeEnum;
  required: boolean;
  unique: boolean;
  description?: string;
  defaultValue?: any;
  // Common properties
  dependOn?: string;
  uniqueId?: string; // Unique identifier for the field
  displayName?: string; // Display name shown in the UI
  isVisible?: boolean; // Whether the field is visible in the UI
  getApiUrl?: string; // API URL for fetching data
  // Field configuration
  attributes?: FieldAttributes;
  validations?: FieldValidations;
  // Only for enumeration fields
  enumValues?: string[];
  // Only for relation fields
  relationCollection?: string;
  relationField?: string;
  // Only for component fields
  componentId?: string;
  componentType?: 'new' | 'existing';
  componentCategory?: string;
  icon?: string;
  // Only for dynamic zone fields
  allowedComponents?: string[];
  min?: number;
  max?: number;
}

// Define content entry
export interface ContentEntry {
  id: string;
  collectionId: string;
  data: any;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define media asset
export interface MediaAsset {
  id: string;
  name: string;
  type: string; // image, video, document, etc.
  url: string;
  size: number; // in bytes
  mimeType: string;
  width?: number; // for images
  height?: number; // for images
  duration?: number; // for videos/audio
  folderId?: string;
  createdAt: string;
  updatedAt: string;
}

// Define media folder
export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth store interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Collection store interface
interface CollectionState {
  collections: Collection[];
  selectedCollection: Collection | null;
  loading: boolean;
  error: string | null;
  setCollections: (collections: Collection[]) => void;
  setSelectedCollection: (collection: Collection | null) => void;
  addCollection: (collection: Collection) => void;
  updateCollection: (id: string, collection: Partial<Collection>) => void;
  removeCollection: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Component store interface
interface ComponentState {
  components: Component[];
  selectedComponent: Component | null;
  loading: boolean;
  error: string | null;
  setComponents: (components: Component[]) => void;
  setSelectedComponent: (component: Component | null) => void;
  addComponent: (component: Component) => void;
  updateComponent: (id: string, component: Partial<Component>) => void;
  removeComponent: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Field type store interface
interface FieldTypeState {
  fieldTypes: FieldType[];
  loading: boolean;
  error: string | null;
  setFieldTypes: (fieldTypes: FieldType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Content entry store interface
interface ContentEntryState {
  contentEntries: ContentEntry[];
  selectedEntry: ContentEntry | null;
  loading: boolean;
  error: string | null;
  setContentEntries: (contentEntries: ContentEntry[]) => void;
  setSelectedEntry: (entry: ContentEntry | null) => void;
  addEntry: (entry: ContentEntry) => void;
  updateEntry: (id: string, entry: Partial<ContentEntry>) => void;
  removeEntry: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Media store interface
interface MediaState {
  assets: MediaAsset[];
  folders: MediaFolder[];
  selectedAsset: MediaAsset | null;
  selectedFolder: MediaFolder | null;
  loading: boolean;
  error: string | null;
  setAssets: (assets: MediaAsset[]) => void;
  setFolders: (folders: MediaFolder[]) => void;
  setSelectedAsset: (asset: MediaAsset | null) => void;
  setSelectedFolder: (folder: MediaFolder | null) => void;
  addAsset: (asset: MediaAsset) => void;
  updateAsset: (id: string, asset: Partial<MediaAsset>) => void;
  removeAsset: (id: string) => void;
  addFolder: (folder: MediaFolder) => void;
  updateFolder: (id: string, folder: Partial<MediaFolder>) => void;
  removeFolder: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Create auth store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        login: (token, user) => set({ token, user, isAuthenticated: true }),
        logout: () => set({ token: null, user: null, isAuthenticated: false }),
      }),
      { name: 'auth-storage' }
    )
  )
);

// Create collection store
export const useCollectionStore = create<CollectionState>()(
  devtools((set) => ({
    collections: [],
    selectedCollection: null,
    loading: false,
    error: null,
    setCollections: (collections) => set({ collections }),
    setSelectedCollection: (selectedCollection) => set({ selectedCollection }),
    addCollection: (collection) =>
      set((state) => ({ collections: [...state.collections, collection] })),
    updateCollection: (id, updatedCollection) =>
      set((state) => ({
        collections: state.collections.map((collection) =>
          collection.id === id ? { ...collection, ...updatedCollection } : collection
        ),
        selectedCollection:
          state.selectedCollection?.id === id
            ? { ...state.selectedCollection, ...updatedCollection }
            : state.selectedCollection,
      })),
    removeCollection: (id) =>
      set((state) => ({
        collections: state.collections.filter((collection) => collection.id !== id),
        selectedCollection:
          state.selectedCollection?.id === id ? null : state.selectedCollection,
      })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  }))
);

// Create component store
export const useComponentStore = create<ComponentState>()(
  devtools((set) => ({
    components: [],
    selectedComponent: null,
    loading: false,
    error: null,
    setComponents: (components) => set({ components }),
    setSelectedComponent: (selectedComponent) => set({ selectedComponent }),
    addComponent: (component) =>
      set((state) => ({ components: [...state.components, component] })),
    updateComponent: (id, updatedComponent) =>
      set((state) => ({
        components: state.components.map((component) =>
          component.id === id ? { ...component, ...updatedComponent } : component
        ),
        selectedComponent:
          state.selectedComponent?.id === id
            ? { ...state.selectedComponent, ...updatedComponent }
            : state.selectedComponent,
      })),
    removeComponent: (id) =>
      set((state) => ({
        components: state.components.filter((component) => component.id !== id),
        selectedComponent:
          state.selectedComponent?.id === id ? null : state.selectedComponent,
      })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  }))
);

// Create field type store
export const useFieldTypeStore = create<FieldTypeState>()(
  devtools((set) => ({
    fieldTypes: [],
    loading: false,
    error: null,
    setFieldTypes: (fieldTypes) => set({ fieldTypes }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  }))
);

// Create content entry store
export const useContentEntryStore = create<ContentEntryState>()(
  devtools((set) => ({
    contentEntries: [],
    selectedEntry: null,
    loading: false,
    error: null,
    setContentEntries: (contentEntries) => set({ contentEntries }),
    setSelectedEntry: (selectedEntry) => set({ selectedEntry }),
    addEntry: (entry) =>
      set((state) => ({ contentEntries: [...state.contentEntries, entry] })),
    updateEntry: (id, updatedEntry) =>
      set((state) => ({
        contentEntries: state.contentEntries.map((entry) =>
          entry.id === id ? { ...entry, ...updatedEntry } : entry
        ),
        selectedEntry:
          state.selectedEntry?.id === id
            ? { ...state.selectedEntry, ...updatedEntry }
            : state.selectedEntry,
      })),
    removeEntry: (id) =>
      set((state) => ({
        contentEntries: state.contentEntries.filter((entry) => entry.id !== id),
        selectedEntry:
          state.selectedEntry?.id === id ? null : state.selectedEntry,
      })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  }))
);

// Create media store
export const useMediaStore = create<MediaState>()(
  devtools((set) => ({
    assets: [],
    folders: [],
    selectedAsset: null,
    selectedFolder: null,
    loading: false,
    error: null,
    setAssets: (assets) => set({ assets }),
    setFolders: (folders) => set({ folders }),
    setSelectedAsset: (selectedAsset) => set({ selectedAsset }),
    setSelectedFolder: (selectedFolder) => set({ selectedFolder }),
    addAsset: (asset) =>
      set((state) => ({ assets: [...state.assets, asset] })),
    updateAsset: (id, updatedAsset) =>
      set((state) => ({
        assets: state.assets.map((asset) =>
          asset.id === id ? { ...asset, ...updatedAsset } : asset
        ),
        selectedAsset:
          state.selectedAsset?.id === id
            ? { ...state.selectedAsset, ...updatedAsset }
            : state.selectedAsset,
      })),
    removeAsset: (id) =>
      set((state) => ({
        assets: state.assets.filter((asset) => asset.id !== id),
        selectedAsset:
          state.selectedAsset?.id === id ? null : state.selectedAsset,
      })),
    addFolder: (folder) =>
      set((state) => ({ folders: [...state.folders, folder] })),
    updateFolder: (id, updatedFolder) =>
      set((state) => ({
        folders: state.folders.map((folder) =>
          folder.id === id ? { ...folder, ...updatedFolder } : folder
        ),
        selectedFolder:
          state.selectedFolder?.id === id
            ? { ...state.selectedFolder, ...updatedFolder }
            : state.selectedFolder,
      })),
    removeFolder: (id) =>
      set((state) => ({
        folders: state.folders.filter((folder) => folder.id !== id),
        selectedFolder:
          state.selectedFolder?.id === id ? null : state.selectedFolder,
      })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  }))
);
