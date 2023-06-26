import React, { useEffect, useState } from 'react';
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

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

interface IFile {
  Key?: string;
  LastModified?: Date;
  Size?: number;
}

export const FileList: React.FC = () => {
  const [fileList, setFileList] = useState<IFile[]>([]);

  useEffect(() => {
    const fetchFileList = async () => {
      const command = new ListObjectsV2Command({
        Bucket: S3_BUCKET,
        MaxKeys: 1000,
      });

      try {
        const response = await client.send(command);

        const currentContents =
          response.Contents?.map((c) => ({
            Key: c.Key,
            LastModified: c.LastModified,
            Size: c.Size,
          })).sort((a, b) => {
            const dateA = new Date(a.LastModified);
            const dateB = new Date(b.LastModified);
            return dateA.getTime() - dateB.getTime();
          }) || [];

        setFileList(currentContents);
      } catch (error) {
        console.error(
          'Erreur lors de la récupération de la liste des fichiers :',
          error
        );
      }
    };

    fetchFileList();
  }, []);

  const downloadFile = async (key: string) => {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    try {
      const response = await client.send(command);
      const str = await response.Body?.transformToString();
      console.log(str);

      if (!str) return;

      const blob = new Blob([str], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = key;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Liste des fichiers dans le bucket</h2>
      <ul>
        {fileList.map((file, index) => (
          <li key={index}>
            {file.Key} - {file.Size} octets -{' '}
            {file.LastModified?.toLocaleString()}
            <button onClick={() => downloadFile(file.Key || '')}>
              Télécharger
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
