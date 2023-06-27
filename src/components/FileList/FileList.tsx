import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
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

interface Props {
  refreshCount: number;
}

export const FileList = ({ refreshCount }: Props) => {
  const [fileList, setFileList] = useState<IFile[]>([]);

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
        })) || [];

      setFileList(currentContents);
    } catch (error) {
      console.error(
        'Erreur lors de la récupération de la liste des fichiers :',
        error
      );
    }
  };

  useEffect(() => {
    fetchFileList();
  }, [refreshCount]);

  const downloadFile = async (key: string) => {
    try {
      const response = await client.send(
        new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
        })
      );

      const res = await response.Body?.transformToByteArray();

      if (!res) return;

      const blob = new Blob([res], { type: 'application/octet-stream' });

      saveAs(blob, key);

      console.log('Téléchargement du fichier démarré.');
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
      fetchFileList();
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
