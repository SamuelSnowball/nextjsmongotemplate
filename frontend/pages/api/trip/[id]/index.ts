import type { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";
import connection from "../../../../lib/mySqlConnection";

type ResponseType = {
  data?: any; // todo
  success: boolean;
};

/*
Information for an individual trip, this should return all associated markers as well
*/
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { method } = req;

  /*
  Trying to get the ID parameter from the URL:

  Split, wherever there's a specified character, it removes it puts it into a new element

  req.url: /api/trip/1
  req.url.split(/):  [ '', 'api', 'trip', '1' ]

  urlSegments = [ '', 'api', 'trip', '1' ]
  length is 4

  To get the last element: urlSegments[urlSegments.length - 1] 
  */
  const urlSegments = req.url.split("/");
  const id = urlSegments[urlSegments.length - 1];
  console.log("/trip/id received id: ", id);
  console.log("typeof id: ", typeof id);

  const GET_INDIVIDUAL_TRIP_SQL = `select * from trip where trip.id = ?`;

  switch (method) {
    case "GET":
      try {
        connection.query(
          GET_INDIVIDUAL_TRIP_SQL,
          [id],
          function (err, results, fields) {
            if (err) {
              console.error(
                "Failed to /trip/id trip with error: ",
                err.message
              );
              res.status(400);
            } else {
              res.status(200).json({ success: true, data: results });
            }
          }
        );
      } catch (err) {
        console.error(
          "Caught error whilst attempting to /trip/id trip with error: ",
          err
        );
      }
      break;

    default:
      res.status(400);
      break;
  }
}
