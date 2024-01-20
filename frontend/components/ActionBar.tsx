import React, { useState } from "react";
import dayjs from "dayjs";

import {
  Box,
  Button,
  FormControl,
  Modal,
  TextField,
  Snackbar,
  InputLabel,
  MenuItem,
} from "@mui/material";
import Select from "@mui/material/Select";
import { Alert, createTripModalStyle, Textarea } from "./myStyles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

function ActionBar(props) {
    const {
        editingTrip,
        setEditingTrip,
        setTripId,
        createMarkerSnackbarError,
        setCreateMarkerSnackbarError,
        markerSnackbarOpen,
        setMarkerSnackbarOpen,
        setSelectedTripTitle
    } = props;
    
    const queryClient = useQueryClient();

    // loading, error, fetching...
    const { data: allTrips } = useQuery({
      queryKey: ["trip"],
      queryFn: () =>
        axios.get("http://localhost:3000/api/trip").then((res) => res.data),
    });

    const [createTripModalOpen, setCreateTripModalOpen] = useState(false);
    const openCreateTripModal = () => setCreateTripModalOpen(true);
    const onCreateTripModalClose = () => setCreateTripModalOpen(false);

    const [tripDescription, setTripDescription] = useState("");
    const [tripStartDate, setTripStartDate] = useState(dayjs("2000-01-01"));
    const [tripEndDate, setTripEndDate] = useState(dayjs("2000-01-01"));

    const createTrip = () => {
      postTripMutation.mutate({
        tripTitle,
        tripDescription,
        startDate: new Date(tripStartDate).toISOString().split("T")[0],
        endDate: new Date(tripEndDate).toISOString().split("T")[0],
      });
  
      setCreateTripModalOpen(false);
    };
  
    const onMarkerSnackbarClose = () => {
      setMarkerSnackbarOpen(false);
    };
    const onMarkerSnackbarErrorClose = () => {
      setCreateMarkerSnackbarError(false);
    };
  
    /*
    selectTrip / loadTripInformation
    Finds the markers for the selected trip
  
    We need the tripId, but the tripChangeEvent doesn't contain it
    Therefore find the selected title in the allTrips array and take the ID
    Query backend for that trips markers
    */
    const selectTrip = (tripChangeEvent: SelectChangeEvent) => {

      // Why do I need to set this? I can query from backend.
      setSelectedTripTitle(tripChangeEvent.target.value as string);
  
      const result = allTrips.data.find(trip => trip.title === tripChangeEvent.target.value)
      console.debug("Found result id in allTrips: ", result?.id);
  
      const id = result?.id
      setTripId(id)
      // I don't need to Invalidate the query or manually call refetch, as tripId is a dependency within the useQuery
    };

  const [tripTitle, setTripTitle] = useState("");


    
  const postTripMutation = useMutation({
    mutationFn: (newTrip) => {
      return axios.post("http://localhost:3000/api/trip", newTrip);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["trip"] });
      console.debug("Result from POST /trip: ", result.data.data.insertId);
      // Set trip ID in the state here
      setTripId(result.data.data.insertId);
    },
  });

    return (  
        <>
        <p>
          Current Mode: {editingTrip ? "Editing..." : "View"}
        </p>
        <Button
        variant="contained"
        color="primary"
        onClick={() => setEditingTrip(!editingTrip)}
      >
        Switch mode
      </Button>

      <Button
        onClick={openCreateTripModal}
        variant="contained"
        color="primary"
        type="submit"
      >
        Create trip
      </Button>

      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="demo-simple-select-label">Trip</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={tripTitle}
          label="Trip"
          onChange={selectTrip}
        >
          {allTrips &&
            allTrips.data.map((trip) => {
              return <MenuItem value={trip.title}>{trip.title}</MenuItem>;
            })}
        </Select>
      </FormControl>

      <Snackbar
        open={markerSnackbarOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={onMarkerSnackbarClose}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          Added pin!
        </Alert>
      </Snackbar>

      <Snackbar
        open={createMarkerSnackbarError}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={onMarkerSnackbarErrorClose}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          Can't add pin, select a trip and switch to edit mode.
        </Alert>
      </Snackbar>

      <Modal
        open={createTripModalOpen}
        onClose={onCreateTripModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={createTripModalStyle}>
          <TextField
            disabled={!editingTrip}
            label="Trip title"
            variant="standard"
            onChange={(e) => setTripTitle(e.target.value)}
            value={tripTitle}
          />

          <DatePicker
            label="Start date"
            value={tripStartDate}
            onChange={(v) => setTripStartDate(dayjs(v))}
          />
          <DatePicker
            label="End date"
            value={tripEndDate}
            onChange={(v) => setTripEndDate(dayjs(v))}
          />

          <Textarea
            placeholder="Description"
            disabled={!editingTrip}
            minRows={3}
            onChange={(e) => setTripDescription(e.target.value)}
            value={tripDescription}
          />

          {
            // Don't need a form, with a button type="submit" as I've no form
            // I could do.. I should do actually, otherwise I need to get all data
            // From hooks, though I will need to do this anyway.
            // What's the point of a form again? if I can just close the dialog and take info from state?
          }
          <Button variant="contained" color="primary" onClick={createTrip}>
            Create
          </Button>
        </Box>
      </Modal>
      </>
    );
}

export default ActionBar;