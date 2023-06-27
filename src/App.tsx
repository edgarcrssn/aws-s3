import { useState } from 'react';
import './App.css';
import { FileList } from './components/FileList/FileList';
import { FileUploader } from './components/FileUploader/FileUploader';

function App() {
  const [refreshCount, setRefreshCount] = useState(0);

  return (
    <main>
      <h1>S3 AWS</h1>
      <FileUploader setRefreshCount={setRefreshCount} />
      <FileList refreshCount={refreshCount} />
    </main>
  );
}

export default App;
