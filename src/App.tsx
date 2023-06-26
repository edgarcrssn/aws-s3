import './App.css';
import { FileList } from './components/FileList/FileList';
import { FileUploader } from './components/FileUploader/FileUploader';

function App() {
  return (
    <>
      <h1>S3 AWS</h1>
      <FileUploader />
      <FileList />
    </>
  );
}

export default App;
