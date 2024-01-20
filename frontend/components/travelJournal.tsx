import React, { useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
} from "@react-google-maps/api";

import { polylineOptions, containerStyle, center } from './myStyles'
import ActionBar from "./ActionBar";
import MapData from "./MapData";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

function TravelJournal() {

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBpN3MH0X41QNp7b6t2lTbkMr9Cd_NEX5M",
  });

  const [map, setMap] = React.useState(null);
  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);
  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Required to dispaly in both ActionBar and Mapdata
  const [selectedTripTitle, setSelectedTripTitle] = useState("");

  // Tech debt / addMarker functionality to address, ideally don't have it here as pollutes the plain googleMap component that I want
  const queryClient = useQueryClient();
  const [tripId, setTripId] = useState(-1);
  const [editingTrip, setEditingTrip] = useState(false);
  // Error message if trying to add marker whilst not editing
  const [createMarkerSnackbarError, setCreateMarkerSnackbarError] = useState();
  // Success snackbar
  const [markerSnackbarOpen, setMarkerSnackbarOpen] = useState(false);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);

  const postMarkerMutation = useMutation({
    mutationFn: (newMarker) => {
        return axios.post(`http://localhost:3000/api/trip/${tripId}/marker`, newMarker);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["marker"] });
        setMarkerSnackbarOpen(true);
    },
  });

  /*
  Instead of adding the markerPosition manaully, get reactQuery to automatically fetch it from the backend, as part of the /GET. (already happens)
  Calculate the polyLine based on that.

  When I add a marker, it will post it to the backend (postMarkerMutation), then it will invalidate the marker query.
  Therefore it will perform a GET for the new markers as defined from useGetMarkersForTrip function.

  Add a onSuccess for useGetMarkersForTrip, where I can calculate the polyLine data. 
  Otherwise I will be re-calculating every render
  */
  const addMarker = (e) => {
    if (!editingTrip || tripId === -1) {
      setCreateMarkerSnackbarError(true);
      return;
    }

    setInfoWindowOpen(false);

    // We don't know the title/description yet, as we've just clicked on the map
    // I guess we don't have to persist now, but it's fine to, otherwise user has to add info right away
    postMarkerMutation.mutate({
      title: "",
      description: "",
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
      tripId,
    });
  };

  /*
  TravelJournal (components)
  Parent state needs to contain, tripId, to re-render markers when new trip selected   
  -Menu
    -Action Buttons
    -Create trip modal & toasts
  -G maps
    (data component?)
    -Markers
      -Info window
    -Polyline
  */
  return isLoaded ? (
    <>

      <ActionBar editingTrip={editingTrip} setEditingTrip={setEditingTrip} setTripId={setTripId}
        createMarkerSnackbarError={createMarkerSnackbarError}
        setCreateMarkerSnackbarError={setCreateMarkerSnackbarError}
        markerSnackbarOpen={markerSnackbarOpen}
        setMarkerSnackbarOpen={setMarkerSnackbarOpen}
        //tripTitle={tripTitle}
        selectedTripTitle={selectedTripTitle}
        setSelectedTripTitle={setSelectedTripTitle}
      />

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={addMarker} // Not ideal, makes this file messy
      >

        <MapData editingTrip={editingTrip}
          setCreateMarkerSnackbarError={setCreateMarkerSnackbarError}
          infoWindowOpen={infoWindowOpen}
          setInfoWindowOpen={setInfoWindowOpen}
          tripId={tripId}
          setTripId={setTripId}
          selectedTripTitle={selectedTripTitle}
        />

      </GoogleMap>
    </>
  ) : (
    <></>
  );
}

export default React.memo(TravelJournal);
