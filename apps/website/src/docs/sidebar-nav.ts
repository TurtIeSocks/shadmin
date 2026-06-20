// AUTO-GENERATED (Phase 7b) by scripts/gen-sidebar-nav.mjs from the old Astro
// sidebar.config.mjs. Labels are each page's frontmatter title. RA-Enterprise
// entries dropped; ra-core entries kept as external links.
//
// After Phase 7c deletes apps/docs, edit THIS file directly (the generator can
// no longer run).

export interface DocsNavInternal {
  slug: string;
  label: string;
  external?: false;
}
export interface DocsNavExternal {
  href: string;
  label: string;
  external: true;
}
export type DocsNavItem = DocsNavInternal | DocsNavExternal;
export interface DocsNavGroup {
  label: string;
  items: DocsNavItem[];
}

export const docsNav: DocsNavGroup[] = [
  {
    label: "Getting Started",
    items: [
      {
        slug: "install",
        label: "Installation",
      },
      {
        slug: "quick-start-guide",
        label: "Quick Start",
      },
      {
        slug: "guides-and-concepts",
        label: "Guides and Concepts",
      },
      {
        slug: "migrating-from-ra-ui-materialui",
        label: "Migrating from ra-ui-materialui",
      },
      {
        slug: "changelog",
        label: "Changelog",
      },
    ],
  },
  {
    label: "App Config",
    items: [
      {
        slug: "admin",
        label: "Admin",
      },
      {
        slug: "resource",
        label: "Resource",
      },
      {
        slug: "custom-routes",
        label: "CustomRoutes",
      },
      {
        slug: "data-providers",
        label: "Data Fetching & Data Providers",
      },
      {
        slug: "security",
        label: "Security & Auth Providers",
      },
      {
        slug: "translation",
        label: "'I18N'",
      },
      {
        slug: "themes",
        label: "Themes",
      },
    ],
  },
  {
    label: "Page components",
    items: [
      {
        slug: "list",
        label: "List",
      },
      {
        slug: "infinite-list",
        label: "InfiniteList",
      },
      {
        slug: "simple-list",
        label: "SimpleList",
      },
      {
        slug: "edit",
        label: "Edit",
      },
      {
        slug: "show",
        label: "Show",
      },
      {
        slug: "simple-show-layout",
        label: "SimpleShowLayout",
      },
      {
        slug: "tabbed-show-layout",
        label: "TabbedShowLayout",
      },
      {
        slug: "create",
        label: "Create",
      },
    ],
  },
  {
    label: "Data Display",
    items: [
      {
        slug: "data-display",
        label: "Introduction",
      },
      {
        slug: "array-field",
        label: "ArrayField",
      },
      {
        slug: "badge-field",
        label: "BadgeField",
      },
      {
        slug: "boolean-field",
        label: "BooleanField",
      },
      {
        slug: "bulk-actions-toolbar",
        label: "BulkActionsToolbar",
      },
      {
        slug: "chip-field",
        label: "ChipField",
      },
      {
        slug: "color-field",
        label: "ColorField",
      },
      {
        slug: "columns-button",
        label: "ColumnsButton",
      },
      {
        slug: "count",
        label: "Count",
      },
      {
        slug: "cron-field",
        label: "CronField",
      },
      {
        slug: "currency-field",
        label: "CurrencyField",
      },
      {
        slug: "data-table",
        label: "DataTable",
      },
      {
        slug: "date-field",
        label: "DateField",
      },
      {
        slug: "duration-field",
        label: "DurationField",
      },
      {
        slug: "email-field",
        label: "EmailField",
      },
      {
        slug: "export-button",
        label: "ExportButton",
      },
      {
        slug: "file-field",
        label: "FileField",
      },
      {
        slug: "fields-selector",
        label: "FieldsSelector",
      },
      {
        slug: "filter-button",
        label: "FilterButton",
      },
      {
        slug: "filter-list",
        label: "FilterList",
      },
      {
        slug: "filter-list-item",
        label: "FilterListItem",
      },
      {
        slug: "filter-list-section",
        label: "FilterListSection",
      },
      {
        slug: "filter-live-form",
        label: "FilterLiveForm",
      },
      {
        slug: "filter-live-search",
        label: "FilterLiveSearch",
      },
      {
        slug: "function-field",
        label: "FunctionField",
      },
      {
        slug: "image-field",
        label: "ImageField",
      },
      {
        slug: "infinite-pagination",
        label: "InfinitePagination",
      },
      {
        slug: "json-field",
        label: "JsonField",
      },
      {
        slug: "list-pagination",
        label: "ListPagination",
      },
      {
        slug: "monaco-json-field",
        label: "MonacoJsonField",
      },
      {
        slug: "number-field",
        label: "NumberField",
      },
      {
        slug: "phone-field",
        label: "PhoneField",
      },
      {
        slug: "rating-field",
        label: "RatingField",
      },
      {
        slug: "record-field",
        label: "RecordField",
      },
      {
        slug: "reference-array-field",
        label: "ReferenceArrayField",
      },
      {
        slug: "reference-field",
        label: "ReferenceField",
      },
      {
        slug: "reference-many-count",
        label: "ReferenceManyCount",
      },
      {
        slug: "reference-many-field",
        label: "ReferenceManyField",
      },
      {
        slug: "reference-one-field",
        label: "ReferenceOneField",
      },
      {
        slug: "select-field",
        label: "SelectField",
      },
      {
        slug: "single-field-list",
        label: "SingleFieldList",
      },
      {
        slug: "simple-list-item",
        label: "SimpleListItem",
      },
      {
        slug: "simple-list-loading",
        label: "SimpleListLoading",
      },
      {
        slug: "sort-button",
        label: "SortButton",
      },
      {
        slug: "text-array-field",
        label: "TextArrayField",
      },
      {
        slug: "text-field",
        label: "TextField",
      },
      {
        slug: "toggle-filter-button",
        label: "ToggleFilterButton",
      },
      {
        slug: "translatable-fields",
        label: "TranslatableFields",
      },
      {
        slug: "url-field",
        label: "UrlField",
      },
      {
        slug: "usage-meter-field",
        label: "UsageMeterField",
      },
      {
        slug: "wrapper-field",
        label: "WrapperField",
      },
    ],
  },
  {
    label: "Data Edition",
    items: [
      {
        slug: "data-edition",
        label: "Introduction",
      },
      {
        slug: "array-input",
        label: "ArrayInput",
      },
      {
        slug: "autocomplete-array-input",
        label: "AutocompleteArrayInput",
      },
      {
        slug: "autocomplete-input",
        label: "AutocompleteInput",
      },
      {
        slug: "boolean-input",
        label: "BooleanInput",
      },
      {
        slug: "bulk-delete-button",
        label: "BulkDeleteButton",
      },
      {
        slug: "bulk-export-button",
        label: "BulkExportButton",
      },
      {
        slug: "bulk-update-button",
        label: "BulkUpdateButton",
      },
      {
        slug: "cancel-button",
        label: "CancelButton",
      },
      {
        slug: "checkbox-group-input",
        label: "CheckboxGroupInput",
      },
      {
        slug: "clone-button",
        label: "CloneButton",
      },
      {
        slug: "color-input",
        label: "ColorInput",
      },
      {
        slug: "create-button",
        label: "CreateButton",
      },
      {
        slug: "cron-input",
        label: "CronInput",
      },
      {
        slug: "currency-input",
        label: "CurrencyInput",
      },
      {
        slug: "datagrid-input",
        label: "DatagridInput",
      },
      {
        slug: "date-input",
        label: "DateInput",
      },
      {
        slug: "date-time-input",
        label: "DateTimeInput",
      },
      {
        slug: "delete-button",
        label: "DeleteButton",
      },
      {
        slug: "duration-input",
        label: "DurationInput",
      },
      {
        slug: "edit-button",
        label: "EditButton",
      },
      {
        slug: "filter-form",
        label: "FilterForm",
      },
      {
        slug: "file-input",
        label: "FileInput",
      },
      {
        slug: "image-input",
        label: "ImageInput",
      },
      {
        slug: "loading-input",
        label: "LoadingInput",
      },
      {
        slug: "monaco-json-input",
        label: "MonacoJsonInput",
      },
      {
        slug: "nullable-boolean-input",
        label: "NullableBooleanInput",
      },
      {
        slug: "number-input",
        label: "NumberInput",
      },
      {
        slug: "password-input",
        label: "PasswordInput",
      },
      {
        slug: "phone-input",
        label: "PhoneInput",
      },
      {
        slug: "prev-next-buttons",
        label: "PrevNextButtons",
      },
      {
        slug: "radio-button-group-input",
        label: "RadioButtonGroupInput",
      },
      {
        slug: "rating-input",
        label: "RatingInput",
      },
      {
        slug: "reference-array-input",
        label: "ReferenceArrayInput",
      },
      {
        slug: "reference-input",
        label: "ReferenceInput",
      },
      {
        slug: "resettable-text-input",
        label: "ResettableTextInput",
      },
      {
        slug: "save-button",
        label: "SaveButton",
      },
      {
        slug: "saved-queries",
        label: "SavedQueries",
      },
      {
        slug: "search-input",
        label: "SearchInput",
      },
      {
        slug: "select-all-button",
        label: "SelectAllButton",
      },
      {
        slug: "select-array-input",
        label: "SelectArrayInput",
      },
      {
        slug: "select-input",
        label: "SelectInput",
      },
      {
        slug: "show-button",
        label: "ShowButton",
      },
      {
        slug: "simple-form",
        label: "SimpleForm",
      },
      {
        slug: "simple-form-configurable",
        label: "SimpleFormConfigurable",
      },
      {
        slug: "simple-form-iterator",
        label: "SimpleFormIterator",
      },
      {
        slug: "tabbed-form",
        label: "TabbedForm",
      },
      {
        slug: "text-array-input",
        label: "TextArrayInput",
      },
      {
        slug: "text-input",
        label: "TextInput",
      },
      {
        slug: "time-input",
        label: "TimeInput",
      },
      {
        slug: "translatable-inputs",
        label: "TranslatableInputs",
      },
      {
        slug: "update-button",
        label: "UpdateButton",
      },
    ],
  },
  {
    label: "Map (Leaflet)",
    items: [
      {
        slug: "leaflet-admin",
        label: "Leaflet",
      },
      {
        slug: "leaflet-osm",
        label: "Leaflet OSM utilities",
      },
      {
        slug: "map-with-search",
        label: "MapWithSearch",
      },
      {
        slug: "geocoding-input",
        label: "GeocodingInput",
      },
      {
        slug: "reverse-geocode-field",
        label: "ReverseGeocodeField",
      },
      {
        slug: "bbox-field",
        label: "BBoxField",
      },
      {
        slug: "bbox-input",
        label: "BBoxInput",
      },
      {
        slug: "lat-lng-field",
        label: "LatLngField",
      },
      {
        slug: "lat-lng-input",
        label: "LatLngInput",
      },
      {
        slug: "point-field",
        label: "PointField",
      },
      {
        slug: "point-input",
        label: "PointInput",
      },
      {
        slug: "multi-point-field",
        label: "MultiPointField",
      },
      {
        slug: "multi-point-input",
        label: "MultiPointInput",
      },
      {
        slug: "line-string-field",
        label: "LineStringField",
      },
      {
        slug: "line-string-input",
        label: "LineStringInput",
      },
      {
        slug: "multi-line-string-field",
        label: "MultiLineStringField",
      },
      {
        slug: "multi-line-string-input",
        label: "MultiLineStringInput",
      },
      {
        slug: "polygon-field",
        label: "PolygonField",
      },
      {
        slug: "polygon-input",
        label: "PolygonInput",
      },
      {
        slug: "multi-polygon-field",
        label: "MultiPolygonField",
      },
      {
        slug: "multi-polygon-input",
        label: "MultiPolygonInput",
      },
      {
        slug: "geometry-collection-field",
        label: "GeometryCollectionField",
      },
      {
        slug: "geometry-collection-input",
        label: "GeometryCollectionInput",
      },
      {
        slug: "feature-field",
        label: "FeatureField",
      },
      {
        slug: "feature-input",
        label: "FeatureInput",
      },
      {
        slug: "feature-collection-field",
        label: "FeatureCollectionField",
      },
      {
        slug: "feature-collection-input",
        label: "FeatureCollectionInput",
      },
      {
        slug: "geojson-field",
        label: "GeoJSONField",
      },
      {
        slug: "geojson-input",
        label: "GeoJSONInput",
      },
      {
        slug: "osm-feature-add",
        label: "OsmFeatureAdd",
      },
      {
        slug: "osm-feature-subtract",
        label: "OsmFeatureSubtract",
      },
      {
        slug: "simplify-input",
        label: "SimplifyInput",
      },
      {
        slug: "use-geoman-rhf",
        label: "useGeomanRHF",
      },
    ],
  },
  {
    label: "Extras",
    items: [
      {
        slug: "api-key-field",
        label: "ApiKeyField",
      },
      {
        slug: "api-key-input",
        label: "ApiKeyInput",
      },
      {
        slug: "approval-queue",
        label: "ApprovalQueue",
      },
      {
        slug: "assistant",
        label: "Assistant",
      },
      {
        slug: "bulk-edit-drawer",
        label: "BulkEditDrawer",
      },
      {
        slug: "calendar-list",
        label: "CalendarList",
      },
      {
        slug: "command-menu",
        label: "CommandMenu",
      },
      {
        slug: "comments-thread",
        label: "CommentsThread",
      },
      {
        slug: "dashboard-charts",
        label: "DashboardCharts",
      },
      {
        slug: "data-provider-devtools",
        label: "DataProviderDevtools",
      },
      {
        slug: "diff-viewer",
        label: "DiffViewer",
      },
      {
        slug: "dual-approval-button",
        label: "DualApprovalButton",
      },
      {
        slug: "i18n-key-editor",
        label: "I18nKeyEditor",
      },
      {
        slug: "in-place-editor",
        label: "InPlaceEditor",
      },
      {
        slug: "job-monitor",
        label: "JobMonitor",
      },
      {
        slug: "kanban-board",
        label: "KanbanBoard",
      },
      {
        slug: "layout-builder",
        label: "LayoutBuilder",
      },
      {
        slug: "onboarding-tour",
        label: "OnboardingTour",
      },
      {
        slug: "permission-matrix",
        label: "PermissionMatrix",
      },
      {
        slug: "pivot-grid",
        label: "PivotGrid",
      },
      {
        slug: "presence-bar",
        label: "PresenceBar",
      },
      {
        slug: "record-timeline",
        label: "RecordTimeline",
      },
      {
        slug: "schema-driven-view",
        label: "SchemaDrivenView",
      },
      {
        slug: "status-transition-button",
        label: "StatusTransitionButton",
      },
      {
        slug: "subscription-plan-field",
        label: "SubscriptionPlanField",
      },
      {
        slug: "subscription-plan-picker",
        label: "SubscriptionPlanPicker",
      },
      {
        slug: "theme-studio",
        label: "ThemeStudio",
      },
      {
        slug: "tree-list",
        label: "TreeList",
      },
      {
        slug: "webhook-endpoint-field",
        label: "WebhookEndpointField",
      },
      {
        slug: "webhook-endpoint-input",
        label: "WebhookEndpointInput",
      },
      {
        slug: "wizard-form",
        label: "WizardForm",
      },
    ],
  },
  {
    label: "CSV Import",
    items: [
      {
        slug: "csv-import",
        label: "CsvImport",
      },
    ],
  },
  {
    label: "MDX Editor",
    items: [
      {
        slug: "mdx-field",
        label: "MdxField",
      },
      {
        slug: "mdx-input",
        label: "MdxInput",
      },
    ],
  },
  {
    label: "Rich Text Input",
    items: [
      {
        slug: "rich-text-input",
        label: "RichTextInput",
      },
      {
        slug: "rich-text-field",
        label: "RichTextField",
      },
    ],
  },
  {
    label: "Block Editor",
    items: [
      {
        slug: "block-editor-input",
        label: "BlockEditorInput",
      },
      {
        slug: "block-doc-field",
        label: "BlockDocField",
      },
      {
        slug: "custom-blocks",
        label: "Custom Blocks",
      },
    ],
  },
  {
    label: "Realtime",
    items: [
      {
        slug: "realtime",
        label: "Realtime",
      },
      {
        slug: "realtime-data-provider",
        label: "realtimeDataProvider",
      },
      {
        slug: "add-events-for-mutations",
        label: "addEventsForMutations",
      },
      {
        slug: "broadcast-channel-transport",
        label: "broadcastChannelTransport",
      },
      {
        slug: "sse-transport",
        label: "sseTransport",
      },
      {
        slug: "websocket-transport",
        label: "webSocketTransport",
      },
      {
        slug: "fake-transport",
        label: "fakeTransport",
      },
      {
        slug: "list-live",
        label: "ListLive",
      },
      {
        slug: "edit-live",
        label: "EditLive",
      },
      {
        slug: "show-live",
        label: "ShowLive",
      },
      {
        slug: "menu-live",
        label: "MenuLive",
      },
      {
        slug: "in-memory-lock-provider",
        label: "inMemoryLockProvider",
      },
      {
        slug: "lock-on-mount",
        label: "LockOnMount",
      },
      {
        slug: "lock-status",
        label: "LockStatus",
      },
      {
        slug: "use-lock",
        label: "useLock",
      },
      {
        slug: "use-unlock",
        label: "useUnlock",
      },
      {
        slug: "use-lock-on-mount",
        label: "useLockOnMount",
      },
      {
        slug: "use-get-lock",
        label: "useGetLock",
      },
      {
        slug: "use-get-lock-live",
        label: "useGetLockLive",
      },
      {
        slug: "use-get-locks",
        label: "useGetLocks",
      },
      {
        slug: "use-get-locks-live",
        label: "useGetLocksLive",
      },
      {
        slug: "use-subscribe",
        label: "useSubscribe",
      },
      {
        slug: "use-subscribe-callback",
        label: "useSubscribeCallback",
      },
      {
        slug: "use-subscribe-to-record",
        label: "useSubscribeToRecord",
      },
      {
        slug: "use-subscribe-to-record-list",
        label: "useSubscribeToRecordList",
      },
      {
        slug: "use-publish",
        label: "usePublish",
      },
      {
        slug: "use-realtime-status",
        label: "useRealtimeStatus",
      },
      {
        slug: "use-on-reconnect",
        label: "useOnReconnect",
      },
      {
        slug: "use-get-list-live",
        label: "useGetListLive",
      },
      {
        slug: "use-get-one-live",
        label: "useGetOneLive",
      },
      {
        slug: "use-get-many-live",
        label: "useGetManyLive",
      },
    ],
  },
  {
    label: "UI & Layout",
    items: [
      {
        slug: "access-denied",
        label: "AccessDenied",
      },
      {
        slug: "app-bar",
        label: "AppBar",
      },
      {
        slug: "app-sidebar",
        label: "AppSidebar",
      },
      {
        slug: "application-updated-notification",
        label: "ApplicationUpdatedNotification",
      },
      {
        slug: "auth-callback",
        label: "AuthCallback",
      },
      {
        slug: "auth-error",
        label: "AuthError",
      },
      {
        slug: "authentication-error",
        label: "AuthenticationError",
      },
      {
        slug: "auth-layout",
        label: "AuthLayout",
      },
      {
        slug: "breadcrumb",
        label: "Breadcrumb",
      },
      {
        slug: "card-content-inner",
        label: "CardContentInner",
      },
      {
        slug: "check-for-application-update",
        label: "CheckForApplicationUpdate",
      },
      {
        slug: "confirm",
        label: "Confirm",
      },
      {
        slug: "dashboard-menu-item",
        label: "DashboardMenuItem",
      },
      {
        slug: "device-test-wrapper",
        label: "DeviceTestWrapper",
      },
      {
        slug: "empty",
        label: "Empty",
      },
      {
        slug: "error",
        label: "Error",
      },
      {
        slug: "hide-on-scroll",
        label: "HideOnScroll",
      },
      {
        slug: "inspector",
        label: "Inspector",
      },
      {
        slug: "keyboard-shortcut",
        label: "KeyboardShortcut",
      },
      {
        slug: "labeled",
        label: "Labeled",
      },
      {
        slug: "layout",
        label: "Layout",
      },
      {
        slug: "linear-progress",
        label: "LinearProgress",
      },
      {
        slug: "link",
        label: "Link",
      },
      {
        slug: "list-actions",
        label: "ListActions",
      },
      {
        slug: "list-button",
        label: "ListButton",
      },
      {
        slug: "list-no-results",
        label: "ListNoResults",
      },
      {
        slug: "list-toolbar",
        label: "ListToolbar",
      },
      {
        slug: "loading",
        label: "Loading",
      },
      {
        slug: "loading-indicator",
        label: "LoadingIndicator",
      },
      {
        slug: "loading-page",
        label: "LoadingPage",
      },
      {
        slug: "locales-menu-button",
        label: "LocalesMenuButton",
      },
      {
        slug: "login-form",
        label: "LoginForm",
      },
      {
        slug: "login-page",
        label: "LoginPage",
      },
      {
        slug: "login-with-email",
        label: "LoginWithEmail",
      },
      {
        slug: "logout",
        label: "Logout",
      },
      {
        slug: "menu",
        label: "Menu",
      },
      {
        slug: "menu-item-link",
        label: "MenuItemLink",
      },
      {
        slug: "not-found",
        label: "NotFound",
      },
      {
        slug: "notification",
        label: "Notification",
      },
      {
        slug: "offline",
        label: "Offline",
      },
      {
        slug: "placeholder",
        label: "Placeholder",
      },
      {
        slug: "ready",
        label: "Ready",
      },
      {
        slug: "reference-error",
        label: "ReferenceError",
      },
      {
        slug: "refresh-button",
        label: "RefreshButton",
      },
      {
        slug: "refresh-icon-button",
        label: "RefreshIconButton",
      },
      {
        slug: "resource-menu-item",
        label: "ResourceMenuItem",
      },
      {
        slug: "resource-menu-item-group",
        label: "ResourceMenuItemGroup",
      },
      {
        slug: "sidebar-toggle-button",
        label: "SidebarToggleButton",
      },
      {
        slug: "skip-navigation-button",
        label: "SkipNavigationButton",
      },
      {
        slug: "theme-mode-toggle",
        label: "ThemeModeToggle",
      },
      {
        slug: "title",
        label: "Title",
      },
      {
        slug: "title-portal",
        label: "TitlePortal",
      },
      {
        slug: "toolbar",
        label: "Toolbar",
      },
      {
        slug: "top-toolbar",
        label: "TopToolbar",
      },
      {
        slug: "user-menu",
        label: "UserMenu",
      },
    ],
  },
  {
    label: "Supabase",
    items: [
      {
        slug: "supabase/getting-started",
        label: "Supabase Integration",
      },
      {
        slug: "supabase/i18n",
        label: "Supabase i18n",
      },
      {
        slug: "supabase/admin-guesser",
        label: "AdminGuesser",
      },
      {
        slug: "supabase/list-guesser",
        label: "SupabaseListGuesser",
      },
      {
        slug: "supabase/edit-guesser",
        label: "SupabaseEditGuesser",
      },
      {
        slug: "supabase/show-guesser",
        label: "SupabaseShowGuesser",
      },
      {
        slug: "supabase/create-guesser",
        label: "SupabaseCreateGuesser",
      },
      {
        slug: "supabase/login-page",
        label: "SupabaseLoginPage",
      },
      {
        slug: "supabase/forgot-password-page",
        label: "ForgotPasswordPage",
      },
      {
        slug: "supabase/set-password-page",
        label: "SetPasswordPage",
      },
      {
        slug: "supabase/social-auth-button",
        label: "SocialAuthButton",
      },
    ],
  },
  {
    label: "Misc",
    items: [
      {
        slug: "mcp",
        label: "MCP Server",
      },
    ],
  },
];
