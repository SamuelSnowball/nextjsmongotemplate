// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import connection from "../../../../../../../lib/mySqlConnection";
import {
  getImages,
  postImages,
} from "../../../../../../../lib/s3";

import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import formidable, { IncomingForm } from "formidable";

type ResponseType = {
  data?: any; // todo
  success: boolean;
};

export const config = {
  api: {
    bodyParser: false,
  },
};

/*
http://localhost:3000/api/trip/3/marker/5/upload

For handling image uploads, it proxies the data to S3, and returns the image IDs as well as storing them in the DB.
*/
export default async function handler(req, res: NextApiResponse<ResponseType>) {
  const { method } = req;

  const { markerId, imageIds } = req.query;

  // const GET_TRIP_SQL = `select * from trip`;
  const MARKER_UPLOAD_SQL = `update marker set imageIds = ? WHERE id = ?`;

  switch (method) {
    case "GET":
      const listResponse = await getImages(imageIds);
      res.status(200).json({ data: listResponse });
      break;

    case "POST":
      try {
        const s3key = await postImages(req, res);

        // Persist key
        if (s3key) {

          console.log('Persisting for markerId: ' + markerId);

          connection.query(
            MARKER_UPLOAD_SQL,
            [
              s3key,
              markerId,
            ],
            function (err, result, fields) {
              if (err) {
                console.error(
                  "Failed to POST marker/id/upload with error: ",
                  err.message
                );
                res.status(400);
              } else {
                res.status(200).json({ data: result });
              }
            }
          );

          res.status(200).json({ data: s3key });
        }
      } catch (err) {
        console.error(
          "Caught error whilst attempting to POST marker/upload with error: ",
          err
        );
      }
      break;

    default:
      res.status(400);
      break;
  }
}

export const uploadToS3 = async (req, res) => {};
