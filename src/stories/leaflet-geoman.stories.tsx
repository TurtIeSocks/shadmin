import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

import { GeomanControl, GeomanEvents } from "@/components/leaflet";
import { ThemeProvider } from "@/components/admin";
import {
  DEFAULT_ATTRIBUTION,
  DEFAULT_TILE_URL,
} from "@/components/leaflet/shared";

export default { title: "Leaflet/Geoman" };

const Wrapper = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider>
    <div style={{ height: 400, width: "100%" }} data-testid="geoman-wrap">
      <MapContainer
        center={[48.85, 2.35]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={DEFAULT_TILE_URL} attribution={DEFAULT_ATTRIBUTION} />
        {children}
      </MapContainer>
    </div>
  </ThemeProvider>
);

export const Basic = () => (
  <Wrapper>
    <GeomanControl position="topleft" />
  </Wrapper>
);

export const PolygonOnly = () => (
  <Wrapper>
    <GeomanControl
      position="topleft"
      shapes={["Polygon"]}
      edit
      drag={false}
      remove
      rotate={false}
    />
  </Wrapper>
);

export const WithEvents = () => {
  const [count, setCount] = useState(0);
  return (
    <Wrapper>
      <GeomanControl position="topleft" />
      <GeomanEvents onCreate={() => setCount((c) => c + 1)} />
      <div data-testid="create-count">{count}</div>
    </Wrapper>
  );
};
