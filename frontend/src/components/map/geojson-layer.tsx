"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

export type FeatureStyler = (feature: google.maps.Data.Feature) => google.maps.Data.StyleOptions;

interface GeoJsonLayerProps {
  data: GeoJSON.FeatureCollection | undefined;
  styler: FeatureStyler;
  onFeatureClick?: (feature: google.maps.Data.Feature) => void;
  visible: boolean;
  opacity?: number;
  zIndex?: number;
}

/**
 * Renders one GeoJSON layer (parcels, buildings or roads) on the shared map using the
 * native google.maps.Data layer, which is the right tool for crisp vector cadastral
 * overlays that stay sharp at every zoom level.
 */
export function GeoJsonLayer({ data, styler, onFeatureClick, visible, opacity = 1, zIndex = 1 }: GeoJsonLayerProps) {
  const map = useMap();
  const dataLayerRef = useRef<google.maps.Data | null>(null);

  useEffect(() => {
    if (!map) return;
    const layer = new google.maps.Data({ map });
    layer.setStyle((feature) => ({ ...styler(feature), zIndex }));
    dataLayerRef.current = layer;

    const clickListener = layer.addListener("click", (e: google.maps.Data.MouseEvent) => {
      onFeatureClick?.(e.feature);
    });

    return () => {
      google.maps.event.removeListener(clickListener);
      layer.setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    const layer = dataLayerRef.current;
    if (!layer) return;
    layer.forEach((f) => layer.remove(f));
    if (data && visible) {
      layer.addGeoJson(data as any);
    }
    layer.setMap(visible ? map : null);
  }, [data, visible, map]);

  useEffect(() => {
    dataLayerRef.current?.setStyle((feature) => ({ ...styler(feature), zIndex }));
  }, [styler, opacity, zIndex]);

  return null;
}
