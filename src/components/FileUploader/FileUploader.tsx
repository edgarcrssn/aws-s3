import React, { useState } from 'react';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const S3_BUCKET: string = import.meta.env.VITE_S3_BUCKET;
const REGION: string = import.meta.env.VITE_REGION;
const ACCESS_KEY: string = import.meta.env.VITE_ACCESS_KEY;
const SECRET_ACCESS_KEY: string = import.meta.env.VITE_SECRET_ACCESS_KEY;

const client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export const FileUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: file.name,
      Body: file,
    });

    try {
      const response = await client.send(command);
      console.log('Fichier uploadé avec succès :', response);
    } catch (error) {
      console.error("Erreur lors de l'upload du fichier :", error);
    }
  };

  return (
    <form onSubmit={handleFileSubmit}>
      <h2>Upload</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button type="submit">Upload</button>
    </form>
  );
};
