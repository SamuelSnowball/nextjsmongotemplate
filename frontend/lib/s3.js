import {
  S3Client,
  ListBucketsCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const { readFile } = require("node:fs/promises");
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

// a client can be shared by different commands.
const client = new S3Client({
  region: "eu-west-2",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
  },
});

const BUCKET = "traveljournal";

const params = {};
const command = new ListBucketsCommand(params);

// endpoint to get the list of files in the bucket
export async function getImages(imageIds) {

  // ... what to do?


  const response = await client.send(new ListObjectsCommand({ BUCKET }));
  return response?.Contents ?? [];
}

export async function postImages(req, res) {
  let status = 200,
    resultBody = { message: "Files were uploaded successfully" };

  /* Get files using formidable */
  const files = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    const files = [];
    form.on("file", function (field, file) {
      files.push(file);
    });
    form.on("end", () => resolve(files));
    form.on("error", (err) => reject(err));
    form.parse(req, () => {
      //
    });
  }).catch((e) => {
    console.log(e);
    status = 500;
    resultBody = {
      message: "Upload error",
    };
  });

  if (files?.length) {
    try {
      const contents = await readFile(files[0].filepath);
      const key = uuidv4();

      const putCommand = new PutObjectCommand({
        Bucket: "traveljournal",
        Key: key,
        Body: contents,
        ContentType: "image/png",
      });

      const response = await client.send(putCommand);
      console.log(
        "Successfully uploaded data to " + "traveljournal" + "/" + "testobject"
      );
      return key;
    } catch (err) {
      console.error(err, err.stack);
    }
  }
}