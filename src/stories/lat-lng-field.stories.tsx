import React from "react";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";
import { CoreAdminContext, RecordContextProvider } from "ra-core";

import { LatLngField, LatLngInput } from "@/components/lat-lng-field";
import { ThemeProvider, SimpleForm, Create } from "@/components/admin";

export default { title: "Fields/LatLngField" };

const i18nProvider = polyglotI18nProvider(() => englishMessages);

const parisRecord = {
  id: 1,
  name: "Paris",
  lat: 48.8566,
  lng: 2.3522,
};

const recordMissingCoords = {
  id: 2,
  name: "Unknown",
};

const FieldWrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={parisRecord}>
        {children}
      </RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

const MissingWrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <RecordContextProvider value={recordMissingCoords}>
        {children}
      </RecordContextProvider>
    </CoreAdminContext>
  </ThemeProvider>
);

const InputWrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <CoreAdminContext i18nProvider={i18nProvider}>
      <Create resource="locations">
        <SimpleForm toolbar={false}>{children}</SimpleForm>
      </Create>
    </CoreAdminContext>
  </ThemeProvider>
);

/** Shows a static Leaflet marker over Paris using coordinates from the record. */
export const Basic = () => (
  <FieldWrapper>
    <LatLngField latSource="lat" lngSource="lng" zoom={13} height={300} />
  </FieldWrapper>
);

/** Returns null — both coordinate fields are missing from the record. */
export const MissingCoordinates = () => (
  <MissingWrapper>
    <LatLngField latSource="lat" lngSource="lng" />
  </MissingWrapper>
);

/** Draggable marker input centred on Paris. Click or drag to update the form values. */
export const BasicInput = () => (
  <InputWrapper>
    <LatLngInput
      latSource="lat"
      lngSource="lng"
      defaultPosition={[48.85, 2.35]}
      height={300}
      label="Map location"
      helperText="Click or drag the marker to set a location."
    />
  </InputWrapper>
);
