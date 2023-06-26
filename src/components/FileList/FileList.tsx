import React, { useEffect, useState } from 'react';
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Button, Card, Popconfirm } from 'antd';
import styles from './FileList.module.scss';
import {
  DeleteOutlined,
  DownloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';

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
    try {
      const response = await client.send(
        new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
        })
      );
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

  const deleteFile = async (key: string) => {
    try {
      const data = await client.send(
        new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key })
      );
      console.log('Success. Object deleted.', data);
      return data; // For unit tests.
    } catch (err) {
      console.log('Error', err);
    }
  };

  return (
    <section className={styles.fileList}>
      <h2>Bucket files list</h2>
      <ul className={styles.list}>
        {fileList.map((file, index) => (
          <li key={index} className={styles.item}>
            <Card
              title={file.Key}
              actions={[
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => downloadFile(file.Key || '')}
                >
                  Download
                </Button>,
                <Popconfirm
                  icon={<WarningOutlined style={{ color: 'red' }} />}
                  title="Delete the file"
                  description="Are you sure to delete this file?"
                  onConfirm={() => deleteFile(file.Key || '')}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button icon={<DeleteOutlined />} danger>
                    Delete
                  </Button>
                </Popconfirm>,
              ]}
            >
              <em>Size:</em> {file.Size} Byte(s)
              <br />
              <em>Date:</em> {file.LastModified?.toLocaleString()}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
};
