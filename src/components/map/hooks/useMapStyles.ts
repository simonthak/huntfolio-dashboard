import { Feature } from 'geojson';

export const useMapStyles = () => {
  const styles = [
    // Vertex point style
    {
      'id': 'gl-draw-polygon-and-line-vertex-active',
      'type': 'circle',
      'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
      'paint': {
        'circle-radius': 6,
        'circle-color': '#fff',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#13B67F'
      }
    },
    // Vertex point style (inactive)
    {
      'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
      'type': 'circle',
      'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
      'paint': {
        'circle-radius': 5,
        'circle-color': '#fff',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#13B67F'
      }
    },
    // Mid point style
    {
      'id': 'gl-draw-polygon-midpoint',
      'type': 'circle',
      'filter': ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
      'paint': {
        'circle-radius': 3,
        'circle-color': '#13B67F'
      }
    },
    // Line style
    {
      'id': 'gl-draw-line',
      'type': 'line',
      'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#13B67F',
        'line-width': 2
      }
    },
    // Polygon fill (inactive)
    {
      'id': 'gl-draw-polygon-fill-inactive',
      'type': 'fill',
      'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      'paint': {
        'fill-color': '#13B67F',
        'fill-outline-color': '#13B67F',
        'fill-opacity': 0.1
      }
    },
    // Polygon outline (inactive)
    {
      'id': 'gl-draw-polygon-stroke-inactive',
      'type': 'line',
      'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#13B67F',
        'line-width': 2
      }
    },
    // Polygon fill (active)
    {
      'id': 'gl-draw-polygon-fill-active',
      'type': 'fill',
      'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
      'paint': {
        'fill-color': '#13B67F',
        'fill-outline-color': '#13B67F',
        'fill-opacity': 0.2
      }
    },
    // Polygon outline (active)
    {
      'id': 'gl-draw-polygon-stroke-active',
      'type': 'line',
      'filter': ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#13B67F',
        'line-width': 2
      }
    }
  ];

  return styles;
};