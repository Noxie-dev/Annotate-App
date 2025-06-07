import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MainScreen.css';

type File = {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
};

type Folder = {
  id: string;
  name: string;
  files: File[];
};

const MainScreen: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([
    {
      id: '1',
      name: 'Project Documents',
      files: [
        {
          id: '101',
          name: 'Project Plan.docx',
          type: 'document',
          size: '2.4 MB',
          lastModified: '2025-05-27',
        },
        {
          id: '102',
          name: 'Budget.xlsx',
          type: 'spreadsheet',
          size: '1.8 MB',
          lastModified: '2025-05-26',
        },
      ],
    },
    {
      id: '2',
      name: 'Marketing Materials',
      files: [
        {
          id: '201',
          name: 'Presentation.pptx',
          type: 'presentation',
          size: '5.7 MB',
          lastModified: '2025-05-25',
        },
      ],
    },
  ]);

  const [activeFolder, setActiveFolder] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleFolderClick = (folderId: string) => {
    setActiveFolder(folderId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getActiveFolder = () => {
    return folders.find((folder) => folder.id === activeFolder);
  };

  const filteredFiles = getActiveFolder()?.files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="main-screen">
      <header className="app-header">
        <div className="header-left">
          <h1>File Chat</h1>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="header-right">
          <button className="upload-button">Upload File</button>
          <div className="user-profile">
            <span>JD</span>
          </div>
        </div>
      </header>

      <div className="app-container">
        <aside className="sidebar">
          <nav>
            <ul>
              <li className="sidebar-heading">Navigation</li>
              <li className="sidebar-item active">
                <a href="#">
                  <span className="icon">📁</span>
                  <span>Files</span>
                </a>
              </li>
              <li className="sidebar-item">
                <a href="#">
                  <span className="icon">💬</span>
                  <span>Chats</span>
                </a>
              </li>
              <li className="sidebar-item">
                <a href="#">
                  <span className="icon">👥</span>
                  <span>Shared</span>
                </a>
              </li>
              <li className="sidebar-heading">Folders</li>
              {folders.map((folder) => (
                <li
                  key={folder.id}
                  className={`sidebar-item ${
                    activeFolder === folder.id ? 'active' : ''
                  }`}
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <a href="#">
                    <span className="icon">📁</span>
                    <span>{folder.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="sidebar-footer">
            <Link to="/" className="logout-button">
              Sign Out
            </Link>
          </div>
        </aside>

        <main className="content-area">
          <div className="folder-header">
            <h2>{getActiveFolder()?.name}</h2>
            <div className="folder-actions">
              <button className="new-folder-button">New Folder</button>
            </div>
          </div>

          <div className="files-grid">
            {filteredFiles?.map((file) => (
              <div key={file.id} className="file-card">
                <div className="file-icon">
                  {file.type === 'document' && '📄'}
                  {file.type === 'spreadsheet' && '📊'}
                  {file.type === 'presentation' && '📑'}
                </div>
                <div className="file-info">
                  <h3>{file.name}</h3>
                  <p>
                    {file.size} • Last modified: {file.lastModified}
                  </p>
                </div>
                <div className="file-actions">
                  <button className="file-action-button">⋮</button>
                </div>
              </div>
            ))}
            {filteredFiles?.length === 0 && (
              <div className="empty-state">
                <p>No files found in this folder</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainScreen;

