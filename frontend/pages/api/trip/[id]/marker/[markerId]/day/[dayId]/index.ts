// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connection from "../../../../../../../../lib/mySqlConnection";

type ResponseType = {
  data?: any; // todo
  success: boolean;
};

// Example req.query: { id: '3', markerId: '6', dayId: '21' }
// So ensure we take the req.query.dayId vs the id, which is from the trip.
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { method } = req;
  const id = req.query.dayId;

  const PUT_DAY_SQL =  `update day set description = ? WHERE id = ?`

  switch (method) {
    case "GET":
      break;

    // We /POST to /day
    case "PUT":
      try {
        connection.query(PUT_DAY_SQL, [
          req.body.description, 
          id
        ], 
        function (err, results, fields) {
          if (err) {
            console.error("Failed to /PUT day with error: ", err.message);
            res.status(400);
          }
          else {
            res.status(200).json({ data: results });
          }
        });
      } catch (err) {
        console.error("Caught error whilst attempting to /PUT day with error: ", err);
      }
      break;

    default:
      res.status(400);
      break;
  }
}
