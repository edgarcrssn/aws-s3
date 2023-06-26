import './App.css';
import { FileList } from './components/FileList/FileList';
import { FileUploader } from './components/FileUploader/FileUploader';

function App() {
  return (
    <main>
      <h1>S3 AWS</h1>
      <FileUploader />
      <FileList />
    </main>
  );
}

export default App;
