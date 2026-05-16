import {
  BadgeField,
  BooleanField,
  CardContentInner,
  ChipField,
  CreateButton,
  DateField,
  EmailField,
  FunctionField,
  Labeled,
  LinearProgress,
  LoadingIndicator,
  NumberField,
  Placeholder,
  RecordField,
  TextField,
  TopToolbar,
  UrlField,
  WrapperField,
} from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button as UiButton } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RecordContextProvider } from "ra-core";

interface GalleryComponent {
  name: string;
  family: string;
  docs: string;
}

const galleryComponents: GalleryComponent[] = [
  { name: "AccessDenied", family: "Auth and feedback", docs: "AccessDenied" },
  { name: "Admin", family: "App shell", docs: "Admin" },
  { name: "AppBar", family: "App shell", docs: "AppBar" },
  { name: "AppSidebar", family: "App shell", docs: "AppSidebar" },
  {
    name: "ApplicationUpdatedNotification",
    family: "Auth and feedback",
    docs: "ApplicationUpdatedNotification",
  },
  { name: "ArrayField", family: "Fields", docs: "ArrayField" },
  { name: "ArrayInput", family: "Inputs", docs: "ArrayInput" },
  { name: "AuthCallback", family: "Auth and feedback", docs: "AuthCallback" },
  { name: "AuthError", family: "Auth and feedback", docs: "AuthError" },
  { name: "AuthLayout", family: "Auth and feedback", docs: "AuthLayout" },
  {
    name: "AuthenticationError",
    family: "Auth and feedback",
    docs: "AuthenticationError",
  },
  {
    name: "AutocompleteArrayInput",
    family: "Inputs",
    docs: "AutocompleteArrayInput",
  },
  { name: "AutocompleteInput", family: "Inputs", docs: "AutocompleteInput" },
  { name: "BadgeField", family: "Fields", docs: "BadgeField" },
  { name: "BooleanField", family: "Fields", docs: "BooleanField" },
  { name: "BooleanInput", family: "Inputs", docs: "BooleanInput" },
  { name: "Breadcrumb", family: "App shell", docs: "Breadcrumb" },
  {
    name: "BulkActionsToolbar",
    family: "Buttons and actions",
    docs: "BulkActionsToolbar",
  },
  {
    name: "BulkDeleteButton",
    family: "Buttons and actions",
    docs: "BulkDeleteButton",
  },
  {
    name: "BulkExportButton",
    family: "Buttons and actions",
    docs: "BulkExportButton",
  },
  {
    name: "BulkUpdateButton",
    family: "Buttons and actions",
    docs: "BulkUpdateButton",
  },
  { name: "CancelButton", family: "Buttons and actions", docs: "CancelButton" },
  { name: "CardContentInner", family: "Layout", docs: "CardContentInner" },
  {
    name: "CheckForApplicationUpdate",
    family: "Auth and feedback",
    docs: "CheckForApplicationUpdate",
  },
  { name: "CheckboxGroupInput", family: "Inputs", docs: "CheckboxGroupInput" },
  { name: "ChipField", family: "Fields", docs: "ChipField" },
  { name: "CloneButton", family: "Buttons and actions", docs: "CloneButton" },
  {
    name: "ColumnsButton",
    family: "Buttons and actions",
    docs: "ColumnsButton",
  },
  { name: "Confirm", family: "Auth and feedback", docs: "Confirm" },
  { name: "Count", family: "Fields", docs: "Count" },
  { name: "Create", family: "Views", docs: "Create" },
  { name: "CreateButton", family: "Buttons and actions", docs: "CreateButton" },
  {
    name: "DashboardMenuItem",
    family: "App shell",
    docs: "DashboardMenuItem",
  },
  {
    name: "DataProviderDevtools",
    family: "Inspector",
    docs: "DataProviderDevtools",
  },
  { name: "DataTable", family: "Lists and references", docs: "DataTable" },
  { name: "DatagridInput", family: "Inputs", docs: "DatagridInput" },
  { name: "DateField", family: "Fields", docs: "DateField" },
  { name: "DateInput", family: "Inputs", docs: "DateInput" },
  { name: "DateTimeInput", family: "Inputs", docs: "DateTimeInput" },
  { name: "DeleteButton", family: "Buttons and actions", docs: "DeleteButton" },
  { name: "DeviceTestWrapper", family: "Layout", docs: "DeviceTestWrapper" },
  { name: "Edit", family: "Views", docs: "Edit" },
  { name: "EditButton", family: "Buttons and actions", docs: "EditButton" },
  { name: "EditGuesser", family: "Views", docs: "Edit" },
  { name: "EmailField", family: "Fields", docs: "EmailField" },
  { name: "Empty", family: "Auth and feedback", docs: "Empty" },
  { name: "Error", family: "Auth and feedback", docs: "Error" },
  { name: "ExportButton", family: "Buttons and actions", docs: "ExportButton" },
  { name: "FieldsSelector", family: "Inspector", docs: "FieldsSelector" },
  { name: "FileField", family: "Fields", docs: "FileField" },
  { name: "FileInput", family: "Inputs", docs: "FileInput" },
  { name: "FilterButton", family: "Filters", docs: "FilterButton" },
  { name: "FilterForm", family: "Filters", docs: "FilterForm" },
  { name: "FilterList", family: "Filters", docs: "FilterList" },
  { name: "FilterListItem", family: "Filters", docs: "FilterListItem" },
  { name: "FilterListSection", family: "Filters", docs: "FilterListSection" },
  { name: "FilterLiveForm", family: "Filters", docs: "FilterLiveForm" },
  { name: "FilterLiveSearch", family: "Filters", docs: "FilterLiveSearch" },
  { name: "FunctionField", family: "Fields", docs: "FunctionField" },
  { name: "GuesserEmpty", family: "Views", docs: "ListGuesser" },
  { name: "HideOnScroll", family: "Layout", docs: "HideOnScroll" },
  { name: "I18nKeyEditor", family: "App shell", docs: "I18nKeyEditor" },
  { name: "ImageField", family: "Fields", docs: "ImageField" },
  { name: "ImageInput", family: "Inputs", docs: "ImageInput" },
  { name: "InPlaceEditor", family: "Inputs", docs: "InPlaceEditor" },
  {
    name: "InfiniteList",
    family: "Lists and references",
    docs: "InfiniteList",
  },
  {
    name: "InfinitePagination",
    family: "Lists and references",
    docs: "InfinitePagination",
  },
  { name: "Inspector", family: "Inspector", docs: "Inspector" },
  { name: "KeyboardShortcut", family: "Layout", docs: "KeyboardShortcut" },
  { name: "Labeled", family: "Layout", docs: "Labeled" },
  { name: "Layout", family: "App shell", docs: "Layout" },
  { name: "LayoutBuilder", family: "Layout", docs: "LayoutBuilder" },
  {
    name: "LinearProgress",
    family: "Auth and feedback",
    docs: "LinearProgress",
  },
  { name: "Link", family: "Layout", docs: "Link" },
  { name: "List", family: "Views", docs: "List" },
  { name: "ListActions", family: "Lists and references", docs: "ListActions" },
  { name: "ListButton", family: "Buttons and actions", docs: "ListButton" },
  { name: "ListGuesser", family: "Views", docs: "ListGuesser" },
  {
    name: "ListNoResults",
    family: "Lists and references",
    docs: "ListNoResults",
  },
  {
    name: "ListPagination",
    family: "Lists and references",
    docs: "ListPagination",
  },
  { name: "ListToolbar", family: "Lists and references", docs: "ListToolbar" },
  { name: "Loading", family: "Auth and feedback", docs: "Loading" },
  {
    name: "LoadingIndicator",
    family: "Auth and feedback",
    docs: "LoadingIndicator",
  },
  { name: "LoadingInput", family: "Inputs", docs: "LoadingInput" },
  { name: "LocalesMenuButton", family: "App shell", docs: "LocalesMenuButton" },
  { name: "LoginForm", family: "Auth and feedback", docs: "LoginForm" },
  { name: "LoginPage", family: "Auth and feedback", docs: "LoginPage" },
  {
    name: "LoginWithEmail",
    family: "Auth and feedback",
    docs: "LoginWithEmail",
  },
  { name: "Logout", family: "Auth and feedback", docs: "Logout" },
  { name: "Menu", family: "App shell", docs: "Menu" },
  { name: "MenuItemLink", family: "App shell", docs: "MenuItemLink" },
  { name: "NotFound", family: "Auth and feedback", docs: "NotFound" },
  { name: "Notification", family: "Auth and feedback", docs: "Notification" },
  {
    name: "NullableBooleanInput",
    family: "Inputs",
    docs: "NullableBooleanInput",
  },
  { name: "NumberField", family: "Fields", docs: "NumberField" },
  { name: "NumberInput", family: "Inputs", docs: "NumberInput" },
  { name: "Offline", family: "Auth and feedback", docs: "Offline" },
  { name: "PasswordInput", family: "Inputs", docs: "PasswordInput" },
  { name: "Placeholder", family: "Layout", docs: "Placeholder" },
  {
    name: "PrevNextButtons",
    family: "Buttons and actions",
    docs: "PrevNextButtons",
  },
  {
    name: "RadioButtonGroupInput",
    family: "Inputs",
    docs: "RadioButtonGroupInput",
  },
  { name: "Ready", family: "Auth and feedback", docs: "Ready" },
  { name: "RecordField", family: "Fields", docs: "RecordField" },
  {
    name: "ReferenceArrayField",
    family: "Lists and references",
    docs: "ReferenceArrayField",
  },
  {
    name: "ReferenceArrayInput",
    family: "Inputs",
    docs: "ReferenceArrayInput",
  },
  {
    name: "ReferenceField",
    family: "Lists and references",
    docs: "ReferenceField",
  },
  { name: "ReferenceInput", family: "Inputs", docs: "ReferenceInput" },
  {
    name: "ReferenceManyCount",
    family: "Lists and references",
    docs: "ReferenceManyCount",
  },
  {
    name: "ReferenceManyField",
    family: "Lists and references",
    docs: "ReferenceManyField",
  },
  {
    name: "ReferenceOneField",
    family: "Lists and references",
    docs: "ReferenceOneField",
  },
  {
    name: "RefreshButton",
    family: "Buttons and actions",
    docs: "RefreshButton",
  },
  {
    name: "RefreshIconButton",
    family: "Buttons and actions",
    docs: "RefreshIconButton",
  },
  {
    name: "ResettableTextInput",
    family: "Inputs",
    docs: "ResettableTextInput",
  },
  { name: "ResourceMenuItem", family: "App shell", docs: "ResourceMenuItem" },
  { name: "RichTextField", family: "Fields", docs: "RichTextField" },
  { name: "SaveButton", family: "Buttons and actions", docs: "SaveButton" },
  { name: "SavedQueries", family: "Filters", docs: "SavedQueries" },
  { name: "SearchInput", family: "Inputs", docs: "SearchInput" },
  {
    name: "SelectAllButton",
    family: "Buttons and actions",
    docs: "SelectAllButton",
  },
  { name: "SelectArrayInput", family: "Inputs", docs: "SelectArrayInput" },
  { name: "SelectField", family: "Fields", docs: "SelectField" },
  { name: "SelectInput", family: "Inputs", docs: "SelectInput" },
  { name: "Show", family: "Views", docs: "Show" },
  { name: "ShowButton", family: "Buttons and actions", docs: "ShowButton" },
  { name: "ShowGuesser", family: "Views", docs: "Show" },
  {
    name: "SidebarToggleButton",
    family: "App shell",
    docs: "SidebarToggleButton",
  },
  { name: "SimpleForm", family: "Inputs", docs: "SimpleForm" },
  {
    name: "SimpleFormConfigurable",
    family: "Inspector",
    docs: "SimpleFormConfigurable",
  },
  { name: "SimpleFormIterator", family: "Inputs", docs: "SimpleFormIterator" },
  { name: "SimpleList", family: "Lists and references", docs: "SimpleList" },
  {
    name: "SimpleListItem",
    family: "Lists and references",
    docs: "SimpleListItem",
  },
  {
    name: "SimpleListLoading",
    family: "Lists and references",
    docs: "SimpleListLoading",
  },
  { name: "SimpleShowLayout", family: "Views", docs: "SimpleShowLayout" },
  {
    name: "SingleFieldList",
    family: "Lists and references",
    docs: "SingleFieldList",
  },
  {
    name: "SkipNavigationButton",
    family: "Buttons and actions",
    docs: "SkipNavigationButton",
  },
  { name: "SortButton", family: "Buttons and actions", docs: "SortButton" },
  {
    name: "SubscriptionPlanField",
    family: "Fields",
    docs: "SubscriptionPlanField",
  },
  {
    name: "SubscriptionPlanPicker",
    family: "Inputs",
    docs: "SubscriptionPlanPicker",
  },
  { name: "TabbedForm", family: "Inputs", docs: "TabbedForm" },
  { name: "TabbedShowLayout", family: "Views", docs: "TabbedShowLayout" },
  { name: "TextArrayField", family: "Fields", docs: "TextArrayField" },
  { name: "TextArrayInput", family: "Inputs", docs: "TextArrayInput" },
  { name: "TextField", family: "Fields", docs: "TextField" },
  { name: "TextInput", family: "Inputs", docs: "TextInput" },
  { name: "ThemeModeToggle", family: "App shell", docs: "ThemeModeToggle" },
  { name: "TimeInput", family: "Inputs", docs: "TimeInput" },
  { name: "Title", family: "Layout", docs: "Title" },
  { name: "TitlePortal", family: "Layout", docs: "TitlePortal" },
  { name: "ToggleFilterButton", family: "Filters", docs: "ToggleFilterButton" },
  { name: "Toolbar", family: "Inputs", docs: "Toolbar" },
  { name: "TopToolbar", family: "Buttons and actions", docs: "TopToolbar" },
  { name: "TranslatableFields", family: "Fields", docs: "TranslatableFields" },
  { name: "TranslatableInputs", family: "Inputs", docs: "TranslatableInputs" },
  { name: "UpdateButton", family: "Buttons and actions", docs: "UpdateButton" },
  { name: "UrlField", family: "Fields", docs: "UrlField" },
  { name: "UserMenu", family: "App shell", docs: "UserMenu" },
  { name: "WrapperField", family: "Fields", docs: "WrapperField" },
];

const sampleRecord = {
  id: 1,
  active: true,
  badge: "Published",
  created_at: "2026-05-12T08:30:00.000Z",
  email: "jane@example.com",
  name: "Jane Doe",
  price: 129.99,
  role: "Admin",
  tags: ["retail", "priority", "newsletter"],
  website: "https://example.com",
};

const groupedComponents = galleryComponents.reduce<
  Record<string, GalleryComponent[]>
>((groups, component) => {
  groups[component.family] ??= [];
  groups[component.family].push(component);
  return groups;
}, {});

export const ComponentGallery = () => (
  <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 py-6">
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-normal">
        Component gallery
      </h1>
      <p className="max-w-3xl text-sm text-muted-foreground">
        Public admin components grouped by family, with live examples for common
        field, action, feedback, and layout states.
      </p>
    </div>

    <section className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Before</CardTitle>
          <CardDescription>
            Components were mostly discoverable through CRUD screens.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A field could have docs but no mounted browser example, and a button
            could have a story without any demo route entry.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>After</CardTitle>
          <CardDescription>
            Each public component has a demo gallery entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use this page for quick visual scanning, then open Storybook for
            deep interaction variants.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Coverage</CardTitle>
          <CardDescription>
            {galleryComponents.length} public entries
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Object.keys(groupedComponents).map((family) => (
            <Badge key={family} variant="secondary">
              {family}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </section>

    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Fields</CardTitle>
          <CardDescription>Record-backed display states.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecordContextProvider value={sampleRecord}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Labeled label="TextField">
                <TextField source="name" />
              </Labeled>
              <Labeled label="RecordField">
                <RecordField source="role" />
              </Labeled>
              <Labeled label="BadgeField">
                <BadgeField source="badge" />
              </Labeled>
              <Labeled label="ChipField">
                <ChipField source="role" />
              </Labeled>
              <Labeled label="BooleanField">
                <BooleanField source="active" />
              </Labeled>
              <Labeled label="DateField">
                <DateField source="created_at" showTime />
              </Labeled>
              <Labeled label="NumberField">
                <NumberField
                  source="price"
                  options={{ style: "currency", currency: "USD" }}
                />
              </Labeled>
              <Labeled label="EmailField">
                <EmailField source="email" />
              </Labeled>
              <Labeled label="UrlField">
                <UrlField source="website" />
              </Labeled>
              <Labeled label="FunctionField">
                <FunctionField<typeof sampleRecord>
                  render={(record) => `${record.name} (${record.role})`}
                />
              </Labeled>
              <WrapperField label="WrapperField">
                <TextField source="name" />
                <span className="text-muted-foreground"> / </span>
                <TextField source="role" />
              </WrapperField>
            </div>
          </RecordContextProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions and feedback</CardTitle>
          <CardDescription>
            Common controls without data mutation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <TopToolbar>
            <CreateButton resource="products" />
            <UiButton variant="outline">Secondary action</UiButton>
          </TopToolbar>
          <div className="space-y-2">
            <LinearProgress />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LoadingIndicator />
              Loading indicator
            </div>
          </div>
          <CardContentInner>
            <Placeholder>No record selected</Placeholder>
          </CardContentInner>
          <div className="flex max-w-sm flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="gallery-input">
              Base shadcn input used by admin inputs
            </label>
            <Input id="gallery-input" placeholder="Filter components" />
          </div>
        </CardContent>
      </Card>
    </section>

    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Object.entries(groupedComponents).map(([family, components]) => (
        <Card key={family}>
          <CardHeader>
            <CardTitle>{family}</CardTitle>
            <CardDescription>{components.length} components</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {components.map((component) => (
              <Badge key={component.name} variant="outline">
                {component.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      ))}
    </section>
  </div>
);
