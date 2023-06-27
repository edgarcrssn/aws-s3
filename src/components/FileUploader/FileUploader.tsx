import React, { useState } from 'react';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Button } from 'antd';
import styles from './FileUploader.module.scss';

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

interface Props {
  setRefreshCount: React.Dispatch<React.SetStateAction<number>>;
}

export const FileUploader = ({ setRefreshCount }: Props) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileSubmit = async () => {
    if (!file) return;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: file.name,
      Body: file,
    });

    try {
      const response = await client.send(command);
      console.log('Fichier uploadé avec succès :', response);
      setRefreshCount((prev) => prev + 1);
    } catch (error) {
      console.error("Erreur lors de l'upload du fichier :", error);
    }
  };

  return (
    <form onSubmit={handleFileSubmit} className={styles.fileUploader}>
      <h2>Upload</h2>
      <div className={styles.flex}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file ? file.name : null}
        <Button onClick={handleFileSubmit}>Upload</Button>
      </div>
    </form>
  );
};
