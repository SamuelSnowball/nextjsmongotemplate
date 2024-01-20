// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connection from "../../../../../../../lib/mySqlConnection";

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
  const markerId = req.query.markerId;
  
  // Get all days for a given marker
  // Think I can slim this query down, should only need the number of days
  const GET_DAYS_SQL = `select 
  marker.id as markerId,
  day.id,
  day.description
  from day inner join marker on day.markerId=marker.id where marker.id = ?`;

  const POST_DAY_SQL = `insert into day(description, markerId) values (?, ?)`

  switch (method) {

    // Refactor get into /day/id? Or do we always want to get all the days upfront?
    // Well we need to know how many 'days' to render, so may as well get them all here
    case "GET":
      try {
        connection.query(GET_DAYS_SQL, [markerId], function (err, results, fields) {
          if (err) {
            console.error(`Failed to GET /trip/${id}/marker/${markerId}/day with error: ${err.message}`);
            res.status(400)
          }
          else {
            res.status(200).json({ success: true, data: results });
          }
        });
      } catch (err) {
        console.error(`Caught error whilst attempting to GET /trip/${id}/marker/${markerId}/day with error: ${err}`);
      }
      break;

      case "POST":
        try {
          connection.query(POST_DAY_SQL, [
            req.body.description, 
            markerId
          ], 
          function (err, results, fields) {
            if (err) {
              console.error("Failed to /POST day with error: ", err.message);
              res.status(400);
            }
            else {
              res.status(200).json({ data: results });
            }
          });
        } catch (err) {
          console.error("Caught error whilst attempting to /POST day with error: ", err);
        }
        break;

    default:
      res.status(400);
      break;
  }
}
