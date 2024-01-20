import React from "react";
import { TextareaAutosize as BaseTextareaAutosize } from "@mui/base/TextareaAutosize";
import { styled } from "@mui/system";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

export const blue = {
    100: "#DAECFF",
    200: "#b6daff",
    400: "#3399FF",
    500: "#007FFF",
    600: "#0072E5",
    900: "#003A75",
  };
  
  export const grey = {
    50: "#F3F6F9",
    100: "#E5EAF2",
    200: "#DAE2ED",
    300: "#C7D0DD",
    400: "#B0B8C4",
    500: "#9DA8B7",
    600: "#6B7A90",
    700: "#434D5B",
    800: "#303740",
    900: "#1C2025",
  };
  
  export const createTripModalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };
  
  export const Textarea = styled(BaseTextareaAutosize)(
    ({ theme }) => `
      width: 100%;
      font-family: IBM Plex Sans, sans-serif;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5;
      padding: 8px 12px;
      border-radius: 8px;
      color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
      background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
      border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
      box-shadow: 0px 2px 2px ${
        theme.palette.mode === "dark" ? grey[900] : grey[50]
      };
  
      &:hover {
        border-color: ${blue[400]};
      }
  
      &:focus {
        border-color: ${blue[400]};
        box-shadow: 0 0 0 3px ${
          theme.palette.mode === "dark" ? blue[600] : blue[200]
        };
      }
  
      // firefox
      &:focus-visible {
        outline: 0;
      }
    `
  );
  
  export const containerStyle = {
    width: "1400px",
    height: "1400px",
  };
  
  export const center = {
    lat: 13.763967297028055,
    lng: 100.51434564731058,
  };
  
  export  const polylineOptions = {
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 30000,
    zIndex: 1,
  };

 export const markerModalStyle = {
    position: 'absolute' as 'absolute',
    width: '75%',
    height: '75%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: "flex",
  };

  export const infoWindowLeft = {
    border: `1px solid red`,
    // A flex item can also be a container
    display: "flex",
    flexDirection: 'column',
    flexShrink: 1,
  };

export const infoWindowCentre = {
  border: `1px solid blue`,
  width: '100%',
}

export const infoWindowRight = {
  border: `1px solid green`,
  flexShrink: 1,
}



  
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });