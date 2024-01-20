import type { NextPage } from 'next'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import TravelJournal from "../components/travelJournal";


const Home: NextPage = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <TravelJournal />
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default Home;