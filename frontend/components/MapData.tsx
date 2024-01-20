import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { InfoWindowF, MarkerF, Polyline } from "@react-google-maps/api";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import { Button, TextField } from "@mui/material";
import Modal from "@mui/material/Modal";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import {
  markerModalStyle,
  infoWindowLeft,
  infoWindowCentre,
  infoWindowRight,
  Textarea,
} from "./myStyles";
import DayPanel from "./DayPanel";

function MapData(props) {
  const {
    editingTrip,
    setCreateMarkerSnackbarError, // Not longed used after moving addMarker back up to GoogleMap level
    infoWindowOpen,
    setInfoWindowOpen,
    tripId,
  } = props;

  const queryClient = useQueryClient();

  // Wrapped around useQuery so I can pass in a parameter, same as:
  // Now now from reading that I've learnt
  // Setting a variable in the queryKey, means whenever that variable updates the query will be refetched, this is what I want. No passing in variables required.
  // https://tanstack.com/query/v4/docs/vue/guides/query-keys#if-your-query-function-depends-on-a-variable-include-it-in-your-query-key
  const getMarkersForTrip = () => {
    return axios
      .get(`http://localhost:3000/api/trip/${tripId}/marker`)
      .then((res) => res.data.data);
  };
  function useGetMarkersForTrip() {
    const queryKey = ["marker", tripId];
    return useQuery({
      queryKey,
      queryFn: () => getMarkersForTrip(),
    });
  }
  const { data: markers } = useGetMarkersForTrip();
  const [editingMarker, setEditingMarker] = useState(true);
  const [title, setTitle] = useState("Title"); // refactor to marker
  const [description, setDescription] = useState("Description"); // refactor to marker
  const [markerStartDate, setMarkerStartDate] = useState(null);
  const [markerEndDate, setMarkerEndDate] = useState(null);
  const [markerId, setMarkerId] = useState(-1); // Used to query for markerId/days

  // To know what information we should be displaying
  const [lastClickedMarkerPosition, setLastClickedMarkerPosition] = useState({
    lat: 0,
    lng: 0,
  });

  const [infoWindowPosition, setInfoWindowPosition] = useState({
    lat: 0,
    lng: 0,
  });

  /**
   * When we click a marker, we want to display its information to the user
   * However, we initially only have the lat/lng of the marker that was clicked
   * We do have all of the markers that exist. So loop through and find the marker.
   * Once the marker is found, we take its title and description and set it in local state to be displayed.
   *
   * @param e Marker object that was clicked, containing its lat/long. From this we can match it's position in the marker array.
   */
  const markerClicked = (e) => {
    setInfoWindowOpen(true);
    setEditingMarker(true);
    setSelectedDay({}); // Clear the selected day

    const foundMarker = markers.find(
      (marker) =>
        marker.latLng.x === e.latLng.lat() && marker.latLng.y === e.latLng.lng()
    );

    retrieveImages(foundMarker.id);

    /*
    The join query will return us the trip and marker titles, with the same column name,
    So I have used marker.title as markerTitle etc, so there aren't conflicts, and we get
    both trip and marker titles returned in the JSON.
    But this means the property, when returned from the backend is now called markerTitle,
    as opposed to title. We then set it in state as 'title' to only rename it once (ideally..)
    */
    setTitle(foundMarker.markerTitle);
    setDescription(foundMarker.markerDescription);

    if (foundMarker.markerStartDate && foundMarker.markerEndDate) {
      console.log(
        "setting foundMarker.startDate && foundMarker.endDate: ",
        foundMarker.startDate,
        foundMarker.endDate
      );
      setMarkerStartDate(foundMarker.markerStartDate);
      setMarkerEndDate(foundMarker.markerEndDate);
    } else {
      // The dates are NULL as they haven't been set yet, default today
      setMarkerStartDate(dayjs());
      setMarkerEndDate(dayjs());
    }

    // Refactor these into a setMarker()

    console.log("setting foundMarker.id: ", foundMarker.id);
    setMarkerId(foundMarker.id); // So we know what endpoint to query the days for (/markerId/days)

    setInfoWindowPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });

    setLastClickedMarkerPosition({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  const putMarkerMutation = useMutation({
    mutationFn: (updatedMarker) => {
      return axios.put(
        `http://localhost:3000/api/trip/${tripId}/marker/${markerId}`,
        updatedMarker
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marker"] });
    },
  });

  /*
    Horrible but works..
  
    Marker : {
      latLng: {
        x: 47.27363061139639
        y: -113.61832731487385
      }
    }
  
    lastClickedMarkerPosition: {
      lat: 47.27363061139639
      lng: -113.61832731487385
    }
    */
  const updateMarkerInformation = (e) => {
    e.preventDefault();

    if (!editingTrip || tripId === -1) {
      setCreateMarkerSnackbarError(true);
      return;
    }

    setInfoWindowOpen(false);

    const markerToUpdate = markers.find(
      (marker) =>
        marker.latLng.x === lastClickedMarkerPosition.lat &&
        marker.latLng.y === lastClickedMarkerPosition.lng
    );
    console.log("Found markerToUpdate: ", markerToUpdate);

    // The ID of the markerToUpdate is set to the tripId in the frontend, but it's correct in the database

    console.log(
      "submitting start date as...",
      new Date(markerStartDate).toISOString().split("T")[0]
    );

    // PUT, with the marker and new content
    // What's the query? is it a good idea to query on the database ID to find the item to update?
    putMarkerMutation.mutate({
      id: markerToUpdate.id,
      title,
      description,
      markerStartDate: new Date(markerStartDate).toISOString().split("T")[0],
      markerEndDate: new Date(markerEndDate).toISOString().split("T")[0],
    });
  };

  const addDay = () => {
    // Just initialze null values, we update them when adding the days information
    postDayMutation.mutate({});
  };

  // For the polyLine, don't persist anything, just calculate it from the retrieved marker information
  // This will render the existing data, and any new points will be added onto this array in the addMarker function..?
  let polylineCoordinates = []; // do I need this in state?
  const calculatePolylineFromMarkers = () => {
    polylineCoordinates = []; // reset

    // Unable to touch markers here, if I do nothing renders and they're undefined
    // markers.forEach(m => console.log('m: ', m) )

    // Markers is still being calculated here... as we haven't returned the res.data.data yet.
    // Must I call calculatePolylineFromMarkers() each render? This is what I've gone with.

    // Calculate polyLine from the marker information
    markers &&
      markers.forEach((m) => {
        polylineCoordinates.push({
          lat: m.latLng.x,
          lng: m.latLng.y,
        });
      });
  };

  calculatePolylineFromMarkers();

  // Days
  // Query function to get /markerId/days, call it when a marker is selected / when markerId is changed
  const [dayId, setDayId] = useState(-1);
  const getDaysForMarkers = () => {
    return axios
      .get(`http://localhost:3000/api/trip/${tripId}/marker/${markerId}/day`)
      .then((res) => res.data.data);
  };
  function useGetDaysForMarkers() {
    const queryKey = ["days", tripId, markerId]; // markerId will change when I select a marker
    return useQuery({
      queryKey,
      queryFn: () => getDaysForMarkers(),
    });
  }
  const postDayMutation = useMutation({
    mutationFn: (newDay) => {
      return axios.post(
        `http://localhost:3000/api/trip/${tripId}/marker/${markerId}/day`,
        newDay
      );
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["days"] });
    },
  });

  const { data: days } = useGetDaysForMarkers();

  console.log("days", days);

  const [selectedDay, setSelectedDay] = useState({});
  const viewDay = (i) => {
    console.log("View day: ", i);
    const day = days[i]; // Find the selected day
    console.log("Viewing day:", day);

    setSelectedDay(day);
  };

  // Upload
  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);
  // View
  const [images, setImages] = useState([]); // Image data subsequently returned by the server

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  /*
  Pass markerID to backend, query S3 for everything in that folder

  Use the foundMarker.id as to not rely on a setState call completeing before calling this function,
  as that wouldn't work!
  */
  const retrieveImages = async (foundMarkerId) => {
    // Change endpoint name as weird
    const retrievedImages = await axios.get(
      `http://localhost:3000/api/trip/${tripId}/marker/${foundMarkerId}/upload`
    );

    // Get working for one image for now
    // Axois has a data property, as do I, hence the .data.data
    console.log('retrievedImages.data: ', retrievedImages.data.data[0]);

    const imageData = retrievedImages.data.data[0]

    setImages([imageData]);
  };

  /*
  Access to fetch at 'https://s3.eu-west-2.amazonaws.com/' from origin 'http://localhost:3000' has been blocked by CORS policy: 
  No 'Access-Control-Allow-Origin' header is present on the requested resource. 
  If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
  MapData.tsx:363 
        
  POST https://s3.eu-west-2.amazonaws.com/ net::ERR_FAILED 405 (Method Not Allowed

  FormData uses multipart/form-data format
  */
  const uploadToServer = async () => {
    const body = new FormData();
    // arg.files.forEach((file) => {
    body.append("file", image);
    //});

    console.log(
      `Posting image to api/trip/${tripId}/marker/${markerId}/upload`
    );

    const response = await fetch(
      `http://localhost:3000/api/trip/${tripId}/marker/${markerId}/upload`,
      { method: "POST", body }
    );
    const data = await response.json();
    console.log("data: ", data);
  };

  console.log("Mapping images: ", images);

  return (
    /*
        The marker position is saved in a single latLng property on the DB
        We only submit the values separately
        When it comes out of DB it's {x: 5, y:5} format. Annoying.
        Need to rename keys to lat/lng.
        */
    <>
      {markers &&
        markers.map((marker) => {
          let markerPosition = {
            lat: marker.latLng.x,
            lng: marker.latLng.y,
          };
          return (
            // key={markerPosition.lat} is odd, but should be good enough
            <MarkerF
              key={markerPosition.lat + ":" + markerPosition.lng}
              position={markerPosition}
              onClick={markerClicked}
            />
          );
        })}

      <Polyline
        // onLoad={onLoad}
        path={polylineCoordinates}
        // options={polylineOptions}
      />

      {markers && infoWindowOpen && (
        <Modal open={infoWindowOpen} onClose={() => setInfoWindowOpen(false)}>
          <Box sx={markerModalStyle}>
            <form onSubmit={(e) => updateMarkerInformation(e)}>
              <Box sx={infoWindowLeft}>
                <EditIcon onClick={() => setEditingMarker(!editingMarker)} />

                {
                  // I need this to have a flex direction of row, within a paraent container that has flex direction of column
                  // As I want the two text fields side by side
                  // Atm everything goes onto one row, I need a max size of 2 before it should go to the next row
                  // I've had to make another box container, so again, the 2 date pickers take up half of the row each
                }
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    paddingBottom: "15px",
                  }}
                >
                  <TextField
                    disabled={!editingMarker}
                    variant="standard"
                    onChange={(e) => setTitle(e.target.value)}
                    value={title}
                  />
                  <TextField
                    disabled={true}
                    variant="standard"
                    value={markers[0].title} // Get the trip title from the first marker, confusing though. Implies it's the marker title but isnt. The join from the DB returns the trip title as title.
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    paddingBottom: "5px",
                  }}
                >
                  <DatePicker
                    label="Start date"
                    value={dayjs(markerStartDate)}
                    onChange={(v) => setMarkerStartDate(v)}
                  />
                  <DatePicker
                    label="End date"
                    value={dayjs(markerEndDate)}
                    onChange={(v) => setMarkerEndDate(v)}
                  />
                </Box>

                <Textarea
                  disabled={!editingMarker}
                  minRows={8}
                  onChange={(e) => setDescription(e.target.value)}
                  value={description}
                />

                <Button onClick={addDay}>Add day</Button>

                <h3>Days:</h3>
                {days &&
                  days.map((day, i) => {
                    return (
                      <div>
                        Day {i}
                        <Button onClick={() => viewDay(i)}>View</Button>
                      </div>
                    );
                  })}

                <Button variant="contained" color="primary" type="submit">
                  Save
                </Button>

                <div>
                  <div>
                    <img
                      src={createObjectURL}
                      style={{ width: "100px", height: "100px" }}
                    />
                    <h4>Select Image</h4>
                    <input
                      type="file"
                      name="myImage"
                      onChange={uploadToClient}
                    />
                    <button
                      className="btn btn-primary"
                      type="submit"
                      onClick={uploadToServer}
                    >
                      Send to server
                    </button>
                  </div>
                </div>
              </Box>
            </form>

            <Box sx={infoWindowCentre}>
              <DayPanel selectedDay={selectedDay} tripId={tripId} />
            </Box>

            {
              // Refactor for next image, just to learn it
              // Setting the width as PX here is a bit of a hack, as it's in a flexbox
            }
            <Box sx={infoWindowRight}>
              <ImageList
                cols={2}
                rowHeight={200}
                sx={{ padding: 0, width: 400, height: "95%" }}
              >
                {
                images.map((image, index) => (
                  <ImageListItem key={index}>
                    <img src={`data:image/png;base64,${image}`} />
                  </ImageListItem>
                ))}
              </ImageList>
            </Box>
          </Box>
        </Modal>
      )}
    </>
  );
}

export default MapData;
