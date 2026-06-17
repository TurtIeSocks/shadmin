import { useState } from "react";
import { CoreAdminContext } from "shadmin-core";
import { ThemeProvider } from "@/components/admin/theme-provider";
import {
  PermissionMatrix,
  type PermissionsState,
} from "@/components/extras/permission-matrix";
import { i18nProvider } from "@/lib/i18n-provider";

const roles = ["admin", "editor", "viewer"];
const resources = ["products", "orders", "users"];
const actions = ["list", "show", "create", "edit", "delete"];

const StoryWrapper = ({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: "system" | "light" | "dark";
}) => (
  <ThemeProvider defaultTheme={theme}>
    <CoreAdminContext i18nProvider={i18nProvider}>{children}</CoreAdminContext>
  </ThemeProvider>
);

const storyArgs = {
  args: { theme: "system" as const },
  argTypes: {
    theme: {
      type: "select" as const,
      options: ["light", "dark", "system"],
    },
  },
};

export default {
  title: "Extras/PermissionMatrix",
  parameters: { docs: { codePanel: true } },
};

export const Basic = ({ theme }: { theme: "system" | "light" | "dark" }) => {
  const [value, setValue] = useState<PermissionsState>({});
  return (
    <StoryWrapper theme={theme}>
      <div className="space-y-4 p-4">
        <PermissionMatrix
          roles={roles}
          resources={resources}
          actions={actions}
          value={value}
          onChange={setValue}
        />
        <pre
          data-testid="state-display"
          className="rounded-md border bg-muted/40 p-3 text-xs"
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </StoryWrapper>
  );
};
Object.assign(Basic, storyArgs);

export const WithInitialState = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [value, setValue] = useState<PermissionsState>({
    admin: {
      products: {
        list: true,
        show: true,
        create: true,
        edit: true,
        delete: true,
      },
      orders: {
        list: true,
        show: true,
        create: false,
        edit: true,
        delete: false,
      },
      users: { list: true, show: true, create: true, edit: true, delete: true },
    },
    editor: {
      products: {
        list: true,
        show: true,
        create: true,
        edit: true,
        delete: false,
      },
      orders: {
        list: true,
        show: true,
        create: false,
        edit: false,
        delete: false,
      },
      users: {
        list: true,
        show: false,
        create: false,
        edit: false,
        delete: false,
      },
    },
    viewer: {
      products: {
        list: true,
        show: true,
        create: false,
        edit: false,
        delete: false,
      },
      orders: {
        list: true,
        show: true,
        create: false,
        edit: false,
        delete: false,
      },
      users: {
        list: false,
        show: false,
        create: false,
        edit: false,
        delete: false,
      },
    },
  });
  return (
    <StoryWrapper theme={theme}>
      <div className="space-y-4 p-4">
        <PermissionMatrix
          roles={roles}
          resources={resources}
          actions={actions}
          value={value}
          onChange={setValue}
        />
        <pre
          data-testid="state-display"
          className="rounded-md border bg-muted/40 p-3 text-xs"
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </StoryWrapper>
  );
};
Object.assign(WithInitialState, storyArgs);

export const ReadOnly = ({ theme }: { theme: "system" | "light" | "dark" }) => {
  const value: PermissionsState = {
    admin: {
      products: {
        list: true,
        show: true,
        create: true,
        edit: true,
        delete: true,
      },
    },
  };
  return (
    <StoryWrapper theme={theme}>
      <div className="p-4">
        <PermissionMatrix
          roles={roles}
          resources={resources}
          actions={actions}
          value={value}
          onChange={() => {}}
          readOnly
        />
      </div>
    </StoryWrapper>
  );
};
Object.assign(ReadOnly, storyArgs);

export const CustomLabels = ({
  theme,
}: {
  theme: "system" | "light" | "dark";
}) => {
  const [value, setValue] = useState<PermissionsState>({});
  return (
    <StoryWrapper theme={theme}>
      <div className="space-y-4 p-4">
        <PermissionMatrix
          roles={[
            { id: "admin", label: "Administrator" },
            { id: "editor", label: "Content Editor" },
          ]}
          resources={[
            { id: "products", label: "Products Catalog" },
            { id: "orders", label: "Order Management" },
          ]}
          actions={actions}
          value={value}
          onChange={setValue}
        />
        <pre
          data-testid="state-display"
          className="rounded-md border bg-muted/40 p-3 text-xs"
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </StoryWrapper>
  );
};
Object.assign(CustomLabels, storyArgs);

export const NoRoles = ({ theme }: { theme: "system" | "light" | "dark" }) => {
  return (
    <StoryWrapper theme={theme}>
      <div className="p-4">
        <PermissionMatrix
          roles={[]}
          resources={resources}
          actions={actions}
          value={{}}
          onChange={() => {}}
        />
      </div>
    </StoryWrapper>
  );
};
Object.assign(NoRoles, storyArgs);
