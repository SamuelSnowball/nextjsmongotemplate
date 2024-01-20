// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connection from "../../../../../lib/mySqlConnection";

type ResponseType = {
  data?: any; // todo
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { method } = req;
  const id = req.query.id;

  /*
  Why do I need the trip start and end date?
  */
  const GET_MARKER_SQL = `select marker.id,
  marker.title as markerTitle,
  marker.description as markerDescription,
  marker.latLng,
  marker.imageIds,
  marker.tripId,
  marker.startDate as markerStartDate,
  marker.endDate as markerEndDate,
  trip.title,
  trip.description,
  trip.startDate,
  trip.endDate from marker inner join trip on marker.tripId=trip.id where trip.id = ?`;

  // I have to specify the columns I'm inserting into, even though I'm doing them all, minus the ID which is auto incremented.
  const POST_MARKER_SQL = `insert into marker(title, description, latLng, imageIds, tripId) values(?, ?, POINT(?, ?), ?, ?)`;

  const PUT_MARKER_SQL =  `update marker set title = ?, description = ?, imageIds = ?, startDate = ?, endDate = ? WHERE id = ?`

  switch (method) {
    case "GET":
      try {
        connection.query(GET_MARKER_SQL, [id], function (err, results, fields) {
          if (err) {
            console.error(`Failed to GET /trip/${id}/marker marker with error: ${err.message}`);
            res.status(400)
          }
          else {
            res.status(200).json({ success: true, data: results });
          }
        });
      } catch (err) {
        console.error(`Caught error whilst attempting to GET /trip/${id}/marker marker with error: ${err}`);
      }
      break;

      case "POST":
        try {
          connection.query(POST_MARKER_SQL, [
            req.body.title, 
            req.body.description, 
            req.body.lat,
            req.body.lng,
            req.body.imageIds,
            req.body.tripId
          ], 
          function (err, results, fields) {
            if (err) {
              console.error("Failed to /POST marker with error: ", err.message);
              res.status(400);
            }
            else {
              res.status(200).json({ data: results });
            }
          });
        } catch (err) {
          console.error("Caught error whilst attempting to /POST marker with error: ", err);
        }
        break;

    // We /PUT to the individual /marker/markerId endpoint, so currently not required
    //  case "PUT":
    //    break;

    default:
      res.status(400);
      break;
  }
}
