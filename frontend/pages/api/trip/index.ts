// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connection from "../../../lib/mySqlConnection";

type ResponseType = {
  data?: any; // todo
  success: boolean;
};

/*
Information for all trips, doesn't return associated marker information
*/
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { method } = req;

  const GET_TRIP_SQL = `select * from trip`;

  // I have to specify the columns I'm inserting into, even though I'm doing them all, minus the ID which is auto incremented.
  const POST_TRIP_SQL = `insert into trip(title, description, startDate, endDate) values(?, ?, ?, ?)`;

  console.log("Receievd body: ", req.body);

  switch (method) {
    case "GET":

      try {
        connection.query(GET_TRIP_SQL, function (err, results, fields) {
          if (err) {
            console.error("Failed to /GET trip with error: ", err.message);
            res.status(400);
          } else {
            res.status(200).json({ success: true, data: results });
          }
        });
      } catch (err) {
        console.error(
          "Caught error whilst attempting to /GET trip with error: ",
          err
        );
      }
      break;

      case "POST":
      try {
        connection.query(
          POST_TRIP_SQL,
          [
            req.body.tripTitle,
            req.body.tripDescription,
            req.body.startDate,
            req.body.endDate,
          ],
          function (err, result, fields) {
            if (err) {
              console.error("Failed to /POST trip with error: ", err.message);
              res.status(400);
            } else {
              res.status(200).json({ data: result });
            }
          }
        );
      } catch (err) {
        console.error(
          "Caught error whilst attempting to /POST trip with error: ",
          err
        );
      }
      break;

    default:
      res.status(400);
      break;
  }
}
