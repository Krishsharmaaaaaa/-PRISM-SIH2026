"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { LayersPanel, LayerState } from "./layers-panel";
import { MapLegend } from "./legend";
import { LocationSearch } from "./location-search";
import { ParcelInspector } from "./parcel-inspector";
import { ParcelProperties } from "@/lib/types";

interface ParcelMapProps {
  projectId: string;
  center: { lat: number; lng: number };
  parcelsGeoJSON?: GeoJSON.FeatureCollection;
  buildingsGeoJSON?: GeoJSON.FeatureCollection;
  roadsGeoJSON?: GeoJSON.FeatureCollection;
}

const STATUS_COLOR: Record<string, string> = {
  ai_generated: "#D97706", // Amber
  under_review: "#2563EB", // Blue
  field_verified: "#059669", // Green/Moss
  approved: "#10B981", // Bright green
  rejected: "#DC2626", // Red
};

export function ParcelMap({
  projectId,
  center,
  parcelsGeoJSON,
  buildingsGeoJSON,
  roadsGeoJSON,
}: ParcelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const parcelsLayerRef = useRef<L.GeoJSON | null>(null);
  const buildingsLayerRef = useRef<L.GeoJSON | null>(null);
  const roadsLayerRef = useRef<L.GeoJSON | null>(null);

  const [layers, setLayers] = useState<LayerState>({
    parcels: true,
    buildings: true,
    roads: true,
    satellite: true,
  });
  const [mapType, setMapType] = useState<"satellite" | "roadmap">("satellite");
  const [selectedParcel, setSelectedParcel] = useState<ParcelProperties | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialMap = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "topright" }).addTo(initialMap);

    const satelliteUrl =
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    const satelliteLayer = L.tileLayer(satelliteUrl, {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri",
    });

    satelliteLayer.addTo(initialMap);
    tileLayerRef.current = satelliteLayer;
    mapRef.current = initialMap;

    return () => {
      initialMap.remove();
      mapRef.current = null;
    };
  }, [center.lat, center.lng]);

  // Handle Base Map (Satellite vs Street Map)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const url =
      mapType === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    const newTile = L.tileLayer(url, {
      maxZoom: 19,
      attribution: mapType === "satellite" ? "Tiles &copy; Esri" : "&copy; OpenStreetMap",
    });

    newTile.addTo(map);
    tileLayerRef.current = newTile;
  }, [mapType]);

  // Render Buildings GeoJSON Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (buildingsLayerRef.current) {
      map.removeLayer(buildingsLayerRef.current);
      buildingsLayerRef.current = null;
    }

    if (!buildingsGeoJSON || !layers.buildings) return;

    const bLayer = L.geoJSON(buildingsGeoJSON, {
      style: () => ({
        color: "#3A5166",
        weight: 1.5,
        fillColor: "#3A5166",
        fillOpacity: 0.4,
      }),
      onEachFeature: (feature, layer) => {
        const cat = feature.properties?.category || "Building";
        layer.bindTooltip(`<b>Building:</b> ${cat}`, { sticky: true });
      },
    });

    bLayer.addTo(map);
    buildingsLayerRef.current = bLayer;
  }, [buildingsGeoJSON, layers.buildings]);

  // Render Roads GeoJSON Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (roadsLayerRef.current) {
      map.removeLayer(roadsLayerRef.current);
      roadsLayerRef.current = null;
    }

    if (!roadsGeoJSON || !layers.roads) return;

    const rLayer = L.geoJSON(roadsGeoJSON, {
      style: () => ({
        color: "#F59E0B",
        weight: 3.5,
        opacity: 0.9,
      }),
      onEachFeature: (feature, layer) => {
        const cat = feature.properties?.category || "Road";
        const width = feature.properties?.estimatedWidthM ? ` (${feature.properties.estimatedWidthM}m)` : "";
        layer.bindTooltip(`<b>Road:</b> ${cat}${width}`, { sticky: true });
      },
    });

    rLayer.addTo(map);
    roadsLayerRef.current = rLayer;
  }, [roadsGeoJSON, layers.roads]);

  // Render Parcels GeoJSON Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (parcelsLayerRef.current) {
      map.removeLayer(parcelsLayerRef.current);
      parcelsLayerRef.current = null;
    }

    if (!parcelsGeoJSON || !layers.parcels) return;

    const pLayer = L.geoJSON(parcelsGeoJSON, {
      style: (feature) => {
        const status = feature?.properties?.status || "ai_generated";
        const color = STATUS_COLOR[status] ?? "#7A2331";
        return {
          color: color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.22,
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const code = props.parcelCode || "Parcel";
        const status = props.status?.replace("_", " ") || "";
        layer.bindTooltip(`<b>${code}</b><br/><span style="text-transform: capitalize;">${status}</span>`, {
          sticky: true,
        });

        layer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ weight: 3.5, fillOpacity: 0.45 });
          },
          mouseout: (e) => {
            pLayer.resetStyle(e.target);
          },
          click: () => {
            setSelectedParcel({
              id: props.id || props._id,
              parcelCode: props.parcelCode,
              landUse: props.landUse ?? null,
              status: props.status,
              aiConfidence: props.aiConfidence ?? null,
              areaSqm: props.areaSqm ?? null,
            });
          },
        });
      },
    });

    pLayer.addTo(map);
    parcelsLayerRef.current = pLayer;

    // Auto-fit bounds if we have features across layers
    const fitAllBounds = () => {
      const group = L.featureGroup();
      if (parcelsLayerRef.current && parcelsGeoJSON?.features?.length) {
        group.addLayer(parcelsLayerRef.current);
      }
      if (buildingsLayerRef.current && buildingsGeoJSON?.features?.length) {
        group.addLayer(buildingsLayerRef.current);
      }
      if (roadsLayerRef.current && roadsGeoJSON?.features?.length) {
        group.addLayer(roadsLayerRef.current);
      }

      if (map && group.getLayers().length > 0) {
        try {
          const bounds = group.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18, animate: true });
          }
        } catch {
          // ignore
        }
      }
    };

    fitAllBounds();
  }, [parcelsGeoJSON, layers.parcels, buildingsGeoJSON, roadsGeoJSON]);

  // Function to re-frame on demand
  const handleZoomToExtents = () => {
    const map = mapRef.current;
    if (!map) return;

    const group = L.featureGroup();
    if (parcelsLayerRef.current) group.addLayer(parcelsLayerRef.current);
    if (buildingsLayerRef.current) group.addLayer(buildingsLayerRef.current);
    if (roadsLayerRef.current) group.addLayer(roadsLayerRef.current);

    if (group.getLayers().length > 0) {
      try {
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 18, duration: 1.2 });
          return;
        }
      } catch {}
    }

    map.flyTo([center.lat, center.lng], 17, { duration: 1.2 });
  };

  // Search Location handler
  const handleLocationSelect = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Map DOM node */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Top Left Search */}
      <div className="absolute left-6 top-6 z-10 flex items-center gap-3">
        <LocationSearch onSelect={handleLocationSelect} />
        
        {/* Quick Zoom to Area Button */}
        <button
          onClick={handleZoomToExtents}
          title="Zoom to Extracted Survey Area"
          className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-hairlineStrong shadow-subtle text-xs font-semibold text-ink hover:text-oxblood hover:border-oxblood transition-all"
        >
          <span>🎯</span>
          <span className="hidden sm:inline">Fit Survey Area</span>
        </button>
      </div>

      {/* Bottom Left Layers Panel */}
      <div className="absolute left-6 bottom-6 z-10">
        <LayersPanel
          layers={layers}
          onToggle={(key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }))}
          mapType={mapType}
          onMapTypeChange={setMapType}
        />
      </div>

      {/* Bottom Right Legend */}
      <div className="absolute right-6 bottom-6 z-10">
        <MapLegend />
      </div>

      {/* Parcel Inspector Modal/Panel */}
      {selectedParcel && (
        <ParcelInspector
          parcel={selectedParcel}
          projectId={projectId}
          onClose={() => setSelectedParcel(null)}
        />
      )}
    </div>
  );
}
