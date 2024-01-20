import React, { useState } from "react";
import { Button } from "@mui/material";
import { Textarea } from "./myStyles";
import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

/**
 * Renders a given day, also allows updating the description
 * 
 * @param props
 *  tripId, to know what endpoint to call
 * @returns
 */
function DayPanel(props) {
  const { selectedDay, tripId } = props;

  const queryClient = useQueryClient();

  const [description, setDescription] = useState(null); // rename to description

  const save = () => {
    putDayMutation.mutate({
        id: selectedDay.id,
        description,
        //imageIds: "",
    });
  }

  console.log('DayPanel rendering with selected day: ', selectedDay);

  const putDayMutation = useMutation({
    mutationFn: (day) => {
      return axios.put(`
        http://localhost:3000/api/trip/${tripId}/marker/${selectedDay.markerId}/day/${selectedDay.id}`, 
      day);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["days"] });
    },
  });

  // {selectedDay.description ? selectedDay.description : description}
  // If we're passing a description into this component, use it (we recieved it from the backend)
  // Otherwise, use the value from the state variable
  // The statement has to be this way around, so we prioritize the value from the backend, rather than a value
  // from the frontend. As if I add a description to a day, then view a different day, this components
  // description not cleared, as we've only one DayPanel. And therefore it will render the wrong description / 
  // won't clear the value.
  // But when I render with selectedDay.description = null, then the statement obviously doesn't work
  return (
    <>
      <Textarea
        minRows={10}
        onChange={(e) => setDescription(e.target.value)}
        value={selectedDay.description ? selectedDay.description : description}
      />
      <Button variant="contained" color="primary" onClick={save}>
        Save
      </Button>
    </>
  );
}

export default DayPanel;
